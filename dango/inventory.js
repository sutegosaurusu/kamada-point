// ===============================
// 持ち物管理
// ===============================

let currentCategory = "food";
let inventoryData = {};


// ===============================
// ログイン後開始
// ===============================

auth.onAuthStateChanged(user => {

    if(!user){
        location.href = "../index.html";
        return;
    }

    currentUser = user;

    watchInventory();
　　
    watchEquipment(renderEquipPanel);
});


// ===============================
// 持ち物監視
// ===============================

function watchInventory(){

    database
    .ref("inventories/" + currentUser.uid)
    .on("value", snapshot => {

        inventoryData = snapshot.val() || {};

        renderInventory();
        updateTotalItemCount();

    });

}


// ===============================
// カテゴリ切り替え
// ===============================

document
.querySelectorAll(".categoryTabs button")
.forEach(button=>{

    button.addEventListener("click",()=>{


        document
        .querySelectorAll(".categoryTabs button")
        .forEach(tab=>{
            tab.classList.remove("active");
        });


        button.classList.add("active");


        currentCategory =
            button.dataset.category;


        renderInventory();

    });

});


// ===============================
// 持ち物表示
// ===============================

function renderInventory(){

    const inventory =
        document.getElementById("inventory");

    const items =
        Object.entries(inventoryData)
        .filter(([id, item]) => {

            if(!item){
                return false;
            }

            return (
                Number(item.quantity || 0) > 0 &&
                item.category === currentCategory
            );
        });

    if(items.length === 0){

        const category =
            categoryInformation[currentCategory];

        inventory.innerHTML = `
        <div class="empty">
        ${category.icon}
        ${category.name}は持っていません
        </div>
        `;

        return;

    }


    inventory.innerHTML="";


 items.forEach(([id,item])=>{


        const info =
            getItemInformation(id, item);



        const card =
            document.createElement("div");

        card.className="itemCard";


        card.innerHTML=`

        <div class="quantity">
        ×${Number(item.quantity)}
        </div>


        <div class="itemIcon">
        ${info.icon}
        </div>


        <div class="itemName">
        ${escapeHtml(item.name)}
        </div>


        <div class="itemCategory">

        ${
            categoryInformation[item.category]?.name
            || "その他"
        }

        </div>


        <div class="tapText">
        触って効果を確認
        </div>

        `;



      card.onclick=()=>{

            openItemDetail(id, item);

        };

        inventory.appendChild(card);


    });

}
// ===============================
// 装備パネル表示
// ===============================

function renderEquipPanel(){

    document
    .querySelectorAll(".equipSlotBox")
    .forEach(box => {

        const slot = box.dataset.slot;

        const itemId = equipmentData[slot];

        const iconElement =
            box.querySelector(".equipSlotIcon");

        const nameElement =
            box.querySelector(".equipSlotName");

        if(!itemId){

            iconElement.textContent = "—";
            nameElement.textContent = "なし";
            nameElement.classList.add("equipSlotEmpty");

            return;
        }

        const info = itemInformation[itemId];

        iconElement.textContent =
            info?.icon || getDefaultIcon("equipment");

        nameElement.textContent =
            info?.name || itemId;

        nameElement.classList.remove("equipSlotEmpty");
    });
}

// ===============================
// 合計個数
// ===============================

function updateTotalItemCount(){

    let total = 0;

    Object.values(inventoryData)
    .forEach(item => {

        if(item){
            total += Number(item.quantity || 0);
        }

    });

    const element =
        document.getElementById("totalItemCount");

    if(element){
        element.textContent = total.toLocaleString();
    }
}

// ===============================
// 詳細表示
// ===============================

function openItemDetail(id, item){


    const info =
        getItemInformation(id, item);


    const category =
        categoryInformation[item.category] || {

            name:"その他",
            icon:"📦"

        };



    document
    .getElementById("detailIcon")
    .textContent =
    info.icon;



    document
    .getElementById("detailName")
    .textContent =
    item.name;



    document
    .getElementById("detailCategory")
    .textContent =
    category.icon+" "+category.name;



    document
    .getElementById("detailQuantity")
    .textContent =
    "所持数："+item.quantity+"個";



    document
    .getElementById("detailEffect")
    .textContent =
    info.effect;


    renderDetailEquipArea(id, item);


    document
    .getElementById("detailOverlay")
    .classList.add("show");

}

function renderDetailEquipArea(id, item){

    const area =
        document.getElementById("detailEquipArea");

    area.innerHTML = "";

    if(item.category !== "equipment"){
        return;
    }

    const itemData = itemInformation[id];

    const slot = itemData?.equipSlot;

    if(!slot){
        return;
    }

    const isEquipped =
        equipmentData[slot] === id;

    const button =
        document.createElement("button");

    button.className =
        "equipButton" + (isEquipped ? " unequip" : "");

    button.textContent =
        isEquipped
        ? equipSlotLabels[slot] + "から外す"
        : equipSlotLabels[slot] + "に装備する";

    button.addEventListener("click", async () => {

        button.disabled = true;

        try{

            if(isEquipped){
                await unequipItem(slot);
                showMessage(item.name + "を外しました");
            }else{
                await equipItem(slot, id);
                showMessage(item.name + "を装備しました");
            }

            closeItemDetail();

        }catch(error){

            console.error(error);
            showMessage("装備の変更に失敗しました");

        }finally{

            button.disabled = false;
        }
    });

    area.appendChild(button);
}


// ===============================
// 詳細閉じる
// ===============================

function closeItemDetail(){

    document
    .getElementById("detailOverlay")
    .classList.remove("show");

}



document
.getElementById("closeDetailButton")
.addEventListener("click",
closeItemDetail);



document
.getElementById("detailOverlay")
.addEventListener("click",e=>{

    if(e.target.id==="detailOverlay"){

        closeItemDetail();

    }
    
});
function getItemInformation(id, item){

    const savedInformation =
        itemInformation[id] || {};

    const effectInformation =
        itemEffects[id] || {};


    return {

        icon:
            item.icon ||
            savedInformation.icon ||
            getDefaultIcon(item.category),


        effect:
            effectInformation.description ||
            "このアイテムの効果はありません。"

    };
}

