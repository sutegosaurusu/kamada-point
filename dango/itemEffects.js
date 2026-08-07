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

    // ======================
    // 食べ物
    // ======================

    leaf:{
        successRate:0.05,
        description:"探索成功率 +5%"
    },

    acorn:{
        rewardMultiplier:1.2,
        description:"獲得アイテム数 +20%"
    },

    flower_petal:{
        findBonus:{
            smallbug:0.20,
            honey:0.10
        },
        description:"小さな虫・蜜の発見率アップ"
    },

    moss:{
        successRate:0.03,
        description:"探索成功率 +3%"
    },

    berry:{
        successRate:0.08,
        description:"探索成功率 +8%"
    },

    gum:{
        rewardMultiplier:1.3,
        description:"獲得アイテム数 +30%"
    },

    tree_sap:{
        successRate:0.10,
        description:"探索成功率 +10%"
    },

    honey:{
        successRate:0.12,
        description:"探索成功率 +12%"
    },

    Chocolate:{
        successRate:0.20,
        description:"探索成功率 +20%"
    },

    Anteggs:{
        successRate:0.15,
        description:"探索成功率 +15%"
    },

    smallbug:{
        successRate:0.05,
        description:"探索成功率 +5%"
    },

    larva:{
        successRate:0.10,
        description:"探索成功率 +10%"
    },

    // ======================
    // 水
    // ======================

    morning_dew:{
        successRate:0.05,
        description:"探索成功率 +5%"
    },

    water:{
        successRate:0.08,
        description:"探索成功率 +8%"
    },

    slime:{
        successRate:0.12,
        description:"探索成功率 +12%"
    },

    os1:{
        successRate:0.20,
        description:"探索成功率 +20%"
    },

    cola:{
        successRate:-0.20,
        rewardMultiplier:2,
        description:"探索成功率 -20%。獲得報酬2倍"
    },

    // ======================
    // 装備（消費しない）
    // ======================

    bou:{
        successRate:0.10,
        description:"探索成功率 +10%"
    },

    toothpick:{
        successRate:0.15,
        description:"探索成功率 +15%"
    },

    pull_tab:{
        findBonus:{
            bottle_cap:0.20
        },
        description:"ペットボトルのふたの発見率 +20%"
    },

    bottle_cap:{
        successRate:0.05,
        description:"探索成功率 +5%"
    },

    feather:{
        rewardMultiplier:1.2,
        description:"獲得アイテム数 +20%"
    }

};
console.log("itemEffects.js読み込み完了");
