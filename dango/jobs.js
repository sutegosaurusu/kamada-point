// =====================================================
// 農園求人・労働システム
// =====================================================

let farmJobsData = {};
let currentJobsUser = null;


// =====================================================
// ログイン
// =====================================================

auth.onAuthStateChanged(user => {

    if(!user){
        return;
    }

    currentJobsUser = user;

    watchFarmJobs();
    watchMyJob();

});


// =====================================================
// 農園データ監視
// =====================================================

function watchFarmJobs(){

    database
        .ref("farms")
        .on("value", snapshot => {

            const allFarms =
                snapshot.val() || {};

            farmJobsData = allFarms;

            renderFarmJobs();
            renderMyFarmJobButtons();

        });

}


// =====================================================
// 求人一覧表示
// =====================================================

function renderFarmJobs(){

    const container =
        document.getElementById("jobList");

    if(!container){
        return;
    }

    const jobs =
        Object.entries(farmJobsData)
        .filter(([farmId, farm]) => {

            if(!farm){
                return false;
            }

            // 作物がない農園は求人不可
            if(!farm.cropId){
                return false;
            }

            // 自分の農園は求人一覧から除外
            if(
                currentJobsUser &&
                farm.ownerId === currentJobsUser.uid
            ){
                return false;
            }

            const farmType =
                farmTypes[farm.farmType];

            if(!farmType){
                return false;
            }

            const workers =
                Number(farm.workerCount || 0);

            const capacity =
                Number(
                    farm.workerCapacity ||
                    farmType.workerCapacity
                );

            // 募集枠が満員なら表示しない
            return workers < capacity;

        });


    if(jobs.length === 0){

        container.innerHTML = `
            <div class="emptyFarm">

                <div class="emptyFarmTitle">
                    現在募集中の農園はありません
                </div>

                <div class="emptyFarmText">
                    農園主が求人を出すと、ここに表示されます。
                </div>

            </div>
        `;

        return;
    }


    container.innerHTML = "";


    jobs.forEach(([farmId, farm]) => {

        const card =
            createJobCard(
                farmId,
                farm
            );

        container.appendChild(card);

    });

}


// =====================================================
// 求人カード
// =====================================================

function createJobCard(
    farmId,
    farm
){

    const farmType =
        farmTypes[farm.farmType];

    const crop =
        farmCrops[farm.cropId];

    const workerCount =
        Number(farm.workerCount || 0);

    const workerCapacity =
        Number(
            farm.workerCapacity ||
            farmType.workerCapacity
        );

    const salary =
        Number(
            farm.salary || 0
        );

    const card =
        document.createElement("div");

    card.className =
        "farmCard";


    card.innerHTML = `

        <div class="farmHeader">

            <div>

                <div class="farmName">
                    ${farmType.icon}
                    ${escapeHtml(farmType.name)}
                </div>

                <div class="farmType">
                    所有者：
                    ${escapeHtml(
                        farm.ownerName || "農園主"
                    )}
                </div>

            </div>

        </div>


        <div class="cropArea">

            <div class="cropTitle">
                🌱 作物
            </div>

            <div class="cropName">
                ${crop?.icon || "🌱"}
                ${escapeHtml(
                    crop?.name || "不明"
                )}
            </div>

        </div>


        <div class="workerArea">

            <div class="workerTitle">
                👨‍🌾 労働者
            </div>

            <div class="workerCount">
                ${workerCount} / ${workerCapacity}人
            </div>

            <div class="workerNotice">
                労働者が増えるほど地主の収穫量が増えます。
            </div>

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
                    労働時の収穫
                </div>

                <div class="infoValue">
                    ${
                        calculateFarmHarvest(
                            farm.farmType,
                            workerCount
                        )
                    }個
                </div>

            </div>

        </div>


        <div class="pointCard" style="margin:15px 0 0; width:100%;">

            <div class="pointLabel">
                労働賃金
            </div>

            <div class="point" style="font-size:26px;">
                ${salary.toLocaleString()} Pt
            </div>

        </div>


        <div class="farmButtons">

            <button
                class="farmButton"
                data-action="join">

                👨‍🌾 この農園で働く

            </button>

        </div>
    `;


    card
        .querySelector(
            '[data-action="join"]'
        )
        .addEventListener(
            "click",
            () => {

                joinFarmJob(
                    farmId,
                    farm
                );

            }
        );


    return card;

}

// =====================================================
// 自分の現在の仕事をリアルタイム表示
// =====================================================

function watchMyJob(){

    if(!currentJobsUser){
        return;
    }

    database
        .ref(
            "farmWorkers/" +
            currentJobsUser.uid
        )
        .on("value", async snapshot => {

            const job =
                snapshot.val();

            const container =
                document.getElementById("myJobArea");

            if(!container){
                return;
            }

            if(!job){

                container.innerHTML = `
                    <div class="emptyFarm">

                        <div class="emptyFarmTitle">
                            仕事をしていません
                        </div>

                        <div class="emptyFarmText">
                            農園の求人から仕事に参加できます。
                        </div>

                    </div>
                `;

                return;
            }

            const farmSnapshot =
                await database
                    .ref(
                        "farms/" +
                        job.farmId
                    )
                    .once("value");

            const farm =
                farmSnapshot.val();

            if(!farm){

                container.innerHTML = `
                    <div class="emptyFarm">

                        <div class="emptyFarmTitle">
                            農園情報が見つかりません
                        </div>

                    </div>
                `;

                return;
            }

            const farmType =
                farmTypes[farm.farmType];

            const crop =
                farmCrops[farm.cropId];

            const salary =
                Number(
                    job.salary ||
                    farm.salary ||
                    0
                );

            const workerCount =
                Number(
                    farm.workerCount || 0
                );

            const workerCapacity =
                Number(
                    farm.workerCapacity ||
                    farmType?.workerCapacity ||
                    0
                );

            container.innerHTML = `

                <div class="farmCard">

                    <div class="farmHeader">

                        <div>

                            <div class="farmName">
                                ${farmType?.icon || "🌾"}
                                ${escapeHtml(
                                    farmType?.name || "農園"
                                )}
                            </div>

                            <div class="farmType">
                                所有者：
                                ${escapeHtml(
                                    farm.ownerName || "農園主"
                                )}
                            </div>

                        </div>

                    </div>

                    <div class="cropArea">

                        <div class="cropTitle">
                            🌱 作物
                        </div>

                        <div class="cropName">
                            ${crop?.icon || "🌱"}
                            ${escapeHtml(
                                crop?.name || "未設定"
                            )}
                        </div>

                    </div>

                    <div class="workerArea">

                        <div class="workerTitle">
                            👨‍🌾 労働者
                        </div>

                        <div class="workerCount">
                            ${workerCount} / ${workerCapacity}人
                        </div>

                    </div>

                    <div class="workerArea">

                        <div class="workerTitle">
                            💰 労働賃金
                        </div>

                        <div class="workerCount">
                            ${salary.toLocaleString()} Pt
                        </div>

                    </div>

                    <div class="farmButtons">

                        <button
                            class="farmButton danger"
                            id="leaveFarmButton">

                            🚪 この仕事を辞める

                        </button>

                    </div>

                </div>
            `;

            const leaveButton =
                document.getElementById(
                    "leaveFarmButton"
                );

            if(leaveButton){

                leaveButton.addEventListener(
                    "click",
                    async () => {

                        await leaveFarmJob();

                    }
                );

            }

        });

}
// =====================================================
// 自分の農園の求人ボタン
// =====================================================

function renderMyFarmJobButtons(){

    // 自分の農園カードを描画している
    // farm.js側に求人ボタンを追加するための関数。
    // farm.jsとの結合部分は後述。

}


// =====================================================
// 求人を出す
// =====================================================

async function openFarmRecruitment(farm){

    if(!farm){
        return;
    }

    if(
        !currentJobsUser ||
        farm.ownerId !== currentJobsUser.uid
    ){

        showFarmJobMessage(
            "この農園を管理する権限がありません。"
        );

        return;

    }


    const farmType =
        farmTypes[farm.farmType];

    if(!farmType){
        return;
    }


    const currentWorkers =
        Number(
            farm.workerCount || 0
        );

    const capacity =
        Number(
            farm.workerCapacity ||
            farmType.workerCapacity
        );


    if(currentWorkers >= capacity){

        showFarmJobMessage(
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
            "労働者1人あたりの賃金を設定してください。\n\n" +
            "現在の賃金：" +
            currentSalary +
            " Pt"
        );


    if(input === null){
        return;
    }


    const salary =
        Number(input);


    if(
        !Number.isFinite(salary) ||
        salary <= 0
    ){

        showFarmJobMessage(
            "正しい賃金を入力してください。"
        );

        return;

    }


    if(
        !Number.isInteger(salary)
    ){

        showFarmJobMessage(
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
            .set(salary);


        showFarmJobMessage(
            salary.toLocaleString() +
            " Ptで求人を設定しました。"
        );


    }catch(error){

        console.error(
            "求人設定エラー:",
            error
        );

        showFarmJobMessage(
            "求人を設定できませんでした。"
        );

    }

}


// =====================================================
// 農園で働く
// =====================================================

async function joinFarmJob(
    farmId,
    farm
){

    if(!currentJobsUser){
        return;
    }


    // 自分の農園では働けない
    if(
        farm.ownerId ===
        currentJobsUser.uid
    ){

        showFarmJobMessage(
            "自分の農園では働けません。"
        );

        return;

    }


    const farmType =
        farmTypes[farm.farmType];

    if(!farmType){

        showFarmJobMessage(
            "農園情報がありません。"
        );

        return;

    }


    const workerCount =
        Number(
            farm.workerCount || 0
        );

    const capacity =
        Number(
            farm.workerCapacity ||
            farmType.workerCapacity
        );


    if(workerCount >= capacity){

        showFarmJobMessage(
            "この農園は満員です。"
        );

        return;

    }


    const salary =
        Number(
            farm.salary || 0
        );


    if(salary <= 0){

        showFarmJobMessage(
            "現在、この農園は求人を出していません。"
        );

        return;

    }


    // -------------------------------------------------
    // すでにどこかの農園で働いていないか確認
    // -------------------------------------------------

    const workerSnapshot =
        await database
            .ref(
                "farmWorkers/" +
                currentJobsUser.uid
            )
            .once("value");


    const currentJob =
        workerSnapshot.val();


    if(currentJob){

        showFarmJobMessage(
            "すでに別の農園で働いています。"
        );

        return;

    }


    const confirmed =
        confirm(
            "この農園で働きますか？\n\n" +
            "農園：" +
            farmType.name +
            "\n" +
            "作物：" +
            (
                farmCrops[
                    farm.cropId
                ]?.name || "不明"
            ) +
            "\n" +
            "賃金：" +
            salary.toLocaleString() +
            " Pt"
        );


    if(!confirmed){
        return;
    }


    try{

        const farmRef =
            database
                .ref(
                    "farms/" +
                    farmId
                );


        // ---------------------------------------------
        // 農園を最新状態で取得
        // ---------------------------------------------

        const latestSnapshot =
            await farmRef.once("value");


        const latestFarm =
            latestSnapshot.val();


        if(!latestFarm){

            showFarmJobMessage(
                "農園が見つかりません。"
            );

            return;

        }


        const latestWorkers =
            Number(
                latestFarm.workerCount || 0
            );


        const latestCapacity =
            Number(
                latestFarm.workerCapacity ||
                farmType.workerCapacity
            );


        if(
            latestWorkers >=
            latestCapacity
        ){

            showFarmJobMessage(
                "申し訳ありません。この農園は満員になりました。"
            );

            return;

        }


        // ---------------------------------------------
        // 労働者登録
        // ---------------------------------------------

        const workerPath =
            "farmWorkers/" +
            currentJobsUser.uid;


        const updates = {};


        updates[
            workerPath
        ] = {

            farmId:farmId,

            farmOwnerId:
                latestFarm.ownerId,

            farmOwnerName:
                latestFarm.ownerName ||
                "農園主",

            joinedAt:
                firebase.database
                    .ServerValue.TIMESTAMP,

            salary:
                Number(
                    latestFarm.salary || 0
                )

        };


        updates[
            "farms/" +
            farmId +
            "/workerCount"
        ] =
            latestWorkers + 1;


        await database
            .ref()
            .update(updates);


        showFarmJobMessage(
            "農園の仕事に参加しました。"
        );


    }catch(error){

        console.error(
            "農園参加エラー:",
            error
        );


        showFarmJobMessage(
            "農園に参加できませんでした。"
        );

    }

}


// =====================================================
// 農園を辞める
// =====================================================

async function leaveFarmJob(){

    if(!currentJobsUser){
        return;
    }


    const workerRef =
        database
            .ref(
                "farmWorkers/" +
                currentJobsUser.uid
            );


    const snapshot =
        await workerRef.once("value");


    const job =
        snapshot.val();


    if(!job){

        showFarmJobMessage(
            "現在、農園で働いていません。"
        );

        return;

    }


    const farmId =
        job.farmId;


    try{

        const farmRef =
            database
                .ref(
                    "farms/" +
                    farmId
                );


        const farmSnapshot =
            await farmRef.once("value");


        const farm =
            farmSnapshot.val();


        const updates = {};


        if(farm){

            const workers =
                Number(
                    farm.workerCount || 0
                );


            updates[
                "farms/" +
                farmId +
                "/workerCount"
            ] =
                Math.max(
                    0,
                    workers - 1
                );

        }


        updates[
            "farmWorkers/" +
            currentJobsUser.uid
        ] = null;


        await database
            .ref()
            .update(updates);


        showFarmJobMessage(
            "農園の仕事を辞めました。"
        );


    }catch(error){

        console.error(
            "退職エラー:",
            error
        );


        showFarmJobMessage(
            "仕事を辞められませんでした。"
        );

    }

}


// =====================================================
// 労働者の賃金を支払う
// =====================================================
//
// 今回は「農園で働いた結果、収穫時に賃金を支払う」
// 方式にします。
// farm.js の収穫処理から呼び出せます。
// =====================================================

async function payFarmWorkers(
    farmId,
    farm
){

    if(!farm){
        return;
    }


    const workersSnapshot =
        await database
            .ref(
                "farmWorkers"
            )
            .once("value");


    const allWorkers =
        workersSnapshot.val() || {};


    const workerEntries =
        Object.entries(allWorkers)
        .filter(
            ([uid, worker]) =>
                worker &&
                worker.farmId === farmId
        );


    if(
        workerEntries.length === 0
    ){

        return;

    }


    const salary =
        Number(
            farm.salary || 0
        );


    if(salary <= 0){
        return;
    }


    const updates = {};


    for(
        const [uid, worker]
        of workerEntries
    ){

        const pointSnapshot =
            await database
                .ref(
                    "members/" +
                    uid +
                    "/point"
                )
                .once("value");


        const current =
            Number(
                pointSnapshot.val() || 0
            );


        updates[
            "members/" +
            uid +
            "/point"
        ] =
            current + salary;

    }


    await database
        .ref()
        .update(updates);

}


// =====================================================
// メッセージ
// =====================================================

function showFarmJobMessage(
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
        showFarmJobMessage.timer
    );


    showFarmJobMessage.timer =
        setTimeout(
            () => {

                element.style.display =
                    "none";

            },
            3000
        );

}


// =====================================================
// jobs.js 読み込み完了
// =====================================================

console.log(
    "jobs.js読み込み完了"
);
