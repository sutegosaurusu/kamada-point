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
