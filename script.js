// Sayfa yüklendiğinde çalışacak fonksiyonlar
document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation();
    initializePortfolio();
    loadPortfolioFromStorage();
    loadTransactionsFromStorage();
    updateBalance();
    initializeIdeas();
    initializeHeroButtons();
    initializeNewsModal();
    initializeCharts();
    initializeChat();
    initializeGamification();
});

// Navigasyon işlemleri
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('.section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            
            // Aktif link ve section'ı güncelle
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetId) {
                    section.classList.add('active');
                }
            });
        });
    });
}

// Hero butonları için tıklama olayları
function initializeHeroButtons() {
    const heroButtons = document.querySelectorAll('.hero-btn');
    
    heroButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = button.getAttribute('href').substring(1);
            
            // Aktif section'ı güncelle
            document.querySelectorAll('.section').forEach(section => {
                section.classList.remove('active');
                if (section.id === targetId) {
                    section.classList.add('active');
                }
            });
            
            // Aktif nav link'i güncelle
            document.querySelectorAll('.nav-links a').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${targetId}`) {
                    link.classList.add('active');
                }
            });
            
            // Sayfayı yumuşak bir şekilde kaydır
            document.querySelector(`#${targetId}`).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
}

// Portföy işlemleri için başlangıç değerleri
let portfolio = {
    balance: 100000,
    assets: {},
    transactions: []
};

// Portföy başlatma
function initializePortfolio() {
    const buyBtn = document.querySelector('.buy-btn');
    const sellBtn = document.querySelector('.sell-btn');
    
    buyBtn.addEventListener('click', handleBuy);
    sellBtn.addEventListener('click', handleSell);
}

// Alım işlemi
function handleBuy() {
    const assetType = document.getElementById('asset-type').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const price = parseFloat(document.getElementById('price').value);
    
    if (!assetType || !amount || !price) {
        alert('Lütfen tüm alanları doldurun!');
        return;
    }
    
    const totalCost = amount * price;
    
    if (totalCost > portfolio.balance) {
        alert('Yetersiz bakiye!');
        return;
    }
    
    // Portföyü güncelle
    portfolio.balance -= totalCost;
    
    if (!portfolio.assets[assetType]) {
        portfolio.assets[assetType] = {
            amount: 0,
            averagePrice: 0
        };
    }
    
    const asset = portfolio.assets[assetType];
    const newTotalAmount = asset.amount + amount;
    const newTotalCost = (asset.amount * asset.averagePrice) + totalCost;
    
    asset.amount = newTotalAmount;
    asset.averagePrice = newTotalCost / newTotalAmount;
    
    // İşlemi kaydet
    addTransaction('Alım', assetType, amount, price);
    
    // Arayüzü güncelle
    updatePortfolioTable();
    updateBalance();
    savePortfolioToStorage();
    
    // Formu temizle
    document.getElementById('trading-form').reset();
}

// Satış işlemi
function handleSell() {
    const assetType = document.getElementById('asset-type').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const price = parseFloat(document.getElementById('price').value);
    
    if (!assetType || !amount || !price) {
        alert('Lütfen tüm alanları doldurun!');
        return;
    }
    
    if (!portfolio.assets[assetType] || portfolio.assets[assetType].amount < amount) {
        alert('Yetersiz varlık miktarı!');
        return;
    }
    
    // Portföyü güncelle
    const totalValue = amount * price;
    portfolio.balance += totalValue;
    
    const asset = portfolio.assets[assetType];
    asset.amount -= amount;
    
    if (asset.amount === 0) {
        delete portfolio.assets[assetType];
    }
    
    // İşlemi kaydet
    addTransaction('Satış', assetType, amount, price);
    
    // Arayüzü güncelle
    updatePortfolioTable();
    updateBalance();
    savePortfolioToStorage();
    
    // Formu temizle
    document.getElementById('trading-form').reset();
}

// İşlem ekleme
function addTransaction(type, asset, amount, price) {
    const transaction = {
        date: new Date().toLocaleString(),
        type,
        asset,
        amount,
        price
    };
    
    portfolio.transactions.unshift(transaction);
    updateTransactionTable();
}

// Portföy tablosunu güncelleme
function updatePortfolioTable() {
    const tbody = document.getElementById('portfolio-body');
    tbody.innerHTML = '';
    
    for (const [asset, data] of Object.entries(portfolio.assets)) {
        const row = document.createElement('tr');
        const currentPrice = getCurrentPrice(asset);
        const currentValue = data.amount * currentPrice;
        const profitLoss = currentValue - (data.amount * data.averagePrice);
        
        row.innerHTML = `
            <td>${asset}</td>
            <td>${data.amount.toFixed(4)}</td>
            <td>₺${data.averagePrice.toFixed(2)}</td>
            <td>₺${currentValue.toFixed(2)}</td>
            <td class="${profitLoss >= 0 ? 'positive' : 'negative'}">
                ₺${profitLoss.toFixed(2)}
            </td>
        `;
        
        tbody.appendChild(row);
    }
}

// İşlem tablosunu güncelleme
function updateTransactionTable() {
    const tbody = document.getElementById('transaction-body');
    tbody.innerHTML = '';
    
    portfolio.transactions.forEach(transaction => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${transaction.date}</td>
            <td>${transaction.type}</td>
            <td>${transaction.asset}</td>
            <td>${transaction.amount.toFixed(4)}</td>
            <td>₺${transaction.price.toFixed(2)}</td>
        `;
        
        tbody.appendChild(row);
    });
}

// Bakiye güncelleme
function updateBalance() {
    const balanceElement = document.querySelector('.balance');
    balanceElement.textContent = `₺${portfolio.balance.toFixed(2)}`;
}

// Güncel fiyat alma (simülasyon için)
function getCurrentPrice(asset) {
    const prices = {
        'BTC': 1250000,
        'ETH': 85000,
        'THYAO': 125.50
    };
    return prices[asset] || 0;
}

// LocalStorage işlemleri
function savePortfolioToStorage() {
    localStorage.setItem('portfolio', JSON.stringify(portfolio));
}

function loadPortfolioFromStorage() {
    const savedPortfolio = localStorage.getItem('portfolio');
    if (savedPortfolio) {
        portfolio = JSON.parse(savedPortfolio);
        updatePortfolioTable();
    }
}

function loadTransactionsFromStorage() {
    const savedPortfolio = localStorage.getItem('portfolio');
    if (savedPortfolio) {
        portfolio = JSON.parse(savedPortfolio);
        updateTransactionTable();
    }
}

// Fikirler Bölümü
function initializeIdeas() {
    // Filtre butonları
    const filterButtons = document.querySelectorAll('.ideas-filters .filter-btn');
    const ideaCards = document.querySelectorAll('.idea-card');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Aktif buton stilini güncelle
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filter = button.getAttribute('data-filter');

            // Kartları filtrele
            ideaCards.forEach(card => {
                const ideaType = card.querySelector('.idea-type').classList[1];
                if (filter === 'all' || ideaType === filter) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // TradingView Grafikleri
    const charts = {
        'btc-idea-chart': 'BTCUSDT',
        'eth-idea-chart': 'ETHUSDT',
        'thyao-idea-chart': 'THYAO'
    };

    // Her grafik için TradingView widget'ı oluştur
    Object.entries(charts).forEach(([elementId, symbol]) => {
        new TradingView.widget({
            "width": "100%",
            "height": 200,
            "symbol": symbol,
            "interval": "D",
            "timezone": "Etc/UTC",
            "theme": "light",
            "style": "1",
            "locale": "tr",
            "toolbar_bg": "#f1f3f6",
            "enable_publishing": false,
            "allow_symbol_change": false,
            "container_id": elementId
        });
    });

    // Fikir kartları için hover efekti
    ideaCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });
}

// Haber detayları için veri
const newsData = {
    'btc-news-1': {
        title: 'Bitcoin ETF onayı beklentisi fiyatları yukarı taşıyor',
        time: '2 saat önce',
        source: 'CryptoNews',
        content: 'Bitcoin fiyatları, spot ETF onayı beklentisiyle birlikte yükselişe geçti. Piyasa uzmanları, SEC\'in yakın zamanda spot Bitcoin ETF\'lerini onaylamasını bekliyor. Bu gelişme, kurumsal yatırımcıların Bitcoin\'e daha kolay erişim sağlamasını mümkün kılacak.',
        expert: {
            name: 'Dr. Ahmet Yılmaz',
            title: 'Kripto Para Analisti',
            avatar: 'https://example.com/expert1.jpg',
            comment: 'Bitcoin ETF onayı, kripto para piyasası için önemli bir dönüm noktası olacak. Kurumsal yatırımcıların piyasaya girişi, fiyatları daha da yukarı taşıyabilir.'
        }
    },
    'btc-news-2': {
        title: 'Kripto piyasası günlük işlem hacmi rekor kırıyor',
        time: '4 saat önce',
        source: 'CoinDesk',
        content: 'Kripto para piyasası, son 24 saatte 100 milyar doların üzerinde işlem hacmine ulaştı. Bu rekor seviye, piyasadaki yüksek volatilite ve artan yatırımcı ilgisini gösteriyor.',
        expert: {
            name: 'Prof. Mehmet Demir',
            title: 'Finans Ekonomisti',
            avatar: 'https://example.com/expert2.jpg',
            comment: 'Yüksek işlem hacmi, piyasadaki likiditenin artığını gösteriyor. Bu durum, kurumsal yatırımcıların piyasaya ilgisinin arttığının bir göstergesi.'
        }
    },
    'eth-news-1': {
        title: 'Ethereum 2.0 güncellemesi yaklaşıyor',
        time: '1 saat önce',
        source: 'ETHNews',
        content: 'Ethereum ağı, büyük güncelleme öncesi son hazırlıklarını tamamlıyor. Yeni güncelleme ile birlikte ağ performansı ve ölçeklenebilirlik önemli ölçüde artacak.',
        expert: {
            name: 'Ayşe Kaya',
            title: 'Blockchain Uzmanı',
            avatar: 'https://example.com/expert3.jpg',
            comment: 'Ethereum 2.0 güncellemesi, ağın geleceği için kritik öneme sahip. Bu güncelleme ile birlikte Ethereum\'un rekabet gücü artacak.'
        }
    },
    'sol-news-1': {
        title: 'Solana ağı yeni güncelleme ile hızlanıyor',
        time: '2 saat önce',
        source: 'SolanaNews',
        content: 'Solana ağı, yeni güncelleme ile birlikte işlem hızını artırdı. Ağ şu anda saniyede 65,000 işlem kapasitesine ulaştı.',
        expert: {
            name: 'Can Yıldız',
            title: 'Blockchain Geliştirici',
            avatar: 'https://example.com/expert4.jpg',
            comment: 'Solana\'nın yüksek işlem hızı, DeFi ve NFT projeleri için ideal bir platform olmasını sağlıyor.'
        }
    },
    'dot-news-1': {
        title: 'Polkadot yeni parachain projelerini duyurdu',
        time: '3 saat önce',
        source: 'PolkadotNews',
        content: 'Polkadot ekosistemi, yeni parachain projelerini duyurdu. Bu projeler, ağın ölçeklenebilirliğini ve kullanım alanlarını genişletecek.',
        expert: {
            name: 'Zeynep Aydın',
            title: 'Blockchain Analisti',
            avatar: 'https://example.com/expert5.jpg',
            comment: 'Polkadot\'un parachain mimarisi, farklı blockchain projelerinin birlikte çalışmasını sağlayarak ekosistemin büyümesini hızlandırıyor.'
        }
    },
    'avax-news-1': {
        title: 'Avalanche yeni DeFi projelerini duyurdu',
        time: '2 saat önce',
        source: 'AvalancheNews',
        content: 'Avalanche ağı, yeni DeFi projelerini duyurdu. Bu projeler, ağın finansal ekosistemini güçlendirecek.',
        expert: {
            name: 'Burak Özkan',
            title: 'DeFi Uzmanı',
            avatar: 'https://example.com/expert6.jpg',
            comment: 'Avalanche\'ın hızlı ve düşük maliyetli yapısı, DeFi projeleri için ideal bir platform sunuyor.'
        }
    }
};

// Haber detayları için modal işlemleri
function initializeNewsModal() {
    const modal = document.getElementById('news-modal');
    const closeBtn = modal.querySelector('.close-modal');
    const newsItems = document.querySelectorAll('.news-item');

    // Haber detaylarını göster
    newsItems.forEach(item => {
        item.addEventListener('click', () => {
            const newsId = item.getAttribute('data-news-id');
            const news = newsData[newsId];
            
            if (news) {
                modal.querySelector('.news-detail-title').textContent = news.title;
                modal.querySelector('.news-detail-time').textContent = news.time;
                modal.querySelector('.news-detail-source').textContent = news.source;
                modal.querySelector('.news-detail-content').textContent = news.content;
                
                const expert = news.expert;
                modal.querySelector('.expert-avatar').src = expert.avatar;
                modal.querySelector('.expert-name').textContent = expert.name;
                modal.querySelector('.expert-title').textContent = expert.title;
                modal.querySelector('.expert-comment').textContent = expert.comment;
                
                modal.style.display = 'block';
            }
        });
    });

    // Modalı kapat
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Modal dışına tıklandığında kapat
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// TradingView grafiklerini başlat
function initializeCharts() {
    const chartSymbols = {
        'btc-chart': 'BTCUSDT',
        'eth-chart': 'ETHUSDT',
        'sol-chart': 'SOLUSDT',
        'ada-chart': 'ADAUSDT',
        'dot-chart': 'DOTUSDT',
        'avax-chart': 'AVAXUSDT'
    };

    Object.entries(chartSymbols).forEach(([elementId, symbol]) => {
        new TradingView.widget({
            "width": "100%",
            "height": 200,
            "symbol": symbol,
            "interval": "D",
            "timezone": "Etc/UTC",
            "theme": "light",
            "style": "1",
            "locale": "tr",
            "toolbar_bg": "#f1f3f6",
            "enable_publishing": false,
            "allow_symbol_change": false,
            "container_id": elementId
        });
    });
}

// AI Asistan
function initializeChat() {
    const chatToggle = document.querySelector('.chat-toggle');
    const chatContainer = document.querySelector('.chat-container');
    const closeChat = document.querySelector('.close-chat');
    const sendButton = document.querySelector('.send-message');
    const chatInput = document.querySelector('.chat-input input');
    const chatMessages = document.querySelector('.chat-messages');

    // Sohbet penceresini aç/kapat
    chatToggle.addEventListener('click', () => {
        chatContainer.classList.add('active');
    });

    closeChat.addEventListener('click', () => {
        chatContainer.classList.remove('active');
    });

    // Mesaj gönderme
    function sendMessage() {
        const message = chatInput.value.trim();
        if (message) {
            // Kullanıcı mesajını ekle
            addMessage(message, 'user');
            chatInput.value = '';

            // AI yanıtını oluştur
            setTimeout(() => {
                const aiResponse = generateAIResponse(message);
                addMessage(aiResponse, 'ai');
            }, 1000);
        }
    }

    sendButton.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Mesaj ekleme
    function addMessage(text, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        
        const content = document.createElement('div');
        content.className = 'message-content';
        
        if (type === 'ai') {
            const icon = document.createElement('i');
            icon.className = 'fas fa-robot';
            content.appendChild(icon);
        }
        
        const paragraph = document.createElement('p');
        paragraph.textContent = text;
        content.appendChild(paragraph);
        
        messageDiv.appendChild(content);
        chatMessages.appendChild(messageDiv);
        
        // Otomatik kaydırma
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// AI yanıtları oluşturma
function generateAIResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Yatırım tavsiyeleri
    if (lowerMessage.includes('bitcoin') || lowerMessage.includes('btc')) {
        return 'Bitcoin şu anda teknik olarak güçlü bir trend içerisinde. RSI 65 seviyesinde ve MACD pozitif bölgede. Kısa vadede ₺1,350,000 hedefini görebiliriz. Ancak yatırım yapmadan önce risk yönetimi stratejinizi belirlemenizi öneririm.';
    }
    
    if (lowerMessage.includes('ethereum') || lowerMessage.includes('eth')) {
        return 'Ethereum, konsolidasyon sürecinde. RSI 55 seviyesinde ve MACD yatay. Yeni bir yön için katalizör bekleniyor. Şu an için pozisyon almak yerine beklemek daha mantıklı olabilir.';
    }
    
    if (lowerMessage.includes('thyao')) {
        return 'THYAO, aşırı alım bölgesinde. RSI 75 seviyesinde ve MACD satış sinyali veriyor. Kısa vadede düşüş bekliyoruz. Mevcut pozisyonları kapatmak veya kısa pozisyon almak düşünülebilir.';
    }
    
    // Genel piyasa analizi
    if (lowerMessage.includes('piyasa') || lowerMessage.includes('analiz')) {
        return 'Piyasalar şu anda volatil bir dönemden geçiyor. Kripto paralar güçlü bir yükseliş trendinde, ancak hisse senetleri karışık sinyaller veriyor. Risk yönetimi stratejinizi gözden geçirmenizi öneririm.';
    }
    
    // Risk yönetimi
    if (lowerMessage.includes('risk') || lowerMessage.includes('güvenli')) {
        return 'Risk yönetimi yatırımda en önemli konulardan biridir. Portföyünüzü çeşitlendirmenizi, stop-loss kullanmanızı ve yatırım yapmadan önce detaylı araştırma yapmanızı öneririm.';
    }
    
    // Genel tavsiyeler
    if (lowerMessage.includes('tavsiye') || lowerMessage.includes('öneri')) {
        return 'Yatırım yapmadan önce şunları göz önünde bulundurmanızı öneririm:\n1. Risk toleransınızı belirleyin\n2. Portföyünüzü çeşitlendirin\n3. Stop-loss kullanın\n4. Duygusal kararlardan kaçının\n5. Düzenli olarak portföyünüzü gözden geçirin';
    }

    // Yeni eklenen yanıtlar
    if (lowerMessage.includes('merhaba') || lowerMessage.includes('selam')) {
        return 'Merhaba! Ben Parabolik Asistan. Size yatırım tavsiyeleri, piyasa analizleri ve portföy yönetimi konularında yardımcı olabilirim. Hangi konuda bilgi almak istersiniz?';
    }

    if (lowerMessage.includes('nasıl') || lowerMessage.includes('yardım')) {
        return 'Size şu konularda yardımcı olabilirim:\n1. Kripto para analizleri\n2. Hisse senedi tavsiyeleri\n3. Portföy yönetimi\n4. Risk yönetimi\n5. Teknik analiz\n6. Piyasa trendleri\n\nHangi konuda detaylı bilgi almak istersiniz?';
    }

    if (lowerMessage.includes('kripto') || lowerMessage.includes('coin')) {
        return 'Kripto para piyasası hakkında genel bir bilgi vermek gerekirse:\n\n1. Bitcoin (BTC): Güçlü yükseliş trendinde\n2. Ethereum (ETH): Konsolidasyon sürecinde\n3. Solana (SOL): Yeni ATH hedefliyor\n4. Cardano (ADA): Yatay seyirde\n5. Polkadot (DOT): Düşüş trendinde\n\nHangi kripto para hakkında detaylı analiz istersiniz?';
    }

    if (lowerMessage.includes('hisse') || lowerMessage.includes('borsa')) {
        return 'Borsa İstanbul\'daki önemli hisseler hakkında güncel durum:\n\n1. THYAO: Aşırı alım bölgesinde\n2. GARAN: Yatay seyirde\n3. ASELS: Yükseliş trendinde\n4. KCHOL: Konsolidasyon sürecinde\n5. SISE: Düşüş trendinde\n\nHangi hisse hakkında detaylı analiz istersiniz?';
    }

    if (lowerMessage.includes('portföy') || lowerMessage.includes('yatırım')) {
        return 'Portföy yönetimi için önerilerim:\n\n1. Varlık dağılımı:\n   - %40 Kripto paralar\n   - %30 Hisse senetleri\n   - %20 Altın/Döviz\n   - %10 Nakit\n\n2. Risk yönetimi:\n   - Stop-loss kullanın\n   - Pozisyon büyüklüğünü sınırlayın\n   - Portföyü düzenli gözden geçirin\n\nDetaylı portföy analizi için hangi varlık sınıfına odaklanmak istersiniz?';
    }

    if (lowerMessage.includes('teşekkür') || lowerMessage.includes('sağol')) {
        return 'Rica ederim! Başka sorularınız varsa yardımcı olmaktan mutluluk duyarım. İyi yatırımlar dilerim!';
    }
    
    // Varsayılan yanıt
    return 'Size daha iyi yardımcı olabilmem için lütfen şu konulardan birini sorun:\n\n1. Kripto para analizleri\n2. Hisse senedi tavsiyeleri\n3. Portföy yönetimi\n4. Risk yönetimi\n5. Teknik analiz\n6. Piyasa trendleri\n\nÖrneğin: "Bitcoin analizi yapar mısın?" veya "Portföy yönetimi için önerilerin neler?" gibi sorular sorabilirsiniz.';
}

// Oyunlaştırma Verileri
const gamificationData = {
    userLevel: 5,
    currentXP: 750,
    nextLevelXP: 1000,
    dailyTasks: [
        {
            id: 'read-analysis',
            title: 'Hisse Analizi Oku',
            description: 'Bugün 1 hisse analizi oku',
            progress: 0,
            target: 1,
            reward: 50,
            completed: false
        },
        {
            id: 'portfolio-performance',
            title: 'Portföy Performansı',
            description: 'Portföyünü 5 gün üst üste yeşilde tut',
            progress: 3,
            target: 5,
            reward: 500,
            completed: false
        },
        {
            id: 'make-comment',
            title: 'Yorum Yap',
            description: 'Bir analiz hakkında yorum yap',
            progress: 0,
            target: 1,
            reward: 30,
            completed: false
        }
    ],
    achievements: [
        {
            id: 'master-investor',
            title: 'Yatırım Ustası',
            description: '1000 XP kazan',
            unlocked: false,
            icon: 'fa-star'
        },
        {
            id: 'portfolio-manager',
            title: 'Portföy Yöneticisi',
            description: '5 farklı varlık ekle',
            unlocked: true,
            icon: 'fa-chart-pie'
        },
        {
            id: 'quick-trader',
            title: 'Hızlı Yatırımcı',
            description: '10 işlem gerçekleştir',
            unlocked: false,
            icon: 'fa-bolt'
        },
        {
            id: 'analysis-expert',
            title: 'Analiz Uzmanı',
            description: '20 analiz oku',
            unlocked: false,
            icon: 'fa-book'
        }
    ]
};

// Oyunlaştırma Fonksiyonları
function initializeGamification() {
    updateLevelDisplay();
    updateTasksDisplay();
    updateAchievementsDisplay();
    setupTaskListeners();
}

function updateLevelDisplay() {
    const levelInfo = document.querySelector('.level-details h3');
    const xpProgress = document.querySelector('.xp-progress');
    const xpText = document.querySelector('.level-details p');

    if (levelInfo && xpProgress && xpText) {
        levelInfo.textContent = `Seviye ${gamificationData.userLevel}`;
        const progressPercentage = (gamificationData.currentXP / gamificationData.nextLevelXP) * 100;
        xpProgress.style.width = `${progressPercentage}%`;
        xpText.textContent = `${gamificationData.currentXP}/${gamificationData.nextLevelXP} XP`;
    }
}

function updateTasksDisplay() {
    const tasksGrid = document.querySelector('.tasks-grid');
    if (!tasksGrid) return;

    tasksGrid.innerHTML = gamificationData.dailyTasks.map(task => `
        <div class="task-card" data-task-id="${task.id}">
            <div class="task-icon">
                <i class="fas ${getTaskIcon(task.id)}"></i>
            </div>
            <div class="task-info">
                <h4>${task.title}</h4>
                <p>${task.description}</p>
                <div class="task-progress">
                    <div class="progress-bar">
                        <div class="progress" style="width: ${(task.progress / task.target) * 100}%"></div>
                    </div>
                    <span>${task.progress}/${task.target}</span>
                </div>
                <span class="task-reward">+${task.reward} XP</span>
            </div>
        </div>
    `).join('');
}

function updateAchievementsDisplay() {
    const badgesGrid = document.querySelector('.badges-grid');
    if (!badgesGrid) return;

    badgesGrid.innerHTML = gamificationData.achievements.map(achievement => `
        <div class="badge-card ${achievement.unlocked ? '' : 'locked'}" data-achievement-id="${achievement.id}">
            <div class="badge-icon">
                <i class="fas ${achievement.icon}"></i>
            </div>
            <h4>${achievement.title}</h4>
            <p>${achievement.description}</p>
        </div>
    `).join('');
}

function getTaskIcon(taskId) {
    const icons = {
        'read-analysis': 'fa-chart-line',
        'portfolio-performance': 'fa-coins',
        'make-comment': 'fa-comment-dots'
    };
    return icons[taskId] || 'fa-tasks';
}

function setupTaskListeners() {
    // Görev tamamlama olaylarını dinle
    document.addEventListener('analysisRead', () => updateTaskProgress('read-analysis'));
    document.addEventListener('portfolioUpdated', () => updateTaskProgress('portfolio-performance'));
    document.addEventListener('commentAdded', () => updateTaskProgress('make-comment'));
}

function updateTaskProgress(taskId) {
    const task = gamificationData.dailyTasks.find(t => t.id === taskId);
    if (!task || task.completed) return;

    task.progress++;
    if (task.progress >= task.target) {
        task.completed = true;
        addXP(task.reward);
        showRewardNotification(task.reward);
    }

    updateTasksDisplay();
}

function addXP(amount) {
    gamificationData.currentXP += amount;
    
    // Seviye atlama kontrolü
    if (gamificationData.currentXP >= gamificationData.nextLevelXP) {
        levelUp();
    }
    
    updateLevelDisplay();
}

function levelUp() {
    gamificationData.userLevel++;
    gamificationData.currentXP -= gamificationData.nextLevelXP;
    gamificationData.nextLevelXP = Math.floor(gamificationData.nextLevelXP * 1.5);
    
    showLevelUpNotification();
    checkAchievements();
}

function showRewardNotification(xp) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <i class="fas fa-star"></i>
        <p>Tebrikler! ${xp} XP kazandınız!</p>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function showLevelUpNotification() {
    const notification = document.createElement('div');
    notification.className = 'notification level-up';
    notification.innerHTML = `
        <i class="fas fa-trophy"></i>
        <p>Tebrikler! Seviye ${gamificationData.userLevel}'e yükseldiniz!</p>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function checkAchievements() {
    // Başarı kontrolü ve güncelleme
    const achievements = {
        'master-investor': () => gamificationData.currentXP >= 1000,
        'portfolio-manager': () => portfolio.length >= 5,
        'quick-trader': () => transactions.length >= 10,
        'analysis-expert': () => readAnalyses >= 20
    };

    Object.entries(achievements).forEach(([id, check]) => {
        const achievement = gamificationData.achievements.find(a => a.id === id);
        if (achievement && !achievement.unlocked && check()) {
            achievement.unlocked = true;
            showAchievementNotification(achievement);
        }
    });

    updateAchievementsDisplay();
}

function showAchievementNotification(achievement) {
    const notification = document.createElement('div');
    notification.className = 'notification achievement';
    notification.innerHTML = `
        <i class="fas ${achievement.icon}"></i>
        <p>Yeni Başarı: ${achievement.title}</p>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
} 