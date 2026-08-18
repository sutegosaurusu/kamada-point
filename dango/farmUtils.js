// =====================================================
// 農園共通ユーティリティ
// =====================================================


// =====================================================
// 時間
// =====================================================

function formatFarmTime(milliseconds){

    const totalSeconds =
        Math.max(
            0,
            Math.ceil(milliseconds / 1000)
        );

    const hours =
        Math.floor(
            totalSeconds / 3600
        );

    const minutes =
        Math.floor(
            (totalSeconds % 3600) / 60
        );

    const seconds =
        totalSeconds % 60;

    return (
        String(hours).padStart(2,"0") +
        ":" +
        String(minutes).padStart(2,"0") +
        ":" +
        String(seconds).padStart(2,"0")
    );
}


// =====================================================
// 農園が収穫可能か
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


// =====================================================
// 労働者数に応じた収穫量
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
// 次回収穫時刻
// =====================================================

function getNextHarvestAt(){

    return (
        Date.now() +
        FARM_GROWTH_TIME
    );
}


// =====================================================
// 作物が存在するか
// =====================================================

function getFarmCrop(cropId){

    return farmCrops[cropId] || null;
}


// =====================================================
// 農地タイプ取得
// =====================================================

function getFarmType(farmTypeId){

    return farmTypes[farmTypeId] || null;
}


// =====================================================
// 農園収穫の予想価値
// =====================================================

function calculateFarmExpectedValue(
    farmTypeId,
    cropId,
    workerCount
){

    const farm =
        getFarmType(farmTypeId);

    const crop =
        getFarmCrop(cropId);

    if(!farm || !crop){
        return 0;
    }

    const harvest =
        calculateFarmHarvest(
            farmTypeId,
            workerCount
        );

    return harvest * crop.value;
}


// =====================================================
// 所有者名
// =====================================================

function getFarmOwnerName(farm){

    if(!farm){
        return "不明";
    }

    return farm.ownerName ||
        "農園主";
}
// =====================================================
// 農園共通ユーティリティ
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


function getFarmRemainingTime(farm){

    if(!farm || !farm.harvestAt){
        return 0;
    }

    return Math.max(
        0,
        Number(farm.harvestAt) - Date.now()
    );
}


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


function getNextHarvestAt(){

    return (
        Date.now() +
        FARM_GROWTH_TIME
    );
}


function getFarmCrop(cropId){

    return farmCrops[cropId] || null;
}


function getFarmType(farmTypeId){

    return farmTypes[farmTypeId] || null;
}


function calculateFarmExpectedValue(
    farmTypeId,
    cropId,
    workerCount
){

    const farm =
        getFarmType(farmTypeId);

    const crop =
        getFarmCrop(cropId);

    if(!farm || !crop){
        return 0;
    }

    const harvest =
        calculateFarmHarvest(
            farmTypeId,
            workerCount
        );

    return harvest * crop.value;
}


function getFarmOwnerName(farm){

    if(!farm){
        return "不明";
    }

    return farm.ownerName || "農園主";
}


console.log("farmUtils.js読み込み完了");

console.log("farmUtils.js読み込み完了");
