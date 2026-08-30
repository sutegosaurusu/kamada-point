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

        updatePointDisplay(currentPoint);

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
            showCraftConfirm(itemId, recipe);
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
    .filter(([itemId]) => itemInformation[itemId]);

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
// ===============================
// 作成確認モーダル
// ===============================

function ensureCraftConfirmModal(){

    if(document.getElementById("craftConfirmOverlay")){
        return;
    }

    const overlay = document.createElement("div");
    overlay.id = "craftConfirmOverlay";
    overlay.style.cssText = `
        position:fixed;
        inset:0;
        background:rgba(0,0,0,.5);
        display:none;
        align-items:center;
        justify-content:center;
        z-index:2000;
    `;

    overlay.innerHTML = `
        <div id="craftConfirmBox" style="
            width:90%;
            max-width:420px;
            padding:18px;
            background:#e3d1ae;
            border:3px solid #5b422b;
            box-shadow:4px 4px 0 #75593c;
            font-family:inherit;
            color:#302318;
        ">
            <div id="craftConfirmTitle" style="
                font-size:18px;
                font-weight:bold;
                margin-bottom:10px;
            "></div>

            <div id="craftConfirmMaterials" style="
                font-size:14px;
                margin-bottom:10px;
                display:flex;
                flex-direction:column;
                gap:4px;
            "></div>

            <div id="craftConfirmPoint" style="
                font-size:14px;
                font-weight:bold;
                margin-bottom:16px;
            "></div>

            <div style="display:flex; gap:10px;">
                <button id="craftConfirmCancel" style="
                    flex:1;
                    padding:10px;
                    border:2px solid #4c351f;
                    background:#a99570;
                    color:#302318;
                    font-family:inherit;
                    font-size:14px;
                    cursor:pointer;
                ">キャンセル</button>

                <button id="craftConfirmOk" style="
                    flex:1;
                    padding:10px;
                    border:2px solid #402b19;
                    background:#69482c;
                    color:#fff0d0;
                    font-family:inherit;
                    font-size:14px;
                    cursor:pointer;
                ">作る</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    overlay.addEventListener("click", event => {
        if(event.target === overlay){
            hideCraftConfirm();
        }
    });

    document
        .getElementById("craftConfirmCancel")
        .addEventListener("click", hideCraftConfirm);
}

function hideCraftConfirm(){

    const overlay =
        document.getElementById("craftConfirmOverlay");

    if(overlay){
        overlay.style.display = "none";
    }
}

function showCraftConfirm(itemId, recipe){

    ensureCraftConfirmModal();

    const info = itemInformation[itemId];
    const useTicket = hasFreeCraftTicket();

    document.getElementById("craftConfirmTitle").textContent =
        (info.icon || "") + " " + info.name + " を作りますか？";

    const materialsHtml =
        Object.entries(recipe.materials)
        .map(([materialId, needQty]) => {

            const materialInfo =
                itemInformation[materialId] || {};

            const owned =
                getOwnedQuantity(materialId);

            return `
            <span>
                ${escapeHtml(materialInfo.name || materialId)}
                を ${needQty} 個使用
                （所持 ${owned}）
            </span>
            `;
        })
        .join("");

    document.getElementById("craftConfirmMaterials").innerHTML =
        materialsHtml;

    document.getElementById("craftConfirmPoint").textContent =
        useTicket
        ? "🎟 無料チケット使用（Point消費なし）"
        : "💰 " + recipe.point.toLocaleString() + " Pt 消費します";

    const okButton =
        document.getElementById("craftConfirmOk");

    // 前回のイベントを消してから付け直す
    const newOkButton = okButton.cloneNode(true);
    okButton.parentNode.replaceChild(newOkButton, okButton);

    newOkButton.addEventListener("click", () => {
        hideCraftConfirm();
        craftItem(itemId, recipe);
    });

    document.getElementById("craftConfirmOverlay")
        .style.display = "flex";
}
