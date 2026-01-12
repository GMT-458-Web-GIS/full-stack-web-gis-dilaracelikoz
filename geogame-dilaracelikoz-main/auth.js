// --- 🔐 UI KONTROL FONKSİYONLARI ---

// 1. Modalı Açıp Kapatma (TAMİR EDİLDİ: Flex Uyumlu)
window.toggleAuthModal = function() {
    const modal = document.getElementById('auth-modal');
    
    // HATA BURADAYDI: Artık 'block' değil 'flex' kontrolü yapıyoruz
    if (modal.style.display === 'flex') {
        modal.style.display = 'none'; // Gizle (Oyun Başlasın!)
    } else {
        modal.style.display = 'flex'; // Göster
    }
}

// Giriş Yap / Kayıt Ol Geçişi (GÜNCELLENMİŞ)
let isLoginMode = true;

window.switchAuthMode = function() {
    isLoginMode = !isLoginMode;
    
    const title = document.getElementById('auth-title');
    const subtitle = document.getElementById('auth-subtitle');
    const btn = document.getElementById('submit-auth-btn');
    const switchBtn = document.getElementById('switch-btn');
    
    // YENİ: Soru metnini yakalıyoruz
    const questionText = document.getElementById('auth-question');
    const roleGroup = document.getElementById('role-group');
    
    if (isLoginMode) {
        // --- GİRİŞ MODU ---
        title.textContent = "HUNTER LOGIN";
        if(subtitle) subtitle.textContent = "Enter your credentials to save your legacy!";
        btn.textContent = "LOGIN";
        roleGroup.style.display = 'none'; 
        
        // Yazıları Eski Haline Getir
        questionText.textContent = "Don't have an ID? "; 
        switchBtn.textContent = "Create New Account";
        
    } else {
        // --- KAYIT MODU ---
        title.textContent = "JOIN THE HUNT";
        if(subtitle) subtitle.textContent = "Create an account to become a Legend!";
        btn.textContent = "REGISTER";
        roleGroup.style.display = 'block';
        
        // Yazıları Değiştir: "Zaten hesabın var mı?"
        questionText.textContent = "Already have an account? ";
        switchBtn.textContent = "Login Here";
    }
}

// 3. Sayfa Yüklenince Kutu Otomatik Açılsın
window.onload = function() {
    const modal = document.getElementById('auth-modal');
    if(modal) {
        modal.style.display = 'flex'; // Başlangıçta 'flex' olarak aç
    }
};
// --- ROL SEÇİM FONKSİYONU ---
window.selectRole = function(role) {
    // 1. Gizli kutuya değeri yaz
    document.getElementById('selected-role-value').value = role;

    // 2. Görsel değişimi (Hangisi aktif?)
    const btnHunter = document.getElementById('btn-hunter');
    const btnAdmin = document.getElementById('btn-admin');

    if (role === 'hunter') {
        btnHunter.classList.add('active'); // Hunter parlasın
        btnAdmin.classList.remove('active'); // Admin sönsün
    } else {
        btnAdmin.classList.add('active'); // Admin parlasın
        btnHunter.classList.remove('active'); // Hunter sönsün
    }
}


// --- 🎒 MİSAFİR MODU (DÜRTME EKLENTİLİ) ---
window.playAsGuest = function() {
    // 1. Giriş Kutusunu Kapat
    toggleAuthModal();
    
    // 2. CSS Sınıfını Ekle (Görünümü değiştir)
    document.body.classList.add('guest-mode');
    
    // 3. ✨ SİHİRLİ DOKUNUŞ: Haritayı Dürt! ✨
    // 300 milisaniye bekleyip (kutu kapanana kadar) tarayıcıya "Ekran Boyutu Değişti!" yalanını söylüyoruz.
    // Böylece harita panikle uyanıp tüm boşluğu dolduruyor.
    setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
    }, 0.01);
}