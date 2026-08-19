// =====================================================
// アグロポリス農園システム
// =====================================================
// farm.js の役割
//
// ① 自分の農園を表示
// ② 作物を選ぶ
// ③ 作物を植える
// ④ 12時間の成長を管理
// ⑤ 収穫する
// ⑥ 地主がアルバイト求人を設定する
//
// ※ 農地購入 → shop.js
// ※ 農地売却 → shop.js
// ※ アルバイト参加・12時間労働 → jobs.js
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

    // common.js 側の currentUser を使用
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
    // 自分のポイント
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


                const pointElement =
                    document.getElementById(
                        "point"
                    );


                if(pointElement){

                    pointElement.textContent =
                        currentPoint.toLocaleString() +
                        " Pt";

                }

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


    // -----------------------------------------------
    // 農園を持っていない
    // -----------------------------------------------

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


    // -----------------------------------------------
    // 農園カード表示
    // -----------------------------------------------

    container.innerHTML = "";


    farms.forEach(
        farm => {

            const card =
                createFarmCard(
                    farm
                );

            container.appendChild(
                card
            );

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


    // -----------------------------------------------
    // 農園種類が不明
    // -----------------------------------------------

    if(!farmType){

        const errorCard =
            document.createElement(
                "div"
            );


        errorCard.className =
            "farmCard";


        errorCard.innerHTML = `

            <div class="farmName">
                不明な農園
            </div>

        `;


        return errorCard;

    }


    // -----------------------------------------------
    // 作物
    // -----------------------------------------------

    const crop =
        farm.cropId
        ? farmCrops[farm.cropId]
        : null;


    // -----------------------------------------------
    // 労働者
    // -----------------------------------------------

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


    // -----------------------------------------------
    // 求人賃金
    // -----------------------------------------------

    const salary =
        Number(
            farm.salary || 0
        );


    // -----------------------------------------------
    // 収穫量
    // -----------------------------------------------

    const harvestAmount =
        crop
        ? calculateFarmHarvest(
            farm.farmType,
            workerCount
        )
        : 0;


    // -----------------------------------------------
    // 成長状態
    // -----------------------------------------------

    const ready =
        crop &&
        isFarmReady(farm);


    const remaining =
        crop && !ready
        ? getFarmRemainingTime(farm)
        : 0;


    // -----------------------------------------------
    // 労働者受付状態
    // -----------------------------------------------

    const acceptingWorkers =
        workerCount <
        workerCapacity;


    // -----------------------------------------------
    // カード
    // -----------------------------------------------

    const card =
        document.createElement(
            "div"
        );


    card.className =
        "farmCard";


    // =================================================
    // 作物表示
    // =================================================

    let cropHtml = "";


    // -------------------------------------------------
    // 作物なし
    // -------------------------------------------------

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

    }

    // -------------------------------------------------
    // 作物あり
    // -------------------------------------------------

    else{

        cropHtml = `

            <div class="cropArea">

                <div class="cropTitle">
                    🌱 作物
                </div>

                <div class="cropName">

                    ${crop.icon || "🌱"}

                    ${escapeHtml(
                        crop.name
                    )}

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
    // 求人表示
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
                            Pt
                            / 12時間

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
    // カードHTML
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
    // ボタンイベント
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


                        // -----------------------------
                        // 作物を選ぶ
                        // -----------------------------

                        if(
                            action ===
                            "plant"
                        ){

                            openCropSelection(
                                farm
                            );

                            return;

                        }


                        // -----------------------------
                        // 作物変更
                        // -----------------------------

                        if(
                            action ===
                            "cropSelect"
                        ){

                            openCropSelection(
                                farm
                            );

                            return;

                        }


                        // -----------------------------
                        // 求人設定
                        // -----------------------------

                        if(
                            action ===
                            "recruit"
                        ){

                            await openFarmRecruitment(
                                {
                                    ...farm,
                                    id:farm.id
                                }
                            );

                            return;

                        }


                        // -----------------------------
                        // 収穫
                        // -----------------------------

                        if(
                            action ===
                            "harvest"
                        ){

                            await harvestFarm(
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
        prompt(
            message
        );


    if(
        answer === null
    ){

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

    if(!currentUser){

        return;

    }


    const crop =
        farmCrops[
            cropId
        ];


    if(!crop){

        showFarmMessage(
            "作物が見つかりません。"
        );

        return;

    }


    // -------------------------------------------------
    // すでに作物が育っている場合
    // -------------------------------------------------

    if(
        farm.cropId &&
        farm.harvestAt &&
        Date.now() <
        Number(farm.harvestAt)
    ){

        const confirmed =
            confirm(
                "現在の作物はまだ成長中です。\n" +
                "変更すると現在の作物をやめて、新しい作物を植えます。\n\n" +
                "続行しますか？"
            );


        if(!confirmed){

            return;

        }

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

            cropId:
                cropId,

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

    if(!currentUser){

        return;

    }


    if(!farm){

        return;

    }


    // -------------------------------------------------
    // 収穫可能か確認
    // -------------------------------------------------

    if(
        !isFarmReady(farm)
    ){

        showFarmMessage(
            "まだ収穫できません。"
        );

        return;

    }


    // -------------------------------------------------
    // 最新農園データを取得
    // -------------------------------------------------

    try{

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


        // -------------------------------------------------
        // もう一度、収穫可能か確認
        // -------------------------------------------------

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


        // -------------------------------------------------
        // 労働者数
        // -------------------------------------------------

        const workerCount =
            Number(
                latestFarm.workerCount ||
                0
            );


        // -------------------------------------------------
        // 最新収穫量
        // -------------------------------------------------

        const harvestAmount =
            calculateFarmHarvest(
                latestFarm.farmType,
                workerCount
            );


        // -------------------------------------------------
        // インベントリを取得
        // -------------------------------------------------

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
                currentItem?.quantity ||
                0
            );


        // -------------------------------------------------
        // 更新データ
        // -------------------------------------------------

        const updates = {};


        // 収穫物
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


        // -------------------------------------------------
        // 次の12時間栽培
        // -------------------------------------------------

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


        // -------------------------------------------------
        // まとめて保存
        // -------------------------------------------------

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

        showFarmMessage(
            "農園情報が見つかりません。"
        );

        return;

    }


    const currentWorkers =
        Number(
            farm.workerCount ||
            0
        );


    const capacity =
        Number(
            farm.workerCapacity ||
            farmType.workerCapacity ||
            0
        );


    if(
        currentWorkers >=
        capacity
    ){

        showFarmMessage(
            "この農園はすでに満員です。"
        );

        return;

    }


    const currentSalary =
        Number(
            farm.salary ||
            0
        );


    const input =
        prompt(

            "12時間アルバイトの賃金を設定してください。\n\n" +
            "現在の賃金：" +
            currentSalary +
            " Pt"

        );


    if(
        input === null
    ){

        return;

    }


    const salary =
        Number(
            input
        );


    if(
        !Number.isFinite(salary) ||
        salary <= 0
    ){

        showFarmMessage(
            "正しい賃金を入力してください。"
        );

        return;

    }


    if(
        !Number.isInteger(
            salary
        )
    ){

        showFarmMessage(
            "賃金は整数で入力してください。"
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

        alert(
            message
        );

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
// 農園表示更新
// =====================================================

setInterval(
    () => {

        if(currentUser){

            renderMyFarms();

        }

    },
    1000
);


// =====================================================
// 読み込み完了
// =====================================================

console.log(
    "farm.js読み込み完了"
);
