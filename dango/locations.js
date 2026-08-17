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

    // =====================================================
    // 近所の公園
    // 目標利益：約10Pt / 時間
    // 初心者向け。安価なもの中心。
    // =====================================================

    {
        id:"park",
        name:"近所の公園",
        icon:"🌳",
        difficulty:1,

        description:
        "ダンゴムシたちが最初に探検する身近な場所。落ち葉や木の実、小さな素材が見つかる。",

        rewardRate:1,
        baseSuccessRate:0.67,

        rewards:[
            { itemId:"leaf", weight:35 },
            { itemId:"water", weight:20 },
            { itemId:"acorn", weight:15 },
            { itemId:"moss", weight:12 },
            { itemId:"flower_petal", weight:10 },
            { itemId:"small_stone", weight:5 },
            { itemId:"twig", weight:2 },
            { itemId:"berry", weight:1 }
        ]
    },


    // =====================================================
    // 雑木林
    // 目標利益：約30Pt / 時間
    // 公園より少し高価な素材・虫が出る。
    // =====================================================

    {
        id:"forest",
        name:"雑木林",
        icon:"🌲",
        difficulty:2,

        description:
        "公園の奥に広がる雑木林。木々が生い茂り、虫や樹液、珍しい素材が多く見つかる。",

        rewardRate:1.25,
        baseSuccessRate:0.65,

        rewards:[
            { itemId:"twig", weight:30 },
            { itemId:"small_stone", weight:20 },
            { itemId:"moss", weight:18 },
            { itemId:"leaf", weight:12 },
            { itemId:"tree_sap", weight:4 },
            { itemId:"berry", weight:4 },
            { itemId:"smallbug", weight:3 },
            { itemId:"honey", weight:1 },
            { itemId:"larva", weight:1 },
            { itemId:"cicada_shell", weight:1 },
            { itemId:"snail_shell", weight:0.5 },
            { itemId:"feather", weight:0.5 }
        ]
    },


    // =====================================================
    // 田んぼ
    // 目標利益：約30Pt / 時間
    // 雑木林とは違う資源を取れる。
    // =====================================================

    {
        id:"rice_field",
        name:"田んぼ",
        icon:"🌾",
        difficulty:3,

        description:
        "水が豊富な田んぼ。食べ物や虫が多く見つかるが、鳥やカエルなどの天敵も多い。",

        rewardRate:1.55,
        baseSuccessRate:0.385,

        rewards:[
            { itemId:"water", weight:18 },
            { itemId:"rice", weight:18 },
            { itemId:"moss", weight:18 },
            { itemId:"leaf", weight:12 },
            { itemId:"small_stone", weight:12 },
            { itemId:"twig", weight:10 },
            { itemId:"smallbug", weight:4 },
            { itemId:"larva", weight:3 },
            { itemId:"snail_shell", weight:2 },
            { itemId:"grasshopper_leg", weight:1.5 },
            { itemId:"frog_skin", weight:1.5 }
        ]
    },


    // =====================================================
    // 小川
    // 目標利益：約50Pt / 時間
    // 水辺特有の素材を狙える。
    // =====================================================

    {
        id:"stream",
        name:"小川",
        icon:"🌊",
        difficulty:4,

        description:
        "透き通った小川。水辺ならではの素材や生き物が見つかるが、流れが速く探索は難しい。",

        rewardRate:2,
        baseSuccessRate:0.295,

        rewards:[
            { itemId:"water", weight:15 },
            { itemId:"moss", weight:15 },
            { itemId:"round_stone", weight:12 },
            { itemId:"reed_stem", weight:10 },
            { itemId:"driftwood", weight:8 },
            { itemId:"smallbug", weight:7 },
            { itemId:"larva", weight:5 },
            { itemId:"river_snail_shell", weight:10 },
            { itemId:"honey", weight:4 },
            { itemId:"shrimp_shell", weight:5 },
            { itemId:"snail_shell", weight:5 },
            { itemId:"cicada_shell", weight:4 }
        ]
    },


    // =====================================================
    // 花壇
    // 目標利益：約70Pt / 時間
    // 蜜・虫・幼虫が豊富。
    // =====================================================

    {
        id:"flower_garden",
        name:"花壇",
        icon:"🌸",
        difficulty:5,

        description:
        "色とりどりの花が咲く花壇。蜜や花びら、花に集まる小さな生き物が多く見つかる。",

        rewardRate:2.6,
        baseSuccessRate:0.43,

        rewards:[
            { itemId:"flower_petal", weight:22 },
            { itemId:"honey", weight:7 },
            { itemId:"smallbug", weight:17 },
            { itemId:"larva", weight:8 },
            { itemId:"moss", weight:15 },
            { itemId:"berry", weight:10 },
            { itemId:"leaf", weight:10 },
            { itemId:"water", weight:6 },
            { itemId:"tree_sap", weight:3 },
            { itemId:"feather", weight:1 },
            { itemId:"snail_shell", weight:0.5 },
            { itemId:"cicada_shell", weight:0.5 }
        ]
    },


    // =====================================================
    // 空き家
    // 目標利益：約100Pt / 時間
    // 生活用品・金属類を狙える高難度場所。
    // =====================================================

    {
        id:"vacant_house",
        name:"空き家",
        icon:"🏚️",
        difficulty:7,

        description:
        "人の住まなくなった空き家。床下や台所、物置には、長い間残された食べ物や生活用品が眠っている。",

        rewardRate:4.0,
        baseSuccessRate:0.45,

        rewards:[
            { itemId:"nail", weight:60 },
            { itemId:"smallbug", weight:8 },
            { itemId:"tea_leaf", weight:5 },
            { itemId:"thread", weight:5 },
            { itemId:"straw", weight:3 },
            { itemId:"twig", weight:3 },
            { itemId:"rubber_band", weight:4 },
            { itemId:"button", weight:3 },
            { itemId:"glass_piece", weight:4 },
            { itemId:"pottery_piece", weight:5 }
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
