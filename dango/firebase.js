// Firebase設定

const firebaseConfig = {
    apiKey: "ここに自分の値",
    authDomain: "ここに自分の値",
    databaseURL: "ここに自分の値",
    projectId: "ここに自分の値",
    storageBucket: "ここに自分の値",
    messagingSenderId: "ここに自分の値",
    appId: "ここに自分の値"
};


firebase.initializeApp(firebaseConfig);


// どのページでも使えるようにする

const auth = firebase.auth();

const database = firebase.database();
