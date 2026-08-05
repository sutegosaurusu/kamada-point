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

    /* 村外れのオリーブ畑 */
    wild_olive:     { successRate:0.01 },
    barley:         { successRate:0.01 },
    small_stone:    { successRate:0.02 },

    /* 干上がった川床 */
    dry_herb:       { successRate:0.01 },
    clay:           { boostItemId:"flint", boostAmount:12 },
    flint:          { successRate:0.03 },

    /* 薄暗い松林 */
    forest_mushroom:{ successRate:0.01 },
    pine_resin:     { boostItemId:"strong_branch", boostAmount:12 },
    strong_branch:  { successRate:0.03 },

    /* 岩だらけの丘陵 */
    mountain_herb:  { successRate:0.02 },
    hard_stone:     { boostItemId:"copper_fragment", boostAmount:12 },
    copper_fragment:{ successRate:0.04 },

    /* 崩れた古代遺跡（old_potteryは成功率＋入手率アップの両方持ち） */
    sacred_fig:     { successRate:0.02 },
    old_pottery:    { successRate:0.02, boostItemId:"ancient_coin", boostAmount:15 },
    ancient_coin:   { successRate:0.05 },
    bronze_fragment:{ successRate:0.05 },

    /* 海辺の深い洞窟（rare_crystalは成功率＋入手率アップの両方持ち） */
    cave_mushroom:      { successRate:0.02 },
    underground_water:  { successRate:0.03 },
    rare_crystal:       { successRate:0.03, boostItemId:"silver_fragment", boostAmount:15 },
    silver_fragment:    { successRate:0.06 }

};
