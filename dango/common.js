// ======================
// Firebase初期化
// ======================

const firebaseConfig = {

    apiKey:"AIzaSyBgILQJKJOiQ6gIeZPKhbVjdybXS_vsD3Q",

    authDomain:"kamadapoint.firebaseapp.com",

    databaseURL:"https://kamadapoint-default-rtdb.asia-southeast1.firebasedatabase.app",

    projectId:"kamadapoint",

    storageBucket:"kamadapoint.firebasestorage.app",

    messagingSenderId:"601769416524",

    appId:"1:601769416524:web:0be49ce5a0baf87f75e1e9"

};


// 二重初期化防止
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}


const auth = firebase.auth();
const database = firebase.database();


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

function loadPoint(){


    database
    .ref("members/" + currentUser.uid + "/point")
    .on("value", snapshot=>{


        const point =
            Number(snapshot.val() || 0);



        // shop.html用
        const pointDisplay =
            document.getElementById("pointDisplay");


        if(pointDisplay){

            pointDisplay.textContent =
                point.toLocaleString() + " Pt";

        }



        // dango.html用
        const pointElement =
            document.getElementById("point");


        if(pointElement){

            pointElement.textContent =
                point.toLocaleString() + " Pt";

        }


    });


}



// ======================
// メッセージ表示
// ======================

function showMessage(text){

    const message =
        document.getElementById("message");


    if(!message){
        return;
    }


    message.textContent = text;

    message.classList.add("show");


    clearTimeout(showMessage.timer);


    showMessage.timer = setTimeout(()=>{

        message.classList.remove("show");

    },2500);

}



// ======================
// HTMLエスケープ
// ======================

function escapeHtml(value){

    return String(value || "")
        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;")
        .replaceAll('"',"&quot;")
        .replaceAll("'","&#039;");

}
