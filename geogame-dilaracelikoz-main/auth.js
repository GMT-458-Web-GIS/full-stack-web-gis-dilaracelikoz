
import { auth, db } from './firebase-config.js';
import { doc, getDoc, setDoc, collection, addDoc, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signOut, 
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

console.log("🔥 Auth ve Master Modülü Yüklendi!");


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


const authForm = document.getElementById('auth-form');
const MASTER_EMAIL = "dilaracelikoz@icloud.com"; 

if (authForm) {
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        const email = document.getElementById('user-email').value.trim();
        const password = document.getElementById('user-password').value;
        const btnText = document.getElementById('submit-auth-btn').textContent;

        if (btnText === "REGISTER") {
            await registerUser(email, password);
        } else {
            
            const isMasterTab = document.querySelector('.tab-btn.master-active');
            if (isMasterTab) {
                if (email.toLowerCase() !== MASTER_EMAIL.toLowerCase()) {
                    showCustomAlert("⛔ADMIN LOGIN ", "This tab is only for <strong>Admin</strong> !<br>Please login from'Hunter' tab.");
                    return;
                }
            } else {
                if (email.toLowerCase() === MASTER_EMAIL.toLowerCase()) {
                    showCustomAlert("Hunter Login!", "You are not a Hunter!<br>Please click the <strong>MASTER</strong> tab to log in.");
                    return;
                }
            }
            await loginUser(email, password);
        }
    });
}


window.toggleAuthModal = function() {
    const modal = document.getElementById('auth-modal');
    modal.style.display = (modal.style.display === 'flex') ? 'none' : 'flex';
}

let isLoginMode = true;


window.switchAuthMode = function() {
    isLoginMode = !isLoginMode;
    
    const title = document.getElementById('auth-title');
    const subtitle = document.getElementById('auth-subtitle');
    const btn = document.getElementById('submit-auth-btn');
    const switchBtn = document.getElementById('switch-btn');
    const questionText = document.getElementById('auth-question');
    
  
    const tabs = document.getElementById('login-tabs');
    
    if (isLoginMode) {
   
        if(tabs) tabs.style.display = 'flex'; 

        title.textContent = "HUNTER LOGIN";
        if(subtitle) subtitle.textContent = "Enter your credentials to save your legacy!";
        btn.textContent = "LOGIN";
        
        questionText.textContent = "Don't have an ID? "; 
        switchBtn.textContent = "Create New Account";
        
    } else {
        
        if(tabs) tabs.style.display = 'none'; 

        title.textContent = "JOIN THE HUNT";
        if(subtitle) subtitle.textContent = "Create an account!";
        btn.textContent = "REGISTER";
        
        questionText.textContent = "Already have an account? ";
        switchBtn.textContent = "Login Here";
    }
}


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
                "WANDERER MODU", 
                "Welcome Wanderer!<br><br>You can explore the map freely without time or score pressure.<br><br>" +
                "<span style='color: #eb2f96; font-size: 1.3em;'>📏</span> <strong>Function:</strong><br>" +
                "You can measure distances between two points by clicking on points."
            );
        }
    }, 300);
}


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
        showCustomAlert("🎉 Success!", "Account created successfully. You can now log in.");
        switchAuthMode();
        document.getElementById('user-email').value = email;
        document.getElementById('user-password').value = '';
    } catch (error) {
        console.error("Kayıt Hatası:", error);
        let errorMsg = error.message;
        if(errorMsg.includes("email-already-in-use")) errorMsg = "This email is already in use!";
        else if(errorMsg.includes("weak-password")) errorMsg = "Password must be at least 6 characters.";
        showCustomAlert("⚠️", errorMsg);
    }
}

async function loginUser(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await checkUserRole(user.uid);
        toggleAuthModal(); 
    } catch (error) {
        console.error("Giriş Hatası:", error);
        showCustomAlert("⚠️ Login Failed", "Wrong e-mail or password.");
    }
}



async function checkUserRole(uid) {
    
    const currentUser = auth.currentUser;
    const MASTER_EMAIL = "dilaracelikoz@icloud.com"; 

    console.log("🔍 Rol Kontrolü Yapılıyor...");

    if (currentUser && currentUser.email.toLowerCase() === MASTER_EMAIL.toLowerCase()) {
        console.log("👑 KRALİÇE TESPİT EDİLDİ (Direkt Erişim)");
        
        document.body.classList.add('admin-mode');
        

        const masterBtn = document.getElementById('master-add-btn');
        if (masterBtn) {
            masterBtn.style.display = 'block'; 
            console.log("✅ Buton görünür yapıldı.");
        } else {
            console.error("❌ HATA: 'master-add-btn' ID'li buton HTML'de bulunamadı!");
        }
        window.loadMasterLocationList();
        showCustomAlert("ADMIN LOGIN", "Welcome Admin! Edit mode activated.");
        return; 
        
    }

    
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



window.activateMasterMode = function() {
    
    window.isMasterAddingMode = true; 
    document.body.classList.add('master-cursor'); 
    
    showCustomAlert(
        "ADMIN MODE ACTIVATED", 
        "Click on map.<br>Add question!"
    );
}


window.toggleAdminPanel = function() {
    const p = document.getElementById('admin-panel');
    p.style.display = (p.style.display === 'flex') ? 'none' : 'flex';
    
  
    if(p.style.display === 'flex') {
        window.loadMasterLocationList();
    }
}


window.saveLocationToDB = async function() {
    const coordsText = document.getElementById('admin-coords').value;
    const city = document.getElementById('admin-city').value;
    const clue = document.getElementById('admin-clue').value;
    const radius = document.getElementById('admin-radius').value;

    if (!coordsText || !clue) {
        alert("Please select a location and enter a clue!");
        return;
    }

    
    const parts = coordsText.split(',');
    const lat = parseFloat(parts[0].split(':')[1]);
    const lng = parseFloat(parts[1].split(':')[1]);

    try {
        
        await addDoc(collection(db, "locations"), {
            name: clue.substring(0, 15) + "...", 
            clue: clue,
            lat: lat,
            lng: lng,
            city: city,
            radius: parseInt(radius)
        });

        showCustomAlert("SUCCESS", "New question added!");
        toggleAdminPanel(); 
        
        
        document.getElementById('admin-clue').value = '';
        
    } catch (error) {
        console.error("Hata:", error);
        alert("Error while saving: " + error.message);
    }
}


onAuthStateChanged(auth, async (user) => {
    if (user) console.log("User logged in:", user.email);
});


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
        title.style.color = "#eb2f96";
        if(subtitle) subtitle.innerText = "Enter your credentials to save your legacy!";
    } else {
        btns[1].classList.add('active');
        btns[1].classList.add('master-active');
        title.innerText = "ADMIN LOGIN";
        title.style.color = "#eb2f96";
        if(subtitle) subtitle.innerText = "Welcome back, Creator. The map awaits.";
    }
}


window.loadMasterLocationList = async function() {
    const container = document.getElementById('location-items-container');
    if (!container) return;

    try {
        const querySnapshot = await getDocs(collection(db, "locations"));
        container.innerHTML = ""; 

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const itemDiv = document.createElement('div');
       
            itemDiv.style = "background: #fff; margin: 8px 0; padding: 10px; border-radius: 12px; border: 1px solid #ffadd2; display: flex; justify-content: space-between; align-items: center;";
            
            itemDiv.innerHTML = `
                <div style="text-align: left; flex: 1;">
                    <strong style="color: #eb2f96; font-size: 0.85em;"> ${data.city.toUpperCase()}</strong><br>
                    <span style="font-size: 0.7em; color: #780650;">${data.clue.substring(0, 25)}...</span>
                </div>
                <button onclick="deleteHeritageLocation('${docSnap.id}')" 
                        style="background: #FFEDFA; color: #FF90BB; border: 2px solid #FF90BB; padding: 5px 10px; border-radius: 8px; cursor: pointer; font-size: 0.75em; font-weight: bold;">
                    DELETE
                </button>
            `;
            container.appendChild(itemDiv);
        });
    } catch (error) {
        console.error("Liste yüklenemedi:", error);
    }
}


window.deleteHeritageLocation = async function(locationId) {
    if (confirm("Are you sure?")) {
        try {
            await deleteDoc(doc(db, "locations", locationId));
            alert("Successfully deleted!");
            window.loadMasterLocationList(); 
            if (typeof window.loadQuestionsFromDB === "function") window.loadQuestionsFromDB(); 
        } catch (error) {
            alert("Error! Could not delete: ");
        }
    }
}


window.goHome = function() {
    const gameControls = document.getElementById('game-controls');
    const adminPanel = document.getElementById('admin-panel');
    const splashScreen = document.getElementById('splash-screen');
    const mainMenuBtn = document.getElementById('main-menu-btn');
    
 
    if(gameControls) gameControls.style.display = 'none';
    if(adminPanel) adminPanel.style.display = 'none';
    if(mainMenuBtn) mainMenuBtn.style.display = 'none'; 
    
    
    if(splashScreen) splashScreen.style.display = 'block';
    
    console.log("Şehir seçim ekranına başarıyla dönüldü!");
}


window.exitToLogin = function() {
    if (confirm("Are you sure you want to exit? 🌸")) {
       
        if (auth.currentUser) {
            signOut(auth).then(() => {
                window.location.reload(); 
            }).catch((error) => {
                console.error("Çıkış hatası:", error);
                window.location.reload();
            });
        } else {
           
            window.location.reload();
        }
    }
}