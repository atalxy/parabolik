document.addEventListener('DOMContentLoaded', () => {
    initializeMarketTabs();
    initializeTradingView();
    initializeMarketCharts();
    initializeMarketFilters();
    startLiveUpdates();
    loadExpertAnalyses();
});

// Piyasa sekmeleri
function initializeMarketTabs() {
    const tabs = document.querySelectorAll('.market-tab');
    const sections = document.querySelectorAll('.market-section');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetMarket = tab.dataset.market;
            
            // Aktif sekmeyi güncelle
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Aktif bölümü güncelle
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === `${targetMarket}-market`) {
                    section.classList.add('active');
                }
            });
        });
    });
}

// Piyasa filtreleri
function initializeMarketFilters() {
    const filters = document.querySelectorAll('.filter-btn');
    
    filters.forEach(filter => {
        filter.addEventListener('click', () => {
            const filterType = filter.dataset.filter;
            
            // Aktif filtreyi güncelle
            filters.forEach(f => f.classList.remove('active'));
            filter.classList.add('active');
            
            // Kartları filtrele
            filterMarketCards(filterType);
        });
    });
}

// Market kartlarını filtreleme
function filterMarketCards(filterType) {
    const cards = document.querySelectorAll('.market-card');
    
    cards.forEach(card => {
        const change = parseFloat(card.querySelector('.market-change').textContent);
        const volume = parseFloat(card.querySelector('.market-volume').textContent.replace(/[^0-9.-]+/g, ''));
        
        switch(filterType) {
            case 'gainers':
                card.style.display = change > 0 ? 'block' : 'none';
                break;
            case 'losers':
                card.style.display = change < 0 ? 'block' : 'none';
                break;
            case 'volume':
                // Hacme göre sırala
                const sortedCards = Array.from(cards).sort((a, b) => {
                    const volumeA = parseFloat(a.querySelector('.market-volume').textContent.replace(/[^0-9.-]+/g, ''));
                    const volumeB = parseFloat(b.querySelector('.market-volume').textContent.replace(/[^0-9.-]+/g, ''));
                    return volumeB - volumeA;
                });
                
                const container = cards[0].parentElement;
                sortedCards.forEach(card => container.appendChild(card));
                break;
            default:
                card.style.display = 'block';
        }
    });
}

// TradingView widget'ı
function initializeTradingView() {
    new TradingView.widget({
        "width": "100%",
        "height": 500,
        "symbol": "BINANCE:BTCUSDT",
        "interval": "D",
        "timezone": "Etc/UTC",
        "theme": "light",
        "style": "1",
        "locale": "tr",
        "toolbar_bg": "#f1f3f6",
        "enable_publishing": false,
        "allow_symbol_change": true,
        "container_id": "tradingview-widget"
    });
}

// Mini grafikler
function initializeMarketCharts() {
    const chartIds = [
        'btc-chart', 'eth-chart', 'bnb-chart',
        'usd-chart', 'eur-chart', 'gbp-chart',
        'thyao-chart', 'garan-chart', 'asels-chart'
    ];
    
    chartIds.forEach(id => {
        new TradingView.MiniWidget({
            "symbol": getSymbolForChart(id),
            "width": "100%",
            "height": 100,
            "locale": "tr",
            "dateRange": "1D",
            "colorTheme": "light",
            "trendLineColor": "rgba(41, 98, 255, 1)",
            "underLineColor": "rgba(41, 98, 255, 0.3)",
            "underLineBottomColor": "rgba(41, 98, 255, 0)",
            "isTransparent": false,
            "autosize": true,
            "container_id": id
        });
    });
}

// Grafik sembolleri
function getSymbolForChart(chartId) {
    const symbols = {
        // BIST Hisseleri
        'thyao-chart': 'BIST:THYAO',
        'garan-chart': 'BIST:GARAN',
        'asels-chart': 'BIST:ASELS',
        'akbnk-chart': 'BIST:AKBNK',
        'ykbnk-chart': 'BIST:YKBNK',
        'eregl-chart': 'BIST:EREGL',
        'kchol-chart': 'BIST:KCHOL',
        'sahol-chart': 'BIST:SAHOL',
        'tuprs-chart': 'BIST:TUPRS',
        'sise-chart': 'BIST:SISE',
        // ... diğer hisseler için benzer şekilde devam eder

        // Kripto Paralar
        'btc-chart': 'BINANCE:BTCUSDT',
        'eth-chart': 'BINANCE:ETHUSDT',
        'bnb-chart': 'BINANCE:BNBUSDT',
        'ada-chart': 'BINANCE:ADAUSDT',
        'doge-chart': 'BINANCE:DOGEUSDT',

        // Döviz
        'usd-chart': 'FX:USDTRY',
        'eur-chart': 'FX:EURTRY',
        'gbp-chart': 'FX:GBPTRY',
        'xau-chart': 'FX:XAUUSD',
        'xag-chart': 'FX:XAGUSD'
    };
    return symbols[chartId] || 'BIST:THYAO';
}

// Canlı fiyat güncellemeleri
function startLiveUpdates() {
    // Her 5 saniyede bir fiyatları güncelle
    setInterval(updatePrices, 5000);
    // Her 1 dakikada bir haberleri güncelle
    setInterval(updateNews, 60000);
    // Her 5 dakikada bir analizleri güncelle
    setInterval(loadExpertAnalyses, 300000);
}

async function updatePrices() {
    try {
        const prices = await fetchMarketPrices();
        updatePriceCards(prices);
        updateMarketStats(prices);
    } catch (error) {
        console.error('Fiyat güncelleme hatası:', error);
    }
}

// API'den fiyat verilerini çekme (manuel veri)
async function fetchMarketPrices() {
    // Güncel BIST verileri
    const bistData = {
        'THYAO': {
            price: 125.50,
            change: 1.5,
            volume: 2500000000,
            high: 128.00,
            low: 122.00,
            lastPrice: 125.50,
            lastRate: 1.5
        },
        'GARAN': {
            price: 85.75,
            change: -0.8,
            volume: 1000000000,
            high: 86.50,
            low: 84.50,
            lastPrice: 85.75,
            lastRate: -0.8
        },
        'ASELS': {
            price: 45.30,
            change: 2.1,
            volume: 750000000,
            high: 46.00,
            low: 44.50,
            lastPrice: 45.30,
            lastRate: 2.1
        },
        'AKBNK': {
            price: 32.45,
            change: 0.5,
            volume: 800000000,
            high: 33.00,
            low: 32.00,
            lastPrice: 32.45,
            lastRate: 0.5
        },
        'YKBNK': {
            price: 28.90,
            change: -1.2,
            volume: 600000000,
            high: 29.50,
            low: 28.50,
            lastPrice: 28.90,
            lastRate: -1.2
        },
        'EREGL': {
            price: 42.15,
            change: 1.8,
            volume: 1200000000,
            high: 43.00,
            low: 41.50,
            lastPrice: 42.15,
            lastRate: 1.8
        },
        'KCHOL': {
            price: 185.25,
            change: 0.9,
            volume: 1500000000,
            high: 187.00,
            low: 184.00,
            lastPrice: 185.25,
            lastRate: 0.9
        },
        'SAHOL': {
            price: 95.80,
            change: -0.5,
            volume: 900000000,
            high: 96.50,
            low: 95.00,
            lastPrice: 95.80,
            lastRate: -0.5
        },
        'TUPRS': {
            price: 165.40,
            change: 1.2,
            volume: 1800000000,
            high: 167.00,
            low: 164.00,
            lastPrice: 165.40,
            lastRate: 1.2
        },
        'SISE': {
            price: 38.25,
            change: -0.7,
            volume: 700000000,
            high: 39.00,
            low: 38.00,
            lastPrice: 38.25,
            lastRate: -0.7
        }
    };

    // Güncel kripto para verileri
    const cryptoData = {
        'BTCUSDT': {
            price: 1250000,
            change: 2.5,
            volume: 2500000000,
            high: 1280000,
            low: 1220000
        },
        'ETHUSDT': {
            price: 85000,
            change: 1.8,
            volume: 1500000000,
            high: 87000,
            low: 83000
        },
        'BNBUSDT': {
            price: 25000,
            change: -0.5,
            volume: 800000000,
            high: 25500,
            low: 24800
        },
        'ADAUSDT': {
            price: 1500,
            change: 3.2,
            volume: 500000000,
            high: 1550,
            low: 1450
        },
        'DOGEUSDT': {
            price: 850,
            change: -1.5,
            volume: 300000000,
            high: 880,
            low: 820
        }
    };

    // Güncel döviz verileri
    const forexData = {
        'USD/TRY': {
            price: 32.45,
            change: 0.8,
            volume: 0,
            high: 32.80,
            low: 32.20
        },
        'EUR/TRY': {
            price: 35.20,
            change: 0.5,
            volume: 0,
            high: 35.50,
            low: 35.00
        },
        'GBP/TRY': {
            price: 41.15,
            change: -0.3,
            volume: 0,
            high: 41.50,
            low: 40.90
        },
        'XAU/USD': {
            price: 2150.50,
            change: 1.2,
            volume: 0,
            high: 2160.00,
            low: 2140.00
        },
        'XAG/USD': {
            price: 24.80,
            change: 0.9,
            volume: 0,
            high: 25.00,
            low: 24.50
        }
    };

    return {
        ...bistData,
        ...cryptoData,
        ...forexData
    };
}

// Fiyat kartlarını güncelleme
function updatePriceCards(prices) {
    if (!prices || Object.keys(prices).length === 0) {
        console.error('Güncellenecek fiyat verisi bulunamadı');
        return;
    }

    for (const [symbol, data] of Object.entries(prices)) {
        const card = document.querySelector(`.market-card h4:contains('${symbol}')`)?.closest('.market-card');
        if (card) {
            const priceElement = card.querySelector('.price');
            const changeElement = card.querySelector('.market-change');
            const volumeElement = card.querySelector('.market-volume');
            
            if (priceElement) priceElement.textContent = `₺${data.price.toFixed(2)}`;
            if (changeElement) {
                changeElement.textContent = `${data.change > 0 ? '+' : ''}${data.change.toFixed(2)}%`;
                changeElement.className = `market-change ${data.change >= 0 ? 'positive' : 'negative'}`;
            }
            if (volumeElement) volumeElement.textContent = `Hacim: $${(data.volume / 1000000).toFixed(1)}M`;
        }
    }
}

// Market istatistiklerini güncelleme
function updateMarketStats(prices) {
    for (const [symbol, data] of Object.entries(prices)) {
        const card = document.querySelector(`.market-card h4:contains('${symbol}')`).closest('.market-card');
        if (card) {
            const statsContainer = card.querySelector('.market-stats');
            if (statsContainer) {
                statsContainer.innerHTML = `
                    <div class="stat">
                        <span class="label">24s Yüksek</span>
                        <span class="value">₺${data.high.toFixed(2)}</span>
                    </div>
                    <div class="stat">
                        <span class="label">24s Düşük</span>
                        <span class="value">₺${data.low.toFixed(2)}</span>
                    </div>
                `;
            }
        }
    }
}

// Haberleri güncelleme
async function updateNews() {
    try {
        const news = await fetchMarketNews();
        updateNewsCards(news);
    } catch (error) {
        console.error('Haber güncelleme hatası:', error);
    }
}

// API'den haber verilerini çekme (simülasyon)
async function fetchMarketNews() {
    // Gerçek uygulamada bu kısım gerçek API çağrılarıyla değiştirilecek
    return {
        'BTC/USDT': [
            'Bitcoin ETF onayı beklentisi fiyatları yukarı taşıyor',
            'Kripto piyasası günlük işlem hacmi rekor kırıyor'
        ],
        'THYAO': [
            'THY, yeni uçak siparişlerini açıkladı',
            'Yolcu sayısı geçen yılın aynı dönemine göre %25 arttı'
        ],
        // Diğer varlıklar için benzer haberler...
    };
}

// Haber kartlarını güncelleme
function updateNewsCards(news) {
    for (const [symbol, newsItems] of Object.entries(news)) {
        const card = document.querySelector(`.market-card h4:contains('${symbol}')`).closest('.market-card');
        if (card) {
            const newsContainer = card.querySelector('.market-news');
            if (newsContainer) {
                const newsList = newsContainer.querySelector('.news-list');
                newsList.innerHTML = newsItems.map(item => `<li>${item}</li>`).join('');
            }
        }
    }
}

// Uzman analizlerini yükleme
async function loadExpertAnalyses() {
    try {
        const analyses = await fetchExpertAnalyses();
        updateAnalysisCards(analyses);
    } catch (error) {
        console.error('Analiz güncelleme hatası:', error);
    }
}

// API'den uzman analizlerini çekme (simülasyon)
async function fetchExpertAnalyses() {
    // Gerçek uygulamada bu kısım gerçek API çağrılarıyla değiştirilecek
    return [
        {
            expert: {
                name: 'Ahmet Yılmaz',
                title: 'Kıdemli Analist',
                avatar: 'https://example.com/expert1.jpg'
            },
            symbol: 'THYAO',
            analysis: {
                title: 'THYAO Teknik Analiz',
                indicators: {
                    rsi: 65,
                    macd: 'Alım',
                    bollinger: 'Orta Bant'
                },
                text: 'THYAO, teknik göstergelerde güçlü alım sinyalleri veriyor. RSI 65 seviyesinde ve MACD pozitif bölgede. Kısa vadede ₺130 hedefini görebiliriz.',
                targets: {
                    target: 130.00,
                    stop: 120.00
                }
            }
        },
        // Diğer analizler...
    ];
}

// Analiz kartlarını güncelleme
function updateAnalysisCards(analyses) {
    const container = document.querySelector('.analysis-grid');
    if (container) {
        container.innerHTML = analyses.map(analysis => `
            <div class="analysis-card">
                <div class="expert-info">
                    <img src="${analysis.expert.avatar}" alt="${analysis.expert.name}" class="expert-avatar">
                    <div>
                        <h4>${analysis.expert.name}</h4>
                        <span class="expert-title">${analysis.expert.title}</span>
                    </div>
                </div>
                <div class="analysis-content">
                    <h5>${analysis.analysis.title}</h5>
                    <div class="technical-indicators">
                        <div class="indicator">
                            <span class="label">RSI</span>
                            <span class="value">${analysis.analysis.indicators.rsi}</span>
                        </div>
                        <div class="indicator">
                            <span class="label">MACD</span>
                            <span class="value ${analysis.analysis.indicators.macd.toLowerCase()}">${analysis.analysis.indicators.macd}</span>
                        </div>
                        <div class="indicator">
                            <span class="label">Bollinger</span>
                            <span class="value">${analysis.analysis.indicators.bollinger}</span>
                        </div>
                    </div>
                    <p class="analysis-text">${analysis.analysis.text}</p>
                    <div class="analysis-targets">
                        <div class="target">
                            <span class="label">Hedef</span>
                            <span class="value">₺${analysis.analysis.targets.target.toFixed(2)}</span>
                        </div>
                        <div class="target">
                            <span class="label">Stop</span>
                            <span class="value">₺${analysis.analysis.targets.stop.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

// Kullanıcı menüsü
document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('user');
    window.location.href = 'auth.html';
});

// Kullanıcı adını güncelle
const user = JSON.parse(localStorage.getItem('user'));
if (user) {
    document.getElementById('user-name').textContent = `Hoş Geldiniz, ${user.name}`;
} 