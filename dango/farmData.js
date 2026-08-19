// =====================================================
// 農園データ
// =====================================================

const FARM_GROWTH_TIME = 12 * 60 * 60 * 1000;


// =====================================================
// 農地の種類
// =====================================================

const farmTypes = {

    small:{
        id:"small",
        name:"小さな農地",
        icon:"🌱",

        price:300000,
        sellPrice:240000,

        workerCapacity:1,

        baseHarvest:1,
        extraHarvestPerWorker:1,

        description:
            "小さな農地。少人数で管理できる小規模な農地。"
    },

    normal:{
        id:"normal",
        name:"農地",
        icon:"🌾",

        price:600000,
        sellPrice:480000,

        workerCapacity:3,

        baseHarvest:3,
        extraHarvestPerWorker:1,

        description:
            "標準的な農地。複数の農夫を雇って大きく育てられる。"
    },

    large:{
        id:"large",
        name:"大きな農地",
        icon:"🌳",

        price:1200000,
        sellPrice:960000,

        workerCapacity:6,

        baseHarvest:6,
        extraHarvestPerWorker:1,

        description:
            "広大な農地。多くの労働者を雇うことで大量の収穫が期待できる。"
    }

};

// =====================================================
// 作物
// =====================================================

const farmCrops = {

    leaf:{
        id:"leaf",
        name:"落ち葉",
        icon:"🍂",

        // 12時間
        growthTime:FARM_GROWTH_TIME,

        // 通常品
        value:10,

        description:
            "身近に集められる基本的な作物。"
    },

    moss:{
        id:"moss",
        name:"コケ",
        icon:"🌿",

        growthTime:FARM_GROWTH_TIME,

        value:10,

        description:
            "湿った農地で育つ基本的な作物。"
    },

    mushroom:{
        id:"mushroom",
        name:"キノコ",
        icon:"🍄",

        growthTime:FARM_GROWTH_TIME,

        // 通常作物のおよそ10倍
        value:100,

        description:
            "珍しく高価な作物。通常の作物より高い価値を持つ。"
    }

};


// =====================================================
// 労働による追加収穫量
// =====================================================

function calculateFarmHarvest(
    farmTypeId,
    workerCount
){

    const farm =
        farmTypes[farmTypeId];

    if(!farm){
        return 0;
    }

    const workers =
        Math.max(
            0,
            Math.min(
                Number(workerCount || 0),
                farm.workerCapacity
            )
        );

    return (
        farm.baseHarvest +
        workers *
        farm.extraHarvestPerWorker
    );
}


// =====================================================
// 成長時間
// =====================================================

function getFarmGrowthTime(){

    return FARM_GROWTH_TIME;
}


// =====================================================
// 収穫可能か判定
// =====================================================

function isFarmReady(farm){

    if(!farm){
        return false;
    }

    if(!farm.harvestAt){
        return false;
    }

    return Date.now() >=
        Number(farm.harvestAt);
}


// =====================================================
// 残り時間
// =====================================================

function getFarmRemainingTime(farm){

    if(!farm || !farm.harvestAt){
        return 0;
    }

    return Math.max(
        0,
        Number(farm.harvestAt) - Date.now()
    );
}


console.log("farmData.js読み込み完了");
