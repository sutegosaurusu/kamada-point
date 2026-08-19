// =====================================================
// アゴラ市場
// =====================================================
// shop.js の役割
//
// ・通常商品
// ・商人商品
// ・通常アイテムの出品
// ・通常アイテムの売却
// ・新規農地購入
// ・所有農地の出品
// ・所有農地の出品取り下げ
// ・不動産市場で農地購入
// =====================================================


let currentCategory = "food";

let listingData = {};

let merchantData = {};

let farmListingsData = {};

let currentPoint = 0;


// =====================================================
// 商人再入荷
// =====================================================

const REGEN_ITEMS = {
    leaf:30,
    water:30
};


const RESTOCK_HOUR = 5;


// =====================================================
// ログイン
// =====================================================

auth.onAuthStateChanged(user => {

    if(!user){

        location.href =
            "../index.html";

        return;

    }


    currentUser =
        user;


    startShop();

});


// =====================================================
// 初期化
// =====================================================

function startShop(){

    watchPoint();

    watchListings();

    setupShopEvents();

}


// =====================================================
// ポイント
// =====================================================

function watchPoint(){

    database
        .ref(
            "members/" +
            currentUser.uid +
            "/point"
        )
        .on(
            "value",
            snapshot => {

                currentPoint =
                    Number(
                        snapshot.val() || 0
                    );


                const element =
                    document.getElementById(
                        "pointDisplay"
                    );


                if(element){

                    element.textContent =
                        currentPoint.toLocaleString() +
                        " Pt";

                }

            }
        );

}


// =====================================================
// 市場監視
// =====================================================

function watchListings(){

    database
        .ref("marketListings")
        .on(
            "value",
            snapshot => {

                listingData =
                    snapshot.val() || {};


                renderMarket();

                renderMyListings();

            }
        );


    database
        .ref("merchantStock")
        .on(
            "value",
            async snapshot => {

                merchantData =
                    snapshot.val() || {};


                if(
                    Object.keys(
                        merchantData
                    ).length === 0
                ){

                    const stock = {};


                    items.forEach(
                        item => {

                            stock[item.id] = {
                                quantity:0
                            };


                            if(
                                REGEN_ITEMS[
                                    item.id
                                ] !== undefined
                            ){

                                stock[
                                    item.id
                                ].lastRestockAt =
                                    firebase.database
                                        .ServerValue
                                        .TIMESTAMP;

                            }

                        }
                    );


                    await database
                        .ref(
                            "merchantStock"
                        )
                        .set(stock);


                    merchantData =
                        stock;

                }


                await checkMerchantRestock();

                renderMarket();

            }
        );


    database
        .ref("farmListings")
        .on(
            "value",
            snapshot => {

                farmListingsData =
                    snapshot.val() || {};


                renderMarket();

                renderMyFarmSales();

            }
        );


    watchMyFarmsForShop();

}


// =====================================================
// 自分の農地監視
// =====================================================

function watchMyFarmsForShop(){

    database
        .ref("farms")
        .on(
            "value",
            snapshot => {

                const allFarms =
                    snapshot.val() || {};


                const myFarms = [];


                Object.entries(
                    allFarms
                )
                .forEach(
                    ([farmId, farm]) => {

                        if(
                            farm &&
                            farm.ownerId ===
                            currentUser.uid
                        ){

                            myFarms.push({

                                id:farmId,

                                ...farm

                            });

                        }

                    }
                );


                renderMyFarmSales(
                    myFarms
                );

            }
        );

}


// =====================================================
// 所有農地を表示
// =====================================================

function renderMyFarmSales(
    farms
){

    const container =
        document.getElementById(
            "myFarmSales"
        );


    if(!container){
        return;
    }


    if(farms.length === 0){

        container.innerHTML = `

            <div class="empty">

                所有している農地はありません

            </div>

        `;

        return;

    }


    container.innerHTML = "";


    farms.forEach(
        farm => {

            const farmType =
                farmTypes[
                    farm.farmType
                ];


            if(!farmType){
                return;
            }


            const listing =
                farmListingsData[
                    farm.id
                ];


            const workerCount =
                Number(
                    farm.workerCount || 0
                );


            const hasWorkers =
                workerCount > 0;


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "farmSellCard";


            if(listing){

                card.innerHTML = `

                    <div class="farmSellInfo">

                        <div class="farmSellName">

                            ${farmType.icon}
                            ${escapeHtml(
                                farmType.name
                            )}

                        </div>


                        <div class="farmSellPrice">

                            出品価格：
                            ${Number(
                                listing.price || 0
                            ).toLocaleString()}
                            Pt

                        </div>


                        <div class="farmSellStatus">

                            🏠 不動産市場に出品中

                        </div>

                    </div>


                    <button
                        class="farmSellButton"
                        data-action="cancel">

                        出品を取り下げる

                    </button>

                `;


                card
                    .querySelector(
                        '[data-action="cancel"]'
                    )
                    .addEventListener(
                        "click",
                        () => {

                            cancelFarmListing(
                                farm
                            );

                        }
                    );

            }else{

                card.innerHTML = `

                    <div class="farmSellInfo">

                        <div class="farmSellName">

                            ${farmType.icon}
                            ${escapeHtml(
                                farmType.name
                            )}

                        </div>


                        <div class="farmSellPrice">

                            自由価格で出品できます

                        </div>


                        <div class="farmSellStatus">

                            ${
                                hasWorkers
                                ? "👨‍🌾 労働者がいるため出品できません"
                                : "出品可能"
                            }

                        </div>

                    </div>


                    <button
                        class="farmSellButton"
                        data-action="sell"
                        ${hasWorkers ? "disabled" : ""}>

                        農地を売りに出す

                    </button>

                `;


                if(!hasWorkers){

                    card
                        .querySelector(
                            '[data-action="sell"]'
                        )
                        .addEventListener(
                            "click",
                            () => {

                                listFarmForSale(
                                    farm
                                );

                            }
                        );

                }

            }


            container.appendChild(
                card
            );

        }
    );

}


// =====================================================
// 商人再入荷
// =====================================================

function getLastRestockTime(
    baseTime
){

    const date =
        new Date(
            baseTime
        );


    date.setHours(
        RESTOCK_HOUR,
        0,
        0,
        0
    );


    if(
        date.getTime() >
        baseTime
    ){

        date.setDate(
            date.getDate() - 1
        );

    }


    return date.getTime();

}


async function checkMerchantRestock(){

    const now =
        Date.now();


    const latestRestockTime =
        getLastRestockTime(
            now
        );


    for(
        const itemId in REGEN_ITEMS
    ){

        const regenAmount =
            REGEN_ITEMS[
                itemId
            ];


        const item =
            items.find(
                i =>
                    i.id ===
                    itemId
            );


        if(!item){
            continue;
        }


        const limit =
            merchantStockLimit[
                item.category
            ] || 0;


        const stockRef =
            database.ref(
                "merchantStock/" +
                itemId
            );


        await stockRef.transaction(
            currentStock => {

                if(!currentStock){
                    return;
                }


                const lastRestockAt =
                    Number(
                        currentStock.lastRestockAt ||
                        0
                    );


                if(
                    lastRestockAt >=
                    latestRestockTime
                ){

                    return currentStock;

                }


                const elapsedRestocks =
                    Math.floor(
                        (
                            latestRestockTime -
                            lastRestockAt
                        ) /
                        (
                            24 *
                            60 *
                            60 *
                            1000
                        )
                    ) + 1;


                const currentQuantity =
                    Number(
                        currentStock.quantity ||
                        0
                    );


                currentStock.quantity =
                    Math.min(
                        limit,
                        currentQuantity +
                        regenAmount *
                        elapsedRestocks
                    );


                currentStock.lastRestockAt =
                    latestRestockTime;


                return currentStock;

            }
        );

    }

}


// =====================================================
// ボタン設定
// =====================================================

function setupShopEvents(){

    document
        .querySelectorAll(
            ".categoryTabs button"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        document
                            .querySelectorAll(
                                ".categoryTabs button"
                            )
                            .forEach(
                                btn =>
                                    btn.classList
                                        .remove(
                                            "active"
                                        )
                            );


                        button.classList.add(
                            "active"
                        );


                        currentCategory =
                            button.dataset.category;


                        updateSellAreaVisibility();

                        renderMarket();

                        renderSellItems();

                    }
                );

            }
        );


    const searchInput =
        document.getElementById(
            "searchInput"
        );


    if(searchInput){

        searchInput.addEventListener(
            "input",
            renderMarket
        );

    }


    const sortSelect =
        document.getElementById(
            "sortSelect"
        );


    if(sortSelect){

        sortSelect.addEventListener(
            "change",
            renderMarket
        );

    }


    const sellButton =
        document.getElementById(
            "sellButton"
        );


    if(sellButton){

        sellButton.addEventListener(
            "click",
            sellItem
        );

    }


    setupFarmPurchaseButtons();

}


// =====================================================
// 通常出品欄の表示
// =====================================================

function updateSellAreaVisibility(){

    const isRealEstate =
        currentCategory ===
        "realestate";


    const sellArea =
        document.querySelector(
            ".sellArea"
        );


    const myListings =
        document.querySelector(
            ".myListings"
        );


    if(sellArea){

        sellArea.style.display =
            isRealEstate
            ? "none"
            : "flex";

    }


    if(myListings){

        myListings.style.display =
            isRealEstate
            ? "none"
            : "block";

    }

}


// =====================================================
// 市場表示
// =====================================================

function renderMarket(){

    if(
        currentCategory ===
        "realestate"
    ){

        renderRealEstateMarket();

        return;

    }


    const market =
        document.getElementById(
            "market"
        );


    if(
        !market ||
        !currentUser
    ){

        return;

    }


    const searchInput =
        document.getElementById(
            "searchInput"
        );


    const sortSelect =
        document.getElementById(
            "sortSelect"
        );


    const searchWord =
        searchInput
        ? searchInput.value
            .trim()
            .toLowerCase()
        : "";


    const sortType =
        sortSelect
        ? sortSelect.value
        : "price";


    let offers = [];


    // -----------------------------------------
    // 商人
    // -----------------------------------------

    if(
        window.merchantItems
    ){

        window.merchantItems.forEach(
            itemId => {

                const item =
                    items.find(
                        i =>
                            i.id ===
                            itemId
                    );


                if(!item){
                    return;
                }


                if(
                    item.category !==
                    currentCategory
                ){

                    return;

                }


                const quantity =
                    Number(
                        merchantData[
                            itemId
                        ]?.quantity || 0
                    );


                offers.push({

                    type:"merchant",

                    id:item.id,

                    itemId:item.id,

                    itemName:item.name,

                    category:item.category,

                    sellerId:"merchant",

                    sellerName:"商人",

                    price:
                        getMerchantPrice(
                            item,
                            quantity
                        ),

                    sellPrice:
                        Math.floor(
                            item.price *
                            0.3
                        ),

                    quantity:quantity,

                    createdAt:0

                });

            }
        );

    }


    // -----------------------------------------
    // 会員出品
    // -----------------------------------------

    Object.entries(
        listingData
    )
    .forEach(
        ([listingId, listing]) => {

            if(!listing){
                return;
            }


            if(
                listing.category !==
                currentCategory
            ){

                return;

            }


            if(
                Number(
                    listing.quantity || 0
                ) <= 0
            ){

                return;

            }


            offers.push({

                type:"member",

                id:listingId,

                ...listing,

                price:
                    Number(
                        listing.price || 0
                    ),

                quantity:
                    Number(
                        listing.quantity || 0
                    )

            });

        }
    );


    if(searchWord){

        offers =
            offers.filter(
                offer =>

                    String(
                        offer.itemName || ""
                    )
                    .toLowerCase()
                    .includes(
                        searchWord
                    )
            );

    }


    offers.sort(
        (a,b) => {

            if(
                sortType ===
                "new"
            ){

                return (
                    Number(
                        b.createdAt || 0
                    ) -
                    Number(
                        a.createdAt || 0
                    )
                );

            }


            return (
                Number(a.price) -
                Number(b.price)
            );

        }
    );


    if(
        offers.length === 0
    ){

        market.innerHTML =
            '<div class="empty">この分類の商品はありません</div>';

        return;

    }


    const grouped = {};


    offers.forEach(
        offer => {

            if(
                !grouped[
                    offer.itemName
                ]
            ){

                grouped[
                    offer.itemName
                ] = [];

            }


            grouped[
                offer.itemName
            ].push(
                offer
            );

        }
    );


    market.innerHTML = "";


    Object.entries(
        grouped
    )
    .forEach(
        ([itemName, itemOffers]) => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "itemCard";


            const header =
                document.createElement(
                    "div"
                );


            header.className =
                "itemHeader";


            header.textContent =
                itemName;


            card.appendChild(
                header
            );


            itemOffers.forEach(
                offer => {

                    const row =
                        document.createElement(
                            "div"
                        );


                    row.className =
                        "offerRow";


                    const isOwnListing =
                        offer.type === "member" &&
                        offer.sellerId ===
                        currentUser.uid;


                    const isSoldOut =
                        offer.type ===
                        "merchant" &&
                        offer.quantity <= 0;


                    row.innerHTML = `

                        <div class="${
                            offer.type === "merchant"
                            ? "seller merchant"
                            : "seller"
                        }">

                            ${escapeHtml(
                                offer.sellerName ||
                                "名無し"
                            )}

                        </div>


                        <div class="price">

                            ${Number(
                                offer.price
                            ).toLocaleString()}
                            Pt

                        </div>


                        <div class="stock">

                            ${
                                offer.type ===
                                "merchant"

                                ? "在庫：" +
                                  offer.quantity +
                                  "個"

                                : "残り " +
                                  offer.quantity +
                                  "（まとめ買い）"
                            }

                        </div>


                        <div class="buyArea">

                            ${
                                offer.type ===
                                "merchant"

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


                            ${
                                isSoldOut

                                ? `

                                    <div class="soldOut">
                                        売り切れ
                                    </div>

                                `

                                : `

                                    <button
                                        class="buyButton"
                                        ${
                                            isOwnListing
                                            ? "disabled"
                                            : ""
                                        }>

                                        ${
                                            isOwnListing
                                            ? "自分"
                                            : (
                                                offer.type ===
                                                "merchant"
                                                ? "買う"
                                                : "まとめて買う"
                                            )
                                        }

                                    </button>

                                `
                            }


                            ${
                                offer.type ===
                                "merchant"

                                ? `

                                    <button
                                        class="sellButton">

                                        売る

                                    </button>

                                `

                                : ""
                            }

                        </div>

                    `;


                    const buyButton =
                        row.querySelector(
                            ".buyButton"
                        );


                    const sellButton =
                        row.querySelector(
                            ".sellButton"
                        );


                    if(sellButton){

                        sellButton.addEventListener(
                            "click",
                            () => {

                                const quantity =
                                    Number(
                                        row.querySelector(
                                            ".buyQuantity"
                                        )?.value || 1
                                    );


                                if(
                                    !Number.isInteger(
                                        quantity
                                    ) ||
                                    quantity <= 0
                                ){

                                    showMessage(
                                        "個数を正しく入力してください"
                                    );

                                    return;

                                }


                                sellMerchantItem(
                                    offer,
                                    quantity
                                );

                            }
                        );

                    }


                    if(
                        buyButton &&
                        !isOwnListing
                    ){

                        buyButton.addEventListener(
                            "click",
                            () => {

                                let quantity =
                                    1;


                                if(
                                    offer.type ===
                                    "merchant"
                                ){

                                    quantity =
                                        Number(
                                            row.querySelector(
                                                ".buyQuantity"
                                            ).value
                                        );

                                }else{

                                    quantity =
                                        Number(
                                            offer.quantity
                                        );

                                }


                                if(
                                    offer.type ===
                                    "merchant"
                                ){

                                    buyMerchantItem(
                                        offer,
                                        quantity
                                    );

                                }else{

                                    buyMemberListing(
                                        offer
                                    );

                                }

                            }
                        );

                    }


                    card.appendChild(
                        row
                    );

                }
            );


            market.appendChild(
                card
            );

        }
    );

}


// =====================================================
// 不動産市場
// =====================================================

function renderRealEstateMarket(){

    const market =
        document.getElementById(
            "market"
        );


    if(
        !market ||
        !currentUser
    ){

        return;

    }


    const searchInput =
        document.getElementById(
            "searchInput"
        );


    const sortSelect =
        document.getElementById(
            "sortSelect"
        );


    const searchWord =
        searchInput
        ? searchInput.value
            .trim()
            .toLowerCase()
        : "";


    const sortType =
        sortSelect
        ? sortSelect.value
        : "price";


    let listings =
        Object.entries(
            farmListingsData
        )
        .filter(
            ([farmId, listing]) =>
                !!listing
        )
        .map(
            ([farmId, listing]) => ({
                farmId,
                ...listing
            })
        );


    if(searchWord){

        listings =
            listings.filter(
                listing =>

                    String(
                        listing.farmTypeName ||
                        ""
                    )
                    .toLowerCase()
                    .includes(
                        searchWord
                    )
            );

    }


    listings.sort(
        (a,b) => {

            if(
                sortType === "new"
            ){

                return (
                    Number(
                        b.createdAt || 0
                    ) -
                    Number(
                        a.createdAt || 0
                    )
                );

            }


            return (
                Number(a.price || 0) -
                Number(b.price || 0)
            );

        }
    );


    if(
        listings.length === 0
    ){

        market.innerHTML = `

            <div class="empty">

                出品されている農地はありません

            </div>

        `;

        return;

    }


    const card =
        document.createElement(
            "div"
        );


    card.className =
        "itemCard";


    const header =
        document.createElement(
            "div"
        );


    header.className =
        "itemHeader";


    header.textContent =
        "🏠 不動産（農地）";


    card.appendChild(
        header
    );


    listings.forEach(
        listing => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "offerRow";


            const isOwnListing =
                listing.sellerId ===
                currentUser.uid;


            row.innerHTML = `

                <div class="seller">

                    ${escapeHtml(
                        listing.farmTypeIcon ||
                        "🏠"
                    )}

                    ${escapeHtml(
                        listing.farmTypeName ||
                        "農地"
                    )}

                    <br>

                    <small>

                        地主：
                        ${escapeHtml(
                            listing.sellerName ||
                            "名無し"
                        )}

                    </small>

                </div>


                <div class="price">

                    ${Number(
                        listing.price || 0
                    ).toLocaleString()}
                    Pt

                </div>


                <div class="stock">

                    1区画

                </div>


                <div class="buyArea">

                    ${
                        isOwnListing

                        ? `

                            <button
                                class="cancelButton">

                                取り下げ

                            </button>

                        `

                        : `

                            <button
                                class="buyButton">

                                購入する

                            </button>

                        `
                    }

                </div>

            `;


            if(isOwnListing){

                row
                    .querySelector(
                        ".cancelButton"
                    )
                    .addEventListener(
                        "click",
                        () => {

                            cancelFarmListing(
                                listing
                            );

                        }
                    );

            }else{

                row
                    .querySelector(
                        ".buyButton"
                    )
                    .addEventListener(
                        "click",
                        () => {

                            buyFarmListing(
                                listing
                            );

                        }
                    );

            }


            card.appendChild(
                row
            );

        }
    );


    market.appendChild(
        card
    );

}


// =====================================================
// 新規農地購入ボタン
// =====================================================

function setupFarmPurchaseButtons(){

    document
        .querySelectorAll(
            ".farmPurchaseButton"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        buyNewFarm(
                            button.dataset.farmType
                        );

                    }
                );

            }
        );

}


// =====================================================
// 新規農地購入
// =====================================================

async function buyNewFarm(
    farmTypeId
){

    const farmType =
        farmTypes[
            farmTypeId
        ];


    if(!farmType){

        showMessage(
            "農地情報が見つかりません"
        );

        return;

    }


    const price =
        Number(
            farmType.price || 0
        );


    const totalSnapshot =
        await database
            .ref(
                "farmMeta/totalFarms"
            )
            .once(
                "value"
            );


    const total =
        Number(
            totalSnapshot.val() || 0
        );


    if(total >= 30){

        showMessage(
            "新しい農地はすべて売り切れています。不動産市場をご利用ください。"
        );

        return;

    }


    if(currentPoint < price){

        showMessage(
            "ポイントが足りません"
        );

        return;

    }


    const confirmed =
        confirm(

            farmType.name +
            "を" +
            price.toLocaleString() +
            " Ptで購入しますか？"

        );


    if(!confirmed){
        return;
    }


    let slotReserved =
        false;

    let pointDeducted =
        false;


    try{

        const totalRef =
            database.ref(
                "farmMeta/totalFarms"
            );


        const slotResult =
            await totalRef.transaction(
                value => {

                    const current =
                        Number(
                            value || 0
                        );


                    if(
                        current >= 30
                    ){

                        return;

                    }


                    return current + 1;

                }
            );


        if(
            !slotResult.committed
        ){

            showMessage(
                "農地はすべて売り切れています"
            );

            return;

        }


        slotReserved =
            true;


        const pointRef =
            database.ref(
                "members/" +
                currentUser.uid +
                "/point"
            );


        const pointResult =
            await pointRef.transaction(
                point => {

                    const current =
                        Number(
                            point || 0
                        );


                    if(
                        current <
                        price
                    ){

                        return;

                    }


                    return current -
                        price;

                }
            );


        if(
            !pointResult.committed
        ){

            showMessage(
                "ポイントが足りません"
            );

            return;

        }


        pointDeducted =
            true;


        const farmRef =
            database
                .ref("farms")
                .push();


        await farmRef.set({

            ownerId:
                currentUser.uid,

            ownerName:
                currentMember?.name ||
                currentUser.displayName ||
                "農園主",

            farmType:
                farmTypeId,

            cropId:
                null,

            plantedAt:
                null,

            harvestAt:
                null,

            workerCount:
                0,

            workerCapacity:
                farmType.workerCapacity,

            salary:
                0,

            createdAt:
                firebase.database
                    .ServerValue
                    .TIMESTAMP

        });


        showMessage(
            farmType.name +
            "を購入しました"
        );


    }catch(error){

        console.error(
            "新規農地購入エラー:",
            error
        );


        if(pointDeducted){

            await database
                .ref(
                    "members/" +
                    currentUser.uid +
                    "/point"
                )
                .transaction(
                    point =>
                        Number(
                            point || 0
                        ) + price
                );

        }


        if(slotReserved){

            await database
                .ref(
                    "farmMeta/totalFarms"
                )
                .transaction(
                    value =>
                        Math.max(
                            0,
                            Number(
                                value || 0
                            ) - 1
                        )
                );

        }


        showMessage(
            "農地を購入できませんでした"
        );

    }

}


// =====================================================
// 自分の農地を出品
// =====================================================

async function listFarmForSale(
    farm
){

    const farmType =
        farmTypes[
            farm.farmType
        ];


    if(!farmType){

        showMessage(
            "農地情報が見つかりません"
        );

        return;

    }


    const workerCount =
        Number(
            farm.workerCount || 0
        );


    if(workerCount > 0){

        showMessage(
            "労働者がいる農地は出品できません"
        );

        return;

    }


    const existing =
        await database
            .ref(
                "farmListings/" +
                farm.id
            )
            .once(
                "value"
            );


    if(existing.exists()){

        showMessage(
            "すでに出品されています"
        );

        return;

    }


    const input =
        prompt(
            farmType.name +
            "の販売価格を入力してください。"
        );


    if(input === null){
        return;
    }


    const price =
        Number(input);


    if(
        !Number.isInteger(price) ||
        price <= 0
    ){

        showMessage(
            "正しい販売価格を入力してください"
        );

        return;

    }


    const confirmed =
        confirm(

            farmType.name +
            "を" +
            price.toLocaleString() +
            " Ptで不動産市場に出品しますか？"

        );


    if(!confirmed){
        return;
    }


    try{

        await database
            .ref(
                "farmListings/" +
                farm.id
            )
            .set({

                sellerId:
                    currentUser.uid,

                sellerName:
                    currentMember?.name ||
                    currentUser.displayName ||
                    "農園主",

                farmType:
                    farm.farmType,

                farmTypeName:
                    farmType.name,

                farmTypeIcon:
                    farmType.icon ||
                    "🏠",

                price:
                    price,

                createdAt:
                    firebase.database
                        .ServerValue
                        .TIMESTAMP

            });


        showMessage(
            farmType.name +
            "を不動産市場に出品しました"
        );


    }catch(error){

        console.error(
            "農地出品エラー:",
            error
        );


        showMessage(
            "農地を出品できませんでした"
        );

    }

}


// =====================================================
// 自分の出品を取り下げる
// =====================================================

async function cancelFarmListing(
    farm
){

    const listingRef =
        database.ref(
            "farmListings/" +
            farm.id
        );


    try{

        const snapshot =
            await listingRef.once(
                "value"
            );


        const listing =
            snapshot.val();


        if(!listing){

            showMessage(
                "この農地は出品されていません"
            );

            return;

        }


        if(
            listing.sellerId !==
            currentUser.uid
        ){

            showMessage(
                "この出品を取り下げる権限がありません"
            );

            return;

        }


        const confirmed =
            confirm(
                "この農地の出品を取り下げますか？"
            );


        if(!confirmed){
            return;
        }


        await listingRef.remove();


        showMessage(
            "農地の出品を取り下げました"
        );


    }catch(error){

        console.error(
            "農地出品取り下げエラー:",
            error
        );


        showMessage(
            "出品を取り下げられませんでした"
        );

    }

}


// =====================================================
// 他人の農地を購入
// =====================================================

async function buyFarmListing(
    listing
){

    const price =
        Number(
            listing.price || 0
        );


    if(
        listing.sellerId ===
        currentUser.uid
    ){

        showMessage(
            "自分の農地は購入できません"
        );

        return;

    }


    const confirmed =
        confirm(

            listing.farmTypeName +
            "を" +
            price.toLocaleString() +
            " Ptで購入しますか？"

        );


    if(!confirmed){
        return;
    }


    let pointDeducted =
        false;


    try{

        const listingRef =
            database.ref(
                "farmListings/" +
                listing.farmId
            );


        const listingSnapshot =
            await listingRef.once(
                "value"
            );


        const latestListing =
            listingSnapshot.val();


        if(!latestListing){

            showMessage(
                "この農地はすでに売却されています"
            );

            return;

        }


        const buyerPointRef =
            database.ref(
                "members/" +
                currentUser.uid +
                "/point"
            );


        const pointResult =
            await buyerPointRef.transaction(
                point => {

                    const current =
                        Number(
                            point || 0
                        );


                    if(
                        current <
                        price
                    ){

                        return;

                    }


                    return current -
                        price;

                }
            );


        if(
            !pointResult.committed
        ){

            showMessage(
                "ポイントが足りません"
            );

            return;

        }


        pointDeducted =
            true;


        const farmRef =
            database.ref(
                "farms/" +
                listing.farmId
            );


        const farmResult =
            await farmRef.transaction(
                farm => {

                    if(!farm){
                        return;
                    }


                    if(
                        farm.ownerId !==
                        latestListing.sellerId
                    ){

                        return;

                    }


                    farm.ownerId =
                        currentUser.uid;


                    farm.ownerName =
                        currentMember?.name ||
                        currentUser.displayName ||
                        "農園主";


                    farm.workerCount =
                        0;


                    farm.salary =
                        0;


                    return farm;

                }
            );


        if(
            !farmResult.committed
        ){

            await refundPoints(
                price
            );


            pointDeducted =
                false;


            showMessage(
                "この農地はすでに売却されています"
            );

            return;

        }


        await database
            .ref(
                "members/" +
                latestListing.sellerId +
                "/point"
            )
            .transaction(
                point =>
                    Number(
                        point || 0
                    ) + price
            );


        await listingRef.remove();


        showMessage(
            latestListing.farmTypeName +
            "を購入しました"
        );


    }catch(error){

        console.error(
            "農地購入エラー:",
            error
        );


        if(pointDeducted){

            await refundPoints(
                price
            );

        }


        showMessage(
            "農地の購入に失敗しました"
        );

    }

}


// =====================================================
// 通常商品の購入
// =====================================================

async function buyMerchantItem(
    item,
    quantity
){

    if(
        !Number.isInteger(
            quantity
        ) ||
        quantity <= 0
    ){

        showMessage(
            "個数を正しく入力してください"
        );

        return;

    }


    const stockRef =
        database.ref(
            "merchantStock/" +
            item.itemId
        );


    const stockSnapshot =
        await stockRef.once(
            "value"
        );


    const stock =
        stockSnapshot.val();


    if(
        !stock ||
        stock.quantity <
        quantity
    ){

        showMessage(
            "商人の在庫が足りません"
        );

        return;

    }


    const totalPrice =
        Number(
            item.price *
            quantity
        );


    const confirmed =
        confirm(

            item.itemName +
            "を" +
            quantity +
            "個、" +
            totalPrice.toLocaleString() +
            " Ptで購入しますか？"

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
            await pointRef.transaction(
                point => {

                    const current =
                        Number(
                            point || 0
                        );


                    if(
                        current <
                        totalPrice
                    ){

                        return;

                    }


                    return current -
                        totalPrice;

                }
            );


        if(
            !pointResult.committed
        ){

            showMessage(
                "ポイントが足りません"
            );

            return;

        }


        await addItemToInventory(
            currentUser.uid,
            item.itemId,
            item.itemName,
            item.category,
            quantity
        );


        await merchantTakeItem(
            item.itemId,
            quantity
        );


        showMessage(
            item.itemName +
            "を購入しました"
        );


    }catch(error){

        console.error(error);

        showMessage(
            "購入に失敗しました"
        );

    }

}


// =====================================================
// 会員出品購入
// =====================================================

async function buyMemberListing(
    listing
){

    const quantity =
        Number(
            listing.quantity || 0
        );


    if(
        listing.sellerId ===
        currentUser.uid
    ){

        showMessage(
            "自分の出品は購入できません"
        );

        return;

    }


    const totalPrice =
        Number(
            listing.price *
            quantity
        );


    const confirmed =
        confirm(

            listing.itemName +
            "を" +
            quantity +
            "個、" +
            totalPrice.toLocaleString() +
            " Ptで購入しますか？"

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


    let pointDeducted =
        false;


    try{

        const pointResult =
            await buyerPointRef.transaction(
                point => {

                    const current =
                        Number(
                            point || 0
                        );


                    if(
                        current <
                        totalPrice
                    ){

                        return;

                    }


                    return current -
                        totalPrice;

                }
            );


        if(
            !pointResult.committed
        ){

            showMessage(
                "ポイントが足りません"
            );

            return;

        }


        pointDeducted =
            true;


        const listingRef =
            database.ref(
                "marketListings/" +
                listing.id
            );


        const listingResult =
            await listingRef.transaction(
                currentListing => {

                    if(!currentListing){
                        return;
                    }


                    const stock =
                        Number(
                            currentListing.quantity ||
                            0
                        );


                    if(
                        stock <
                        quantity
                    ){

                        return;

                    }


                    if(
                        stock ===
                        quantity
                    ){

                        currentListing.earnedPoints =
                            Number(
                                currentListing.price
                            ) *
                            stock;


                        currentListing.quantity =
                            0;


                        currentListing.status =
                            "sold";


                        currentListing.soldAt =
                            firebase.database
                                .ServerValue
                                .TIMESTAMP;


                        return currentListing;

                    }


                    currentListing.quantity =
                        stock -
                        quantity;


                    return currentListing;

                }
            );


        if(
            !listingResult.committed
        ){

            await refundPoints(
                totalPrice
            );


            pointDeducted =
                false;


            showMessage(
                "この商品は売り切れました"
            );

            return;

        }


        await database
            .ref(
                "members/" +
                listing.sellerId +
                "/point"
            )
            .transaction(
                point =>
                    Number(
                        point || 0
                    ) +
                    totalPrice
            );


        await addItemToInventory(
            currentUser.uid,
            listing.itemId,
            listing.itemName,
            listing.category,
            quantity
        );


        showMessage(
            listing.itemName +
            "を購入しました"
        );


    }catch(error){

        console.error(error);


        if(pointDeducted){

            await refundPoints(
                totalPrice
            );

        }


        showMessage(
            "購入処理に失敗しました"
        );

    }

}


// =====================================================
// ポイント返却
// =====================================================

async function refundPoints(
    amount
){

    await database
        .ref(
            "members/" +
            currentUser.uid +
            "/point"
        )
        .transaction(
            point =>
                Number(
                    point || 0
                ) +
                Number(amount)
        );

}


// =====================================================
// インベントリ追加
// =====================================================

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


    await itemRef.transaction(
        currentItem => {

            if(!currentItem){

                return {

                    name:
                        itemName,

                    category:
                        category,

                    quantity:
                        Number(
                            quantity
                        ),

                    updatedAt:
                        firebase.database
                            .ServerValue
                            .TIMESTAMP

                };

            }


            currentItem.quantity =
                Number(
                    currentItem.quantity || 0
                ) +
                Number(
                    quantity
                );


            currentItem.name =
                itemName;


            currentItem.category =
                category;


            currentItem.updatedAt =
                firebase.database
                    .ServerValue
                    .TIMESTAMP;


            return currentItem;

        }
    );

}


// =====================================================
// 商人在庫
// =====================================================

async function merchantTakeItem(
    itemId,
    quantity
){

    const stockRef =
        database.ref(
            "merchantStock/" +
            itemId
        );


    await stockRef.transaction(
        currentStock => {

            if(!currentStock){
                return;
            }


            const stock =
                Number(
                    currentStock.quantity ||
                    0
                );


            if(
                stock <
                quantity
            ){

                return;

            }


            currentStock.quantity =
                stock -
                quantity;


            return currentStock;

        }
    );

}


async function merchantReceiveItem(
    itemId,
    quantity
){

    const stockRef =
        database.ref(
            "merchantStock/" +
            itemId
        );


    await stockRef.transaction(
        currentStock => {

            if(!currentStock){

                return {
                    quantity:quantity
                };

            }


            currentStock.quantity =
                Number(
                    currentStock.quantity ||
                    0
                ) +
                quantity;


            return currentStock;

        }
    );

}


// =====================================================
// 持ち物から出品
// =====================================================

function renderSellItems(){

    const select =
        document.getElementById(
            "sellItem"
        );


    if(!select){
        return;
    }


    select.innerHTML =
        '<option value="">出品する品物を選ぶ</option>';


    Object.entries(
        inventoryData || {}
    )
    .forEach(
        ([itemId, item]) => {

            if(!item){
                return;
            }


            const quantity =
                Number(
                    item.quantity || 0
                );


            if(
                quantity <= 0
            ){

                return;

            }


            if(
                item.category !==
                currentCategory
            ){

                return;

            }


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                itemId;


            option.textContent =
                item.name +
                "　所持数：" +
                quantity;


            select.appendChild(
                option
            );

        }
    );

}


// =====================================================
// 通常商品の出品
// =====================================================

async function sellItem(){

    const itemId =
        document.getElementById(
            "sellItem"
        )?.value;


    const quantity =
        Number(
            document.getElementById(
                "sellQuantity"
            )?.value
        );


    const price =
        Number(
            document.getElementById(
                "sellPrice"
            )?.value
        );


    if(!itemId){

        showMessage(
            "出品する品物を選んでください"
        );

        return;

    }


    if(
        !Number.isInteger(quantity) ||
        quantity <= 0
    ){

        showMessage(
            "個数を正しく入力してください"
        );

        return;

    }


    if(
        !Number.isInteger(price) ||
        price <= 0
    ){

        showMessage(
            "値段を正しく入力してください"
        );

        return;

    }


    const item =
        inventoryData[
            itemId
        ];


    if(!item){

        showMessage(
            "その品物を持っていません"
        );

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

        const result =
            await inventoryRef.transaction(
                currentItem => {

                    if(!currentItem){
                        return;
                    }


                    const owned =
                        Number(
                            currentItem.quantity ||
                            0
                        );


                    if(
                        owned <
                        quantity
                    ){

                        return;

                    }


                    if(
                        owned ===
                        quantity
                    ){

                        return null;

                    }


                    currentItem.quantity =
                        owned -
                        quantity;


                    return currentItem;

                }
            );


        if(
            !result.committed
        ){

            showMessage(
                "持っている個数が足りません"
            );

            return;

        }


        const newListingRef =
            database
                .ref(
                    "marketListings"
                )
                .push();


        await newListingRef.set({

            sellerId:
                currentUser.uid,

            sellerName:
                currentMember?.name ||
                currentUser.displayName ||
                "会員",

            itemId:
                itemId,

            itemName:
                item.name,

            category:
                item.category,

            price:
                price,

            quantity:
                quantity,

            createdAt:
                firebase.database
                    .ServerValue
                    .TIMESTAMP

        });


        document.getElementById(
            "sellQuantity"
        ).value = 1;


        document.getElementById(
            "sellPrice"
        ).value = "";


        showMessage(
            item.name +
            "を出品しました"
        );


    }catch(error){

        console.error(error);


        await addItemToInventory(
            currentUser.uid,
            itemId,
            item.name,
            item.category,
            quantity
        );


        showMessage(
            "出品に失敗しました"
        );

    }

}


// =====================================================
// 自分の通常商品出品
// =====================================================

function renderMyListings(){

    const area =
        document.getElementById(
            "myListings"
        );


    if(
        !area ||
        !currentUser
    ){

        return;

    }


    const ownListings =
        Object.entries(
            listingData
        )
        .filter(
            ([id, listing]) =>

                listing &&
                listing.sellerId ===
                currentUser.uid

        );


    if(
        ownListings.length === 0
    ){

        area.innerHTML =
            '<div class="empty">出品はありません</div>';

        return;

    }


    area.innerHTML = "";


    ownListings.forEach(
        ([listingId, listing]) => {

            const isSold =
                listing.status ===
                "sold";


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "myListing" +
                (
                    isSold
                    ? " sold"
                    : ""
                );


            row.innerHTML = `

                <div>

                    <strong>

                        ${escapeHtml(
                            listing.itemName
                        )}

                    </strong>

                    <br>

                    ${
                        isSold

                        ? "売れました（+" +
                          Number(
                              listing.earnedPoints ||
                              0
                          ).toLocaleString() +
                          "Pt）"

                        : Number(
                              listing.price
                          ).toLocaleString() +
                          "Pt × " +
                          Number(
                              listing.quantity ||
                              0
                          ) +
                          "個"
                    }

                </div>


                <div>

                    ${
                        isSold
                        ? ""
                        : "合計 " +
                          (
                              Number(
                                  listing.price
                              ) *
                              Number(
                                  listing.quantity ||
                                  0
                              )
                          ).toLocaleString() +
                          "Pt"
                    }

                </div>


                ${
                    isSold
                    ? ""
                    : `
                        <button
                            class="cancelButton">

                            取り下げ

                        </button>
                    `
                }

            `;


            if(!isSold){

                row
                    .querySelector(
                        ".cancelButton"
                    )
                    .addEventListener(
                        "click",
                        () => {

                            cancelListing(
                                listingId,
                                listing
                            );

                        }
                    );

            }


            area.appendChild(
                row
            );

        }
    );

}


// =====================================================
// 通常出品取り下げ
// =====================================================

async function cancelListing(
    listingId,
    listing
){

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
                .once(
                    "value"
                );


        const latest =
            snapshot.val();


        if(!latest){

            showMessage(
                "すでに売り切れています"
            );

            return;

        }


        if(
            latest.sellerId !==
            currentUser.uid
        ){

            showMessage(
                "この出品は取り下げられません"
            );

            return;

        }


        await addItemToInventory(
            currentUser.uid,
            latest.itemId,
            latest.itemName,
            latest.category,
            Number(
                latest.quantity || 0
            )
        );


        await database
            .ref(
                "marketListings/" +
                listingId
            )
            .remove();


        showMessage(
            "出品を取り下げました"
        );


    }catch(error){

        console.error(error);


        showMessage(
            "取り下げに失敗しました"
        );

    }

}


// =====================================================
// 商人へ売却
// =====================================================

async function sellMerchantItem(
    item,
    quantity
){

    if(
        !Number.isInteger(
            quantity
        ) ||
        quantity <= 0
    ){

        showMessage(
            "個数を正しく入力してください"
        );

        return;

    }


    const total =
        Number(
            item.sellPrice *
            quantity
        );


    const confirmed =
        confirm(

            item.itemName +
            "を" +
            quantity +
            "個、" +
            total.toLocaleString() +
            " Ptで売りますか？"

        );


    if(!confirmed){
        return;
    }


    const inventoryRef =
        database.ref(
            "inventories/" +
            currentUser.uid +
            "/" +
            item.itemId
        );


    try{

        const result =
            await inventoryRef.transaction(
                currentItem => {

                    if(!currentItem){
                        return;
                    }


                    const have =
                        Number(
                            currentItem.quantity ||
                            0
                        );


                    if(
                        have <
                        quantity
                    ){

                        return;

                    }


                    if(
                        have ===
                        quantity
                    ){

                        return null;

                    }


                    currentItem.quantity =
                        have -
                        quantity;


                    return currentItem;

                }
            );


        if(
            !result.committed
        ){

            showMessage(
                "持っている個数が足りません"
            );

            return;

        }


        await database
            .ref(
                "members/" +
                currentUser.uid +
                "/point"
            )
            .transaction(
                point =>
                    Number(
                        point || 0
                    ) +
                    total
            );


        await merchantReceiveItem(
            item.itemId,
            quantity
        );


        showMessage(
            item.itemName +
            "を" +
            quantity +
            "個売りました"
        );


    }catch(error){

        console.error(error);

        showMessage(
            "売却に失敗しました"
        );

    }

}


// =====================================================
// 商人価格
// =====================================================

function getMerchantPrice(
    item,
    quantity
){

    const limit =
        merchantStockLimit[
            item.category
        ] || 100;


    const ratio =
        quantity /
        limit;


    let multiplier =
        1.0;


    if(
        ratio <=
        0.1
    ){

        multiplier =
            1.5;

    }else if(
        ratio <=
        0.3
    ){

        multiplier =
            1.2;

    }else if(
        ratio >=
        0.8
    ){

        multiplier =
            0.8;

    }


    return Math.max(
        1,
        Math.round(
            item.price *
            multiplier
        )
    );

}


console.log(
    "shop.js読み込み完了"
);
