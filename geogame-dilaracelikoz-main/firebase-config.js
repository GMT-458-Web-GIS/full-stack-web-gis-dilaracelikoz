// Firebase SDK'larını tarayıcıdan (CDN) çekiyoruz
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Senin Proje Ayarların (Resimden aldım, direkt çalışır!)
const firebaseConfig = {
    apiKey: "AIzaSyA4_yCX6CCOq6uEZeEgDRZ1iSXVpkgYzIw",
    authDomain: "heritage-hunt-final.firebaseapp.com",
    projectId: "heritage-hunt-final",
    storageBucket: "heritage-hunt-final.firebasestorage.app",
    messagingSenderId: "258002637330",
    appId: "1:258002637330:web:1721f7299be38445583ecb",
    measurementId: "G-ZSL8LZTGC1"
};

// Firebase'i Başlat
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

console.log("🔥 Firebase başarıyla bağlandı!");

// Diğer dosyalarda kullanmak için dışa aktar
export { auth, db };
