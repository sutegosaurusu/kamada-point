const items = [

    // ======================
    // 食べ物
    // ======================

    {
        id:"merchant_apple",
        name:"リンゴ",
        category:"food",
        price:120
    },
    {
        id:"merchant_cucumber",
        name:"キュウリ",
        category:"food",
        price:80
    },
    {
        id:"merchant_watermelon",
        name:"スイカ",
        category:"food",
        price:450
    },
    {
        id:"merchant_leaf",
        name:"落ち葉",
        category:"food",
        price:15
    },
    {
        id:"merchant_jelly",
        name:"ゼリー",
        category:"food",
        price:100
    },
    {
        id:"merchant_chinese_cabbage",
        name:"白菜",
        category:"food",
        price:180
    },
    {
        id:"merchant_azuki_bar",
        name:"小豆バー",
        category:"food",
        price:160
    },
    {
        id:"merchant_honey",
        name:"蜜",
        category:"food",
        price:300
    },


    // ======================
    // 水
    // ======================

    {
        id:"merchant_water",
        name:"水",
        category:"water",
        price:40
    },
    {
        id:"merchant_slime",
        name:"粘液",
        category:"water",
        price:90
    },
    {
        id:"merchant_os1",
        name:"OS-1",
        category:"water",
        price:250
    },


    // ======================
    // 装備
    // ======================

    {
        id:"items-bou",
        name:"茎",
        category:"equipment",
        price:300
    }

];


// ======================
// ID検索用データ作成
// ======================

const itemInformation = {};

items.forEach(item=>{
    itemInformation[item.id] = item;
});

const categoryInformation = {

    food:{
        name:"食べ物",
        icon:"🍎"
    },

    water:{
        name:"水",
        icon:"💧"
    },

    equipment:{
        name:"装備",
        icon:"⚔️"
    }

};
function getDefaultIcon(category){

    switch(category){

        case "food":
            return "🍎";

        case "water":
            return "💧";

        case "equipment":
            return "⚔️";

        default:
            return "📦";
    }

}
console.log("items.js読み込み完了");
