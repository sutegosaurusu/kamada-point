const items = [

    // ======================
    // 食べ物
    // ======================

    {
        id:"apple",
        name:"リンゴ",
        category:"food",
        price:120
    },
    {
        id:"cucumber",
        name:"キュウリ",
        category:"food",
        price:80
    },
    {
        id:"watermelon",
        name:"スイカ",
        category:"food",
        price:450
    },
    {
        id:"leaf",
        name:"落ち葉",
        category:"food",
        price:15
    },
    {
        id:"jelly",
        name:"ゼリー",
        category:"food",
        price:100
    },
    {
        id:"chinese_cabbage",
        name:"白菜",
        category:"food",
        price:180
    },
    {
        id:"azuki_bar",
        name:"小豆バー",
        category:"food",
        price:160
    },
    {
        id:"honey",
        name:"蜜",
        category:"food",
        price:300
    },


    // ======================
    // 水
    // ======================

    {
        id:"water",
        name:"水",
        category:"water",
        price:40
    },
    {
        id:"slime",
        name:"粘液",
        category:"water",
        price:90
    },
    {
        id:"os1",
        name:"OS-1",
        category:"water",
        price:250
    },


    // ======================
    // 装備
    // ======================

    {
        id:"bou",
        name:"茎",
        category:"equipment",
        price:300
    }

];


// ======================
// ID検索
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


function getItemById(id){

    return itemInformation[id] || {
        price:0,
        name:"不明"
    };

}

function getMerchantItems(){

    return items;
}
console.log("items.js読み込み完了");
