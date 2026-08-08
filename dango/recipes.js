console.log("recipes.js開始");

// ======================
// 工房：装備レシピ
// ======================
// materials: { 素材のid: 必要個数 }
// point: 必要ポイント
// equipSlot は items.js 側の装備データと合わせてください（head / weapon / shield）
//
// ★ここの数値は仮です。ゲームバランスに合わせて自由に調整してください。

const recipes = {

    bou:{
        materials:{
            twig:3,
            small_stone:2
        },
        point:100
    },

    toothpick:{
        materials:{
            twig:2
        },
        point:30
    },

    pull_tab:{
        materials:{
            small_stone:2,
            round_stone:1
        },
        point:80
    },

    snail_shell:{
        materials:{
            river_snail_shell:1,
            small_stone:2
        },
        point:100
    },

    bottle_cap:{
        materials:{
            driftwood:2,
            round_stone:2
        },
        point:100
    },

    feather:{
        materials:{
            reed_stem:2,
            cicada_shell:1
        },
        point:100
    }

};

console.log("recipes.js読み込み完了");
