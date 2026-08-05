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

/*
持っていくアイテムのスロット
（食べ物3枠・水2枠・装備3枠、埋まっていない枠があってもよい）
*/

const SLOT_COUNTS = {
    food:3,
    water:2,
    equipment:3
};

let selectedSlots = {
    food:[null,null,null],
    water:[null,null],
    equipment:[null,null,null]
};

/*
現在開いているスロット選択モーダル
*/

let openSlot = null;

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
                基本成功率：
                ${Math.round(location.baseSuccessRate * 100)}%
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

/* =====================================================
   スロットのユーティリティ
===================================================== */

function getSlotItemIds(category){

    return selectedSlots[category]
        .filter(itemId => itemId !== null);
}

function getAllSelectedItemIds(){

    return [
        ...getSlotItemIds("food"),
        ...getSlotItemIds("water"),
        ...getSlotItemIds("equipment")
    ];
}

function getSelectedCategoryTotal(category){

    return getSlotItemIds(category).reduce(
        (total,itemId) => {

            const item = inventoryData[itemId];

            return (
                total +
                Number(item?.quantity || 0)
            );
        },
        0
    );
}

/*
枠に入っているアイテムが無効になっていないか
（所持数0・消滅など）を確認して取り除く
*/

function pruneSelectedSlots(){

    Object.keys(selectedSlots).forEach(category => {

        selectedSlots[category] =
            selectedSlots[category].map(itemId => {

                if(itemId === null){
                    return null;
                }

                const item = inventoryData[itemId];

                const valid =
                    item &&
                    item.category === category &&
                    Number(item.quantity || 0) > 0;

                return valid ? itemId : null;
            });
    });
}

/* =====================================================
   持っていくアイテムの効果を計算
===================================================== */

function computeSuccessRateBonus(){

    let bonus = 0;

    getAllSelectedItemIds().forEach(itemId => {

        const effect = itemEffects[itemId];

        if(effect && effect.successRate){
            bonus += effect.successRate;
        }
    });

    return bonus;
}

function computeEffectiveSuccessRate(location){

    const rate =
        location.baseSuccessRate +
        computeSuccessRateBonus();

    return Math.min(0.95,Math.max(0.05,rate));
}

function computeEffectiveRewardWeights(location){

    const selectedIds =
        getAllSelectedItemIds();

    return location.rewards.map(reward => {

        let weight = reward.weight;

        selectedIds.forEach(itemId => {

            const effect = itemEffects[itemId];

            if(
                effect &&
                effect.boostItemId === reward.itemId
            ){
                weight += effect.boostAmount;
            }
        });

        return { ...reward, weight };
    });
}

function findRewardName(itemId){

    for(const location of locations){

        const found =
            location.rewards.find(
                reward => reward.itemId === itemId
            );

        if(found){
            return found.name;
        }
    }

    return null;
}

function getEffectText(itemId){

    const effect = itemEffects[itemId];

    if(!effect){
        return "";
    }

    if(effect.successRate){

        return (
            "成功率+" +
            Math.round(effect.successRate * 100) +
            "%"
        );
    }

    if(effect.boostItemId){

        const targetName =
            findRewardName(effect.boostItemId);

        return (
            (targetName || effect.boostItemId) +
            "の入手率アップ"
        );
    }

    return "";
}

/* =====================================================
   スロット枠の表示
===================================================== */

function renderItemSelection(){

    pruneSelectedSlots();

    renderSlotGrid("food","foodSlotList");
    renderSlotGrid("water","waterSlotList");
    renderSlotGrid("equipment","equipmentSlotList");

    updateSlotHeaders();
}

function updateSlotHeaders(){

    document
        .getElementById("foodSelectHeader")
        .textContent =
            "🍖 食べ物（" +
            getSlotItemIds("food").length +
            "/" +
            SLOT_COUNTS.food +
            "）";

    document
        .getElementById("waterSelectHeader")
        .textContent =
            "💧 水（" +
            getSlotItemIds("water").length +
            "/" +
            SLOT_COUNTS.water +
            "）";

    document
        .getElementById("equipmentSelectHeader")
        .textContent =
            "🎒 装備（" +
            getSlotItemIds("equipment").length +
            "/" +
            SLOT_COUNTS.equipment +
            "）";
}

function renderSlotGrid(category,containerId){

    const container =
        document.getElementById(containerId);

    container.innerHTML = "";

    const slotCount =
        SLOT_COUNTS[category];

    for(let slotIndex = 0; slotIndex < slotCount; slotIndex++){

        const itemId =
            selectedSlots[category][slotIndex];

        const slotBox =
            document.createElement("div");

        slotBox.className = "slotBox";

        const locked = !!activeExpedition;

        if(locked){
            slotBox.classList.add("locked");
        }

        if(itemId){

            slotBox.classList.add("filled");

            const item =
                inventoryData[itemId];

            const effectText =
                getEffectText(itemId);

            slotBox.innerHTML = `
                <div class="slotItemName">
                    ${item?.icon || ""}
                    ${escapeHtml(item?.name || "")}
                </div>

                <div class="slotItemQty">
                    所持${item?.quantity ?? 0}
                </div>

                ${
                    effectText
                    ? `<div class="slotEffect">${escapeHtml(effectText)}</div>`
                    : ""
                }

                ${
                    locked
                    ? ""
                    : `<button class="slotClearButton" type="button">×</button>`
                }
            `;

            if(!locked){

                const clearButton =
                    slotBox.querySelector(
                        ".slotClearButton"
                    );

                clearButton.addEventListener(
                    "click",
                    event => {

                        event.stopPropagation();

                        selectedSlots[category][slotIndex] = null;

                        renderItemSelection();
                        updateRequirementDisplay();
                    }
                );
            }

        }else{

            slotBox.innerHTML = `
                <div class="slotPlaceholder">
                    ＋ タップして選択
                </div>
            `;
        }

        if(!locked){

            slotBox.addEventListener("click", () => {
                openSlotPicker(category,slotIndex);
            });
        }

        container.appendChild(slotBox);
    }
}

/* =====================================================
   スロット選択モーダル
===================================================== */

function openSlotPicker(category,slotIndex){

    if(activeExpedition){
        return;
    }

    openSlot = { category, slotIndex };

    renderSlotModal();

    document
        .getElementById("slotModalOverlay")
        .classList.add("show");
}

function closeSlotPicker(){

    openSlot = null;

    document
        .getElementById("slotModalOverlay")
        .classList.remove("show");
}

function renderSlotModal(){

    if(!openSlot){
        return;
    }

    const { category, slotIndex } = openSlot;

    const categoryLabel = {
        food:"食べ物",
        water:"水",
        equipment:"装備"
    }[category];

    document
        .getElementById("slotModalTitle")
        .textContent =
            categoryLabel + "を選択";

    const list =
        document.getElementById("slotModalList");

    list.innerHTML = "";

    const currentItemId =
        selectedSlots[category][slotIndex];

    /*
    他の枠ですでに選ばれているアイテムは
    候補から除く（同じアイテムの重複選択を防ぐ）
    */

    const usedElsewhere =
        selectedSlots[category]
        .filter((id,index) =>
            id !== null && index !== slotIndex
        );

    const options =
        Object.entries(inventoryData)
        .filter(([itemId,item]) => {

            return (
                item &&
                item.category === category &&
                Number(item.quantity || 0) > 0 &&
                !usedElsewhere.includes(itemId)
            );
        });

    if(currentItemId){

        const clearOption =
            document.createElement("button");

        clearOption.type = "button";
        clearOption.className =
            "slotModalOption clearOption";

        clearOption.textContent = "選択を解除する";

        clearOption.addEventListener("click", () => {

            selectedSlots[category][slotIndex] = null;

            closeSlotPicker();
            renderItemSelection();
            updateRequirementDisplay();
        });

        list.appendChild(clearOption);
    }

    if(options.length === 0){

        const empty =
            document.createElement("p");

        empty.className = "slotModalEmpty";

        empty.textContent =
            "持っている" + categoryLabel + "がありません";

        list.appendChild(empty);

        return;
    }

    options.forEach(([itemId,item]) => {

        const effectText =
            getEffectText(itemId);

        const option =
            document.createElement("button");

        option.type = "button";
        option.className = "slotModalOption";

        option.innerHTML = `
            <span>
                ${item.icon || ""}
                ${escapeHtml(item.name)}
                （所持${item.quantity}）
                ${
                    effectText
                    ? " ／ " + escapeHtml(effectText)
                    : ""
                }
            </span>
        `;

        option.addEventListener("click", () => {

            selectedSlots[category][slotIndex] = itemId;

            closeSlotPicker();
            renderItemSelection();
            updateRequirementDisplay();
        });

        list.appendChild(option);
    });
}

document
    .getElementById("slotModalCloseButton")
    .addEventListener("click", closeSlotPicker);

document
    .getElementById("slotModalOverlay")
    .addEventListener("click", event => {

        if(event.target.id === "slotModalOverlay"){
            closeSlotPicker();
        }
    });

/* =====================================================
   条件表示の更新
===================================================== */

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
            getSelectedCategoryTotal("food") +
            " / " +
            requirements.requiredFood;

    document
        .getElementById("requiredWater")
        .textContent =
            getSelectedCategoryTotal("water") +
            " / " +
            requirements.requiredWater;

    document
        .getElementById("successRateDisplay")
        .textContent =
            Math.round(
                computeEffectiveSuccessRate(location) * 100
            ) +
            "%";

    document
        .getElementById("expectedReward")
        .textContent =
            "約" +
            requirements.expectedReward +
            "個（成功時）";
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
            renderItemSelection();
            updateRequirementDisplay();

            if(openSlot){
                renderSlotModal();
            }
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

    const selectedFoodIds =
        getSlotItemIds("food");

    const selectedWaterIds =
        getSlotItemIds("water");

    const selectedEquipmentIds =
        getSlotItemIds("equipment");

    if(selectedFoodIds.length === 0){
        showMessage("持っていく食べ物を選んでください");
        return;
    }

    if(selectedWaterIds.length === 0){
        showMessage("持っていく水を選んでください");
        return;
    }

    const selectedFoodTotal =
        getSelectedCategoryTotal("food");

    const selectedWaterTotal =
        getSelectedCategoryTotal("water");

    if(selectedFoodTotal < requirements.requiredFood){

        showMessage(
            "選んだ食べ物が" +
            (requirements.requiredFood - selectedFoodTotal) +
            "個足りません"
        );

        return;
    }

    if(selectedWaterTotal < requirements.requiredWater){

        showMessage(
            "選んだ水が" +
            (requirements.requiredWater - selectedWaterTotal) +
            "個足りません"
        );

        return;
    }

    const successRate =
        computeEffectiveSuccessRate(location);

    const rewardWeights =
        computeEffectiveRewardWeights(location);

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
        "個\n" +
        "装備：" +
        selectedEquipmentIds.length +
        "個\n" +
        "成功率：約" +
        Math.round(successRate * 100) +
        "%\n\n" +
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

        const updates = {};

        consumeSelectedItems(
            latestInventory,
            selectedFoodIds,
            requirements.requiredFood,
            updates
        );

        consumeSelectedItems(
            latestInventory,
            selectedWaterIds,
            requirements.requiredWater,
            updates
        );

        consumeEquipmentItems(
            latestInventory,
            selectedEquipmentIds,
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

            successRate:successRate,
            rewardWeights:rewardWeights,

            startAt:startAt,
            endAt:endAt,

            status:"exploring"
        };

        updates[
            "activeExpeditions/" +
            currentUser.uid
        ] = expeditionData;

        await database.ref().update(updates);

        selectedSlots = {
            food:[null,null,null],
            water:[null,null],
            equipment:[null,null,null]
        };

        showMessage("探検を開始しました");

    }catch(error){

        console.error(error);

        showMessage(
            error.message === "物資が不足しています"
            ? "物資が不足しています"
            : "探検を開始できませんでした"
        );

    }finally{

        document.getElementById("startButton").disabled = false;
    }
}

/* =====================================================
   選択したアイテムから食料・水を減らす
===================================================== */

function consumeSelectedItems(
    inventory,
    itemIds,
    amount,
    updates
){

    let remaining = amount;

    for(const itemId of itemIds){

        if(remaining <= 0){
            break;
        }

        const item = inventory[itemId];

        if(!item){
            continue;
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
   選択した装備を1個ずつ消費する
===================================================== */

function consumeEquipmentItems(
    inventory,
    itemIds,
    updates
){

    for(const itemId of itemIds){

        const item = inventory[itemId];

        if(!item || Number(item.quantity || 0) <= 0){
            throw new Error("物資が不足しています");
        }

        const quantity =
            Number(item.quantity);

        const newQuantity =
            quantity - 1;

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

            renderItemSelection();
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
            "時間の探検に出ています。（成功率 約" +
            Math.round(
                Number(activeExpedition.successRate || 0) * 100
            ) +
            "%）";

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
            "結果を受け取る";

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
   結果受け取り（成功/失敗判定）
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

        const successRate =
            Number(
                latestExpedition.successRate ??
                location.baseSuccessRate
            );

        const isSuccess =
            Math.random() < successRate;

        const updates = {};

        updates[
            "activeExpeditions/" +
            currentUser.uid
        ] = null;

        if(!isSuccess){

            await database.ref().update(updates);

            showRewardResult([],false);

            showMessage("探検は失敗に終わりました…");

            return;
        }

        const rewardWeights =
            latestExpedition.rewardWeights ||
            location.rewards;

        const rewardCount =
            createRewardCount(
                latestExpedition,
                location
            );

        const rewards =
            generateRewards(
                { rewards:rewardWeights },
                rewardCount
            );

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

        await database.ref().update(updates);

        showRewardResult(rewards,true);

        showMessage(
            "探検の報酬を受け取りました"
        );

    }catch(error){

        console.error(error);
        showMessage("結果を受け取れませんでした");

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
   結果画面（成功時はアイテム、失敗時は失敗メッセージ）
===================================================== */

function showRewardResult(rewards,isSuccess){

    const resultArea =
        document.getElementById(
            "rewardResult"
        );

    const rewardList =
        document.getElementById(
            "rewardList"
        );

    rewardList.innerHTML = "";

    if(!isSuccess){

        rewardList.innerHTML =
            "<p class='failText'>今回の探検は失敗し、持ち帰れた品はありませんでした。</p>";

    }else{

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
    }

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
