// ======================
// Firebase初期化
// ======================

const firebaseConfig = {
    apiKey: "ここにapiKey",
    authDomain: "ここにauthDomain",
    databaseURL: "ここにdatabaseURL",
    projectId: "ここにprojectId",
    storageBucket: "ここにstorageBucket",
    messagingSenderId: "ここにmessagingSenderId",
    appId: "ここにappId"
};

// 二重初期化防止
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.database();

let currentUser = null;

// ======================
// ログイン確認
// ======================

auth.onAuthStateChanged(user => {

    if (!user) {
        location.href = "../index.html";
        return;
    }

    currentUser = user;

    loadPoint();

});

// ======================
// ポイント表示
// ======================

function loadPoint() {

    db.ref("members/" + currentUser.uid + "/point")
    .on("value", snapshot => {

        const point = snapshot.val() || 0;

        const pointElement =
            document.getElementById("point");

        if(pointElement){
            pointElement.textContent =
                point.toLocaleString() + " Pt";
        }

    });

}
