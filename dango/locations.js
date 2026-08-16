// ===============================
// 探検場所マスターデータ
// 右にある場所ほどdifficultyが高い
//
// baseSuccessRate：
//   この場所の探検が「成功」する基本確率（0〜1）。
//   持っていくアイテムの効果（itemEffects.js）で
//   上昇させることができる。
//   失敗した場合、持ち帰れるアイテムは0個になる。
// ===============================

const locations = [

{
    id:"park",
    name:"近所の公園",
    icon:"🌳",
    difficulty:1,
    description:
    "ダンゴムシたちが最初に探検する身近な場所。落ち葉や木の実、小さな素材が見つかる。",
    rewardRate:1,
    baseSuccessRate:0.70,
    rewards:[
        { itemId:"leaf", weight:28 },
        { itemId:"water", weight:18 },
        { itemId:"acorn", weight:12 },
        { itemId:"moss", weight:10 },
        { itemId:"flower_petal", weight:10.2 },
        { itemId:"small_stone", weight:10 },
        { itemId:"twig", weight:10 },
        { itemId:"berry", weight:8 },
        { itemId:"smallbug", weight:6 },
        { itemId:"cicada_shell", weight:4 },
        { itemId:"larva", weight:1 },
        { itemId:"snail_shell", weight:0.2919 },
        { itemId:"Beast", weight:0.0081 }
    ]
},  

   {
    id:"forest",
    name:"雑木林",
    icon:"🌲",
    difficulty:2,

    description:
    "公園の奥に広がる雑木林。木々が生い茂り、虫や樹液、珍しい素材が多く見つかる。",

    rewardRate:1.25,
    baseSuccessRate:0.60,

    rewards:[
        { itemId:"twig", weight:20 },
        { itemId:"small_stone", weight:15 },
        { itemId:"moss", weight:12 },
        { itemId:"tree_sap", weight:10 },
        { itemId:"smallbug", weight:10 },
        { itemId:"berry", weight:8.2 },
        { itemId:"honey", weight:7 },
        { itemId:"larva", weight:8.7 },
        { itemId:"leaf", weight:5 },
        { itemId:"cicada_shell", weight:3 },
        { itemId:"snail_shell", weight:0.3},
        { itemId:"feather", weight:0.3 },
        { itemId:"stag_beetle_jaw", weight:0.1 },
        { itemId:"Anteggs", weight:0.3 }
    ]
},

    {
    id:"rice_field",
    name:"田んぼ",
    icon:"🌾",
    difficulty:3,
    description:
    "水が豊富な田んぼ。食べ物や虫が多く見つかるが、鳥やカエルなどの天敵も多い。",

    rewardRate:1.55,
    baseSuccessRate:0.40,

    rewards:[
        { itemId:"water", weight:18 },
        { itemId:"rice", weight:15 },
        { itemId:"smallbug", weight:12 },
        { itemId:"larva", weight:10 },
        { itemId:"moss", weight:10 },
        { itemId:"twig", weight:8 },
        { itemId:"small_stone", weight:8 },
        { itemId:"leaf", weight:6 },
        { itemId:"snail_shell", weight:5 },
        { itemId:"honey", weight:3 },
        { itemId:"feather", weight:2 },
        { itemId:"grasshopper_leg", weight:2 },
        { itemId:"frog_skin", weight:1 }
    ]
},
   {
    id:"stream",
    name:"小川",
    icon:"🌊",
    difficulty:4,
    description:
    "透き通った小川。水辺ならではの素材や生き物が見つかるが、流れが速く探索は難しい。",

    rewardRate:2,
    baseSuccessRate:0.25,

    rewards:[
        { itemId:"water", weight:20 },
        { itemId:"moss", weight:15 },
        { itemId:"round_stone", weight:14 },
        { itemId:"reed_stem", weight:12 },
        { itemId:"driftwood", weight:10 },
        { itemId:"smallbug", weight:8 },
        { itemId:"larva", weight:7 },
        { itemId:"river_snail_shell", weight:6 },
        { itemId:"honey", weight:3 },
        { itemId:"feather", weight:2 },
        { itemId:"shrimp_shell", weight:1 },
        { itemId:"snail_shell", weight:1 },
        { itemId:"cicada_shell", weight:1 }
    ]
},

   {
    id:"flower_garden",
    name:"花壇",
    icon:"🌸",
    difficulty:5,

    description:
    "色とりどりの花が咲く花壇。蜜や花びら、花に集まる小さな生き物が多く見つかる。",

    rewardRate:2.6,
    baseSuccessRate:0.50,

    rewards:[
        { itemId:"flower_petal", weight:20 },
        { itemId:"honey", weight:15 },
        { itemId:"smallbug", weight:15 },
        { itemId:"larva", weight:10 },
        { itemId:"moss", weight:8 },
        { itemId:"berry", weight:7 },
        { itemId:"leaf", weight:6 },
        { itemId:"water", weight:6 },
        { itemId:"tree_sap", weight:4 },
        { itemId:"feather", weight:0.2 },
        { itemId:"snail_shell", weight:0.1 },
        { itemId:"cicada_shell", weight:1 },
        { itemId:"Anteggs", weight:0.5 },
        { itemId:"stag_beetle_jaw", weight:0.01 }
    ]
},

    {
    id:"vacant_house",
    name:"空き家",
    icon:"🏚️",
    difficulty:7,
    description:
        "人の住まなくなった空き家。床下や台所、物置には、長い間残された食べ物や生活用品が眠っている。",

    rewardRate:4.0,
    baseSuccessRate:0.38,
    rewards:[
        
    { itemId:"smallbug", weight:15 },        // 小さな虫
    { itemId:"tea_leaf", weight:10 },        // 茶葉
    { itemId:"thread", weight:10 },          // 糸
    { itemId:"straw", weight:10 },           // 藁
    { itemId:"twig", weight:12 },            // 小枝
    { itemId:"rubber_band", weight:10 },     // 輪ゴム
    { itemId:"nail", weight:8 },             // 釘
    { itemId:"button", weight:8 },           // ボタン
    { itemId:"glass_piece", weight:4 },      // ガラス片
    { itemId:"pottery_piece", weight:3 }     // 陶器片
]
}
];

const timeSettings = {

    1:{
        rewardMultiplier:1,
        minReward:1,
        maxReward:3
    },

    3:{
        rewardMultiplier:2.5,
        minReward:3,
        maxReward:5
    },

    6:{
        rewardMultiplier:4.5,
        minReward:5,
        maxReward:8
    },

    12:{
        rewardMultiplier:10,
        minReward:9,
        maxReward:14
    }

};
