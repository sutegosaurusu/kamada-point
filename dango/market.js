let currentCategory = "food";
let listingData = {};
const merchantItems = [
    {
        id:"merchant_barley_bread",
        name:"大麦パン",
        category:"food",
        price:80
    },
    {
        id:"merchant_dried_fig",
        name:"干しいちじく",
        category:"food",
        price:110
    },
    {
        id:"merchant_olive",
        name:"オリーブ",
        category:"food",
        price:65
    },
    {
        id:"merchant_goat_cheese",
        name:"山羊のチーズ",
        category:"food",
        price:150
    },
    {
        id:"merchant_water_skin",
        name:"水袋",
        category:"water",
        price:70
    },
    {
        id:"merchant_large_water",
        name:"大きな水袋",
        category:"water",
        price:180
    },
    {
        id:"merchant_rope",
        name:"麻の縄",
        category:"equipment",
        price:250
    },
    {
        id:"merchant_torch",
        name:"松明",
        category:"equipment",
        price:120
    },
    {
        id:"merchant_bronze_knife",
        name:"青銅の小刀",
        category:"equipment",
        price:700
    }
];
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

document
    .getElementById("searchInput")
    .addEventListener("input", renderMarket);

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

    merchantItems.forEach(item => {

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
            quantity:Infinity,
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

                <button
                    class="buyButton"
                    ${isOwnListing ? "disabled" : ""}
                >
                    ${isOwnListing ? "自分" : "買う"}
                </button>
            `;

            const buyButton =
                row.querySelector(".buyButton");

            if(!isOwnListing){

                buyButton.addEventListener("click", () => {

                    if(offer.type === "merchant"){
                        buyMerchantItem(offer);
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


