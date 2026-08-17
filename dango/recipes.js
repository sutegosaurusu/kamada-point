console.log("recipes.js開始");

const recipes = {

    // ==============================
    // この町で作れる初級装備
    // ==============================

    stone_club:{
        materials:{
            twig:2,
            round_stone:1
        },
        point:200
    },

    sling:{
        materials:{
            thread:2,
            small_stone:2
        },
        point:200
    },

    stone_spear:{
        materials:{
            twig:2,
            small_stone:2,
            thread:1
        },
        point:300
    },

    small_shield:{
        materials:{
            driftwood:1,
            round_stone:1,
            thread:2
        },
        point:300
    },

    pottery_helmet:{
        materials:{
            pottery_piece:2,
            straw:2,
            thread:2
        },
        point:400
    }

};

console.log("recipes.js読み込み完了");
