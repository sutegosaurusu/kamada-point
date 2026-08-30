// =====================================================
// 求人・12時間アルバイト
// =====================================================

let currentJobsUser = null;

let jobsData = {};

let activeJob = null;

let currentPoint = 0;

let jobTimer = null;


// =====================================================
// 定数
// =====================================================

const JOB_DURATION =
    12 * 60 * 60 * 1000;


// =====================================================
// ログイン
// =====================================================

auth.onAuthStateChanged(user => {

    if(!user){

        location.href = "../index.html";

        return;

    }

    currentJobsUser = user;

    watchPoint();

    watchJobs();

    watchActiveJob();

});


// =====================================================
// ポイント監視
// =====================================================

function watchPoint(){

    database
        .ref(
            "members/" +
            currentJobsUser.uid +
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

}


// =====================================================
// 求人監視
// =====================================================

function watchJobs(){

    database
        .ref("farms")
        .on(
            "value",
            snapshot => {

                jobsData =
                    snapshot.val() || {};

                renderJobs();

            }
        );

}


// =====================================================
// 募集中の仕事
// =====================================================

function renderJobs(){

    const container =
        document.getElementById(
            "jobList"
        );

    if(!container){

        return;

    }


    const jobs =
        Object.entries(jobsData)
        .filter(
            ([farmId, farm]) => {

                if(!farm){

                    return false;

                }


                if(!farm.cropId){

                    return false;

                }


                if(
                    currentJobsUser &&
                    farm.ownerId ===
                    currentJobsUser.uid
                ){

                    return false;

                }


                if(
                    Number(
                        farm.salary || 0
                    ) <= 0
                ){

                    return false;

                }


                const farmType =
                    farmTypes[
                        farm.farmType
                    ];


                if(!farmType){

                    return false;

                }


                const workers =
                    Number(
                        farm.workerCount || 0
                    );


                const capacity =
                    Number(
                        farm.workerCapacity ||
                        farmType.workerCapacity
                    );


                return (
                    workers <
                    capacity
                );

            }
        );


    if(jobs.length === 0){

        container.innerHTML = `

            <div class="emptyJob">

                <div class="emptyJobTitle">
                    募集中の仕事はありません
                </div>

                <div class="emptyJobText">
                    農園主が求人を出すとここに表示されます。
                </div>

            </div>

        `;

        return;

    }


    container.innerHTML = "";


    jobs.forEach(
        ([farmId, farm]) => {

            const farmType =
                farmTypes[
                    farm.farmType
                ];

            const crop =
                farmCrops[
                    farm.cropId
                ];


            const workers =
                Number(
                    farm.workerCount || 0
                );


            const capacity =
                Number(
                    farm.workerCapacity ||
                    farmType.workerCapacity
                );


            const salary =
                Number(
                    farm.salary || 0
                );


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "jobCard";


            card.innerHTML = `

                <div class="jobHeader">

                    <div>

                        <div class="jobName">

                            ${farmType.icon}
                            ${escapeHtml(
                                farmType.name
                            )}

                        </div>

                        <div class="jobOwner">

                            地主：
                            ${escapeHtml(
                                farm.ownerName ||
                                "農園主"
                            )}

                        </div>

                    </div>

                </div>


                <div class="jobInfo">

                    <div class="infoBox">

                        <div class="infoLabel">
                            作物
                        </div>

                        <div class="infoValue">

                            ${crop?.icon || "🌱"}
                            ${escapeHtml(
                                crop?.name ||
                                "不明"
                            )}

                        </div>

                    </div>


                    <div class="infoBox">

                        <div class="infoLabel">
                            労働者
                        </div>

                        <div class="infoValue">

                            ${workers}
                            /
                            ${capacity}人

                        </div>

                    </div>


                    <div class="infoBox">

                        <div class="infoLabel">
                            労働時間
                        </div>

                        <div class="infoValue">
                            12時間
                        </div>

                    </div>


                    <div class="infoBox">

                        <div class="infoLabel">
                            報酬
                        </div>

                        <div class="infoValue">

                            ${salary.toLocaleString()}
                            Pt

                        </div>

                    </div>

                </div>


                <button
                    class="jobButton"
                    data-farm-id="${farmId}"
                >

                    ⚒ この仕事を始める

                </button>

            `;


            card
                .querySelector(
                    "[data-farm-id]"
                )
                .addEventListener(
                    "click",
                    () => {

                        startJob(
                            farmId,
                            farm
                        );

                    }
                );


            container.appendChild(
                card
            );

        }
    );

}


// =====================================================
// 現在の仕事監視
// =====================================================

function watchActiveJob(){

    database
        .ref(
            "activeJobs/" +
            currentJobsUser.uid
        )
        .on(
            "value",
            snapshot => {

                activeJob =
                    snapshot.val();

                renderActiveJob();

                updateJobTimer();

            }
        );

}


// =====================================================
// 現在の仕事表示
// =====================================================

function renderActiveJob(){

    const container =
        document.getElementById(
            "activeJob"
        );

    if(!container){

        return;

    }


    if(!activeJob){

        container.innerHTML = `

            <div class="emptyJob">

                <div class="emptyJobTitle">
                    現在仕事をしていません
                </div>

                <div class="emptyJobText">
                    下の求人から仕事を選べます。
                </div>

            </div>

        `;

        stopJobTimer();

        return;

    }


    if(
        activeJob.status ===
        "completed"
    ){

        const salary =
            Number(
                activeJob.salary || 0
            );


        container.innerHTML = `

            <div class="activeJobCard">

                <div class="activeJobTitle">
                    ✅ 仕事終了
                </div>

                <div class="activeJobCrop">
                    ${escapeHtml(
                        activeJob.farmName ||
                        "農園"
                    )}
                </div>

                <div class="jobInfo">

                    <div class="infoBox">

                        <div class="infoLabel">
                            労働時間
                        </div>

                        <div class="infoValue">
                            12時間
                        </div>

                    </div>


                    <div class="infoBox">

                        <div class="infoLabel">
                            報酬
                        </div>

                        <div class="infoValue">
                            ${salary.toLocaleString()} Pt
                        </div>

                    </div>

                </div>


                <div class="progressArea">

                    <div class="progressLabel">

                        <span>
                            仕事の進行
                        </span>

                        <span>
                            完了
                        </span>

                    </div>


                    <div class="progressBar">

                        <div
                            id="jobProgress"
                            class="progress"
                            style="width: 100%;"
                        ></div>

                    </div>

                </div>

                <div id="jobResultInline"></div>

                <button
                    class="jobButton"
                    id="resultButton"
                >

                    🏆 仕事の結果を見る

                </button>

            </div>

        `;


        document
            .getElementById(
                "resultButton"
            )
            .addEventListener(
                "click",
                showJobResult
            );


        stopJobTimer();

        return;

    }


    const farmName =
        activeJob.farmName ||
        "農園";


    const cropName =
        activeJob.cropName ||
        "作物";


    const salary =
        Number(
            activeJob.salary || 0
        );


    container.innerHTML = `

        <div class="activeJobCard">

            <div class="activeJobTitle">

                ⚒ ${escapeHtml(
                    farmName
                )}

            </div>


            <div class="activeJobCrop">

                作物：
                ${escapeHtml(
                    cropName
                )}

            </div>


            <div class="jobInfo">

                <div class="infoBox">

                    <div class="infoLabel">
                        労働時間
                    </div>

                    <div class="infoValue">
                        12時間
                    </div>

                </div>


                <div class="infoBox">

                    <div class="infoLabel">
                        報酬
                    </div>

                    <div class="infoValue">
                        ${salary.toLocaleString()} Pt
                    </div>

                </div>

            </div>


            <div class="progressArea">

                <div class="progressLabel">

                    <span>
                        仕事の進行
                    </span>

                    <span
                        id="jobRemaining"
                    >
                        計算中
                    </span>

                </div>


                <div class="progressBar">

                    <div
                        id="jobProgress"
                        class="progress"
                    ></div>

                </div>

            </div>

        </div>

    `;


}


// =====================================================
// 仕事開始
// =====================================================

async function startJob(
    farmId,
    farm
){

    if(activeJob){

        showJobMessage(
            "すでに仕事をしています。"
        );

        return;

    }


    const farmType =
        farmTypes[
            farm.farmType
        ];


    const crop =
        farmCrops[
            farm.cropId
        ];


    const salary =
        Number(
            farm.salary || 0
        );


    if(!farmType || !crop){

        showJobMessage(
            "仕事の情報が正しくありません。"
        );

        return;

    }


    if(salary <= 0){

        showJobMessage(
            "この求人は終了しています。"
        );

        return;

    }


    const workers =
        Number(
            farm.workerCount || 0
        );


    const capacity =
        Number(
            farm.workerCapacity ||
            farmType.workerCapacity
        );


    if(
        workers >= capacity
    ){

        showJobMessage(
            "この仕事は満員です。"
        );

        return;

    }


    const confirmed =
        confirm(

            farmType.name +
            "\n" +
            "作物：" +
            crop.name +
            "\n\n" +
            "12時間働きます。\n" +
            "報酬：" +
            salary.toLocaleString() +
            " Pt\n\n" +
            "仕事を開始しますか？"

        );


    if(!confirmed){

        return;

    }


    try{

        // -----------------------------------------
        // 最新状態
        // -----------------------------------------

        const farmSnapshot =
            await database
                .ref(
                    "farms/" +
                    farmId
                )
                .once("value");


        const latestFarm =
            farmSnapshot.val();


        if(!latestFarm){

            showJobMessage(
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

            showJobMessage(
                "この仕事は満員になりました。"
            );

            return;

        }


        const startAt =
            Date.now();


        const endAt =
            startAt +
            JOB_DURATION;


        const job = {

            farmId:farmId,

            farmName:
                latestFarm.ownerName
                ? farmType.name
                : farmType.name,

            cropId:
                latestFarm.cropId,

            cropName:
                crop.name,

            cropIcon:
                crop.icon,

            salary:
                Number(
                    latestFarm.salary ||
                    salary
                ),

            startAt:startAt,

            endAt:endAt,

            status:"working"

        };


        const updates = {};


        updates[
            "activeJobs/" +
            currentJobsUser.uid
        ] = job;


        updates[
            "farmWorkers/" +
            currentJobsUser.uid
        ] = {

            farmId:farmId,

            joinedAt:startAt,

            workEndAt:endAt,

            salary:job.salary,

            status:"working"

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


        showJobMessage(
            "12時間の仕事を開始しました。"
        );


    }catch(error){

        console.error(
            "仕事開始エラー:",
            error
        );


        showJobMessage(
            "仕事を開始できませんでした。"
        );

    }

}


// =====================================================
// ゲージ更新
// =====================================================

function updateJobTimer(){

    if(jobTimer){

        clearInterval(jobTimer);

    }


    if(
        !activeJob ||
        activeJob.status !==
        "working"
    ){

        return;

    }


    const update = () => {

        const now =
            Date.now();


        const start =
            Number(
                activeJob.startAt
            );


        const end =
            Number(
                activeJob.endAt
            );


        const total =
            end - start;


        const remaining =
            Math.max(
                0,
                end - now
            );


        const elapsed =
            Math.min(
                total,
                Math.max(
                    0,
                    now - start
                )
            );


        const percent =
            total > 0
            ? elapsed / total * 100
            : 100;


        const progress =
            document.getElementById(
                "jobProgress"
            );


        const remainingElement =
            document.getElementById(
                "jobRemaining"
            );


        if(progress){

            progress.style.width =
                percent + "%";

        }


        if(remainingElement){

            remainingElement.textContent =
                formatJobTime(
                    remaining
                );

        }


        if(remaining <= 0){

            clearInterval(
                jobTimer
            );

            completeJob();

        }

    };


    update();


    jobTimer =
        setInterval(
            update,
            1000
        );

}


// =====================================================
// 仕事終了
// =====================================================

async function completeJob(){

    if(!activeJob){

        return;

    }


    if(
        Date.now() <
        Number(activeJob.endAt)
    ){

        return;

    }


    try{

        await database
            .ref(
                "activeJobs/" +
                currentJobsUser.uid
            )
            .update({

                status:"completed",

                completedAt:
                    Date.now()

            });


        showJobMessage(
            "仕事が終了しました。"
        );


    }catch(error){

        console.error(
            "仕事終了エラー:",
            error
        );

    }

}


// =====================================================
// 結果表示
// =====================================================

function showJobResult(){

    if(!activeJob){

        return;

    }


    const section =
        document.getElementById(
            "resultSection"
        );


    const inlineTarget =
        document.getElementById(
            "jobResultInline"
        );


    const result =
        inlineTarget ||
        document.getElementById(
            "jobResult"
        );


    if(!result){

        return;

    }


    const salary =
        Number(
            activeJob.salary || 0
        );


    result.innerHTML = `

        <div class="resultCard">

            <div class="resultTitle">

                🎉 仕事完了

            </div>


            <div
                class="resultReward"
            >

                +${salary.toLocaleString()} Pt

            </div>


            <button
                class="jobButton"
                id="claimJobButton"
            >

                💰 報酬を受け取る

            </button>

        </div>

    `;


    if(section){
        section.style.display =
            "none";
    }


    const claimButton =
        document.getElementById(
            "claimJobButton"
        );


    if(claimButton){
        claimButton.addEventListener(
            "click",
            claimJobReward
        );
    }

}


// =====================================================
// 報酬を受け取る
// =====================================================

async function claimJobReward(){

    if(!activeJob){

        return;

    }


    if(
        activeJob.status !==
        "completed"
    ){

        showJobMessage(
            "まだ仕事が終わっていません。"
        );

        return;

    }


    const salary =
        Number(
            activeJob.salary || 0
        );


    if(salary <= 0){

        return;

    }


    try{

        // -----------------------------------------
        // ポイント加算
        // -----------------------------------------

        const pointRef =
            database.ref(
                "members/" +
                currentJobsUser.uid +
                "/point"
            );


        const transactionResult =
            await pointRef.transaction(
                point => {

                    return (
                        Number(point || 0) +
                        salary
                    );

                }
            );


        if(
            !transactionResult.committed
        ){

            throw new Error(
                "ポイント更新失敗"
            );

        }


        // -----------------------------------------
        // 農園の労働者数を減らす
        // -----------------------------------------

        const farmRef =
            database
                .ref(
                    "farms/" +
                    activeJob.farmId +
                    "/workerCount"
                );


        await farmRef.transaction(
            count => {

                return Math.max(
                    0,
                    Number(count || 0) - 1
                );

            }
        );


        // -----------------------------------------
        // 労働情報を削除
        // -----------------------------------------

        await database
            .ref(
                "farmWorkers/" +
                currentJobsUser.uid
            )
            .remove();


        await database
            .ref(
                "activeJobs/" +
                currentJobsUser.uid
            )
            .remove();


        sectionReset();


        showJobMessage(
            salary.toLocaleString() +
            " Ptを受け取りました。"
        );


    }catch(error){

        console.error(
            "報酬受取エラー:",
            error
        );


        showJobMessage(
            "報酬を受け取れませんでした。"
        );

    }

}


// =====================================================
// 結果画面を消す
// =====================================================

function sectionReset(){

    const section =
        document.getElementById(
            "resultSection"
        );


    const result =
        document.getElementById(
            "jobResult"
        );


    const inlineResult =
        document.getElementById(
            "jobResultInline"
        );


    if(section){

        section.style.display =
            "none";

    }


    if(result){

        result.innerHTML =
            "";

    }


    if(inlineResult){

        inlineResult.innerHTML =
            "";

    }

}


// =====================================================
// タイマー停止
// =====================================================

function stopJobTimer(){

    if(jobTimer){

        clearInterval(
            jobTimer
        );

        jobTimer =
            null;

    }

}


// =====================================================
// 時間表示
// =====================================================

function formatJobTime(
    milliseconds
){

    const totalSeconds =
        Math.max(
            0,
            Math.ceil(
                milliseconds / 1000
            )
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
        totalSeconds %
        60;


    return (

        String(hours)
            .padStart(2,"0")

        + ":" +

        String(minutes)
            .padStart(2,"0")

        + ":" +

        String(seconds)
            .padStart(2,"0")

    );

}


// =====================================================
// メッセージ
// =====================================================

function showJobMessage(
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
        showJobMessage.timer
    );


    showJobMessage.timer =
        setTimeout(
            () => {

                element.style.display =
                    "none";

            },
            3000
        );

}


console.log(
    "jobs.js読み込み完了"
);
