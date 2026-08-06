// =====================================================
// 商人在庫設定
// =====================================================

const MERCHANT_STOCK_LIMITS = {
    food: 200,
    water: 50,
    equipment: 10,
    material: 100
};

// 毎日、商人が補充する必需品
const DAILY_SUPPLY = {
    leaf: 30,
    water: 30
};

const ONE_DAY = 24 * 60 * 60 * 1000;

// 全アイテムを商人が取り扱う
window.merchantItems = items.map(item => item.id);

// Firebaseから取得した商人在庫
let merchantStockData = {};

// 在庫監視を開始
function watchMerchantStock(){

    database
        .ref("merchantStock")
        .on("value", snapshot => {

            merchantStockData = snapshot.val() || {};

            // 市場がすでに読み込まれていれば再表示
            if(typeof renderMarket === "function"){
                renderMarket();
            }
        });
}

// カテゴリーごとの在庫上限
function getMerchantStockLimit(category){

    return Number(
        MERCHANT_STOCK_LIMITS[category] || 0
    );
}

// 現在の在庫
function getMerchantStock(itemId){

    return Number(
        merchantStockData[itemId]?.quantity || 0
    );
}

// 在庫量による販売価格倍率
function getMerchantPriceMultiplier(stock){

    if(stock >= 200){
        return 0.60;
    }

    if(stock >= 100){
        return 0.80;
    }

    if(stock >= 50){
        return 0.90;
    }

    return 1;
}

// 商人の商品一覧
function getMerchantItems(){

    return window.merchantItems
        .map(id => items.find(item => item.id === id))
        .filter(Boolean)
        .map(item => {

            const stock =
                getMerchantStock(item.id);

            const multiplier =
                getMerchantPriceMultiplier(stock);

            const currentPrice =
                Math.max(
                    1,
                    Math.floor(
                        Number(item.price) * multiplier
                    )
                );

            return {
                ...item,

                stock: stock,

                stockLimit:
                    getMerchantStockLimit(item.category),

                price: currentPrice,

                // 買取価格は現在の販売価格の30%
                sellPrice:
                    Math.max(
                        1,
                        Math.floor(currentPrice * 0.3)
                    )
            };
        });
}

// =====================================================
// 初期在庫と日次更新
// =====================================================

async function updateMerchantStockDaily(){

    const stockRef =
        database.ref("merchantStock");

    await stockRef.transaction(currentData => {

        const now = Date.now();

        const data =
            currentData &&
            typeof currentData === "object"
            ? currentData
            : {};

        const lastUpdatedAt =
            Number(data._meta?.lastUpdatedAt || 0);

        // 初回作成
        if(lastUpdatedAt === 0){

            const initialData = {
                _meta:{
                    lastUpdatedAt: now
                }
            };

            items.forEach(item => {

                const initialQuantity =
                    Number(DAILY_SUPPLY[item.id] || 0);

                initialData[item.id] = {
                    quantity:
                        Math.min(
                            initialQuantity,
                            getMerchantStockLimit(item.category)
                        )
                };
            });

            return initialData;
        }

        const passedDays =
            Math.floor(
                (now - lastUpdatedAt) / ONE_DAY
            );

        if(passedDays <= 0){
            return;
        }

        items.forEach(item => {

            const limit =
                getMerchantStockLimit(item.category);

            let quantity =
                Number(data[item.id]?.quantity || 0);

            for(
                let day = 0;
                day < passedDays;
                day++
            ){

                // 在庫を毎日20%減らす
                quantity =
                    Math.floor(quantity * 0.8);

                // 落ち葉と水を毎日30個補充
                quantity +=
                    Number(DAILY_SUPPLY[item.id] || 0);

                quantity =
                    Math.min(quantity, limit);
            }

            data[item.id] = {
                quantity: Math.max(0, quantity)
            };
        });

        data._meta = {
            lastUpdatedAt:
                lastUpdatedAt +
                passedDays * ONE_DAY
        };

        return data;
    });
}
