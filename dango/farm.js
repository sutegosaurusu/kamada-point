// =====================================================
// アグロポリス農園システム
// =====================================================
// farm.js の役割
//
// ・自分の農園を表示
// ・作物を選ぶ
// ・作物を植える
// ・作物の成長時間を表示
// ・収穫する
// ・地主が求人を設定する
//
// 農地の購入・売却・出品・購入は shop.js が担当
// アルバイトへの参加・12時間労働は jobs.js が担当
// =====================================================


// =====================================================
// 基本変数
// =====================================================

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


    // =================================================
    // 所持ポイント
    // =================================================

    database
        .ref(
            "members/" +
            currentUser.uid +
            "/point"
        )
        .on(
            "value",
            snapshot => {

                currentPoint =
                    Number(
                        snapshot.val() || 0
                    );

                updatePointDisplay(currentPoint);

            }
        );


    // =================================================
    // 自分の農園
    // =================================================

    database
        .ref("farms")
        .on(
            "value",
            snapshot => {

                const allFarms =
                    snapshot.val() || {};

                farmData = {};


                Object.entries(
                    allFarms
                )
                .forEach(
                    ([farmId, farm]) => {

                        if(
                            farm &&
                            farm.ownerId ===
                            currentUser.uid
                        ){

                            farmData[farmId] = {

                                ...farm,

                                id:farmId

                            };

                        }

                    }
                );


                renderFarmPage();

            }
        );

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
        document.getElementById(
            "myFarms"
        );

    if(!container){
        return;
    }


    const farms =
        Object.values(
            farmData
        );


    if(farms.length === 0){

        container.innerHTML = `

            <div class="emptyFarm">

                <div class="emptyFarmTitle">
                    農園を所有していません
                </div>

                <div class="emptyFarmText">

                    店で農地を購入すると、
                    ここで農園を経営できます。

                </div>

            </div>

        `;

        return;
    }


    container.innerHTML = "";


    farms.forEach(
        farm => {

            const card =
                createFarmCard(farm);

            container.appendChild(card);

        }
    );

}


// =====================================================
// 農園カード
// =====================================================

function createFarmCard(farm){

    const farmType =
        farmTypes[
            farm.farmType
        ];


    if(!farmType){

        const errorCard =
            document.createElement(
                "div"
            );

        errorCard.className =
            "itemCard farmCard";

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
        Number(
            farm.workerCount || 0
        );


    const workerCapacity =
        Number(
            farm.workerCapacity ||
            farmType.workerCapacity ||
            0
        );


    const salary =
        Number(
            farm.salary || 0
        );


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
        workerCount <
        workerCapacity;


    const card =
        document.createElement(
            "div"
        );


    card.className =
        "itemCard farmCard";


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
                        data-action="plant"
                    >

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
                        : "⏳ " +
                          formatFarmTime(
                              remaining
                          )
                    }

                </div>

                <div class="farmButtons">

                    ${
                        ready
                        ? `

                            <button
                                class="farmButton"
                                data-action="harvest"
                            >

                                🌾 収穫する

                            </button>

                        `
                        : ""
                    }

                    <button
                        class="farmButton secondary"
                        data-action="cropSelect"
                    >

                        🌱 作物を変更

                    </button>

                </div>

            </div>

        `;

    }


    // =================================================
    // 求人
    // =================================================

    let recruitmentHtml = "";


    if(crop){

        recruitmentHtml = `

            <div class="workerArea">

                <div class="workerTitle">
                    👨‍🌾 労働者募集
                </div>

                <div class="workerCount">

                    ${workerCount}
                    /
                    ${workerCapacity}人

                </div>


                ${
                    salary > 0

                    ? `

                        <div class="workerNotice">

                            賃金：
                            ${salary.toLocaleString()}
                            Pt / 12時間

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
                                data-action="recruit"
                            >

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

        `;

    }


    // =================================================
    // カード
    // =================================================

    card.innerHTML = `

        <div class="farmHeader">

            <div>

                <div class="farmName">

                    ${farmType.icon}

                    ${escapeHtml(
                        farmType.name
                    )}

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
                    farm.ownerName ||
                    "自分"
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


        ${cropHtml}

        ${recruitmentHtml}

    `;


    // =================================================
    // ボタン
    // =================================================

    card
        .querySelectorAll(
            "[data-action]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    async () => {

                        const action =
                            button.dataset.action;


                        if(
                            action ===
                            "plant"
                        ){

                            openCropSelection(
                                farm
                            );

                            return;

                        }


                        if(
                            action ===
                            "cropSelect"
                        ){

                            openCropSelection(
                                farm
                            );

                            return;

                        }


                        if(
                            action ===
                            "harvest"
                        ){

                            await harvestFarm(
                                farm
                            );

                            return;

                        }


                        if(
                            action ===
                            "recruit"
                        ){

                            await openFarmRecruitment(
                                farm
                            );

                            return;

                        }

                    }
                );

            }
        );


    return card;

}


// =====================================================
// 作物選択
// =====================================================

function openCropSelection(
    farm
){

    const cropEntries =
        Object.values(
            farmCrops
        );


    if(
        cropEntries.length === 0
    ){

        showFarmMessage(
            "選択できる作物がありません。"
        );

        return;

    }


    let message =
        "作物を選択してください。\n\n";


    cropEntries.forEach(
        (crop, index) => {

            message +=
                (index + 1) +
                ". " +
                crop.name +
                "（約" +
                crop.value +
                " Pt）\n";

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

            plantedAt:
                now,

            harvestAt:
                now +
                crop.growthTime

        };


        await database
            .ref(
                "farms/" +
                farm.id
            )
            .update(
                updates
            );


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

async function harvestFarm(
    farm
){

    if(!farm){
        return;
    }


    if(!isFarmReady(farm)){

        showFarmMessage(
            "まだ収穫できません。"
        );

        return;

    }


    try{

        // ---------------------------------------------
        // 最新の農園データ
        // ---------------------------------------------

        const farmRef =
            database.ref(
                "farms/" +
                farm.id
            );


        const farmSnapshot =
            await farmRef.once(
                "value"
            );


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
            Number(
                latestFarm.harvestAt
            )
        ){

            showFarmMessage(
                "まだ収穫できません。"
            );

            return;

        }


        const crop =
            farmCrops[
                latestFarm.cropId
            ];


        const farmType =
            farmTypes[
                latestFarm.farmType
            ];


        if(
            !crop ||
            !farmType
        ){

            showFarmMessage(
                "農園データが正しくありません。"
            );

            return;

        }


        const workerCount =
            Number(
                latestFarm.workerCount || 0
            );


        const harvestAmount =
            calculateFarmHarvest(
                latestFarm.farmType,
                workerCount
            );


        // ---------------------------------------------
        // インベントリ取得
        // ---------------------------------------------

        const inventoryRef =
            database
                .ref(
                    "inventories/" +
                    currentUser.uid +
                    "/" +
                    crop.id
                );


        const inventorySnapshot =
            await inventoryRef.once(
                "value"
            );


        const currentItem =
            inventorySnapshot.val();


        const currentQuantity =
            Number(
                currentItem?.quantity || 0
            );


        // ---------------------------------------------
        // 更新
        // ---------------------------------------------

        const updates = {};


        updates[
            "inventories/" +
            currentUser.uid +
            "/" +
            crop.id
        ] = {

            name:
                crop.name,

            category:
                "food",

            icon:
                crop.icon,

            quantity:
                currentQuantity +
                harvestAmount,

            updatedAt:
                firebase.database
                    .ServerValue
                    .TIMESTAMP

        };


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
            crop.growthTime;


        await database
            .ref()
            .update(
                updates
            );


        showFarmMessage(

            crop.name +
            "を" +
            harvestAmount +
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
// 地主が求人を設定
// =====================================================

async function openFarmRecruitment(
    farm
){

    if(!farm){
        return;
    }


    if(
        !currentUser ||
        farm.ownerId !==
        currentUser.uid
    ){

        showFarmMessage(
            "この農園を管理する権限がありません。"
        );

        return;

    }


    const farmType =
        farmTypes[
            farm.farmType
        ];


    if(!farmType){
        return;
    }


    const workerCount =
        Number(
            farm.workerCount || 0
        );


    const capacity =
        Number(
            farm.workerCapacity ||
            farmType.workerCapacity ||
            0
        );


    if(
        workerCount >= capacity
    ){

        showFarmMessage(
            "この農園はすでに満員です。"
        );

        return;

    }


    const currentSalary =
        Number(
            farm.salary || 0
        );


    const input =
        prompt(

            "12時間アルバイトの賃金を設定してください。\n\n" +
            "半角数字のみ入力可能です。\n" +
            "現在の賃金：" +
            currentSalary +
            " Pt"

        );


    if(input === null){
        return;
    }


    const normalizedInput =
        String(input)
            .trim()
            .replace(
                /[０-９]/g,
                char =>
                    String.fromCharCode(
                        char.charCodeAt(0) - 0xFEE0
                    )
            );


    if(!/^[0-9]+$/.test(normalizedInput)){

        showFarmMessage(
            "賃金は半角数字のみ入力してください。"
        );

        return;

    }


    const salary =
        Number(normalizedInput);


    if(
        !Number.isFinite(salary) ||
        salary <= 0 ||
        !Number.isInteger(salary)
    ){

        showFarmMessage(
            "正しい整数の賃金を入力してください。"
        );

        return;

    }


    try{

        await database
            .ref(
                "farms/" +
                farm.id +
                "/salary"
            )
            .set(
                salary
            );


        showFarmMessage(

            salary.toLocaleString() +
            " Ptの12時間アルバイトを募集しました。"

        );


    }catch(error){

        console.error(
            "求人設定エラー:",
            error
        );


        showFarmMessage(
            "求人を設定できませんでした。"
        );

    }

}


// =====================================================
// メッセージ
// =====================================================

function showFarmMessage(
    message
){

    const element =
        document.getElementById(
            "message"
        );


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
// 成長時間表示更新
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
