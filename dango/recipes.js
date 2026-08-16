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

    // =====================================================
    // 【初級装備】
    // 身近な素材だけで作れる基本装備
    // =====================================================

    toothpick:{
        materials:{
            twig:2
        },
        point:30
    },

    bou:{
        materials:{
            twig:3,
            small_stone:2
        },
        point:100
    },

    stone_club:{
        materials:{
            twig:2,
            round_stone:1
        },
        point:60
    },

    sling:{
        materials:{
            thread:2,
            small_stone:2
        },
        point:70
    },


    // =====================================================
    // 【中級装備】
    // 複数の素材を組み合わせて作る装備
    // =====================================================

    javelin:{
        materials:{
            twig:3,
            round_stone:1,
            thread:1
        },
        point:120
    },

    stone_spear:{
        materials:{
            twig:2,
            small_stone:2,
            thread:1
        },
        point:100
    },

    small_shield:{
        materials:{
            driftwood:1,
            round_stone:1,
            thread:2
        },
        point:130
    },

    reinforced_club:{
        materials:{
            twig:2,
            round_stone:2,
            thread:1
        },
        point:150
    },

    pottery_helmet:{
        materials:{
            pottery_piece:2,
            straw:2,
            thread:2
        },
        point:180
    },


    // =====================================================
    // 【上級装備】
    // 希少素材を使った本格的な装備
    // =====================================================

    dory_spear:{
        materials:{
            twig:4,
            round_stone:1,
            thread:2
        },
        point:250
    },

    long_spear:{
        materials:{
            twig:4,
            small_stone:2,
            thread:2
        },
        point:280
    },

    round_shield:{
        materials:{
            driftwood:2,
            round_stone:2,
            thread:3
        },
        point:250
    },

    reinforced_helmet:{
        materials:{
            pottery_piece:2,
            straw:2,
            thread:3
        },
        point:280
    },

    heavy_club:{
        materials:{
            driftwood:2,
            round_stone:3,
            thread:2
        },
        point:300
    },

    claw_weapon:{
        materials:{
            stag_beetle_jaw:2,
            twig:2,
            thread:2
        },
        point:350
    },


    // =====================================================
    // 【最上級装備】
    // 非常に希少な素材を大量に使用する高級装備
    // =====================================================

    heavy_dory:{
        materials:{
            twig:4,
            round_stone:2,
            thread:3,
            stag_beetle_jaw:1
        },
        point:450
    },

    heavy_shield:{
        materials:{
            driftwood:2,
            round_stone:3,
            pottery_piece:2,
            thread:4
        },
        point:500
    },

    reinforced_breastplate:{
        materials:{
            pottery_piece:4,
            straw:2,
            thread:4,
            frog_skin:1
        },
        point:550
    },

    elite_helmet:{
        materials:{
            pottery_piece:3,
            glass_piece:2,
            thread:4,
            stag_beetle_jaw:1
        },
        point:600
    },

    elite_spear:{
        materials:{
            twig:4,
            round_stone:2,
            glass_piece:2,
            thread:4,
            stag_beetle_jaw:1
        },
        point:700
    },


    // =====================================================
    // 【特殊装備】
    // 探検で手に入る装備を材料として使用しない特別枠
    // =====================================================

    pull_tab:{
        materials:{
            small_stone:2,
            round_stone:1
        },
        point:80
    },

    bottle_cap:{
        materials:{
            driftwood:2,
            round_stone:2
        },
        point:100
    }

    // snail_shell・featherは探検で直接入手する装備。
    // 特殊装備として残すため、工房では作成しない。
    //
    // 今後、古代ギリシャ文明の発展に合わせて
    // 青銅・革・木材などの素材を追加した場合、
    // 最上級装備をさらに上位へ拡張できます。

};

console.log("recipes.js読み込み完了");
