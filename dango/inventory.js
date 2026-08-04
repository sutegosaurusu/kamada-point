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
            getItemInformation(item);



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

            openItemDetail(item);

        };


        inventory.appendChild(card);


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

function openItemDetail(item){


    const info =
        getItemInformation(item);


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



    document
    .getElementById("detailOverlay")
    .classList.add("show");

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
function getItemInformation(item){

    const savedInformation =
        itemInformation[item.id] || {};

    return {

        icon:
            item.icon ||
            savedInformation.icon ||
            getDefaultIcon(item.category),

        effect:
            item.effect ||
            savedInformation.effect ||
            "このアイテムの効果は設定されていません。"
    };
}

