

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


   updatePointDisplay(currentMember.point);
    watchMember();
    watchInventory();
    watchListings();

});



function watchMember(){

    database
        .ref("members/" + currentUser.uid)
        .on("value", snapshot => {

            currentMember = snapshot.val() || {};

            updatePointDisplay(currentMember.point);

        });

}



function updateSellAreaVisibility(){

    const isRealEstate =
        currentCategory ===
        "realestate";

    const sellArea =
        document.querySelector(".sellArea");

    const myListings =
        document.querySelector(".myListings");

    const myFarmSales =
        document.getElementById("myFarmSalesSection");

    if(sellArea){
        sellArea.style.display =
            isRealEstate ? "none" : "flex";
    }

    if(myListings){
        myListings.style.display =
            isRealEstate ? "none" : "block";
    }

    if(myFarmSales){
        myFarmSales.style.display =
            isRealEstate ? "block" : "none";
    }

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






