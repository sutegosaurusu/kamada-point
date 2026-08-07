const items = [

    // ======================
    // 食べ物
    // ======================

    
    {
        id:"leaf",
        name:"落ち葉",
        category:"food",
        price:15
    },
    
    {
        id:"honey",
        name:"蜜",
        category:"food",
        price:300
    },
    {
    id:"acorn",
    name:"どんぐり",
    category:"food",
    price:30
},
{
    id:"moss",
    name:"コケ",
    category:"food",
    price:20
},
{
    id:"berry",
    name:"ベリー",
    category:"food",
    price:60
},
{
    id:"gum",
    name:"ガム",
    category:"food",
    price:50
},
{
    id:"tree_sap",
    name:"樹液",
    category:"food",
    price:80
},
{
    id:"flower_petal",
    name:"花びら",
    category:"food",
    price:15
},
{
    id:"Chocolate",
    name:"チョコ",
    category:"food",
    price:100
},
{
        id:"Anteggs",
        name:"アリの卵",
        category:"food",
        price:1000
    },
 {
        id:"smallbug",
        name:"小さな虫",
        category:"food",
        price:100
    },   
 {
        id:"larva",
        name:"幼虫",
        category:"food",
        price:500
    },  
    {
    id:"rice",
    name:"落ちた米粒",
    category:"food",
    price:80
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
　　{
    id:"cola",
    name:"コーラ",
    category:"water",
    price:120
 　 },
    // ======================
    // 装備
    // ======================

   {
    id:"bou",
    name:"茎",
    category:"equipment",
    price:300,
    equipSlot:"weapon"
},

{
    id:"toothpick",
    name:"つまようじ",
    category:"equipment",
    price:80,
    equipSlot:"weapon"
},

{
    id:"pull_tab",
    name:"プルタブ",
    category:"equipment",
    price:200,
    equipSlot:"weapon"
},

{
    id:"bottle_cap",
    name:"ペットボトルのふた",
    category:"equipment",
    price:300,
    equipSlot:"shield"
},

{
    id:"feather",
    name:"羽",
    category:"equipment",
    price:300,
    equipSlot:"head"
},
{
    id:"snail_shell",
    name:"カタツムリの殻",
    category:"equipment",
    price:300,
    equipSlot:"weapon"
},
// ======================
// 素材
// ======================



 {
    id:"cicada_shell",
    name:"セミの抜け殻",
    category:"material",
    price:120
},

{
    id:"stag_beetle_jaw",
    name:"クワガタのあご",
    category:"material",
    price:500
},
{
    id:"small_stone",
    name:"小石",
    category:"material",
    price:10
},

{
    id:"grasshopper_leg",
    name:"バッタの脚",
    category:"material",
    price:120
},
    {
    id:"frog_skin",
    name:"カエルの抜け殻",
    category:"material",
    price:250
},
    {
    id:"twig",
    name:"小枝",
    category:"material",
    price:15
}
];

// ======================
// ID検索
// ======================

const itemInformation = {};

items.forEach(item => {
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
    },

    material:{
        name:"素材",
        icon:"🪨"
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

        case "material":
            return "🪨";

        default:
            return "📦";
    }
}

function getItemById(id){

    return itemInformation[id] || null;
}

console.log("items.js読み込み完了");
