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






