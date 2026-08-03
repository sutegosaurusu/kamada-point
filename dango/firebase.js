// Firebase設定

const firebaseConfig = {

apiKey:"AIzaSyBgILQJKJOiQ6gIeZPKhbVjdybXS_vsD3Q",

authDomain:"kamadapoint.firebaseapp.com",

databaseURL:"https://kamadapoint-default-rtdb.asia-southeast1.firebasedatabase.app",

projectId:"kamadapoint",

storageBucket:"kamadapoint.firebasestorage.app",

messagingSenderId:"601769416524",

appId:"1:601769416524:web:0be49ce5a0baf87f75e1e9"

};


firebase.initializeApp(firebaseConfig);


// どのページでも使えるようにする

const auth = firebase.auth();

const database = firebase.database();
