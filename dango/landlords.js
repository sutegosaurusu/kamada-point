// =====================================================
// NPC地主データ
// =====================================================
// 店に並ぶ農地を管理する。
// 各種類10区画ずつ用意する。
// =====================================================

const landlords = {

    agropolis_estate: {

        id: "agropolis_estate",

        name: "アグロポリス地主会",

        icon: "🏛️",

        description:
            "アグロポリス周辺の土地を所有する地主たちの組織。",

        farms: {

            small: {
                quantity: 10
            },

            normal: {
                quantity: 10
            },

            large: {
                quantity: 10
            }

        }

    }

};


// =====================================================
// Firebase上の地主在庫
// landlordStock
// =====================================================

let landlordStockData = {};


// =====================================================
// 初期在庫
// =====================================================

async function initializeLandlordStock(){

    const snapshot =
        await database
            .ref("landlordStock")
            .once("value");


    const current =
        snapshot.val();


    // すでに存在するなら初期化しない
    if(current){
        landlordStockData = current;
        return;
    }


    const stock = {};


    Object.values(
        landlords
    ).forEach(landlord => {

        Object.entries(
            landlord.farms
        ).forEach(
            ([farmTypeId, data]) => {

                const key =
                    landlord.id +
                    "_" +
                    farmTypeId;


                stock[key] = {

                    landlordId:
                        landlord.id,

                    farmType:
                        farmTypeId,

                    quantity:
                        Number(
                            data.quantity || 0
                        )

                };

            }
        );

    });


    await database
        .ref("landlordStock")
        .set(stock);


    landlordStockData =
        stock;

}


// =====================================================
// 在庫監視
// =====================================================

function watchLandlordStock(){

    database
        .ref("landlordStock")
        .on(
            "value",
            snapshot => {

                landlordStockData =
                    snapshot.val() || {};

                renderMarket();

            }
        );

}


// =====================================================
// 地主情報取得
// =====================================================

function getLandlord(
    landlordId
){

    return landlords[
        landlordId
    ] || null;

}


// =====================================================
// 地主在庫取得
// =====================================================

function getLandlordStock(
    landlordId,
    farmTypeId
){

    const key =
        landlordId +
        "_" +
        farmTypeId;


    return (
        landlordStockData[key] ||
        null
    );

}


console.log(
    "landlords.js読み込み完了"
);
