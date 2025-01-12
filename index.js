// 遊戲配置常數
const GAME_CONFIG = {
    MAX_LEVEL: 20,
    BASE_EXP: 1000,
    EXP_GROWTH: 1000,  // 每級增加的經驗值
    MAX_STRESS: 1000,
    ACTIONS: {
        'overtime': { stress: 15, exp: 150, mood: 'angry', label: '加班' },
        'scolded': { stress: 20, exp: 200, mood: 'angry', label: '被罵' },
        'meeting': { stress: 10, exp: 120, mood: 'angry', label: '會議' },
        'shocked': { stress: 12, exp: 150, mood: 'angry', label: '被雷' },
        'salary': { stress: -30, exp: 250, mood: 'happy', label: '發薪' },
        'bonus': { stress: -25, exp: 200, mood: 'happy', label: '獎金' },
        'promotion': { stress: -40, exp: 350, mood: 'happy', label: '升職' },
        'vacation': { stress: -35, exp: 300, mood: 'happy', label: '休假' }
    },
    TITLES: [
        { level: 1, name: '職場新鮮人' },
        { level: 5, name: '資深社畜' },
        { level: 10, name: '離職工程師' },
        { level: 15, name: '離職大師' },
        { level: 20, name: '離職之神' }
    ]
};

// 離職小語數據
const quotes = [
    '加班不是我工作能力差，是你工作分配有問題',
    '工作要確實，離職要即時',
    '如果是欣梅爾，也會離職的',
    '工作教會我的第一課是 deadline，第二課是如何假裝它不存在',
    '我們是一個團隊的意思是，你要幫忙加班，而別人已經下班了',
    '我的工作分兩部分：在會議裡浪費時間，和用剩下的時間補救浪費掉的進度',
    '對老闆來說，5分鐘能完成的事情，可能只是需要我重寫整個系統',
    '一個人要同時扮演專案經理、設計師、工程師，唯一缺的就是一個醫生',
    '工作中最大的壓力來自兩方面：白癡同事的行為，和我無法直接指出來',
    '你看到那邊那台法拉利了嗎？只要你今年也維持每週70小時的工時，明年你老闆就可以買得起了',
    '算我求你了，我想下班',
    '吃了下午茶，就更有力氣加班了',
    '為了避免同仁拿到年終就離職，今年我們就不發了',
    '別人能者多勞，你就能者過勞',
    '三分我努力，七分主管定，剩下九十靠親戚',
    '工作只有你名字，升遷不關你的事'
];

let currentQuoteIndex = 0;

// 更新離職小語顯示
function updateQuote() {
    const quoteElement = document.querySelector('.quote-text');
    if (quoteElement) {
        // 隨機選擇一句，但避免重複
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * quotes.length);
        } while (newIndex === currentQuoteIndex);
        
        currentQuoteIndex = newIndex;
        quoteElement.textContent = quotes[currentQuoteIndex];
    }
}

// 初始化並設定定時器
function initQuotes() {
    updateQuote(); // 初始顯示
    setInterval(updateQuote, 5000); // 每5秒更新一次
}

// DOM 載入完成後初始化
document.addEventListener('DOMContentLoaded', initQuotes);

// 自定義 SweetAlert2 主題
const swalCustomClass = {
    popup: 'gradient-border-card',
    confirmButton: 'gradient-border-button',
    cancelButton: 'gradient-border-button',
    denyButton: 'gradient-border-button',
    actions: 'swal-actions',
    input: 'share-input'
};

// 初始化遊戲實例
let game;

// 事件監聽器和初始化
document.addEventListener('DOMContentLoaded', () => {
    // 初始化遊戲
    game = new GameState();
    
    // 綁定按鈕事件
    document.querySelectorAll('.action-button-wrapper').forEach(button => {
        button.addEventListener('click', (e) => {
            const action = e.currentTarget.dataset.action;
            if (action) {
                game.update(action);
            }
        });
    });

    // 綁定離職小語按鈕
    const prevButton = document.querySelector('.quote-nav-prev');
    const nextButton = document.querySelector('.quote-nav-next');
    if (prevButton) prevButton.addEventListener('click', () => updateQuote('prev'));
    if (nextButton) nextButton.addEventListener('click', () => updateQuote('next'));

    // 初始化離職小語
    updateQuote();
    
    // 綁定分享按鈕事件
    const shareButton = document.querySelector('.share-button');
    if (shareButton) {
        shareButton.addEventListener('click', shareProgress);
    }
    
    // 設置自動輪播
    setInterval(() => updateQuote('next'), 5000);

    // 建立星星背景
    createStars();

    updateUI();
});

// 遊戲狀態管理
class GameState {
    constructor() {
        this.data = this.loadGameState() || this.getInitialState();
        this.validateState();
        this.domElements = this.cacheDOMElements();
        this.updateUI();
    }

    // 初始狀態
    getInitialState() {
        return {
            level: 1,
            exp: 0,
            expToNext: GAME_CONFIG.BASE_EXP,
            stress: 0,
            happyCount: 0,
            angryCount: 0
        };
    }

    // 載入遊戲狀態
    loadGameState() {
        try {
            const savedState = localStorage.getItem('resignGameState');
            return savedState ? JSON.parse(savedState) : null;
        } catch (error) {
            console.error('載入遊戲狀態失敗:', error);
            return null;
        }
    }

    // 驗證並修正遊戲狀態
    validateState() {
        this.data.level = Math.min(Math.max(1, this.data.level), GAME_CONFIG.MAX_LEVEL);
        this.data.exp = Math.max(0, this.data.exp);
        this.data.stress = Math.min(Math.max(0, this.data.stress), GAME_CONFIG.MAX_STRESS);
        this.data.expToNext = GAME_CONFIG.BASE_EXP + (this.data.level - 1) * GAME_CONFIG.EXP_GROWTH;
        this.data.happyCount = Math.max(0, this.data.happyCount);
        this.data.angryCount = Math.max(0, this.data.angryCount);
    }

    // 緩存 DOM 元素
    cacheDOMElements() {
        return {
            level: document.getElementById('levelDisplay'),
            expBar: document.getElementById('expBar'),
            expCurrent: document.getElementById('expCurrent'),
            expTotal: document.getElementById('expTotal'),
            expToNext: document.getElementById('expToNext'),
            stressValue: document.getElementById('stressValue'),
            stressBar: document.getElementById('stressBar'),
            happyCount: document.getElementById('happyCount'),
            angryCount: document.getElementById('angryCount'),
            titleDisplay: document.getElementById('titleDisplay')
        };
    }

    // 更新遊戲狀態
    update(action) {
        const actionConfig = GAME_CONFIG.ACTIONS[action];
        if (!actionConfig) return;

        // 更新壓力值
        this.data.stress = Math.max(0, Math.min(
            GAME_CONFIG.MAX_STRESS,
            this.data.stress + actionConfig.stress
        ));

        // 更新心情計數
        if (actionConfig.mood === 'happy') {
            this.data.happyCount++;
        } else {
            this.data.angryCount++;
        }

        // 更新經驗值和等級
        this.addExperience(actionConfig.exp);

        // 更新 UI
        this.updateUI();
        this.saveGameState();
        this.showFloatingNumber(actionConfig.stress, actionConfig.exp);
    }

    // 增加經驗值
    addExperience(exp) {
        this.data.exp += exp;
        while (this.data.exp >= this.data.expToNext && this.data.level < GAME_CONFIG.MAX_LEVEL) {
            this.levelUp();
        }
    }

    // 升級處理
    levelUp() {
        this.data.exp -= this.data.expToNext;
        this.data.level++;
        this.data.expToNext = GAME_CONFIG.BASE_EXP + (this.data.level - 1) * GAME_CONFIG.EXP_GROWTH;
        this.showLevelUpEffect();
        this.updateTitle();

        // 顯示升級提示
        Swal.fire({
            title: `升級！`,
            text: `恭喜達到 Lv.${this.data.level}`,
            icon: 'success',
            background: 'rgba(13, 12, 19, 0.95)',
            color: '#fff',
            confirmButtonColor: '#6D28D9'
        });

        updateUI();
    }

    // 更新職稱
    updateTitle() {
        const title = GAME_CONFIG.TITLES
            .slice()
            .reverse()
            .find(title => this.data.level >= title.level);
        
        if (title && this.domElements.titleDisplay) {
            this.domElements.titleDisplay.textContent = title.name;
        }
    }

    // 更新 UI 顯示
    updateUI() {
        requestAnimationFrame(() => {
            const elements = this.domElements;
            
            // 更新等級
            if (elements.level) {
                elements.level.textContent = this.data.level;
            }

            // 更新經驗值
            if (elements.expBar) {
                const expPercentage = (this.data.exp / this.data.expToNext) * 100;
                elements.expBar.style.width = `${expPercentage}%`;
            }
            if (elements.expCurrent) elements.expCurrent.textContent = this.data.exp;
            if (elements.expTotal) elements.expTotal.textContent = this.data.expToNext;
            if (elements.expToNext) {
                elements.expToNext.textContent = this.data.expToNext - this.data.exp;
            }

            // 更新壓力值
            if (elements.stressValue) {
                elements.stressValue.textContent = 
                    `${((this.data.stress / GAME_CONFIG.MAX_STRESS) * 100).toFixed(1)}%`;
            }
            if (elements.stressBar) {
                const stressPercentage = (this.data.stress / GAME_CONFIG.MAX_STRESS) * 100;
                elements.stressBar.style.width = `${stressPercentage}%`;
                
                // 更新壓力條顏色
                if (stressPercentage > 75) {
                    elements.stressBar.style.background = 'linear-gradient(90deg, #ef4444, #dc2626)';
                } else if (stressPercentage > 50) {
                    elements.stressBar.style.background = 'linear-gradient(90deg, #f59e0b, #d97706)';
                } else {
                    elements.stressBar.style.background = 'linear-gradient(90deg, #6D28D9, #DB2777)';
                }
            }

            // 更新心情計數
            if (elements.happyCount) elements.happyCount.textContent = this.data.happyCount;
            if (elements.angryCount) elements.angryCount.textContent = this.data.angryCount;
        });
    }

    // 保存遊戲狀態
    saveGameState() {
        try {
            localStorage.setItem('resignGameState', JSON.stringify(this.data));
        } catch (error) {
            console.error('保存遊戲狀態失敗:', error);
        }
    }

    // 顯示浮動數字效果
    showFloatingNumber(stress, exp) {
        const container = document.createElement('div');
        container.className = 'floating-numbers';
        container.style.cssText = `
            position: fixed;
            left: 50%;
            top: 20%;
            transform: translate(-50%, -50%);
            pointer-events: none;
            z-index: 999;
        `;

        const createFloatingElement = (value, type) => {
            const element = document.createElement('div');
            element.className = `floating-number ${type}`;
            element.textContent = `${value > 0 ? '+' : ''}${value} ${type === 'stress' ? '壓力' : '經驗'}`;
            element.style.cssText = `
                background-color: rgba(13, 12, 19, 0.8);
                padding: 8px 16px;
                border-radius: 8px;
                margin: 5px;
                border: 2px solid ${type === 'stress' ? 
                    (value > 0 ? '#ef4444' : '#22c55e') : 
                    '#a78bfa'};
                animation: floatUp 1s ease-out forwards;
            `;
            return element;
        };

        container.appendChild(createFloatingElement(stress, 'stress'));
        container.appendChild(createFloatingElement(exp, 'exp'));
        document.body.appendChild(container);

        setTimeout(() => container.remove(), 1000);
    }

    // 顯示升級特效
    showLevelUpEffect() {
        const container = document.createElement('div');
        container.className = 'level-up-effect';
        document.body.appendChild(container);
        
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'level-particle';
            particle.style.setProperty('--angle', `${Math.random() * 360}deg`);
            particle.style.setProperty('--distance', `${100 + Math.random() * 100}px`);
            container.appendChild(particle);
        }
        
        setTimeout(() => {
            container.remove();
        }, 2000);
    }
}

// 更新離職小語
function updateQuote(direction = 'next') {
    const quoteElement = document.querySelector('.quote-text');
    if (!quoteElement) return;

    if (direction === 'next') {
        currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
    } else {
        currentQuoteIndex = (currentQuoteIndex - 1 + quotes.length) % quotes.length;
    }
    
    // 添加淡出效果
    quoteElement.style.opacity = '0';
    
    setTimeout(() => {
        quoteElement.textContent = quotes[currentQuoteIndex];
        // 添加淡入效果
        quoteElement.style.opacity = '1';
    }, 300);
}

// 切換到上一句
function previousQuote() {
    console.log('切換到上一句'); // 調試日誌
    currentQuoteIndex = (currentQuoteIndex - 1 + quotes.length) % quotes.length;
    const quoteElement = document.querySelector('.quote-text');
    if (quoteElement) {
        quoteElement.textContent = quotes[currentQuoteIndex];
    }
}

// 切換到下一句
function nextQuote() {
    console.log('切換到下一句'); // 調試日誌
    currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
    const quoteElement = document.querySelector('.quote-text');
    if (quoteElement) {
        quoteElement.textContent = quotes[currentQuoteIndex];
    }
}

// 確保函數在全局範圍可用
window.previousQuote = previousQuote;
window.nextQuote = nextQuote;

// 設置自動輪播
let quoteInterval = setInterval(() => updateQuote('next'), 5000);

// 繪製進度條函數
function drawProgressBar(ctx, x, y, width, height, progress, color1, color2) {
    // 繪製進度條背景
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(x, y, width, height);

    // 繪製進度條
    const gradient = ctx.createLinearGradient(x, y, x + width, y);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width * progress, height);

    // 繪製進度條邊框
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
}

// 生成分享卡片函數
async function generateShareCard(nickname) {
    console.log('開始生成分享卡片');
    
    // 創建 canvas，使用 Instagram Stories 的標準尺寸
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 1080;   // IG Stories 標準寬度
    canvas.height = 1920;  // IG Stories 標準高度

    // 設置背景
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a1631');
    gradient.addColorStop(1, '#0f0c1d');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 調整所有元素的位置和大小以適應新尺寸
    ctx.textAlign = 'center';

    // 添加標題
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 72px sans-serif';
    ctx.fillText('我的離職進度', canvas.width/2, 200);

    // 添加暱稱
    ctx.font = '40px sans-serif';
    ctx.fillStyle = '#a78bfa';
    ctx.fillText(`${nickname} 的離職日記`, canvas.width/2, 280);

    // 添加等級
    ctx.font = 'bold 144px sans-serif';
    ctx.fillStyle = '#a855f7';
    ctx.fillText(`Lv.${game.data.level}`, canvas.width/2, 600);

    // 添加經驗值進度條
    const expProgress = game.data.exp / game.data.expToNext;
    drawProgressBar(
        ctx,
        240, // x
        630, // y
        600, // width
        20,  // height
        expProgress,
        '#a855f7', // 漸層色1
        '#d8b4fe'  // 漸層色2
    );
    
    // 添加經驗值文字
    ctx.font = '48px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${game.data.exp} / ${game.data.expToNext}`, canvas.width/2, 700);

    // 添加今日心情
    ctx.font = 'bold 64px sans-serif';
    ctx.fillText('今日心情', canvas.width/2, 900);
    
    // 添加表情符號和數字
    ctx.font = '56px sans-serif';
    ctx.fillStyle = '#22c55e';
    ctx.fillText(`😊 ${game.data.happyCount}`, canvas.width/2 - 120, 1000);
    ctx.fillStyle = '#ef4444';
    ctx.fillText(`😠 ${game.data.angryCount}`, canvas.width/2 + 120, 1000);

    // 添加壓力指數標題
    ctx.font = 'bold 64px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('壓力指數', canvas.width/2, 1200);

    // 添加壓力指數進度條
    const stressProgress = game.data.stress / GAME_CONFIG.MAX_STRESS;
    drawProgressBar(
        ctx,
        240, // x
        1250, // y
        600, // width
        20,  // height
        stressProgress,
        '#ef4444', // 漸層色1
        '#f87171'  // 漸層色2
    );

    // 添加壓力指數數值
    ctx.font = 'bold 120px sans-serif';
    const stressPercentage = (stressProgress * 100).toFixed(1);
    ctx.fillText(`${stressPercentage}%`, canvas.width/2, 1400);

    try {
        // 生成 QR Code
        const qrCodeUrl = await QRCode.toDataURL('https://byebyeboss.xyz', {
            width: 200,
            height: 200,
            margin: 1,
            color: {
                dark: '#ffffff',
                light: '#13111C'
            }
        });

        // 添加 QR Code
        const qrImage = new Image();
        await new Promise((resolve, reject) => {
            qrImage.onload = resolve;
            qrImage.onerror = reject;
            qrImage.src = qrCodeUrl;
        });
        
        const qrSize = 200;
        const qrX = (canvas.width - qrSize) / 2;
        const qrY = canvas.height - qrSize - 100;
        ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

        // 添加掃描提示
        ctx.font = '40px sans-serif';
        ctx.fillStyle = '#a78bfa';
        ctx.fillText('掃描 QR Code 開始你的離職之旅', canvas.width/2, canvas.height - 40);

    } catch (error) {
        console.error('QR Code 生成失敗:', error);
    }

    return canvas.toDataURL('image/png');
}

// 分享進度函數
async function shareProgress() {
    try {
        console.log('開始分享進度');
        
        // 詢問暱稱，如果取消則使用預設值
        const { value: nickname, isDismissed } = await Swal.fire({
            title: '分享你的離職進度',
            input: 'text',
            inputLabel: '你的暱稱',
            inputPlaceholder: '請輸入暱稱',
            inputValue: '匿名社畜', // 預設值
            showCancelButton: true,
            confirmButtonText: '下一步',
            cancelButtonText: '取消',
            background: 'rgba(13, 12, 19, 0.95)',
            color: '#fff',
            confirmButtonColor: '#6D28D9',
            inputAttributes: {
                autocomplete: 'off',
                autofocus: true
            }
        });

        // 如果用戶點擊取消，則直接返回
        if (isDismissed) return;

        // 使用輸入的暱稱或預設值
        const finalNickname = nickname || '匿名社畜';
        console.log('生成分享卡片，暱稱:', finalNickname);
        
        // 生成分享卡片
        const shareImage = await generateShareCard(finalNickname);
        
        // 顯示預覽
        const result = await Swal.fire({
            title: '分享卡片預覽',
            imageUrl: shareImage,
            imageWidth: 540,  // 保持 9:16 的比例但縮小尺寸以適應螢幕
            imageHeight: 960,
            background: 'rgba(13, 12, 19, 0.95)',
            color: '#fff',
            confirmButtonText: '下載圖片',
            confirmButtonColor: '#6D28D9',
            showCancelButton: true,
            cancelButtonText: '取消'
        });

        if (result.isConfirmed) {
            // 下載圖片
            const link = document.createElement('a');
            link.download = '離職進度分享.png';
            link.href = shareImage;
            link.click();
        }
    } catch (error) {
        console.error('分享進度時發生錯誤:', error);
        Swal.fire({
            title: '分享失敗',
            text: '無法生成分享圖片',
            icon: 'error',
            confirmButtonColor: '#6D28D9',
            background: 'rgba(13, 12, 19, 0.95)',
            color: '#fff'
        });
    }
}

// 確保函數在全局範圍可用
window.generateShareCard = generateShareCard;
window.shareProgress = shareProgress;

// 添加圓角矩形繪製函數
function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
}

// 添加星星背景
function createStars() {
    const stars = document.createElement('div');
    stars.className = 'stars';
    
    for (let i = 0; i < 100; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.width = `${Math.random() * 3}px`;
        star.style.height = star.style.width;
        star.style.setProperty('--duration', `${2 + Math.random() * 3}s`);
        star.style.setProperty('--opacity', `${0.5 + Math.random() * 0.5}`);
        stars.appendChild(star);
    }
    
    document.body.prepend(stars);
}

// 添加 Instagram Story 分享功能
async function shareToInstagramStory() {
    try {
        const canvas = await generateShareImage(); // 使用現有的圖片生成功能
        const imageBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        
        // 檢查是否支援 Web Share API 和 Instagram 分享
        if (navigator.share && navigator.canShare) {
            const filesArray = [
                new File([imageBlob], 'resignation-progress.png', {
                    type: 'image/png'
                })
            ];
            
            const shareData = {
                files: filesArray,
            };
            
            // 檢查是否可以分享文件
            if (navigator.canShare(shareData)) {
                await navigator.share(shareData);
            } else {
                // 如果不支援直接分享，提供下載選項
                const url = URL.createObjectURL(imageBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'resignation-progress.png';
                a.click();
                URL.revokeObjectURL(url);
                
                alert('請將圖片儲存後，手動分享到 Instagram 限時動態');
            }
        } else {
            // 不支援 Web Share API 時的備用方案
            const url = URL.createObjectURL(imageBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'resignation-progress.png';
            a.click();
            URL.revokeObjectURL(url);
            
            alert('請將圖片儲存後，手動分享到 Instagram 限時動態');
        }
    } catch (error) {
        console.error('分享到 Instagram 時發生錯誤:', error);
        alert('分享失敗，請稍後再試');
    }
}

// 定義稱號等級對應
const TITLES = [
    { level: 1, title: '職場新鮮人' },
    { level: 5, title: '職場老鳥' },
    { level: 10, title: '資深員工' },
    { level: 15, title: '職場達人' },
    { level: 20, title: '離職專家' },
    { level: 25, title: '離職大師' },
    { level: 30, title: '職場傳說' },
    { level: 40, title: '離職之王' },
    { level: 50, title: '自由靈魂' }
];

// 根據等級獲取稱號
function getTitleByLevel(level) {
    // 從高等級往低等級檢查，返回第一個符合的稱號
    for (let i = TITLES.length - 1; i >= 0; i--) {
        if (level >= TITLES[i].level) {
            return TITLES[i].title;
        }
    }
    return TITLES[0].title;
}

// 更新UI時更新稱號
function updateUI() {
    // 使用 class 選擇器
    const titleDisplay = document.querySelector('.title-badge');
    if (titleDisplay) {
        const currentTitle = getTitleByLevel(game.data.level);
        titleDisplay.textContent = currentTitle;
        console.log('當前等級:', game.data.level, '更新稱號為:', currentTitle); // 調試日誌
    } else {
        console.log('找不到稱號顯示元素'); // 調試日誌
    }
    
    // ... 其他 UI 更新代碼 ...
}

// 確保在遊戲載入和等級變化時都會更新稱號
document.addEventListener('DOMContentLoaded', () => {
    updateUI();
});

// 在等級提升時更新
function levelUp() {
    // ... 等級提升相關代碼 ...
    updateUI();
}

// 重置遊戲數據
function resetGameData() {
    console.log('重置函數被調用');
    
    // 直接使用 SweetAlert2
    Swal.fire({
        title: '確定要重置所有進度？',
        text: '此操作將清除所有數據，且無法復原',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#6b7280',
        confirmButtonText: '是的，清除所有進度',
        cancelButtonText: '取消',
        background: 'rgba(13, 12, 19, 0.95)',
        color: '#fff'
    }).then((result) => {
        if (result.isConfirmed) {
            console.log('用戶確認重置');
            
            // 清除所有本地存儲
            localStorage.clear();
            console.log('本地存儲已清除');
            
            // 重新載入頁面
            setTimeout(() => {
                window.location.reload(true);
            }, 100);
        }
    }).catch((error) => {
        console.error('重置過程出錯:', error);
        alert('重置失敗，請重試');
    });
}

// 直接在全局範圍綁定函數
window.resetGameData = resetGameData;

// DOM 載入完成後綁定事件
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM 載入完成');
    const resetButton = document.getElementById('resetButton');
    
    if (resetButton) {
        console.log('找到重置按鈕');
        resetButton.onclick = resetGameData;
    }
});

// 確保所有函數都在全局範圍內可用
window.game = {
    data: {
        level: 1,
        exp: 0,
        expToNext: 1000,
        stress: 0,
        stressMax: 100,
        happyCount: 0,
        angryCount: 0,
        lastStressReductionTime: null,
        lastDailyResetTime: null,
        dailyActions: {
            overtime: 0,
            meeting: 0,
            blame: 0,
            thunder: 0
        }
    }
};

// 重置遊戲數據函數
function resetGameData() {
    console.log('重置函數被調用');
    // ... 原有的重置邏輯 ...
}

// 初始化函數
function initializeGame() {
    console.log('初始化遊戲');
    // 綁定重置按鈕
    const resetButton = document.querySelector('.reset-btn');
    if (resetButton) {
        console.log('找到重置按鈕');
        resetButton.addEventListener('click', resetGameData);
    } else {
        console.error('未找到重置按鈕');
    }
}

// 在 DOM 載入完成後初始化
document.addEventListener('DOMContentLoaded', initializeGame);

// 確保函數在全局範圍可用
window.resetGameData = resetGameData;
window.initializeGame = initializeGame;   

// 全局重置處理函數
window.handleReset = function() {
    console.log('開始重置流程');
    
    Swal.fire({
        title: '確定要重置所有進度？',
        text: '此操作將清除所有數據，且無法復原',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#6b7280',
        confirmButtonText: '是的，清除所有進度',
        cancelButtonText: '取消',
        background: 'rgba(13, 12, 19, 0.95)',
        color: '#fff'
    }).then((result) => {
        if (result.isConfirmed) {
            try {
                // 清除所有遊戲數據
                game.data = {
                    level: 1,
                    exp: 0,
                    expToNext: 1000,
                    stress: 0,
                    stressMax: 100,
                    happyCount: 0,
                    angryCount: 0,
                    lastStressReductionTime: null,
                    lastDailyResetTime: null,
                    dailyActions: {
                        overtime: 0,
                        meeting: 0,
                        blame: 0,
                        thunder: 0
                    }
                };

                // 清除本地存儲
                localStorage.clear();
                console.log('數據已清除');

                // 顯示成功消息
                Swal.fire({
                    title: '重置成功！',
                    text: '頁面將重新載入',
                    icon: 'success',
                    confirmButtonColor: '#6D28D9'
                }).then(() => {
                    // 強制重新載入頁面
                    window.location.href = window.location.href + '?t=' + new Date().getTime();
                });
            } catch (error) {
                console.error('重置過程出錯:', error);
                Swal.fire({
                    title: '重置失敗',
                    text: '請重新整理頁面後再試',
                    icon: 'error',
                    confirmButtonColor: '#dc2626'
                });
            }
        }
    });
};

// 不再需要額外的事件監聽器
console.log('重置功能已初始化');   

// 簡單的重置函數
window.simpleReset = function() {
    if (confirm('確定要重置所有進度嗎？此操作無法復原')) {
        // 清除本地存儲
        localStorage.clear();
        
        // 直接重新載入頁面
        window.location.reload();
    }
};   