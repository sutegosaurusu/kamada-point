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

const itemEffects = {

    // ======================
    // 食べ物
    // ======================

    leaf:{
        boostItemId:"leaf",
        boostAmount:15
    },

    honey:{
        successRate:0.05,
        boostItemId:"honey",
        boostAmount:20
    },

    acorn:{
        successRate:0.01,
        boostItemId:"acorn",
        boostAmount:15
    },

    moss:{
        successRate:0.01,
        boostItemId:"moss",
        boostAmount:15
    },

    berry:{
        successRate:0.02,
        boostItemId:"berry",
        boostAmount:15
    },

    gum:{
        successRate:0.02
    },

    tree_sap:{
        successRate:0.03,
        boostItemId:"tree_sap",
        boostAmount:15
    },

    flower_petal:{
        successRate:0.01
    },

    Chocolate:{
        successRate:0.08
    },

    // ======================
    // 水
    // ======================

    water:{
        successRate:0.02
    },

    slime:{
        successRate:0.04
    },

    os1:{
        successRate:0.08
    },

    // ======================
    // 装備
    // ======================

    bou:{
        successRate:0.05
    },

    // ======================
    // 素材
    // （持っていけるようになったら使用）
    // ======================

    toothpick:{
        successRate:0.03
    },

    pull_tab:{
        boostItemId:"bottle_cap",
        boostAmount:15
    },

    bottle_cap:{
        successRate:0.04
    },

    stone:{
        boostItemId:"stone",
        boostAmount:15
    },

    cicada_shell:{
        successRate:0.02
    },

    snail_shell:{
        successRate:0.02
    },

    stag_beetle_jaw:{
        successRate:0.06
    },

    twig:{
        boostItemId:"twig",
        boostAmount:15
    }

};
