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


          
        });

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
