// ===============================
// 工房（装備クラフト）
// ===============================

let inventoryData = {};
let currentPoint = 0;
let craftedRecipes = {};

const FREE_CRAFT_TICKET_ITEM_ID = "free_craft_ticket";


// ===============================
// ログイン後開始
// ===============================

auth.onAuthStateChanged(user => {

    if(!user){
        location.href = "../index.html";
        return;
    }

    currentUser = user;

    loadPointForCraft();
    watchInventoryForCraft();
    watchCraftedRecipes();

});


// ===============================
// ポイント監視
// ===============================

function loadPointForCraft(){

    database
    .ref("members/" + currentUser.uid + "/point")
    .on("value", snapshot=>{

        currentPoint = Number(snapshot.val() || 0);

        const pointDisplay =
            document.getElementById("point");

        if(pointDisplay){
            pointDisplay.textContent =
                currentPoint.toLocaleString() + " Pt";
        }

        renderAll();

    });
}


// ===============================
// 持ち物監視
// ===============================

function watchInventoryForCraft(){

    database
    .ref("inventories/" + currentUser.uid)
    .on("value", snapshot => {

        inventoryData = snapshot.val() || {};

        renderAll();

    });
}


// ===============================
// 作成済みレシピ監視（図鑑用）
// ===============================

function watchCraftedRecipes(){

    database
    .ref("members/" + currentUser.uid + "/craftedRecipes")
    .on("value", snapshot => {

        craftedRecipes = snapshot.val() || {};

        renderAll();

    });
}


// ===============================
// まとめて再描画
// ===============================

function renderAll(){
    renderRecipeList();
    renderMaterialSummary();
    renderRecipeIndex();
}


// ===============================
// 所持数の取得
// ===============================

function getOwnedQuantity(itemId){

    const entry = inventoryData[itemId];

    if(!entry){
        return 0;
    }

    return Number(entry.quantity || 0);
}


// ===============================
// レシピが作成可能か判定
// ===============================

function hasFreeCraftTicket(){
    return getOwnedQuantity(FREE_CRAFT_TICKET_ITEM_ID) > 0;
}

function canCraft(recipe){

    const pointOk =
        hasFreeCraftTicket() ||
        currentPoint >= recipe.point;

    if(!pointOk){
        return false;
    }

    return Object.entries(recipe.materials)
    .every(([materialId, needQty]) => {
        return getOwnedQuantity(materialId) >= needQty;
    });
}


// ===============================
// 装備の効果テキスト取得
// ===============================

function getEffectText(itemId){

    const effect = itemEffects[itemId];

    return effect ? effect.description : "";
}


// ===============================
// レシピ一覧表示
// ===============================

function renderRecipeList(){

    const list =
        document.getElementById("recipeList");

    const countBar =
        document.getElementById("countBar");

    if(!list){
        return;
    }

    const recipeEntries =
        Object.entries(recipes)
        .filter(([itemId]) => itemInformation[itemId]);

    const craftableEntries =
        recipeEntries
        .filter(([, recipe]) => canCraft(recipe));

    if(countBar){
        countBar.textContent =
            "⭐ 作れる装備 " + craftableEntries.length + "種類";
    }

    if(craftableEntries.length === 0){

        list.innerHTML = `
        <div class="empty">
        今作れる装備はありません
        </div>
        `;

        return;
    }

    list.innerHTML = "";

   recipeEntries.forEach(([itemId, recipe]) => {

        const info = itemInformation[itemId];

        const materialCostsHtml =
            Object.entries(recipe.materials)
            .map(([materialId, needQty]) => {

                const materialInfo =
                    itemInformation[materialId] || {};

                return `
                <span>
                ${escapeHtml(materialInfo.name || materialId)}×${needQty}
                </span>
                `;
            })
            .join("");

        const ownedRowHtml =
            Object.entries(recipe.materials)
            .map(([materialId, needQty]) => {

                const materialInfo =
                    itemInformation[materialId] || {};

                const owned =
                    getOwnedQuantity(materialId);

                const enough =
                    owned >= needQty;

                return `
                <span class="${enough ? "" : "short"}">
                ${escapeHtml(materialInfo.name || materialId)}
                ${owned}/${needQty}
                </span>
                `;
            })
            .join("");

        const craftable = canCraft(recipe);
        const effectText = getEffectText(itemId);
        const useTicket = hasFreeCraftTicket();

        const pointRowHtml =
            useTicket
            ? `<div class="pointRow ticketRow">
                🎟 無料チケット使用でPoint消費なし
               </div>`
            : `<div class="pointRow ${currentPoint >= recipe.point ? "" : "short"}">
                💰 ${recipe.point.toLocaleString()} Pt（所持 ${currentPoint.toLocaleString()} Pt）
               </div>`;

        const card =
            document.createElement("div");

        card.className = "recipeCard";

        card.innerHTML = `
        <div class="recipeHeader">
            <div class="recipeIcon">
                ${info.icon || getDefaultIcon(info.category)}
            </div>
            <div>
                <div class="recipeName">
                    ${escapeHtml(info.name)}
                </div>
                ${effectText ? `<div class="recipeEffect">${escapeHtml(effectText)}</div>` : ""}
            </div>
        </div>

        <div class="materialCosts">
            ${materialCostsHtml}
        </div>

        <div class="ownedRow">
            所持 ${ownedRowHtml}
        </div>

        ${pointRowHtml}

        <button
            class="craftButton"
            ${craftable ? "" : "disabled"}
        >
            ${craftable ? "作る" : "素材・Pointが足りません"}
        </button>
        `;

        card.querySelector(".craftButton")
        .addEventListener("click", () => {
            craftItem(itemId, recipe);
        });

        list.appendChild(card);

    });

}


// ===============================
// 所持素材まとめ表示
// ===============================

function renderMaterialSummary(){

    const summary =
        document.getElementById("materialSummary");

    if(!summary){
        return;
    }

    const materialIds =
        new Set();

    Object.values(recipes)
    .forEach(recipe => {
        Object.keys(recipe.materials)
        .forEach(materialId => materialIds.add(materialId));
    });

    if(materialIds.size === 0){

        summary.innerHTML = `
        <span>使用する素材はまだありません</span>
        `;

        return;
    }

    summary.innerHTML =
        Array.from(materialIds)
        .map(materialId => {

            const materialInfo =
                itemInformation[materialId] || {};

            const owned =
                getOwnedQuantity(materialId);

            return `
            <span>
            ${escapeHtml(materialInfo.name || materialId)}
            ${owned}
            </span>
            `;
        })
        .join("");

}


// ===============================
// レシピ図鑑表示
// ===============================

function renderRecipeIndex(){

    const index =
        document.getElementById("recipeIndex");

    if(!index){
        return;
    }

    const recipeEntries =
        Object.entries(recipes)
        .filter(([itemId]) => itemInformation[itemId])
        .filter(([itemId, recipe]) => {
            return (
                Boolean(craftedRecipes[itemId]) ||
                canCraft(recipe)
            );
        });

    if(recipeEntries.length === 0){

        index.innerHTML = `
        <span>まだ作れる装備がありません</span>
        `;

        return;
    }

    index.innerHTML =
        recipeEntries
        .map(([itemId]) => {

            const info = itemInformation[itemId];

            const known =
                Boolean(craftedRecipes[itemId]);

            return `
            <span class="${known ? "known" : "unknown"}">
            ${known ? "✓" : "？"} ${escapeHtml(info.name)}
            </span>
            `;
        })
        .join("");

}


// ===============================
// 作成処理
// ===============================

async function craftItem(itemId, recipe){

    if(!canCraft(recipe)){
        showMessage("素材またはPointが足りません");
        return;
    }

    const info = itemInformation[itemId];

    const updates = {};

    const basePath =
        "inventories/" + currentUser.uid + "/";

    const useTicket = hasFreeCraftTicket();

    // 素材を消費
    Object.entries(recipe.materials)
    .forEach(([materialId, needQty]) => {

        const newQty =
            getOwnedQuantity(materialId) - needQty;

        updates[basePath + materialId + "/quantity"] =
            newQty;
    });

    if(useTicket){

        // 無料チケットを1枚消費（Pointは消費しない）
        const ticketQty =
            getOwnedQuantity(FREE_CRAFT_TICKET_ITEM_ID) - 1;

        const ticketPath =
            basePath + FREE_CRAFT_TICKET_ITEM_ID;

        if(ticketQty <= 0){
            updates[ticketPath] = null;
        }else{
            updates[ticketPath + "/quantity"] = ticketQty;
        }

    }else{

        // Pointを消費
        updates["members/" + currentUser.uid + "/point"] =
            currentPoint - recipe.point;
    }

    // 完成品を付与
    const existing = inventoryData[itemId];

    updates[basePath + itemId + "/quantity"] =
        (existing ? Number(existing.quantity || 0) : 0) + 1;

    updates[basePath + itemId + "/category"] =
        "equipment";

    updates[basePath + itemId + "/name"] =
        info.name;

    // 図鑑に記録
    updates[
        "members/" +
        currentUser.uid +
        "/craftedRecipes/" +
        itemId
    ] = true;

    try{

        await database.ref().update(updates);

        showMessage(
            useTicket
            ? info.name + "を無料チケットで作成しました！"
            : info.name + "を作成しました！"
        );

    }catch(error){

        console.error(error);
        showMessage("作成に失敗しました");
    }
}
