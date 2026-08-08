// ===============================
// 工房（装備クラフト）
// ===============================

let inventoryData = {};
let currentPoint = 0;
let craftedRecipes = {};


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

function canCraft(recipe){

    if(currentPoint < recipe.point){
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

    if(recipeEntries.length === 0){

        list.innerHTML = `
        <div class="empty">
        レシピがまだありません
        </div>
        `;

        return;
    }

    const craftableCount =
        recipeEntries
        .filter(([, recipe]) => canCraft(recipe))
        .length;

    if(countBar){
        countBar.textContent =
            "⭐ 作れる装備 " + craftableCount + "種類";
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
                ${materialInfo.icon || getDefaultIcon(materialInfo.category)}×${needQty}
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
                ${materialInfo.icon || getDefaultIcon(materialInfo.category)}
                ${owned}/${needQty}
                </span>
                `;
            })
            .join("");

        const craftable = canCraft(recipe);
        const effectText = getEffectText(itemId);

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

        <div class="pointRow ${currentPoint >= recipe.point ? "" : "short"}">
            💰 ${recipe.point.toLocaleString()} Pt（所持 ${currentPoint.toLocaleString()} Pt）
        </div>

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
            ${materialInfo.icon || getDefaultIcon(materialInfo.category)}
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
        .filter(([itemId]) => itemInformation[itemId]);

    if(recipeEntries.length === 0){

        index.innerHTML = `
        <span>レシピがまだありません</span>
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

    // 素材を消費
    Object.entries(recipe.materials)
    .forEach(([materialId, needQty]) => {

        const newQty =
            getOwnedQuantity(materialId) - needQty;

        updates[basePath + materialId + "/quantity"] =
            newQty;
    });

    // Pointを消費
    updates["members/" + currentUser.uid + "/point"] =
        currentPoint - recipe.point;

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

        showMessage(info.name + "を作成しました！");

    }catch(error){

        console.error(error);
        showMessage("作成に失敗しました");
    }
}
