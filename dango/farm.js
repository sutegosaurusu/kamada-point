// =====================================================
// 農園システム
// 購入・作物選択・成長・収穫
// =====================================================

let currentUser = null;
let currentPoint = 0;
let farmData = {};
let farmListenersStarted = false;


// =====================================================
// ログイン
// =====================================================

auth.onAuthStateChanged(user => {

    if(!user){

        location.href = "../index.html";
        return;

    }

    currentUser = user;

    startFarmListeners();

});


// =====================================================
// Firebase監視開始
// =====================================================

function startFarmListeners(){

    if(farmListenersStarted){
        return;
    }

    farmListenersStarted = true;

    // -----------------------------------------
    // ポイント
    // -----------------------------------------

    database
        .ref("members/" + currentUser.uid + "/point")
        .on("value", snapshot => {

            currentPoint =
                Number(snapshot.val() || 0);

            const pointElement =
                document.getElementById("point");

            if(pointElement){

                pointElement.textContent =
                    currentPoint.toLocaleString() + " Pt";

            }

            renderFarmPage();

        });


    // -----------------------------------------
    // 自分の農園
    // -----------------------------------------

    database
        .ref("farms")
        .on("value", snapshot => {

            const allFarms =
                snapshot.val() || {};

            farmData = {};

            Object.entries(allFarms)
                .forEach(([farmId, farm]) => {

                    if(
                        farm &&
                        farm.ownerId === currentUser.uid
                    ){

                        farmData[farmId] = {
                            ...farm,
                            id:farmId
                        };

                    }

                });

            renderFarmPage();

        });


    // -----------------------------------------
    // 購入ボタン
    // -----------------------------------------

    document
        .querySelectorAll(".buyButton")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const farmType =
                        button.dataset.farmType;

                    buyFarm(farmType);

                }
            );

        });

}


// =====================================================
// 画面全体
// =====================================================

function renderFarmPage(){

    renderMyFarms();

}


// =====================================================
// 自分の農園一覧
// =====================================================

function renderMyFarms(){

    const container =
        document.getElementById("myFarms");

    if(!container){
        return;
    }

    const farms =
        Object.values(farmData);

    if(farms.length === 0){

        container.innerHTML = `
            <div class="emptyFarm">

                <div class="emptyFarmTitle">
                    農園を所有していません
                </div>

                <div class="emptyFarmText">
                    下から農地を購入できます。
                </div>

            </div>
        `;

        return;
    }

    container.innerHTML = "";

    farms.forEach(farm => {

        const card =
            createFarmCard(farm);

        container.appendChild(card);

    });

}


// =====================================================
// 農園カード
// =====================================================

function createFarmCard(farm){

    const farmType =
        farmTypes[farm.farmType];

    if(!farmType){

        const errorCard =
            document.createElement("div");

        errorCard.className =
            "farmCard";

        errorCard.innerHTML = `
            <div class="farmName">
                不明な農園
            </div>
        `;

        return errorCard;
    }


    const crop =
        farm.cropId
        ? farmCrops[farm.cropId]
        : null;


    const workerCount =
        Number(farm.workerCount || 0);


    const workerCapacity =
        Number(
            farm.workerCapacity ||
            farmType.workerCapacity
        );


    const salary =
        Number(farm.salary || 0);


    const harvestAmount =
        crop
        ? calculateFarmHarvest(
            farm.farmType,
            workerCount
        )
        : 0;


    const ready =
        crop &&
        isFarmReady(farm);


    const remaining =
        crop && !ready
        ? getFarmRemainingTime(farm)
        : 0;


    const acceptingWorkers =
        workerCount < workerCapacity;


    const card =
        document.createElement("div");

    card.className =
        "farmCard";


    // =================================================
    // 作物
    // =================================================

    let cropHtml = "";

    if(!crop){

        cropHtml = `
            <div class="cropArea">

                <div class="cropTitle">
                    🌱 作物
                </div>

                <div class="cropName">
                    まだ植えられていません
                </div>

                <div class="farmButtons">

                    <button
                        class="farmButton"
                        data-action="plant">

                        🌱 作物を選ぶ

                    </button>

                </div>

            </div>
        `;

    }else{

        cropHtml = `
            <div class="cropArea">

                <div class="cropTitle">
                    🌱 作物
                </div>

                <div class="cropName">
                    ${crop.icon || "🌱"}
                    ${escapeHtml(crop.name)}
                </div>

                <div class="cropStatus">

                    ${
                        ready
                        ? "✅ 収穫できます"
                        : "⏳ " + formatFarmTime(remaining)
                    }

                </div>

                <div class="farmButtons">

                    ${
                        ready
                        ? `
                        <button
                            class="farmButton"
                            data-action="harvest">

                            🌾 収穫する

                        </button>
                        `
                        : ""
                    }

                    <button
                        class="farmButton secondary"
                        data-action="cropSelect">

                        🌱 作物を変更

                    </button>

                </div>

            </div>
        `;

    }


    // =================================================
    // 求人表示
    // =================================================

    const recruitmentHtml = crop
        ? `
        <div class="workerArea">

            <div class="workerTitle">
                👨‍🌾 労働者募集
            </div>

            <div class="workerCount">
                ${workerCount} / ${workerCapacity}人
            </div>

            ${
                salary > 0
                ? `
                <div class="workerNotice">
                    賃金：
                    ${salary.toLocaleString()} Pt
                </div>
                `
                : `
                <div class="workerNotice">
                    現在、求人を出していません
                </div>
                `
            }

            <div class="farmButtons">

                ${
                    acceptingWorkers
                    ? `
                    <button
                        class="farmButton"
                        data-action="recruit">

                        👨‍🌾 求人を設定する

                    </button>
                    `
                    : `
                    <div class="workerNotice">
                        ✅ 労働者が定員に達しています
                    </div>
                    `
                }

            </div>

        </div>
        `
        : "";


    // =================================================
    // カードHTML
    // =================================================

    card.innerHTML = `

        <div class="farmHeader">

            <div>

                <div class="farmName">
                    ${farmType.icon}
                    ${escapeHtml(farmType.name)}
                </div>

                <div class="farmType">
                    12時間ごとに収穫
                </div>

            </div>

        </div>


        <div class="farmOwner">

            所有者：
            <strong>
                ${escapeHtml(
                    farm.ownerName || "自分"
                )}
            </strong>

        </div>


        <div class="farmInfo">

            <div class="infoBox">

                <div class="infoLabel">
                    基本収穫
                </div>

                <div class="infoValue">
                    ${farmType.baseHarvest}個
                </div>

            </div>


            <div class="infoBox">

                <div class="infoLabel">
                    現在の予想収穫
                </div>

                <div class="infoValue">
                    ${harvestAmount}個
                </div>

            </div>

        </div>


        ${recruitmentHtml}


        ${cropHtml}


        <div class="farmButtons">

            ${
                crop && acceptingWorkers
                ? `
                <button
                    class="farmButton secondary"
                    data-action="recruit">

                    👨‍🌾 労働者を募集する

                </button>
                `
                : ""
            }

        </div>
    `;


    // =================================================
    // ボタンイベント
    // =================================================

    card
        .querySelectorAll("[data-action]")
        .forEach(button => {

            button.addEventListener(
                "click",
                async () => {

                    const action =
                        button.dataset.action;


                    if(action === "plant"){

                        openCropSelection(farm);

                    }


                    if(action === "cropSelect"){

                        openCropSelection(farm);

                    }


                    if(action === "recruit"){

                        await openFarmRecruitment({
                            ...farm,
                            id:farm.id
                        });

                    }


                    if(action === "harvest"){

                        await harvestFarm(farm);

                    }

                }
            );

        });


    return card;

}


// =====================================================
// 農地購入
// =====================================================

async function buyFarm(farmTypeId){

    if(!currentUser){
        return;
    }


    const farmType =
        farmTypes[farmTypeId];


    if(!farmType){

        showFarmMessage(
            "農地の種類が見つかりません。"
        );

        return;

    }


    if(currentPoint < farmType.price){

        showFarmMessage(
            "ポイントが足りません。"
        );

        return;

    }


    const confirmed =
        confirm(
            farmType.name +
            "を" +
            farmType.price.toLocaleString() +
            " Ptで購入しますか？"
        );


    if(!confirmed){
        return;
    }


    try{

        const pointRef =
            database.ref(
                "members/" +
                currentUser.uid +
                "/point"
            );


        const transactionResult =
            await pointRef.transaction(
                point => {

                    const current =
                        Number(point || 0);

                    if(current < farmType.price){

                        return;

                    }

                    return current -
                        farmType.price;

                }
            );


        if(!transactionResult.committed){

            showFarmMessage(
                "ポイントが足りません。"
            );

            return;

        }


        const farmRef =
            database.ref("farms").push();


        const farmId =
            farmRef.key;


        const farmObject = {

            ownerId:
                currentUser.uid,

            ownerName:
                currentUser.displayName ||
                "農園主",

            farmType:
                farmTypeId,

            cropId:
                null,

            plantedAt:
                null,

            harvestAt:
                null,

            workerCount:
                0,

            workerCapacity:
                farmType.workerCapacity,

            createdAt:
                firebase.database
                    .ServerValue.TIMESTAMP

        };


        await farmRef.set(
            farmObject
        );


        showFarmMessage(
            farmType.name +
            "を購入しました。"
        );


    }catch(error){

        console.error(
            "農園購入エラー:",
            error
        );


        showFarmMessage(
            "農園を購入できませんでした。"
        );

    }

}


// =====================================================
// 作物選択
// =====================================================

function openCropSelection(farm){

    const cropEntries =
        Object.values(farmCrops);


    let message =
        "作物を選択してください。\n\n";


    cropEntries.forEach(
        (crop,index) => {

            message +=
                (index + 1) +
                ". " +
                crop.name +
                "（約" +
                crop.value +
                "Pt）\n";

        }
    );


    const answer =
        prompt(message);


    if(answer === null){
        return;
    }


    const index =
        Number(answer) - 1;


    if(
        !Number.isInteger(index) ||
        !cropEntries[index]
    ){

        showFarmMessage(
            "正しい作物番号を選択してください。"
        );

        return;

    }


    plantCrop(
        farm,
        cropEntries[index].id
    );

}


// =====================================================
// 作物を植える
// =====================================================

async function plantCrop(
    farm,
    cropId
){

    const crop =
        farmCrops[cropId];


    if(!crop){

        showFarmMessage(
            "作物が見つかりません。"
        );

        return;

    }


    const confirmed =
        confirm(
            crop.name +
            "を植えますか？\n\n" +
            "成長時間：12時間"
        );


    if(!confirmed){
        return;
    }


    try{

        const now =
            Date.now();


        const updates = {

            cropId:cropId,

            plantedAt:now,

            harvestAt:
                now +
                crop.growthTime

        };


        await database
            .ref(
                "farms/" + farm.id
            )
            .update(updates);


        showFarmMessage(
            crop.name +
            "を植えました。"
        );


    }catch(error){

        console.error(
            "作付けエラー:",
            error
        );


        showFarmMessage(
            "作物を植えられませんでした。"
        );

    }

}


// =====================================================
// 収穫
// =====================================================

async function harvestFarm(farm){

    if(!farm){
        return;
    }


    if(!isFarmReady(farm)){

        showFarmMessage(
            "まだ収穫できません。"
        );

        return;

    }


    const crop =
        farmCrops[farm.cropId];


    const farmType =
        farmTypes[farm.farmType];


    if(!crop || !farmType){

        showFarmMessage(
            "農園データが正しくありません。"
        );

        return;

    }


    const workerCount =
        Number(
            farm.workerCount || 0
        );


    const harvestAmount =
        calculateFarmHarvest(
            farm.farmType,
            workerCount
        );


    try{

        // -----------------------------------------
        // 現在の農園を再取得
        // -----------------------------------------

        const farmSnapshot =
            await database
                .ref(
                    "farms/" + farm.id
                )
                .once("value");


        const latestFarm =
            farmSnapshot.val();


        if(!latestFarm){

            showFarmMessage(
                "農園が見つかりません。"
            );

            return;

        }


        if(
            !latestFarm.harvestAt ||
            Date.now() <
                Number(latestFarm.harvestAt)
        ){

            showFarmMessage(
                "まだ収穫できません。"
            );

            return;

        }


        const latestCrop =
            farmCrops[latestFarm.cropId];


        const latestFarmType =
            farmTypes[
                latestFarm.farmType
            ];


        if(
            !latestCrop ||
            !latestFarmType
        ){

            showFarmMessage(
                "農園データが正しくありません。"
            );

            return;

        }


        const latestWorkerCount =
            Number(
                latestFarm.workerCount || 0
            );


        const latestHarvestAmount =
            calculateFarmHarvest(
                latestFarm.farmType,
                latestWorkerCount
            );


        // -----------------------------------------
        // インベントリを再取得
        // -----------------------------------------

        const inventorySnapshot =
            await database
                .ref(
                    "inventories/" +
                    currentUser.uid +
                    "/" +
                    latestCrop.id
                )
                .once("value");


        const currentItem =
            inventorySnapshot.val();


        const currentQuantity =
            Number(
                currentItem?.quantity || 0
            );


        const updates = {};


        // -----------------------------------------
        // 収穫物を追加
        // -----------------------------------------

        updates[
            "inventories/" +
            currentUser.uid +
            "/" +
            latestCrop.id
        ] = {

            name:
                latestCrop.name,

            category:
                "food",

            icon:
                latestCrop.icon,

            quantity:
                currentQuantity +
                latestHarvestAmount,

            updatedAt:
                firebase.database
                    .ServerValue.TIMESTAMP

        };


        // -----------------------------------------
        // 次の栽培を開始
        // -----------------------------------------

        const nextStart =
            Date.now();


        updates[
            "farms/" +
            farm.id +
            "/plantedAt"
        ] =
            nextStart;


        updates[
            "farms/" +
            farm.id +
            "/harvestAt"
        ] =
            nextStart +
            latestCrop.growthTime;


        await database
            .ref()
            .update(updates);


        // 労働者への賃金支払い
        if(
            typeof payFarmWorkers === "function"
        ){

            await payFarmWorkers(
                farm.id,
                latestFarm
            );

        }


        showFarmMessage(
            latestCrop.name +
            "を" +
            latestHarvestAmount +
            "個収穫しました！"
        );


    }catch(error){

        console.error(
            "収穫エラー:",
            error
        );


        showFarmMessage(
            "収穫できませんでした。"
        );

    }

}




// =====================================================
// メッセージ
// =====================================================

function showFarmMessage(message){

    const element =
        document.getElementById("message");


    if(!element){

        alert(message);
        return;

    }


    element.textContent =
        message;

    element.style.display =
        "block";


    clearTimeout(
        showFarmMessage.timer
    );


    showFarmMessage.timer =
        setTimeout(
            () => {

                element.style.display =
                    "none";

            },
            3000
        );

}


// =====================================================
// 12時間タイマー
// =====================================================

setInterval(
    () => {

        if(currentUser){

            renderMyFarms();

        }

    },
    1000
);


console.log(
    "farm.js読み込み完了"
);
