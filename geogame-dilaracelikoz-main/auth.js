// auth.js dosyasının EN ÜSTÜ (Eskileri sil, bunu yapıştır)

// 1. Config dosyasından auth ve db'yi al
import { auth, db } from './firebase-config.js';
import { doc, getDoc, collection, addDoc, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 2. Auth ve Firestore fonksiyonlarını çek
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signOut, 
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

console.log("🔥 Auth ve Master Modülü Yüklendi!");

// --- 🌸 SÜSLÜ UYARI FONKSİYONLARI 🌸 ---
window.showCustomAlert = function(title, message) {
    const modal = document.getElementById('custom-alert-modal');
    const titleEl = document.getElementById('alert-title');
    const msgEl = document.getElementById('alert-message');
    
    if (modal && titleEl && msgEl) {
        titleEl.innerText = title;
        msgEl.innerHTML = message.replace(/\n/g, "<br>");
        modal.style.display = 'flex';
    } else {
        alert(message);
    }
}

window.closeCustomAlert = function() {
    const modal = document.getElementById('custom-alert-modal');
    if (modal) modal.style.display = 'none';
}

// --- FORM GÖNDERME İŞLEMİ (GİRİŞ veya KAYIT) ---
const authForm = document.getElementById('auth-form');
const MASTER_EMAIL = "dilaracelikoz@icloud.com"; // 👑 Kraliçe Maili

if (authForm) {
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        const email = document.getElementById('user-email').value.trim();
        const password = document.getElementById('user-password').value;
        const btnText = document.getElementById('submit-auth-btn').textContent;

        if (btnText === "REGISTER") {
            await registerUser(email, password);
        } else {
            // Master/Hunter sekme kontrolü
            const isMasterTab = document.querySelector('.tab-btn.master-active');
            if (isMasterTab) {
                if (email.toLowerCase() !== MASTER_EMAIL.toLowerCase()) {
                    showCustomAlert("⛔ YETKİSİZ GİRİŞ", "Bu kapı sadece <strong>Game Master</strong> içindir!<br>Lütfen 'Hunter' sekmesinden giriş yapın.");
                    return;
                }
            } else {
                if (email.toLowerCase() === MASTER_EMAIL.toLowerCase()) {
                    showCustomAlert("👑 MASTER, BURASI DEĞİL!", "Siz bir Avcı değilsiniz!<br>Lütfen <strong>MASTER</strong> sekmesine tıklayarak giriş yapın.");
                    return;
                }
            }
            await loginUser(email, password);
        }
    });
}

// --- 🔐 UI KONTROL FONKSİYONLARI ---
window.toggleAuthModal = function() {
    const modal = document.getElementById('auth-modal');
    modal.style.display = (modal.style.display === 'flex') ? 'none' : 'flex';
}

let isLoginMode = true;
// auth.js içindeki switchAuthMode fonksiyonunu sil, BUNU YAPIŞTIR:

window.switchAuthMode = function() {
    isLoginMode = !isLoginMode;
    
    const title = document.getElementById('auth-title');
    const subtitle = document.getElementById('auth-subtitle');
    const btn = document.getElementById('submit-auth-btn');
    const switchBtn = document.getElementById('switch-btn');
    const questionText = document.getElementById('auth-question');
    
    // ✨ YENİ: Sekmeleri (Tabs) buluyoruz
    const tabs = document.getElementById('login-tabs');
    
    if (isLoginMode) {
        // --- GİRİŞ MODU (LOGIN) ---
        // Sekmeleri Göster (Çünkü Master buradan giriş yapacak)
        if(tabs) tabs.style.display = 'flex'; 

        title.textContent = "HUNTER LOGIN";
        if(subtitle) subtitle.textContent = "Enter your credentials to save your legacy!";
        btn.textContent = "LOGIN";
        
        questionText.textContent = "Don't have an ID? "; 
        switchBtn.textContent = "Create New Account";
        
    } else {
        // --- KAYIT MODU (REGISTER) ---
        // 👻 Sekmeleri GİZLE (Kayıt olurken rol seçimi yok!)
        if(tabs) tabs.style.display = 'none'; 

        title.textContent = "JOIN THE HUNT";
        if(subtitle) subtitle.textContent = "Create an account to become a Legend!";
        btn.textContent = "REGISTER";
        
        questionText.textContent = "Already have an account? ";
        switchBtn.textContent = "Login Here";
    }
}

// Sayfa Yüklenince
window.onload = function() {
    const modal = document.getElementById('auth-modal');
    if(modal) modal.style.display = 'flex';
};

window.playAsGuest = function() {
    toggleAuthModal();
    document.body.classList.add('guest-mode');
    setTimeout(() => { 
        window.dispatchEvent(new Event('resize'));
        if (typeof enableRulerMode === "function") {
            enableRulerMode();
            showCustomAlert(
                "🎒 WANDERER MODU", 
                "Hoş geldin Gezgin!<br><br>Burada zaman veya puan baskısı yok. Haritayı özgürce keşfet.<br><br>" +
                "<span style='color: #eb2f96; font-size: 1.3em;'>📏</span> <strong>MÜHENDİS ÖZELLİĞİ:</strong><br>" +
                "İki noktaya tıklayarak mesafe ölçebilirsin."
            );
        }
    }, 300);
}

// --- 🌟 KAYIT & GİRİŞ İŞLEMLERİ ---
async function registerUser(email, password) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await setDoc(doc(db, "users", user.uid), {
            email: email,
            role: 'hunter',
            createdAt: new Date(),
            bestScore: 0
        });
        await signOut(auth);
        showCustomAlert("🎉 KAYIT BAŞARILI!", "Hesabın oluşturuldu. Şimdi giriş yapabilirsin.");
        switchAuthMode();
        document.getElementById('user-email').value = email;
        document.getElementById('user-password').value = '';
    } catch (error) {
        console.error("Kayıt Hatası:", error);
        let errorMsg = error.message;
        if(errorMsg.includes("email-already-in-use")) errorMsg = "Bu e-posta zaten kullanımda!";
        else if(errorMsg.includes("weak-password")) errorMsg = "Şifre en az 6 karakter olmalı.";
        showCustomAlert("⚠️ Kayıt Başarısız", errorMsg);
    }
}

async function loginUser(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await checkUserRole(user.uid);
        toggleAuthModal(); // Başarılıysa kapat
    } catch (error) {
        console.error("Giriş Hatası:", error);
        showCustomAlert("⚠️ Giriş Başarısız", "E-posta veya şifre yanlış.");
    }
}

// auth.js içindeki checkUserRole fonksiyonunu SİL ve BUNU YAPIŞTIR:

async function checkUserRole(uid) {
    // 1. Önce veritabanına bakmadan direkt mail kontrolü yapalım (En Hızlı Yöntem)
    const currentUser = auth.currentUser;
    const MASTER_EMAIL = "dilaracelikoz@icloud.com"; 

    console.log("🔍 Rol Kontrolü Yapılıyor...");

    if (currentUser && currentUser.email.toLowerCase() === MASTER_EMAIL.toLowerCase()) {
        console.log("👑 KRALİÇE TESPİT EDİLDİ (Direkt Erişim)");
        
        // Admin modunu aç
        document.body.classList.add('admin-mode');
        
        // Butonu bul ve göster
        const masterBtn = document.getElementById('master-add-btn');
        if (masterBtn) {
            masterBtn.style.display = 'block'; // GİZLENME, ORTAYA ÇIK!
            console.log("✅ Buton görünür yapıldı.");
        } else {
            console.error("❌ HATA: 'master-add-btn' ID'li buton HTML'de bulunamadı!");
        }
        window.loadMasterLocationList();
        showCustomAlert("👑 KRALİÇE GİRİŞİ", "Hoş geldin Diloş! Editör modu aktif.");
        return; // İşlem tamam, veritabanına sormaya gerek bile yok
        
    }

    // Eğer mail tutmazsa veritabanına bak (Diğer adminler için)
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role === 'admin') {
            document.body.classList.add('admin-mode');
            const masterBtn = document.getElementById('master-add-btn');
            if (masterBtn) masterBtn.style.display = 'block';
        }
    }
}
// --- 💎 YENİ EKLENEN KISIM: MASTER FONKSİYONLARI 💎 ---

// 1. "SORU EKLE" Butonuna Basınca
window.activateMasterMode = function() {
    // Global bir değişken tanımlayıp haritaya tıklayınca bu modu kontrol edeceğiz
    window.isMasterAddingMode = true; 
    document.body.classList.add('master-cursor'); // İmleci değiştir
    
    showCustomAlert(
        "💎 EDİTÖR MODU AKTİF", 
        "Şimdi haritada bir noktaya tıkla.<br>Tıkladığın yerde soru ekleme paneli açılacak!"
    );
}


window.toggleAdminPanel = function() {
    const p = document.getElementById('admin-panel');
    p.style.display = (p.style.display === 'flex') ? 'none' : 'flex';
    
    // 🔔 PANEL AÇILDIĞINDA LİSTEYİ TAZELE:
    if(p.style.display === 'flex') {
        window.loadMasterLocationList();
    }
}

// 3. Veritabanına Soruyu Kaydet
window.saveLocationToDB = async function() {
    const coordsText = document.getElementById('admin-coords').value;
    const city = document.getElementById('admin-city').value;
    const clue = document.getElementById('admin-clue').value;
    const radius = document.getElementById('admin-radius').value;

    if (!coordsText || !clue) {
        alert("Lütfen bir yer seçin ve ipucu yazın!");
        return;
    }

    // Koordinatları parçala "Lat: xx, Lng: yy" -> [xx, yy]
    const parts = coordsText.split(',');
    const lat = parseFloat(parts[0].split(':')[1]);
    const lng = parseFloat(parts[1].split(':')[1]);

    try {
        // Firestore 'locations' koleksiyonuna ekle
        await addDoc(collection(db, "locations"), {
            name: clue.substring(0, 15) + "...", // İpucunun başı isim olsun
            clue: clue,
            lat: lat,
            lng: lng,
            city: city,
            radius: parseInt(radius)
        });

        showCustomAlert("✅ BAŞARILI", "Yeni soru haritaya eklendi!");
        toggleAdminPanel(); // Paneli kapat
        
        // Formu temizle
        document.getElementById('admin-clue').value = '';
        
    } catch (error) {
        console.error("Hata:", error);
        alert("Kaydederken hata oluştu: " + error.message);
    }
}

// --- SİSTEM DİNLEME ---
onAuthStateChanged(auth, async (user) => {
    if (user) console.log("User logged in:", user.email);
});

// --- LOGIN TAB DEĞİŞİMİ ---
window.switchLoginTab = function(type) {
    const title = document.getElementById('auth-title');
    const subtitle = document.getElementById('auth-subtitle');
    const btns = document.querySelectorAll('.tab-btn');
    
    btns.forEach(b => {
        b.classList.remove('active');
        b.classList.remove('master-active');
    });

    if (type === 'hunter') {
        btns[0].classList.add('active');
        title.innerText = "HUNTER LOGIN";
        title.style.color = "#a61e4d";
        if(subtitle) subtitle.innerText = "Enter your credentials to save your legacy!";
    } else {
        btns[1].classList.add('active');
        btns[1].classList.add('master-active');
        title.innerText = "💎 MASTER LOGIN";
        title.style.color = "#722ed1";
        if(subtitle) subtitle.innerText = "Welcome back, Creator. The map awaits.";
    }
}

// --- 👑 MASTER: SORULARI LİSTELEME VE SİLME (CRUD - Read & Delete) ---
window.loadMasterLocationList = async function() {
    const container = document.getElementById('location-items-container');
    if (!container) return;

    try {
        const querySnapshot = await getDocs(collection(db, "locations"));
        container.innerHTML = ""; 

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const itemDiv = document.createElement('div');
            // Liste elemanının tasarımı
            itemDiv.style = "background: #fff; margin: 8px 0; padding: 10px; border-radius: 12px; border: 1px solid #ffadd2; display: flex; justify-content: space-between; align-items: center;";
            
            itemDiv.innerHTML = `
                <div style="text-align: left; flex: 1;">
                    <strong style="color: #eb2f96; font-size: 0.85em;">📍 ${data.city.toUpperCase()}</strong><br>
                    <span style="font-size: 0.7em; color: #780650;">${data.clue.substring(0, 25)}...</span>
                </div>
                <button onclick="deleteHeritageLocation('${docSnap.id}')" 
                        style="background: #ff4d4f; color: white; border: none; padding: 5px 10px; border-radius: 8px; cursor: pointer; font-size: 0.75em; font-weight: bold;">
                    SİL
                </button>
            `;
            container.appendChild(itemDiv);
        });
    } catch (error) {
        console.error("Liste yüklenemedi:", error);
    }
}

// Silme Fonksiyonu
window.deleteHeritageLocation = async function(locationId) {
    if (confirm("Bu soruyu sileyim mi kraliçem? 👑")) {
        try {
            await deleteDoc(doc(db, "locations", locationId));
            alert("✅ Soru silindi!");
            window.loadMasterLocationList(); // Listeyi güncelle
            if (typeof window.loadQuestionsFromDB === "function") window.loadQuestionsFromDB(); // Haritayı güncelle
        } catch (error) {
            alert("Silinemedi! ❌");
        }
    }
}