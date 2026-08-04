let currentCategory = "food";
let listingData = {};

function watchListings(){

    database
        .ref("marketListings")
        .on("value", snapshot => {

            listingData = snapshot.val() || {};

            renderMarket();
            renderMyListings();
        });
}
document.querySelectorAll(".categoryTabs button")
.forEach(button => {

    button.addEventListener("click", () => {

        document
            .querySelectorAll(".categoryTabs button")
            .forEach(btn => btn.classList.remove("active"));

        button.classList.add("active");

        currentCategory = button.dataset.category;

        renderMarket();
        renderSellItems();
    });
});

const searchInput = document.getElementById("searchInput");

if(searchInput){
    searchInput.addEventListener("input", renderMarket);
}
document
    .getElementById("sortSelect")
    .addEventListener("change", renderMarket);

/* =====================================================
   市場表示
===================================================== */

function renderMarket(){

    const market = document.getElementById("market");

    if(!currentUser){
        return;
    }

    const searchWord = document
        .getElementById("searchInput")
        .value
        .trim()
        .toLowerCase();

    const sortType =
        document.getElementById("sortSelect").value;

    let offers = [];

    /*
    商人の商品を一覧に追加
    */

   getMerchantItems().forEach(item => {
    if(!item) return;

    if(item.category !== currentCategory){
        return;
    }

    offers.push({
        type:"merchant",
       id:item.id,
　　　　itemId:item.id,
        itemName:item.name,
        category:item.category,
        sellerId:"merchant",
        sellerName:"商人",
        price:Number(item.price),
        quantity:null,
        createdAt:0
    });

});

    /*
    会員の出品を一覧に追加
    */

    Object.entries(listingData).forEach(([listingId, listing]) => {

        if(!listing){
            return;
        }

        if(listing.category !== currentCategory){
            return;
        }

        if(Number(listing.quantity || 0) <= 0){
            return;
        }

        offers.push({
            type:"member",
            id:listingId,
            ...listing,
            price:Number(listing.price || 0),
            quantity:Number(listing.quantity || 0)
        });
    });

    if(searchWord){

        offers = offers.filter(offer =>
            String(offer.itemName || "")
                .toLowerCase()
                .includes(searchWord)
        );
    }

    /*
    基本は商品名ごとにまとめる。
    同じ商品内では安い順に並べる。
    */

    offers.sort((a,b) => {

        const nameCompare =
            String(a.itemName)
                .localeCompare(String(b.itemName), "ja");

        if(nameCompare !== 0){
            return nameCompare;
        }

        if(sortType === "new"){

            return Number(b.createdAt || 0) -
                   Number(a.createdAt || 0);
        }

        return Number(a.price) - Number(b.price);
    });

    if(offers.length === 0){

        market.innerHTML =
            '<div class="empty">この分類の商品はありません</div>';

        return;
    }

    const grouped = {};

    offers.forEach(offer => {

        if(!grouped[offer.itemName]){
            grouped[offer.itemName] = [];
        }

        grouped[offer.itemName].push(offer);
    });

    market.innerHTML = "";

    Object.entries(grouped).forEach(([itemName, itemOffers]) => {

        /*
        同じ商品の中では値段順
        */

        if(sortType === "price"){

            itemOffers.sort((a,b) =>
                Number(a.price) - Number(b.price)
            );
        }

        const card = document.createElement("div");
        card.className = "itemCard";

        const header = document.createElement("div");
        header.className = "itemHeader";
        header.textContent = itemName;

        card.appendChild(header);

        itemOffers.forEach(offer => {

            const row = document.createElement("div");
            row.className = "offerRow";

            const isOwnListing =
                offer.type === "member" &&
                offer.sellerId === currentUser.uid;

            const sellerClass =
                offer.type === "merchant"
                ? "seller merchant"
                : "seller";

         row.innerHTML = `
    <div class="${sellerClass}">
        ${escapeHtml(offer.sellerName || "名無し")}
    </div>

    <div class="price">
        ${Number(offer.price).toLocaleString()} Pt
    </div>

    <div class="stock">
        ${
            offer.type === "merchant"
            ? "在庫 ∞"
            : "残り " + offer.quantity
        }
    </div>

<div class="buyArea">

    ${
        offer.type === "merchant"
        ? `
            <input
                class="buyQuantity"
                type="number"
                min="1"
                value="1"
            >
        `
        : ""
    }

    <button
        class="buyButton"
        ${isOwnListing ? "disabled" : ""}
    >
        ${isOwnListing ? "自分" : "買う"}
    </button>

    ${
        offer.type === "merchant"
        ? `
            <button class="sellButton">
                売る
            </button>
        `
        : ""
    }

</div>

`;
            const buyButton =
                row.querySelector(".buyButton");
            const sellButton =
    row.querySelector(".sellButton");


if(sellButton){

    sellButton.addEventListener("click", () => {

        const quantity = Number(
            row.querySelector(".buyQuantity").value
        );

        if(!Number.isInteger(quantity) || quantity <= 0){
            showMessage("個数を正しく入力してください");
            return;
        }

        sellMerchantItem(offer, quantity);
    });
}
            if(!isOwnListing){

               buyButton.addEventListener("click", () => {

   let quantity = 1;

if(offer.type === "member"){
    quantity = Number(offer.quantity);
}else{
    quantity = Number(
        row.querySelector(".buyQuantity").value
    );
}


if(offer.type === "merchant"){
    buyMerchantItem(offer, quantity);
}else{
    buyMemberListing(offer);
}
});
            }

            card.appendChild(row);
        });

        market.appendChild(card);
    });
}
async function buyMerchantItem(item, quantity){

   const confirmed = confirm(
    item.itemName +
    "を" +
    quantity +
    "個、" +
    Number(item.price * quantity).toLocaleString() +
    "Ptで購入しますか？"
);

    if(!confirmed){
        return;
    }

    try{

        const pointRef =
            database.ref(
                "members/" +
                currentUser.uid +
                "/point"
            );

        const pointResult =
            await pointRef.transaction(currentPoint => {

                const point = Number(currentPoint || 0);

                if(point < item.price){
                    return;
                }

              return point - (item.price * quantity);
            });

        if(!pointResult.committed){

            showMessage("ポイントが足りません");
            return;
        }

        await addItemToInventory(
    currentUser.uid,
    item.itemId,
    item.itemName,
    item.category,
    quantity
);

        showMessage(item.itemName + "を購入しました");

    }catch(error){

        console.error(error);
        showMessage("購入に失敗しました");
    }
}

/* =====================================================
   会員の出品を購入
===================================================== */

async function buyMemberListing(listing){
    
    const quantity = Number(listing.quantity || 0);

    if(listing.sellerId === currentUser.uid){

        showMessage("自分の出品は購入できません");
        return;
    }

    const confirmed = confirm(
        listing.itemName +
"を" +
quantity +
"個、" +
Number(listing.price * quantity).toLocaleString() +
"Ptで購入しますか？"
    );

    if(!confirmed){
        return;
    }

    const buyerPointRef =
        database.ref(
            "members/" +
            currentUser.uid +
            "/point"
        );

    let pointDeducted = false;

    try{

        /*
        購入者からポイントを引く
        */

        const pointResult =
            await buyerPointRef.transaction(currentPoint => {

                const point = Number(currentPoint || 0);

              if(point < listing.price * quantity){
                    return;
                }

               return point - Number(listing.price) * quantity;
            });

        if(!pointResult.committed){

            showMessage("ポイントが足りません");
            return;
        }

        pointDeducted = true;

        /*
        在庫を1個減らす
        */

        const listingRef =
            database.ref(
                "marketListings/" + listing.id
            );

        const listingResult =
            await listingRef.transaction(currentListing => {

                if(!currentListing){
                    return;
                }

                

              const stock =
    Number(currentListing.quantity || 0);

if(stock <= quantity){
    return null;
}

currentListing.quantity =
    stock - quantity;

return currentListing;

            
            });

        if(!listingResult.committed){

            await refundPoints(listing.price);

            showMessage("この商品は売り切れました");
            return;
        }

        /*
        出品者にポイントを渡す
        */

        await database
            .ref(
                "members/" +
                listing.sellerId +
                "/point"
            )
            .transaction(currentPoint =>
                Number(currentPoint || 0) +
               Number(listing.price) * quantity
            );

        /*
        購入者の持ち物へ追加
        */

        await addItemToInventory(
            currentUser.uid,
            listing.itemId,
            listing.itemName,
            listing.category,
            quantity
        );

        showMessage(listing.itemName + "を購入しました");

    }catch(error){

        console.error(error);

        if(pointDeducted){
          await refundPoints(listing.price * quantity);
        }

        showMessage("購入処理に失敗しました");
    }
}

async function refundPoints(amount){

    await database
        .ref(
            "members/" +
            currentUser.uid +
            "/point"
        )
        .transaction(currentPoint =>
            Number(currentPoint || 0) +
            Number(amount)
        );
}
async function addItemToInventory(
    uid,
    itemId,
    itemName,
    category,
    quantity
){

    const itemRef =
        database.ref(
            "inventories/" +
            uid +
            "/" +
            itemId
        );

    await itemRef.transaction(currentItem => {

        if(!currentItem){

            return {
                name:itemName,
                category:category,
                quantity:Number(quantity),
                updatedAt:firebase.database.ServerValue.TIMESTAMP
            };
        }

        currentItem.quantity =
            Number(currentItem.quantity || 0) +
            Number(quantity);

        currentItem.name = itemName;
        currentItem.category = category;
        currentItem.updatedAt =
            firebase.database.ServerValue.TIMESTAMP;

        return currentItem;
    });
}

/* =====================================================
   出品できる持ち物を表示
===================================================== */

function renderSellItems(){

    const select =
        document.getElementById("sellItem");

    select.innerHTML =
        '<option value="">出品する品物を選ぶ</option>';

    Object.entries(inventoryData)
    .forEach(([itemId, item]) => {

        if(!item){
            return;
        }

        const quantity =
            Number(item.quantity || 0);

        if(quantity <= 0){
            return;
        }

        if(item.category !== currentCategory){
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

/* =====================================================
   出品
===================================================== */

document
    .getElementById("sellButton")
    .addEventListener("click", sellItem);

async function sellItem(){

    const itemId =
        document.getElementById("sellItem").value;

    const quantity =
        Number(
            document.getElementById("sellQuantity").value
        );

    const price =
        Number(
            document.getElementById("sellPrice").value
        );

    if(!itemId){

        showMessage("出品する品物を選んでください");
        return;
    }

    if(!Number.isInteger(quantity) || quantity <= 0){

        showMessage("個数を正しく入力してください");
        return;
    }

    if(!Number.isInteger(price) || price <= 0){

        showMessage("値段を正しく入力してください");
        return;
    }

    const item = inventoryData[itemId];

    if(!item){

        showMessage("その品物を持っていません");
        return;
    }

    const inventoryRef =
        database.ref(
            "inventories/" +
            currentUser.uid +
            "/" +
            itemId
        );

    try{

        /*
        所持品から出品分を減らす
        */

        const inventoryResult =
            await inventoryRef.transaction(currentItem => {

                if(!currentItem){
                    return;
                }

                const ownedQuantity =
                    Number(currentItem.quantity || 0);

                if(ownedQuantity < quantity){
                    return;
                }

                if(ownedQuantity === quantity){
                    return null;
                }

                currentItem.quantity =
                    ownedQuantity - quantity;

                return currentItem;
            });

        if(!inventoryResult.committed){

            showMessage("持っている個数が足りません");
            return;
        }

        /*
        市場へ登録
        */

        const newListingRef =
            database.ref("marketListings").push();

        await newListingRef.set({
            sellerId:currentUser.uid,
            sellerName:
                currentMember.name ||
                currentUser.displayName ||
                "会員",

            itemId:itemId,
            itemName:item.name,
            category:item.category,

            price:price,
            quantity:quantity,

            createdAt:
                firebase.database.ServerValue.TIMESTAMP
        });

        document.getElementById("sellQuantity").value = 1;
        document.getElementById("sellPrice").value = "";

        showMessage(item.name + "を出品しました");

    }catch(error){

        console.error(error);

        /*
        出品に失敗した場合は持ち物を戻す
        */

        await addItemToInventory(
            currentUser.uid,
            itemId,
            item.name,
            item.category,
            quantity
        );

        showMessage("出品に失敗しました");
    }
}

/* =====================================================
   自分の出品表示
===================================================== */

function renderMyListings(){

    const area =
        document.getElementById("myListings");

    if(!currentUser){
        return;
    }

    const ownListings =
        Object.entries(listingData)
        .filter(([id, listing]) =>
            listing &&
            listing.sellerId === currentUser.uid
        );

    if(ownListings.length === 0){

        area.innerHTML =
            '<div class="empty">出品はありません</div>';

        return;
    }

    area.innerHTML = "";

    ownListings.forEach(([listingId, listing]) => {

        const row =
            document.createElement("div");

        row.className = "myListing";

        row.innerHTML = `
            <div>
                <strong>${escapeHtml(listing.itemName)}</strong>
                <br>
                ${Number(listing.price).toLocaleString()}Pt ×
                ${Number(listing.quantity || 0)}個
            </div>

            <div>
                合計
                ${(
                    Number(listing.price) *
                    Number(listing.quantity || 0)
                ).toLocaleString()}Pt
            </div>

            <button class="cancelButton">
                取り下げ
            </button>
        `;

        row
            .querySelector(".cancelButton")
            .addEventListener("click", () => {

                cancelListing(listingId, listing);
            });

        area.appendChild(row);
    });
}

/* =====================================================
   出品取り下げ
===================================================== */

async function cancelListing(listingId, listing){

    const confirmed =
        confirm(
            listing.itemName +
            "の出品を取り下げますか？"
        );

    if(!confirmed){
        return;
    }

    try{

        const snapshot =
            await database
                .ref(
                    "marketListings/" +
                    listingId
                )
                .once("value");

        const latestListing =
            snapshot.val();

        if(!latestListing){

            showMessage("すでに売り切れています");
            return;
        }

        if(latestListing.sellerId !== currentUser.uid){

            showMessage("この出品は取り下げられません");
            return;
        }

        await addItemToInventory(
            currentUser.uid,
            latestListing.itemId,
            latestListing.itemName,
            latestListing.category,
            Number(latestListing.quantity || 0)
        );

        await database
            .ref(
                "marketListings/" +
                listingId
            )
            .remove();

        showMessage("出品を取り下げました");

    }catch(error){

        console.error(error);
        showMessage("取り下げに失敗しました");
    }
}
async function sellMerchantItem(item, quantity){

    if(!Number.isInteger(quantity) || quantity <= 0){
        showMessage("個数を正しく入力してください");
        return;
    }

    const confirmed = confirm(
        item.itemName +
        "を" +
        quantity +
        "個、" +
        Number(item.price * quantity).toLocaleString() +
        "Ptで売りますか？"
    );

    if(!confirmed){
        return;
    }

    const inventoryRef = database.ref(
        "inventories/" +
        currentUser.uid +
        "/" +
        item.itemId
    );

    const result = await inventoryRef.transaction(currentItem => {

        if(!currentItem){
            return;
        }

        const have = Number(currentItem.quantity || 0);

        if(have < quantity){
            return;
        }

        if(have === quantity){
            return null;
        }

        currentItem.quantity = have - quantity;

        return currentItem;
    });

    if(!result.committed){
        showMessage("持っている個数が足りません");
        return;
    }

    await database.ref(
        "members/" +
        currentUser.uid +
        "/point"
    )
    .transaction(point =>
        Number(point || 0) +
        Number(item.price) * quantity
    );

    showMessage(
        item.itemName +
        "を" +
        quantity +
        "個売りました"
    );
}
