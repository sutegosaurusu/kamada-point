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
        successRate:0.05
    },

    honey:{
        successRate:0.05,

        boosts:[
            {
                itemId:"smallbug",
                amount:20
            },
            {
                itemId:"larva",
                amount:10
            }
        ]
    },

    acorn:{
    boosts:[
        {
            itemId:"smallbug",
            amount:5
        },
        {
            itemId:"larva",
            amount:5
        }
    ]
}
    },

    moss:{
        successRate:0.01,

        boosts:[
            {
                itemId:"smallbug",
                amount:5
            }
        ]
    },

    berry:{
        successRate:-0.10,

        boosts:[
            {
                itemId:"feather",
                amount:10
           },
           {
            itemId:"larva",
            amount:5
        }
    ]
}
    },
     
    gum:{
        successRate:0.02
        boosts:[
            {
                itemId:"toothpick",
                amount:15
            },
        {
            itemId:"pull_tab",
            amount:5
        }
    ]
}
    },

    tree_sap:{
        successRate:0.03,

        boosts:[
            {
                itemId:"tree_sap",
                amount:15
            }
        ]
    },

    flower_petal:{
        successRate:0.01
        boosts:[
            {
                itemId:"smallbug",
                amount:15
            }
        ]
    },

    Chocolate:{
        successRate:0.30
    },

    Anteggs:{
        successRate:0.03
    },

    smallbug:{
        successRate:0.03
    },

    larva:{
        successRate:0.03
    },


    // ======================
    // 水
    // ======================

    water:{
        successRate:0.05
    },

    slime:{
        successRate:0.08
    },

    os1:{
        successRate:0.20
    },


    // ======================
    // 装備
    // ======================

    bou:{
        successRate:0.10
    },

    toothpick:{
        successRate:0.15
    },

    pull_tab:{
        boosts:[
            {
                itemId:"bottle_cap",
                amount:15
             }
           
        ]
    },
bottle_cap:{
        successRate:0.03,

        boosts:[
            {
                itemId:"water",
                amount:20
            }
        ]
    },
    feather:{
        successRate:0.10
    }

};
