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

    // =====================================================
    // 食べ物
    // =====================================================

    leaf:{
        successRate:0.03,
        description:"探索成功率 +3%"
    },

    acorn:{
        rewardMultiplier:1.08,
        description:"獲得アイテム数 +8%"
    },

    flower_petal:{
        boosts:{
            smallbug:0.15,
            honey:0.08
        },
        description:"小さな虫の発見率 +15%。蜜の発見率 +8%"
    },

    moss:{
        successRate:0.02,
        description:"探索成功率 +2%"
    },

    berry:{
        successRate:0.05,
        description:"探索成功率 +5%"
    },

    gum:{
        rewardMultiplier:1.10,
        description:"獲得アイテム数 +10%"
    },

    tree_sap:{
        successRate:0.06,
        description:"探索成功率 +6%"
    },

    honey:{
        successRate:0.08,
        description:"探索成功率 +8%"
    },

    Chocolate:{
        successRate:0.12,
        description:"探索成功率 +12%"
    },

    Anteggs:{
        successRate:0.10,
        description:"探索成功率 +10%"
    },

    smallbug:{
        successRate:0.04,
        description:"探索成功率 +4%"
    },

    larva:{
        successRate:0.07,
        description:"探索成功率 +7%"
    },

    rice:{
        successRate:0.03,
        rewardMultiplier:1.05,
        description:"探索成功率 +3%。獲得アイテム数 +5%"
    },

    tea_leaf:{
        successRate:0.03,
        description:"探索成功率 +3%"
    },


    // =====================================================
    // 水
    // =====================================================

    morning_dew:{
        successRate:0.03,
        description:"探索成功率 +3%"
    },

    water:{
        successRate:0.04,
        description:"探索成功率 +4%"
    },

    slime:{
        successRate:0.07,
        description:"探索成功率 +7%"
    },

    os1:{
        successRate:0.12,
        description:"探索成功率 +12%"
    },

    cola:{
        successRate:-0.10,
        rewardMultiplier:1.40,
        description:"探索成功率 -10%。獲得報酬40%増加"
    },


    // =====================================================
    // 装備
    // =====================================================

    bou:{
        successRate:0.07,
        description:"探索成功率 +7%"
    },

    toothpick:{
        successRate:0.05,
        description:"探索成功率 +5%"
    },

    pull_tab:{
        boosts:{
            bottle_cap:0.20
        },
        description:"ペットボトルのふたの発見率 +20%"
    },

    bottle_cap:{
        successRate:0.04,
        description:"探索成功率 +4%"
    },

    feather:{
        rewardMultiplier:1.08,
        description:"獲得アイテム数 +8%"
    },

    snail_shell:{
        successRate:0.07,
        description:"探索成功率 +7%"
    },

    nail:{
        successRate:0.06,
        description:"探索成功率 +6%"
    },


    // =====================================================
    // 初級装備
    // =====================================================

    stone_club:{
        successRate:0.07,
        description:"探索成功率 +7%"
    },

    sling:{
        successRate:0.08,
        description:"探索成功率 +8%"
    },


    // =====================================================
    // 中級装備
    // =====================================================

    javelin:{
        successRate:0.09,
        description:"探索成功率 +9%"
    },

    stone_spear:{
        successRate:0.10,
        description:"探索成功率 +10%"
    },

    small_shield:{
        successRate:0.07,
        description:"探索成功率 +7%"
    },

    reinforced_club:{
        successRate:0.11,
        description:"探索成功率 +11%"
    },

    pottery_helmet:{
        successRate:0.09,
        description:"探索成功率 +9%"
    },


    // =====================================================
    // 上級装備
    // =====================================================

    dory_spear:{
        successRate:0.12,
        description:"探索成功率 +12%"
    },

    long_spear:{
        successRate:0.13,
        description:"探索成功率 +13%"
    },

    round_shield:{
        successRate:0.11,
        description:"探索成功率 +11%"
    },

    reinforced_helmet:{
        successRate:0.12,
        description:"探索成功率 +12%"
    },

    heavy_club:{
        successRate:0.14,
        description:"探索成功率 +14%"
    },

    claw_weapon:{
        successRate:0.15,
        description:"探索成功率 +15%"
    },


    // =====================================================
    // 最上級装備
    // =====================================================

    heavy_dory:{
        successRate:0.16,
        description:"探索成功率 +16%"
    },

    heavy_shield:{
        successRate:0.14,
        rewardMultiplier:1.08,
        description:"探索成功率 +14%。獲得アイテム数 +8%"
    },

    reinforced_breastplate:{
        successRate:0.15,
        rewardMultiplier:1.08,
        description:"探索成功率 +15%。獲得アイテム数 +8%"
    },

    elite_helmet:{
        successRate:0.16,
        rewardMultiplier:1.10,
        description:"探索成功率 +16%。獲得アイテム数 +10%"
    },

    elite_spear:{
        successRate:0.18,
        rewardMultiplier:1.12,
        description:"探索成功率 +18%。獲得アイテム数 +12%"
    }

};

console.log("itemEffects.js読み込み完了");
