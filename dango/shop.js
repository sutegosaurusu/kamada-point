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

           renderSellMarket();

            renderMarket();
        });

}




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
       買取価格 ${price} Pt
        </div>

     <input
    class="sellQuantity"
    type="number"
    min="1"
    value="1"
>

<button class="sellButton">
    売る
</button>
        `;


      div.querySelector(".sellButton")
.onclick=()=>{

    const quantity =
        Number(
            div.querySelector(".sellQuantity").value
        );

    sellToMerchant(id,item,quantity);

};


        area.appendChild(div);

    });

}
async function sellToMerchant(id,item,quantity){

   const basePrice =
Number(getItemById(id).price || 0);

const price =
Math.floor(basePrice * 0.3);

    const uid =
    currentUser.uid;


    const ref =
    database.ref(
    "inventories/"+uid+"/"+id+"/quantity"
    );


    const snapshot =
    await ref.once("value");


   const ownedQuantity =
    Number(snapshot.val()||0);
if(ownedQuantity < quantity){
    return;
}

   
  await ref.set(ownedQuantity - quantity);

    await database.ref(
    "members/"+uid+"/point"
    )
   .transaction(p=>
    Number(p||0)+price * quantity
);

   showMessage(
    item.name+"を"+quantity+"個、"+
    (price * quantity)+"Ptで売りました"
);

    renderSellMarket();

}
function renderSellItems(){

    const select =
        document.getElementById("sellItem");

    if(!select){
        return;
    }

    select.innerHTML =
        '<option value="">出品する品物を選ぶ</option>';

    Object.entries(inventoryData)
    .forEach(([itemId,item])=>{

        if(!item){
            return;
        }

        const quantity =
            Number(item.quantity || 0);

        if(quantity <= 0){
            return;
        }

        const option =
            document.createElement("option");

        option.value = itemId;

        option.textContent =
            item.name +
            "　所持数：" +
            quantity;

        select.appendChild(option);

    });

}
