/* =====================================================
   テスト設定

   false：1時間を本当の1時間として計算します。
   true：1時間を1分として計算します。動作確認するときだけtrueに。
===================================================== */

const TEST_MODE = false;

/* =====================================================
   基本変数
===================================================== */

let inventoryData = {};
let activeExpedition = null;

let selectedLocationId = locations[0].id;
let selectedHours = 1;

let countdownTimer = null;

/* =====================================================
   ログイン確認
===================================================== */

auth.onAuthStateChanged(user => {

    if(!user){

        alert("先にログインしてください");

        location.href = "../index.html";

        return;
    }

    currentUser = user;

    renderLocations();
    updateRequirementDisplay();

    watchInventory();
    watchExpedition();
});

/* =====================================================
   場所を表示
===================================================== */

function renderLocations(){

    const locationScroll =
        document.getElementById("locationScroll");

    locationScroll.innerHTML = "";

    locations.forEach(location => {

        const card =
            document.createElement("div");

        card.className = "locationCard";

        if(location.id === selectedLocationId){
            card.classList.add("selected");
        }

        card.innerHTML = `
            <div class="locationIcon">
                ${location.icon}
            </div>

            <div class="locationName">
                ${escapeHtml(location.name)}
            </div>

            <div class="locationDescription">
                ${escapeHtml(location.description)}
            </div>

            <div class="difficulty">
                難易度：
                ${"★".repeat(location.difficulty)}
                ${"☆".repeat(6 - location.difficulty)}
            </div>

            <div class="rewardHint">
                報酬倍率：
                ×${location.rewardRate}
            </div>
        `;

        card.addEventListener("click", () => {

            if(activeExpedition){
                showMessage("探検中は場所を変更できません");
                return;
            }

            selectedLocationId = location.id;

            renderLocations();
            updateRequirementDisplay();
        });

        locationScroll.appendChild(card);
    });
}

/* =====================================================
   時間選択
===================================================== */

document
    .querySelectorAll(".timeButton")
    .forEach(button => {

        button.addEventListener("click", () => {

            if(activeExpedition){

                showMessage("探検中は時間を変更できません");
                return;
            }

            document
                .querySelectorAll(".timeButton")
                .forEach(timeButton => {

                    timeButton.classList.remove("active");

                });

            button.classList.add("active");

            selectedHours =
                Number(button.dataset.hours);

            updateRequirementDisplay();
        });
    });

/* =====================================================
   必要物資を計算
===================================================== */

function getRequirements(location,hours){

    const time =
        timeSettings[hours];

    const requiredFood =
        location.foodRate *
        time.foodMultiplier;

    const requiredWater =
        location.waterRate *
        time.waterMultiplier;

    const expectedReward =
        Math.max(
            1,
            Math.round(
                location.rewardRate *
                time.rewardMultiplier
            )
        );

    return {
        requiredFood,
        requiredWater,
        expectedReward
    };
}

function updateRequirementDisplay(){

    const location =
        getSelectedLocation();

    const requirements =
        getRequirements(
            location,
            selectedHours
        );

    document
        .getElementById("selectedTitle")
        .textContent =
            location.name +
            "・" +
            selectedHours +
            "時間";

    document
        .getElementById("requiredFood")
        .textContent =
            requirements.requiredFood;

    document
        .getElementById("requiredWater")
        .textContent =
            requirements.requiredWater;

    document
        .getElementById("expectedReward")
        .textContent =
            "約" +
            requirements.expectedReward +
            "個";
}

/* =====================================================
   インベントリ監視
===================================================== */

function watchInventory(){

    database
        .ref("inventories/" + currentUser.uid)
        .on("value", snapshot => {

            inventoryData =
                snapshot.val() || {};

            updateSupplyDisplay();
        });
}

function updateSupplyDisplay(){

    let foodCount = 0;
    let waterCount = 0;
    let allItemCount = 0;

    Object.values(inventoryData)
    .forEach(item => {

        if(!item){
            return;
        }

        const quantity =
            Number(item.quantity || 0);

        allItemCount += quantity;

        if(item.category === "food"){
            foodCount += quantity;
        }

        if(item.category === "water"){
            waterCount += quantity;
        }
    });

    document
        .getElementById("foodCount")
        .textContent =
            foodCount.toLocaleString();

    document
        .getElementById("waterCount")
        .textContent =
            waterCount.toLocaleString();

    document
        .getElementById("allItemCount")
        .textContent =
            allItemCount.toLocaleString();
}

/* =====================================================
   探検開始
===================================================== */

document
    .getElementById("startButton")
    .addEventListener("click", startExpedition);

async function startExpedition(){

    if(activeExpedition){

        showMessage("すでに探検中です");
        return;
    }

    const location =
        getSelectedLocation();

    const requirements =
        getRequirements(
            location,
            selectedHours
        );

    const foodTotal =
        getCategoryTotal("food");

    const waterTotal =
        getCategoryTotal("water");

    if(foodTotal < requirements.requiredFood){

        showMessage(
            "食べ物が" +
            (requirements.requiredFood - foodTotal) +
            "個足りません"
        );

        return;
    }

    if(waterTotal < requirements.requiredWater){

        showMessage(
            "水が" +
            (requirements.requiredWater - waterTotal) +
            "個足りません"
        );

        return;
    }

    const confirmed = confirm(
        location.name +
        "へ" +
        selectedHours +
        "時間の探検に出ます。\n\n" +
        "食べ物：" +
        requirements.requiredFood +
        "個\n" +
        "水：" +
        requirements.requiredWater +
        "個\n\n" +
        "開始しますか？"
    );

    if(!confirmed){
        return;
    }

    document.getElementById("startButton").disabled = true;

    try{

        const latestSnapshot =
            await database
                .ref(
                    "inventories/" +
                    currentUser.uid
                )
                .once("value");

        const latestInventory =
            latestSnapshot.val() || {};

        if(
            getCategoryTotalFromData(
                latestInventory,
                "food"
            ) < requirements.requiredFood
        ){

            showMessage("食べ物が足りません");
            return;
        }

        if(
            getCategoryTotalFromData(
                latestInventory,
                "water"
            ) < requirements.requiredWater
        ){

            showMessage("水が足りません");
            return;
        }

        const updates = {};

        consumeCategoryItems(
            latestInventory,
            "food",
            requirements.requiredFood,
            updates
        );

        consumeCategoryItems(
            latestInventory,
            "water",
            requirements.requiredWater,
            updates
        );

        const startAt = Date.now();

        const durationMilliseconds =
            getDurationMilliseconds(
                selectedHours
            );

        const endAt =
            startAt + durationMilliseconds;

        const expeditionData = {
            locationId:location.id,
            locationName:location.name,
            locationIcon:location.icon,

            hours:selectedHours,

            requiredFood:
                requirements.requiredFood,

            requiredWater:
                requirements.requiredWater,

            expectedReward:
                requirements.expectedReward,

            startAt:startAt,
            endAt:endAt,

            status:"exploring"
        };

        updates[
            "activeExpeditions/" +
            currentUser.uid
        ] = expeditionData;

        await database.ref().update(updates);

        showMessage("探検を開始しました");

    }catch(error){

        console.error(error);
        showMessage("探検を開始できませんでした");

    }finally{

        document.getElementById("startButton").disabled = false;
    }
}

/* =====================================================
   食料・水を複数のアイテムから減らす
===================================================== */

function consumeCategoryItems(
    inventory,
    category,
    amount,
    updates
){

    let remaining = amount;

    const items =
        Object.entries(inventory)
        .filter(([itemId,item]) => {

            return (
                item &&
                item.category === category &&
                Number(item.quantity || 0) > 0
            );
        });

    for(const [itemId,item] of items){

        if(remaining <= 0){
            break;
        }

        const quantity =
            Number(item.quantity || 0);

        const consumeAmount =
            Math.min(quantity,remaining);

        const newQuantity =
            quantity - consumeAmount;

        const path =
            "inventories/" +
            currentUser.uid +
            "/" +
            itemId;

        if(newQuantity <= 0){

            updates[path] = null;

        }else{

            updates[
                path + "/quantity"
            ] = newQuantity;

            updates[
                path + "/updatedAt"
            ] =
                firebase.database
                    .ServerValue.TIMESTAMP;
        }

        remaining -= consumeAmount;
    }

    if(remaining > 0){
        throw new Error("物資が不足しています");
    }
}

/* =====================================================
   探検状態を監視
===================================================== */

function watchExpedition(){

    database
        .ref(
            "activeExpeditions/" +
            currentUser.uid
        )
        .on("value", snapshot => {

            activeExpedition =
                snapshot.val();

            if(activeExpedition){

                showActiveExpedition();

            }else{

                hideActiveExpedition();
            }
        });
}

function showActiveExpedition(){

    const panel =
        document.getElementById(
            "expeditionPanel"
        );

    panel.classList.add("show");

    document
        .getElementById("expeditionName")
        .textContent =
            activeExpedition.locationIcon +
            " " +
            activeExpedition.locationName;

    document
        .getElementById(
            "expeditionInformation"
        )
        .textContent =
            activeExpedition.hours +
            "時間の探検に出ています。";

    document
        .getElementById("startButton")
        .disabled = true;

    startCountdown();
}

function hideActiveExpedition(){

    document
        .getElementById("expeditionPanel")
        .classList.remove("show");

    document
        .getElementById("startButton")
        .disabled = false;

    if(countdownTimer){
        clearInterval(countdownTimer);
    }
}

/* =====================================================
   残り時間
===================================================== */

function startCountdown(){

    if(countdownTimer){
        clearInterval(countdownTimer);
    }

    updateCountdown();

    countdownTimer =
        setInterval(updateCountdown,1000);
}

function updateCountdown(){

    if(!activeExpedition){
        return;
    }

    const now = Date.now();

    const remaining =
        Number(activeExpedition.endAt) - now;

    const totalDuration =
        Number(activeExpedition.endAt) -
        Number(activeExpedition.startAt);

    const elapsed =
        now -
        Number(activeExpedition.startAt);

    const progress =
        Math.min(
            100,
            Math.max(
                0,
                (elapsed / totalDuration) * 100
            )
        );

    document
        .getElementById("progressFill")
        .style.width =
            progress + "%";

    const claimButton =
        document.getElementById("claimButton");

    if(remaining <= 0){

        document
            .getElementById("countdown")
            .textContent =
                "探検完了";

        claimButton.disabled = false;
        claimButton.textContent =
            "持ち帰った品物を受け取る";

        clearInterval(countdownTimer);

        return;
    }

    document
        .getElementById("countdown")
        .textContent =
            formatTime(remaining);

    claimButton.disabled = true;
    claimButton.textContent =
        "探検中です";
}

function formatTime(milliseconds){

    const totalSeconds =
        Math.ceil(milliseconds / 1000);

    const hours =
        Math.floor(totalSeconds / 3600);

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

/* =====================================================
   報酬受け取り
===================================================== */

document
    .getElementById("claimButton")
    .addEventListener("click", claimRewards);

async function claimRewards(){

    if(!activeExpedition){
        return;
    }

    if(Date.now() < Number(activeExpedition.endAt)){

        showMessage("探検はまだ終わっていません");
        return;
    }

    const claimButton =
        document.getElementById("claimButton");

    claimButton.disabled = true;

    try{

        const expeditionSnapshot =
            await database
                .ref(
                    "activeExpeditions/" +
                    currentUser.uid
                )
                .once("value");

        const latestExpedition =
            expeditionSnapshot.val();

        if(!latestExpedition){

            showMessage("すでに受け取り済みです");
            return;
        }

        if(
            Date.now()  <
            Number(latestExpedition.endAt)
        ){

            showMessage("探検はまだ終わっていません");
            return;
        }

        const location =
            locations.find(location =>
                location.id ===
                latestExpedition.locationId
            );

        if(!location){
            throw new Error("場所が見つかりません");
        }

        const rewardCount =
            createRewardCount(
                latestExpedition,
                location
            );

        const rewards =
            generateRewards(
                location,
                rewardCount
            );

        const updates = {};

        for(const reward of rewards){

            const inventoryPath =
                "inventories/" +
                currentUser.uid +
                "/" +
                reward.itemId;

            const currentItem =
                inventoryData[reward.itemId];

            const currentQuantity =
                Number(
                    currentItem?.quantity || 0
                );

            updates[inventoryPath] = {
                name:reward.name,
                category:reward.category,
                icon:reward.icon,
                quantity:
                    currentQuantity +
                    reward.quantity,
                updatedAt:
                    firebase.database
                        .ServerValue.TIMESTAMP
            };
        }

        updates[
            "activeExpeditions/" +
            currentUser.uid
        ] = null;

        await database.ref().update(updates);

        showRewardResult(rewards);

        showMessage(
            "探検の報酬を受け取りました"
        );

    }catch(error){

        console.error(error);
        showMessage("報酬を受け取れませんでした");

    }finally{

        claimButton.disabled = false;
    }
}

/* =====================================================
   報酬数を計算
===================================================== */

function createRewardCount(
    expedition,
    location
){

    const basicCount =
        Number(
            expedition.expectedReward || 1
        );

    /*
    基本獲得数の80%から120%の範囲で変動
    */

    const randomMultiplier =
        0.8 + Math.random() * 0.4;

    return Math.max(
        1,
        Math.round(
            basicCount *
            randomMultiplier
        )
    );
}

/* =====================================================
   報酬抽選
===================================================== */

function generateRewards(
    location,
    rewardCount
){

    const result = {};

    for(let i = 0; i < rewardCount; i++){

        const reward =
            selectWeightedReward(
                location.rewards
            );

        if(!result[reward.itemId]){

            result[reward.itemId] = {
                ...reward,
                quantity:0
            };
        }

        result[reward.itemId].quantity++;
    }

    return Object.values(result);
}

function selectWeightedReward(rewards){

    const totalWeight =
        rewards.reduce(
            (total,reward) =>
                total +
                Number(reward.weight || 0),
            0
        );

    let random =
        Math.random() * totalWeight;

    for(const reward of rewards){

        random -= Number(reward.weight || 0);

        if(random <= 0){
            return reward;
        }
    }

    return rewards[rewards.length - 1];
}

/* =====================================================
   報酬画面
===================================================== */

function showRewardResult(rewards){

    const resultArea =
        document.getElementById(
            "rewardResult"
        );

    const rewardList =
        document.getElementById(
            "rewardList"
        );

    rewardList.innerHTML = "";

    rewards.forEach(reward => {

        const item =
            document.createElement("div");

        item.className = "rewardItem";

        item.innerHTML = `
            <div class="rewardIcon">
                ${reward.icon}
            </div>

            <div class="rewardName">
                ${escapeHtml(reward.name)}
            </div>

            <div>
                ×${reward.quantity}
            </div>
        `;

        rewardList.appendChild(item);
    });

    resultArea.classList.add("show");

    resultArea.scrollIntoView({
        behavior:"smooth",
        block:"center"
    });
}

/* =====================================================
   共通処理
===================================================== */

function getSelectedLocation(){

    return (
        locations.find(
            location =>
                location.id ===
                selectedLocationId
        ) ||
        locations[0]
    );
}

function getCategoryTotal(category){

    return getCategoryTotalFromData(
        inventoryData,
        category
    );
}

function getCategoryTotalFromData(
    inventory,
    category
){

    return Object.values(inventory)
        .filter(item =>
            item &&
            item.category === category
        )
        .reduce(
            (total,item) =>
                total +
                Number(item.quantity || 0),
            0
        );
}

function getDurationMilliseconds(hours){

    if(TEST_MODE){

        /*
        テスト時：
        1時間を1分として扱う
        */

        return hours * 60 * 1000;
    }

    return hours * 60 * 60 * 1000;
}
