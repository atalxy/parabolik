document.addEventListener('DOMContentLoaded', () => {
    initializeAuthTabs();
    initializeAuthForms();
});

// Tab değiştirme işlemleri
function initializeAuthTabs() {
    const tabs = document.querySelectorAll('.auth-tab');
    const forms = document.querySelectorAll('.auth-form');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetForm = tab.dataset.tab;
            
            // Aktif tab'ı güncelle
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Aktif formu güncelle
            forms.forEach(form => {
                form.classList.remove('active');
                if (form.id === `${targetForm}-form`) {
                    form.classList.add('active');
                }
            });
        });
    });
}

// Form işlemleri
function initializeAuthForms() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
}

// Giriş işlemi
async function handleLogin(e) {
    e.preventDefault();
    
    const email = loginForm.querySelector('input[type="email"]').value;
    const password = loginForm.querySelector('input[type="password"]').value;
    
    try {
        // Burada gerçek bir API'ye istek atılacak
        const response = await simulateApiCall({
            email,
            password
        });
        
        if (response.success) {
            // Kullanıcı bilgilerini localStorage'a kaydet
            localStorage.setItem('user', JSON.stringify(response.user));
            // Ana sayfaya yönlendir
            window.location.href = 'index.html';
        } else {
            alert('Giriş başarısız: ' + response.message);
        }
    } catch (error) {
        alert('Bir hata oluştu: ' + error.message);
    }
}

// Kayıt işlemi
async function handleRegister(e) {
    e.preventDefault();
    
    const name = registerForm.querySelector('input[type="text"]').value;
    const email = registerForm.querySelector('input[type="email"]').value;
    const password = registerForm.querySelectorAll('input[type="password"]')[0].value;
    const confirmPassword = registerForm.querySelectorAll('input[type="password"]')[1].value;
    
    if (password !== confirmPassword) {
        alert('Şifreler eşleşmiyor!');
        return;
    }
    
    try {
        // Burada gerçek bir API'ye istek atılacak
        const response = await simulateApiCall({
            name,
            email,
            password
        });
        
        if (response.success) {
            alert('Kayıt başarılı! Giriş yapabilirsiniz.');
            // Giriş formuna geç
            document.querySelector('[data-tab="login"]').click();
        } else {
            alert('Kayıt başarısız: ' + response.message);
        }
    } catch (error) {
        alert('Bir hata oluştu: ' + error.message);
    }
}

// API simülasyonu (gerçek uygulamada bu kısım gerçek API çağrılarıyla değiştirilecek)
function simulateApiCall(data) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Demo amaçlı basit bir doğrulama
            if (data.email && data.password) {
                resolve({
                    success: true,
                    user: {
                        id: 1,
                        name: 'Demo Kullanıcı',
                        email: data.email
                    }
                });
            } else {
                resolve({
                    success: false,
                    message: 'Geçersiz e-posta veya şifre'
                });
            }
        }, 1000);
    });
} 