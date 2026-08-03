let currentMember = null;


auth.onAuthStateChanged(async user => {

    if(!user){
        alert("先にログインしてください");
        location.href = "../index.html";
        return;
    }

    currentUser = user;


    const memberSnapshot = await database
        .ref("members/" + user.uid)
        .once("value");


    currentMember = memberSnapshot.val();


    if(!currentMember){
        showMessage("会員情報が見つかりません");
        return;
    }


    updatePointDisplay();

    watchMember();
    watchInventory();
    watchListings();

});



function watchMember(){

    database
        .ref("members/" + currentUser.uid)
        .on("value", snapshot => {

            currentMember = snapshot.val() || {};

            updatePointDisplay();

        });

}



function updatePointDisplay(){

    const point =
        Number(currentMember?.point || 0);


    document.getElementById("pointDisplay")
    .textContent =
        point.toLocaleString() + " Pt";

}



function watchInventory(){

    database
        .ref("inventories/" + currentUser.uid)
        .on("value", snapshot => {

            inventoryData =
                snapshot.val() || {};


            renderSellItems();

            renderMarket();

        });

}
let shopMode = "buy";


document.getElementById("buyModeButton")
.addEventListener("click",()=>{

    shopMode="buy";

    document.getElementById("market").style.display="block";
    document.getElementById("sellMarket").style.display="none";

    renderMarket();

});


document.getElementById("sellModeButton")
.addEventListener("click",()=>{

    shopMode="sell";

    document.getElementById("market").style.display="none";
    document.getElementById("sellMarket").style.display="block";

    renderSellMarket();

});
function renderSellMarket(){

    const area =
    document.getElementById("sellMarket");


    area.innerHTML="";


    Object.entries(inventoryData)
    .forEach(([id,item])=>{


        if(!item || item.quantity<=0){
            return;
        }


        const div =
        document.createElement("div");


        div.className="itemCard";


        div.innerHTML=`

        <div>
        ${escapeHtml(item.name)}
        ×${item.quantity}
        </div>

        <div>
        買取価格 ${item.price || 50} Pt
        </div>

        <button class="buyButton">
        売る
        </button>

        `;


        div.querySelector("button")
        .onclick=()=>{

            sellToMerchant(id,item);

        };


        area.appendChild(div);

    });

}
async function sellToMerchant(id,item){


    const price =
    Number(item.price || 50);


    const uid =
    currentUser.uid;


    const ref =
    database.ref(
    "inventories/"+uid+"/"+id+"/quantity"
    );


    const snapshot =
    await ref.once("value");


    const quantity =
    Number(snapshot.val()||0);


    if(quantity<=0){
        return;
    }


    await ref.set(quantity-1);


    await database.ref(
    "members/"+uid+"/point"
    )
    .transaction(p=>
        Number(p||0)+price
    );


    showMessage(
    item.name+"を"+price+"Ptで売りました"
    );


    renderSellMarket();

}
