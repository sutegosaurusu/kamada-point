// ======================
// 商人販売商品一覧
// ======================

// 通常商人
const merchantItems = [

    "merchant_apple",
    "merchant_cucumber",
    "merchant_watermelon",
    "merchant_leaf",
    "merchant_jelly",
    "merchant_chinese_cabbage",
    "merchant_azuki_bar",
    "merchant_honey",

    "merchant_water",
    "merchant_slime",
    "merchant_os1"

];


// ======================
// 商人商品取得
// ======================

function getMerchantItems(){

    return merchantItems
        .map(id => items.find(item => item.id === id))
        .filter(item => item);

}
