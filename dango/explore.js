/* =====================================================
   テスト設定

   false：1時間を本当の1時間として計算します。
   true：1時間を1分として計算します。動作確認するときだけtrueに。
===================================================== */

const TEST_MODE = true;

/* =====================================================
   基本変数
===================================================== */

let inventoryData = {};
let activeExpedition = null;

let selectedLocationId = locations[0].id;
let selectedHours = 1;

let countdownTimer = null;

const SLOT_COUNTS = {
    food:3
};

let selectedSlots = {
    food:[null,null,null]
};

const waterRequirements = {
    1:0,
    3:1,
    6:2,
    12:3
};

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
    watchEquipment(() => {
        renderEquippedDisplay();
        renderItemSelection();
        updateRequirementDisplay();
    });
});
function renderEquippedDisplay(){

    const container =
        document.getElementById("equippedDisplay");

    if(!container){
        return;
    }

    container.innerHTML = "";

    ["head","weapon","shield"].forEach(slot => {

        const itemId = equipmentData[slot];

        const div =
            document.createElement("div");

        div.className =
            "equippedItem" + (itemId ? "" : " empty");

        if(itemId){

            const info = itemInformation[itemId];

            div.textContent =
                equipSlotLabels[slot] + "：" +
                (info?.icon || "") + " " +
                (info?.name || itemId);

        }else{

            div.textContent =
                equipSlotLabels[slot] + "：未装備";
        }

        container.appendChild(div);
    });
}
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

            <button class="rewardTableButton" type="button">
                📊 取れるものを見る
            </button>
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

        const rewardTableButton =
            card.querySelector(".rewardTableButton");

        rewardTableButton.addEventListener("click", event => {

            // カード自体のクリック（場所選択）が
            // 一緒に発火しないようにする
            event.stopPropagation();

            openRewardTable(location);
        });

        locationScroll.appendChild(card);
    });
}

/* =====================================================
   確率表の表示
===================================================== */

function openRewardTable(location){

    const totalWeight =
        location.rewards.reduce(
            (sum, reward) => sum + (reward.weight || 0),
            0
        );

    // 確率が高い順に並び替え
    const sortedRewards =
        [...location.rewards].sort(
            (a,b) => b.weight - a.weight
        );

    document
        .getElementById("rewardTableTitle")
        .textContent =
            location.icon + " " + location.name + "で取れるもの";

    const list =
        document.getElementById("rewardTableList");

    list.innerHTML = "";

    sortedRewards.forEach(reward => {

        const item =
            getItemById(reward.itemId);

        if(!item){
            return;
        }

        const percent =
            totalWeight > 0
            ? (reward.weight / totalWeight) * 100
            : 0;

        const row =
            document.createElement("div");

        row.className = "rewardTableRow";

        row.innerHTML = `
            <div class="rewardTableIcon">
                ${item.icon || getDefaultIcon(item.category)}
            </div>

            <div class="rewardTableName">
                ${escapeHtml(item.name)}
            </div>

            <div class="rewardTablePercent">
                ${percent.toFixed(percent < 1 ? 2 : 1)}%
            </div>
        `;

        list.appendChild(row);
    });

    document
        .getElementById("rewardTableOverlay")
        .classList.add("show");
}

function closeRewardTable(){

    document
        .getElementById("rewardTableOverlay")
        .classList.remove("show");
}
document
    .getElementById("rewardTableCloseButton")
    .addEventListener("click", closeRewardTable);

document
    .getElementById("rewardTableOverlay")
    .addEventListener("click", event => {

        if(event.target.id === "rewardTableOverlay"){
            closeRewardTable();
        }
    });

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

   食べ物・水は枠（食べ物3個・水2個）が上限なので、
   時間による倍率はかけず、場所の基本値を
   枠の上限で丸めたものを必要数とする。
   （長時間でも必要数が枠数を超えないようにするため）

   予想獲得数だけは、これまで通り時間で増える。
===================================================== */


/* =====================================================
   スロットのユーティリティ
===================================================== */

function getSlotItemIds(category){

    return selectedSlots[category]
        .filter(itemId => itemId !== null);
}

function getAllSelectedItemIds(){

    const equippedIds =
        ["head","weapon","shield"]
        .map(slot => equipmentData[slot])
        .filter(itemId => itemId !== null);

    return [
        ...getSlotItemIds("food"),
        ...equippedIds
    ];
}

/*
選んだ枠の数＝持っていく個数
（各枠は1個ぶんとして数える）
*/

function getSelectedCategoryTotal(category){

    return getSlotItemIds(category).length;
}

/*
同じカテゴリ内で、指定した枠を除いて
そのアイテムが何個すでに使われているか
*/

function countUsedElsewhere(category,itemId,excludeSlotIndex){

    return selectedSlots[category].reduce(
        (count,id,index) => {

            if(index === excludeSlotIndex){
                return count;
            }

            return count + (id === itemId ? 1 : 0);
        },
        0
    );
}

/*
枠に入っているアイテムが無効になっていないか
（所持数が減って足りなくなった等）を確認して
先頭の枠から順に有効な範囲だけを残す
*/

function pruneSelectedSlots(){

    Object.keys(selectedSlots).forEach(category => {

        const usedCounts = {};

        selectedSlots[category] =
            selectedSlots[category].map(itemId => {

                if(itemId === null){
                    return null;
                }

                const item = inventoryData[itemId];

                const quantity =
                    item && item.category === category
                    ? Number(item.quantity || 0)
                    : 0;

                const usedSoFar =
                    usedCounts[itemId] || 0;

                if(usedSoFar >= quantity){
                    return null;
                }

                usedCounts[itemId] = usedSoFar + 1;

                return itemId;
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

    return Math.min(0.99,Math.max(0.01,rate));
}

function computeEffectiveRewardWeights(location){

    const selectedIds =
        getAllSelectedItemIds();

    return location.rewards.map(reward => {

        let weight = reward.weight;

        selectedIds.forEach(itemId => {

            const effect = itemEffects[itemId];

            if(effect && effect.boosts){

                effect.boosts.forEach(boost => {

                    if(boost.itemId === reward.itemId){

                        weight += boost.amount;

                    }

                });

            }

        });

        return { ...reward, weight };
    });
}

function findRewardName(itemId){

    const item =
        getItemById(itemId);

    return item
        ? item.name
        : null;
}
/*
1つのアイテムが複数の効果を持つ場合は
すべて並べて表示する
*/

function getEffectTexts(itemId){

    const effect = itemEffects[itemId];

    if(!effect){
        return [];
    }

    const texts = [];

    if(effect.successRate){

        texts.push(
            "成功率+" +
            Math.round(effect.successRate * 100) +
            "%"
        );
    }

    if(effect.boostItemId){

        const targetName =
            findRewardName(effect.boostItemId);

        texts.push(
            (targetName || effect.boostItemId) +
            "の入手率アップ"
        );
    }

    return texts;
}

/* =====================================================
   スロット枠の表示
===================================================== */

function renderItemSelection(){

    pruneSelectedSlots();

    renderSlotGrid("food","foodSlotList");

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

            const effectTexts =
                getEffectTexts(itemId);

            const remainingQuantity =
                Number(item?.quantity || 0) -
                countUsedElsewhere(
                    category,
                    itemId,
                    slotIndex
                );

            slotBox.innerHTML = `
                <div class="slotItemName">
                    ${item?.icon || ""}
                    ${escapeHtml(item?.name || "")}
                </div>

                <div class="slotItemQty">
                    残り${remainingQuantity}
                </div>

                ${
                    effectTexts
                    .map(text =>
                        `<div class="slotEffect">${escapeHtml(text)}</div>`
                    )
                    .join("")
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
    同じアイテムを複数の枠に入れてもよいが、
    所持数を超えて選ぶことはできない。
    （他の枠ですでに使っている分を差し引いて
      まだ残りがあるものだけを候補にする）
    */

    const options =
        Object.entries(inventoryData)
        .filter(([itemId,item]) => {

            if(
                !item ||
                item.category !== category ||
                Number(item.quantity || 0) <= 0
            ){
                return false;
            }

            const usedElsewhere =
                countUsedElsewhere(
                    category,
                    itemId,
                    slotIndex
                );

            return (
                Number(item.quantity) > usedElsewhere
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

        const effectTexts =
            getEffectTexts(itemId);

        const remainingQuantity =
            Number(item.quantity || 0) -
            countUsedElsewhere(
                category,
                itemId,
                slotIndex
            );

        const option =
            document.createElement("button");

        option.type = "button";
        option.className = "slotModalOption";

        option.innerHTML = `
            <span>
                ${item.icon || ""}
                ${escapeHtml(item.name)}
                （残り${remainingQuantity}）
                ${
                    effectTexts.length > 0
                    ? " ／ " + effectTexts.map(escapeHtml).join("・")
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

    document
        .getElementById("selectedTitle")
        .textContent =
            location.name +
            "・" +
            selectedHours +
            "時間";

    document
        .getElementById("successRateDisplay")
        .textContent =
            Math.round(
                computeEffectiveSuccessRate(location) * 100
            ) + "%";

    const expectedReward =
        Math.max(
            1,
            Math.round(
                location.rewardRate *
                timeSettings[selectedHours].rewardMultiplier
            )
        );

    document
        .getElementById("expectedReward")
        .textContent =
        "約" + expectedReward + "個";
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

    const selectedFoodIds =
        getSlotItemIds("food");

    if(selectedFoodIds.length === 0){
        showMessage("持っていく食べ物を選んでください");
        return;
    }

    const requiredWater =
        waterRequirements[selectedHours] || 0;

    const totalWater =
        Object.values(inventoryData)
        .filter(item => item && item.category === "water")
        .reduce((sum, item) => sum + Number(item.quantity || 0), 0);

    if(totalWater < requiredWater){

        showMessage(
            "この時間の探検には水が" +
            requiredWater +
            "個必要です（現在" +
            totalWater +
            "個）"
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
        selectedFoodIds.length +
        "個\n" +
        "水：" +
        requiredWater +
        "個消費\n" +
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

        consumeSlotItems(
            latestInventory,
            selectedFoodIds,
            updates
        );

        consumeWaterRequirement(
            latestInventory,
            requiredWater,
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
            food:[null,null,null]
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
   選んだ枠のアイテムを1個ずつ消費する

   同じアイテムが複数の枠に入っている場合は、
   その個数ぶんまとめて所持数から引く。
===================================================== */

function consumeSlotItems(
    inventory,
    itemIds,
    updates
){

    const counts = {};

    itemIds.forEach(itemId => {
        counts[itemId] = (counts[itemId] || 0) + 1;
    });

    for(const itemId in counts){

        const needed = counts[itemId];

        const item = inventory[itemId];

        const quantity =
            Number(item?.quantity || 0);

        if(quantity < needed){
            throw new Error("物資が不足しています");
        }

        const newQuantity =
            quantity - needed;

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
function consumeWaterRequirement(
    inventory,
    requiredAmount,
    updates
){

    if(requiredAmount <= 0){
        return;
    }

    let remaining = requiredAmount;

    for(const itemId in inventory){

        if(remaining <= 0){
            break;
        }

        const item = inventory[itemId];

        if(!item || item.category !== "water"){
            continue;
        }

        const have = Number(item.quantity || 0);

        if(have <= 0){
            continue;
        }

        const used = Math.min(have, remaining);
        const newQuantity = have - used;

        const path =
            "inventories/" +
            currentUser.uid +
            "/" +
            itemId;

        if(newQuantity <= 0){

            updates[path] = null;

        }else{

            updates[path + "/quantity"] = newQuantity;

            updates[path + "/updatedAt"] =
                firebase.database.ServerValue.TIMESTAMP;
        }

        remaining -= used;
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

    const multiplier =
        timeSettings[expedition.hours].rewardMultiplier;

   let rewardMultiplier = 1;

getAllSelectedItemIds().forEach(itemId => {

    const effect = itemEffects[itemId];

    if(effect && effect.rewardMultiplier){

        rewardMultiplier *= effect.rewardMultiplier;

    }

});


const basicCount =
    Math.max(
        1,
        Math.round(
            location.rewardRate *
            multiplier *
            rewardMultiplier
        )
    );

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
   重み付き抽選で1つ報酬を選ぶ
===================================================== */
function selectWeightedReward(rewards){
    if(!rewards || rewards.length === 0){
        return null;
    }
    const totalWeight = rewards.reduce(
        (sum, reward) => sum + (reward.weight || 0),
        0
    );
    if(totalWeight <= 0){
        return null;
    }
    let random = Math.random() * totalWeight;
    for(const reward of rewards){
        random -= (reward.weight || 0);
        if(random <= 0){
            return reward;
        }
    }
    // 浮動小数点の誤差対策で最後の要素を返す
    return rewards[rewards.length - 1];
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

        const selectedReward =
            selectWeightedReward(
                location.rewards
            );

        if(!selectedReward){
            continue;
        }

        const item =
            getItemById(selectedReward.itemId);

        if(!item){
            console.error(
                "items.jsに存在しない報酬ID:",
                selectedReward.itemId
            );

            continue;
        }

        if(!result[item.id]){

            result[item.id] = {
                itemId:item.id,
                name:item.name,
                category:item.category,
                icon:
                    item.icon ||
                    getDefaultIcon(item.category),
                quantity:0
            };
        }

        result[item.id].quantity++;
    }

    return Object.values(result);
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
