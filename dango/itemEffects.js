/* =====================================================
   アイテム効果マスターデータ

   持っていくアイテム（食べ物・水・装備）が
   探検にもたらす効果を定義する。

   効果の種類：

   ① successRate
      探検の成功率に、そのまま加算される数値。
      例）0.03 → 成功率+3%

   ② boostItemId / boostAmount
      指定したアイテム（boostItemId）の
      抽選ウェイトに boostAmount を加算する。
      → そのアイテムを持ち帰りやすくなる。

   ①と②は同時に持たせることができる。
   例）{ successRate:0.02, boostItemId:"ancient_coin", boostAmount:15 }
   → 成功率+2%と、古代の硬貨の入手率アップを両方発動する。
===================================================== */
console.log("itemEffects開始");
const itemEffects = {

    leaf:{
        successRate:0.05,
        description:"探索成功率 +5%"
    },

    honey:{
        successRate:0.05,
        boosts:[
            { itemId:"smallbug", amount:20 },
            { itemId:"larva", amount:10 }
        ],
        description:"探索成功率 +5%。小さな虫を20個、幼虫を10個追加発見する"
    },

    acorn:{
        boosts:[
            { itemId:"smallbug", amount:5 },
            { itemId:"larva", amount:5 }
        ],
        description:"小さな虫を5個、幼虫を5個追加発見する"
    },

    moss:{
        successRate:0.01,
        boosts:[
            { itemId:"smallbug", amount:5 }
        ],
        description:"探索成功率 +1%。小さな虫を5個追加発見する"
    },

    berry:{
        successRate:-0.10,
        boosts:[
            { itemId:"feather", amount:10 },
            { itemId:"larva", amount:5 }
        ],
        description:"探索成功率 -10%。羽根を10個、幼虫を5個追加発見する"
    },

    gum:{
        successRate:0.02,
        boosts:[
            { itemId:"toothpick", amount:15 },
            { itemId:"pull_tab", amount:5 }
        ],
        description:"探索成功率 +2%。つまようじ15個、プルタブ5個を追加発見する"
    },

    tree_sap:{
        successRate:0.03,
        findBonus:{
            tree_sap:0.20
        },
        description:"探索成功率 +3%。樹液の発見確率 +20%"
    },

    flower_petal:{
        successRate:0.01,
        boosts:[
            { itemId:"smallbug", amount:15 }
        ],
        description:"探索成功率 +1%。小さな虫を15個追加発見する"
    },

    Chocolate:{
        successRate:0.30,
        description:"探索成功率 +30%"
    },

    Anteggs:{
        successRate:0.03,
        description:"探索成功率 +3%"
    },

    smallbug:{
        successRate:0.03,
        description:"探索成功率 +3%"
    },

    larva:{
        successRate:0.03,
        description:"探索成功率 +3%"
    },


    // 水

    water:{
        successRate:0.05,
        description:"探索成功率 +5%"
    },

    slime:{
        successRate:0.08,
        description:"探索成功率 +8%"
    },

    os1:{
        successRate:0.20,
        description:"探索成功率 +20%"
    },

    cola:{
        successRate:-0.30,
        rewardMultiplier:2,
        description:"探索成功率 -30%。獲得報酬2倍"
    },


    // 装備

    bou:{
        successRate:0.10,
        description:"探索成功率 +10%"
    },

    toothpick:{
        successRate:0.15,
        description:"探索成功率 +15%"
    },

    pull_tab:{
        boosts:[
            { itemId:"bottle_cap", amount:15 }
        ],
        description:"ペットボトルキャップ15個を追加発見する"
    },

    bottle_cap:{
        successRate:0.03,
        boosts:[
            { itemId:"water", amount:20 }
        ],
        description:"探索成功率 +3%。水20個を追加発見する"
    },

    feather:{
        successRate:0.10,
        description:"探索成功率 +10%"
    }

};
console.log("itemEffects.js読み込み完了");
