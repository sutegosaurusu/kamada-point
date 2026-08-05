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
        id:"olive_field",
        name:"村外れのオリーブ畑",
        icon:"🫒",
        difficulty:1,
        description:
            "村に近い安全な畑。初心者でも歩きやすい。",

        foodRate:1,
        waterRate:1,
        rewardRate:1,

        baseSuccessRate:0.90,

        rewards:[
            { itemId:"wild_olive", name:"野生のオリーブ", category:"food", icon:"🫒", weight:50 },
            { itemId:"barley", name:"大麦", category:"food", icon:"🌾", weight:35 },
            { itemId:"small_stone", name:"小さな石", category:"equipment", icon:"🪨", weight:15 }
        ]
    },

    {
        id:"dry_river",
        name:"干上がった川床",
        icon:"🏜️",
        difficulty:2,
        description:
            "乾いた岩場。水は少ないが、珍しい物が落ちている。",

        foodRate:1,
        waterRate:2,
        rewardRate:1.25,

        baseSuccessRate:0.83,

        rewards:[
            { itemId:"dry_herb", name:"乾燥した薬草", category:"food", icon:"🌿", weight:35 },
            { itemId:"clay", name:"粘土", category:"equipment", icon:"🟤", weight:35 },
            { itemId:"flint", name:"火打石", category:"equipment", icon:"🪨", weight:30 }
        ]
    },

    {
        id:"pine_forest",
        name:"薄暗い松林",
        icon:"🌲",
        difficulty:3,
        description:
            "木々が密集した森。食料は多いが危険な生物もいる。",

        foodRate:2,
        waterRate:2,
        rewardRate:1.55,

        baseSuccessRate:0.75,

        rewards:[
            { itemId:"forest_mushroom", name:"森のキノコ", category:"food", icon:"🍄", weight:40 },
            { itemId:"pine_resin", name:"松脂", category:"equipment", icon:"🟡", weight:30 },
            { itemId:"strong_branch", name:"丈夫な枝", category:"equipment", icon:"🪵", weight:30 }
        ]
    },

    {
        id:"rocky_hills",
        name:"岩だらけの丘陵",
        icon:"⛰️",
        difficulty:4,
        description:
            "急な岩山。長い探検には多くの食料と水が必要。",

        foodRate:3,
        waterRate:3,
        rewardRate:2,

        baseSuccessRate:0.65,

        rewards:[
            { itemId:"copper_fragment", name:"銅の欠片", category:"equipment", icon:"🟠", weight:40 },
            { itemId:"mountain_herb", name:"山の薬草", category:"food", icon:"🌿", weight:30 },
            { itemId:"hard_stone", name:"硬い石", category:"equipment", icon:"🪨", weight:30 }
        ]
    },

    {
        id:"ancient_ruins",
        name:"崩れた古代遺跡",
        icon:"🏛️",
        difficulty:5,
        description:
            "古い石造建築の跡。危険だが貴重な品が眠っている。",

        foodRate:4,
        waterRate:4,
        rewardRate:2.6,

        baseSuccessRate:0.55,

        rewards:[
            { itemId:"bronze_fragment", name:"青銅の欠片", category:"equipment", icon:"🟤", weight:35 },
            { itemId:"ancient_coin", name:"古代の硬貨", category:"equipment", icon:"🪙", weight:25 },
            { itemId:"old_pottery", name:"古い陶器片", category:"equipment", icon:"🏺", weight:25 },
            { itemId:"sacred_fig", name:"神殿の干しいちじく", category:"food", icon:"🫐", weight:15 }
        ]
    },

    {
        id:"deep_cave",
        name:"海辺の深い洞窟",
        icon:"🕳️",
        difficulty:6,
        description:
            "暗く深い最難関の洞窟。十分な準備が必要。",

        foodRate:5,
        waterRate:5,
        rewardRate:3.4,

        baseSuccessRate:0.42,

        rewards:[
            { itemId:"silver_fragment", name:"銀の欠片", category:"equipment", icon:"⚪", weight:25 },
            { itemId:"rare_crystal", name:"珍しい結晶", category:"equipment", icon:"💎", weight:20 },
            { itemId:"cave_mushroom", name:"洞窟キノコ", category:"food", icon:"🍄", weight:30 },
            { itemId:"underground_water", name:"洞窟の清水", category:"water", icon:"💧", weight:25 }
        ]
    }

];

const timeSettings = {

    1:{ foodMultiplier:1, waterMultiplier:1, rewardMultiplier:1 },
    3:{ foodMultiplier:2, waterMultiplier:2, rewardMultiplier:2.5 },
    5:{ foodMultiplier:3, waterMultiplier:3, rewardMultiplier:4.2 },
    12:{ foodMultiplier:6, waterMultiplier:6, rewardMultiplier:10 }

};
