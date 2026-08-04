// ===============================
// 持ち物一覧パネル（簡易表示）
// ===============================

let inventoryPanelData = {};

auth.onAuthStateChanged(user => {

    if(!user){
        return;
    }

    database
    .ref("inventories/" + user.uid)
    .on("value", snapshot => {

        inventoryPanelData = snapshot.val() || {};

        renderInventoryPanel();

    });

});

function renderInventoryPanel(){

    const list =
        document.getElementById("inventoryNameList");

    const items =
        Object.values(inventoryPanelData)
        .filter(item => item && Number(item.quantity || 0) > 0);

    if(items.length === 0){

        list.innerHTML =
            `<li class="empty">持ち物はありません</li>`;

        return;

    }

    list.innerHTML =
        items
        .map(item => `<li>${escapeHtml(item.name)}</li>`)
        .join("");

}

document
.getElementById("menuButton")
.addEventListener("click", () => {

    document
    .getElementById("inventoryOverlay")
    .classList.add("show");

});

document
.getElementById("closeInventoryButton")
.addEventListener("click", () => {

    document
    .getElementById("inventoryOverlay")
    .classList.remove("show");

});

document
.getElementById("inventoryOverlay")
.addEventListener("click", e => {

    if(e.target.id === "inventoryOverlay"){

        document
        .getElementById("inventoryOverlay")
        .classList.remove("show");

    }

});
