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
        { itemId:"leaf", weight:25 },
        { itemId:"water", weight:15 },
        { itemId:"acorn", weight:12 },
        { itemId:"moss", weight:10 },
        { itemId:"flower_petal", weight:10 },
        { itemId:"small_stone", weight:10 },
        { itemId:"twig", weight:10 },
        { itemId:"berry", weight:8 },
        { itemId:"smallbug", weight:6 },
        { itemId:"cicada_shell", weight:4 },
        { itemId:"snail_shell", weight:3 },
        { itemId:"tree_sap", weight:2 },
        { itemId:"honey", weight:1 },
        { itemId:"larva", weight:1 },
        { itemId:"Anteggs", weight:0.5 }
    ]

}

];

    {
        id:"dry_river",
        name:"干上がった川床",
        icon:"🏜️",
        difficulty:2,
        description:
            "乾いた岩場。水は少ないが、珍しい物が落ちている。",

       
        rewardRate:1.25,

        baseSuccessRate:0.83,

        rewards:[
            { itemId:"dry_herb", weight:35 },
            { itemId:"clay", weight:35 },
            { itemId:"flint", weight:30 }
        ]
    },

    {
        id:"pine_forest",
        name:"薄暗い松林",
        icon:"🌲",
        difficulty:3,
        description:
            "木々が密集した森。食料は多いが危険な生物もいる。",

       
        rewardRate:1.55,

        baseSuccessRate:0.75,

        rewards:[
            { itemId:"forest_mushroom", weight:40 },
            { itemId:"pine_resin", weight:30 },
            { itemId:"strong_branch", weight:30 }
        ]
    },

    {
        id:"rocky_hills",
        name:"岩だらけの丘陵",
        icon:"⛰️",
        difficulty:4,
        description:
            "急な岩山。長い探検には多くの食料と水が必要。",

      
        rewardRate:2,

        baseSuccessRate:0.65,

        rewards:[
            { itemId:"copper_fragment", weight:40 },
            { itemId:"mountain_herb", weight:30 },
            { itemId:"hard_stone", weight:30 }
        ]
    },

    {
        id:"ancient_ruins",
        name:"崩れた古代遺跡",
        icon:"🏛️",
        difficulty:5,
        description:
            "古い石造建築の跡。危険だが貴重な品が眠っている。",

        
        rewardRate:2.6,

        baseSuccessRate:0.55,

        rewards:[
            { itemId:"bronze_fragment", weight:35 },
            { itemId:"ancient_coin", weight:25 },
            { itemId:"old_pottery", weight:25 },
            { itemId:"sacred_fig", weight:15 }
        ]
    },

    {
        id:"deep_cave",
        name:"海辺の深い洞窟",
        icon:"🕳️",
        difficulty:6,
        description:
            "暗く深い最難関の洞窟。十分な準備が必要。",

       
        rewardRate:3.4,

        baseSuccessRate:0.42,

        rewards:[
            { itemId:"silver_fragment", weight:25 },
            { itemId:"rare_crystal", weight:20 },
            { itemId:"cave_mushroom", weight:30 },
            { itemId:"underground_water", weight:25 }
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
        rewardMultiplier:4.2,
        minReward:4,
        maxReward:7
    },

    12:{
        rewardMultiplier:10,
        minReward:8,
        maxReward:13
    }

};
