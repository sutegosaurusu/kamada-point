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
        successRate:0.05,
        description:"普通の葉っぱ。探索の成功率を少し上げる。"
    },

    honey:{
        successRate:0.05,
        boosts:[
            { itemId:"smallbug", amount:20 },
            { itemId:"larva", amount:10 }
        ],
        description:"甘い蜂蜜。小さな虫や幼虫を引き寄せる。"
    },

    acorn:{
        boosts:[
            { itemId:"smallbug", amount:5 },
            { itemId:"larva", amount:5 }
        ],
        description:"栄養のある木の実。虫を集める効果がある。"
    },

    moss:{
        successRate:0.01,
        boosts:[
            { itemId:"smallbug", amount:5 }
        ],
        description:"湿った苔。小さな虫を見つけやすくする。"
    },

    berry:{
        successRate:-0.10,
        boosts:[
            { itemId:"feather", amount:10 },
            { itemId:"larva", amount:5 }
        ],
        description:"甘い果実。ただし探索は少し不安定になる。"
    },

    gum:{
        successRate:0.02,
        boosts:[
            { itemId:"toothpick", amount:15 },
            { itemId:"pull_tab", amount:5 }
        ],
        description:"強い香りのガム。人工物を集めやすくする。"
    },

    tree_sap:{
        successRate:0.03,
        findBonus:{
            tree_sap:0.20
        },
        description:"木の甘い樹液。樹液を見つける確率を上げる。"
    },

    flower_petal:{
        successRate:0.01,
        boosts:[
            { itemId:"smallbug", amount:15 }
        ],
        description:"花びらの香りで虫を引き寄せる。"
    },

    Chocolate:{
        successRate:0.30,
        description:"高級なお菓子。探索成功率を大きく上げる。"
    },

    Anteggs:{
        successRate:0.03,
        description:"珍しい卵。探索を少し有利にする。"
    },

    smallbug:{
        successRate:0.03,
        description:"小さな虫。食料として利用できる。"
    },

    larva:{
        successRate:0.03,
        description:"幼虫。貴重な食料になる。"
    },


    // ======================
    // 水
    // ======================

    water:{
        successRate:0.05,
        description:"飲み水。体力を保ち探索を安定させる。"
    },

    slime:{
        successRate:0.08,
        description:"不思議な液体。探索成功率を上げる。"
    },

    os1:{
        successRate:0.20,
        description:"特別な飲み物。探索を大きく助ける。"
    },

    cola:{
        successRate:-0.30,
        rewardMultiplier:2,
        description:"刺激の強い飲み物。危険だが報酬が2倍になる。"
    },


    // ======================
    // 装備
    // ======================

    bou:{
        successRate:0.10,
        description:"棒。探索時の成功率を上げる道具。"
    },

    toothpick:{
        successRate:0.15,
        description:"つまようじ。細かい物を集めやすくする。"
    },

    pull_tab:{
        boosts:[
            {
                itemId:"bottle_cap",
                amount:15
            }
        ],
        description:"缶のプルタブ。人工物を集める材料になる。"
    },

    bottle_cap:{
        successRate:0.03,
        boosts:[
            {
                itemId:"water",
                amount:20
            }
        ],
        description:"ペットボトルのふた。水を集める材料になる。"
    },

    feather:{
        successRate:0.10,
        description:"羽根。探索成功率を上げる珍しい装備。"
    }

};
