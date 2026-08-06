// ===============================
// 商人在庫設定
// ===============================

// 商品一覧
window.merchantItems = items.map(item => item.id);

// カテゴリーごとの最大在庫
const merchantStockLimit = {
    food:200,
    water:50,
    material:100,
    equipment:10
};

// 毎日補充する商品
const merchantDailySupply = {
    leaf:30,
    water:30
};

// ===============================
// 在庫取得
// ===============================

async function getMerchantStock(){

    const snapshot =
        await database
        .ref("merchantStock")
        .once("value");

    return snapshot.val() || {};
}

// ===============================
// 在庫保存
// ===============================

async function setMerchantStock(stock){

    await database
        .ref("merchantStock")
        .set(stock);

}

// ===============================
// 商人商品一覧
// ===============================

async function getMerchantItems(){

    await updateMerchantStock();

    const stock =
        await getMerchantStock();

    return window.merchantItems
        .map(id=>{

            const item =
                items.find(i=>i.id===id);

            if(!item){
                return null;
            }

            const quantity =
                Number(stock[id]?.quantity || 0);

            return {

                ...item,

                quantity,

                sellPrice:
                    Math.floor(item.price*0.3)

            };

        })
        .filter(item=>item);

}

// ===============================
// 商人へ売る
// ===============================

async function merchantReceiveItem(itemId,quantity){

    const stock =
        await getMerchantStock();

    const item =
        items.find(i=>i.id===itemId);

    if(!item){
        return;
    }

    if(!stock[itemId]){

        stock[itemId]={
            quantity:0
        };

    }

    const limit =
        merchantStockLimit[item.category] || 100;

    stock[itemId].quantity =
        Math.min(
            limit,
            Number(stock[itemId].quantity||0)+quantity
        );

    await setMerchantStock(stock);

}

// ===============================
// 商人から買う
// ===============================

async function merchantTakeItem(itemId,quantity){

    const stock =
        await getMerchantStock();

    if(!stock[itemId]){
        return false;
    }

    if(stock[itemId].quantity<quantity){
        return false;
    }

    stock[itemId].quantity-=quantity;

    await setMerchantStock(stock);

    return true;

}

// ===============================
// 毎日更新
// ===============================

async function updateMerchantStock(){

    const snapshot =
        await database
        .ref("merchantStock")
        .once("value");

    const stock =
        snapshot.val() || {};

    const today =
        new Date().toISOString().slice(0,10);

    if(stock.lastUpdate===today){
        return;
    }

    // 在庫20%減少
    Object.keys(stock).forEach(id=>{

        if(id==="lastUpdate"){
            return;
        }

        stock[id].quantity=
            Math.floor(
                Number(stock[id].quantity||0)*0.8
            );

    });

    // 落ち葉補充
    if(!stock.leaf){

        stock.leaf={quantity:0};

    }

    stock.leaf.quantity+=30;

    // 水補充
    if(!stock.water){

        stock.water={quantity:0};

    }

    stock.water.quantity+=30;

    // 最大在庫を超えない
    Object.keys(stock).forEach(id=>{

        if(id==="lastUpdate"){
            return;
        }

        const item =
            items.find(i=>i.id===id);

        if(!item){
            return;
        }

        const limit =
            merchantStockLimit[item.category] || 100;

        stock[id].quantity =
            Math.min(
                limit,
                stock[id].quantity
            );

    });

    stock.lastUpdate=today;

    await setMerchantStock(stock);

}
