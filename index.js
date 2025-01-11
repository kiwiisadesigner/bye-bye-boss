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

// 分享進度功能
async function shareProgress() {
    try {
        const { value: displayName, isDismissed } = await Swal.fire({
            title: '請輸入你的暱稱',
            input: 'text',
            inputValue: '',
            inputPlaceholder: '匿名社畜',
            showCancelButton: true,
            confirmButtonText: '產生分享卡片',
            cancelButtonText: '取消',
            background: 'rgba(13, 12, 19, 0.95)',
            color: '#fff',
            confirmButtonColor: '#6D28D9',
            customClass: swalCustomClass
        });

        if (isDismissed) return;
        const name = displayName || '匿名社畜';

        Swal.fire({
            title: '正在生成分享卡片...',
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 600;   // Instagram 風格的寬高比
        canvas.height = 750;

        // 背景漸層
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#1a1b3c');
        gradient.addColorStop(1, '#2d1b4e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 等待字體載入
        await document.fonts.ready;
        await document.fonts.load('bold 48px "Noto Sans TC"');
        await document.fonts.load('normal 24px "Noto Sans TC"');

        // 添加磨砂玻璃效果的背景卡片
        const cardPadding = 40;
        const cardRadius = 20;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        roundRect(ctx, cardPadding, cardPadding, canvas.width - cardPadding * 2, canvas.height - cardPadding * 2, cardRadius);

        // 頂部標題區域
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        roundRect(ctx, cardPadding, cardPadding, canvas.width - cardPadding * 2, 100, cardRadius);

        const centerX = canvas.width / 2;

        // 標題和暱稱
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px "Noto Sans TC"';
        ctx.fillText('我的離職進度', centerX, cardPadding + 45);
        ctx.font = '20px "Noto Sans TC"';
        ctx.fillStyle = '#a78bfa';
        ctx.fillText(`${name} 的離職日記`, centerX, cardPadding + 75);

        // 等級顯示（大型）
        const lvText = `Lv.${game.data.level}`;
        ctx.font = 'bold 72px "Noto Sans TC"';
        const lvGradient = ctx.createLinearGradient(centerX - 80, 200, centerX + 80, 200);
        lvGradient.addColorStop(0, '#6D28D9');
        lvGradient.addColorStop(1, '#DB2777');
        ctx.fillStyle = lvGradient;
        ctx.fillText(lvText, centerX, 220);

        // 經驗值進度條（時尚風格）
        const barWidth = canvas.width - (cardPadding * 4);
        const barHeight = 12;
        const barY = 260;
        
        // 進度條背景
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        roundRect(ctx, cardPadding * 2, barY, barWidth, barHeight, barHeight / 2);
        
        // 進度條
        const expProgress = game.data.exp / game.data.expToNext;
        const expGradient = ctx.createLinearGradient(cardPadding * 2, 0, cardPadding * 2 + barWidth, 0);
        expGradient.addColorStop(0, '#6D28D9');
        expGradient.addColorStop(1, '#DB2777');
        ctx.fillStyle = expGradient;
        roundRect(ctx, cardPadding * 2, barY, barWidth * expProgress, barHeight, barHeight / 2);

        // 經驗值文字
        ctx.font = '18px "Noto Sans TC"';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`${game.data.exp} / ${game.data.expToNext}`, centerX, barY + 35);

        // 心情統計區域
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        roundRect(ctx, cardPadding * 2, 320, barWidth, 120, 15);

        // 心情標題
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px "Noto Sans TC"';
        ctx.fillText('今日心情', centerX, 355);

        // 心情數據
        const moodY = 400;
        const moodSpacing = 80;
        
        // 開心數據
        ctx.font = '36px "Noto Sans TC"';
        ctx.fillText('😊', centerX - moodSpacing, moodY);
        ctx.font = 'bold 32px "Noto Sans TC"';
        ctx.fillStyle = '#10B981';
        ctx.fillText(game.data.happyCount, centerX - moodSpacing, moodY + 40);

        // 分隔線
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(centerX - 1, moodY - 30, 2, 80);

        // 生氣數據
        ctx.font = '36px "Noto Sans TC"';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('😡', centerX + moodSpacing, moodY);
        ctx.font = 'bold 32px "Noto Sans TC"';
        ctx.fillStyle = '#EF4444';
        ctx.fillText(game.data.angryCount, centerX + moodSpacing, moodY + 40);

        // 壓力指數區域
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        roundRect(ctx, cardPadding * 2, 470, barWidth, 120, 15);

        // 壓力標題和數值
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px "Noto Sans TC"';
        ctx.fillText('壓力指數', centerX, 505);
        ctx.font = 'bold 48px "Noto Sans TC"';
        ctx.fillText(`${(game.data.stress / GAME_CONFIG.MAX_STRESS * 100).toFixed(1)}%`, centerX, 560);

        // 底部資訊
        ctx.font = '20px "Noto Sans TC"';
        ctx.fillStyle = '#a78bfa';
        ctx.fillText('掃描 QR Code 開始你的離職之旅', centerX, canvas.height - 60);

        // 生成圖片
        const imageUrl = canvas.toDataURL('image/png');

        // 關閉載入提示
        Swal.close();
        
        // 創建按鈕容器
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'share-buttons';
        buttonContainer.innerHTML = `
            <button class="share-btn copy-btn" onclick="copyImage()">
                複製圖片
            </button>
            <button class="share-btn download-btn" onclick="downloadImage()">
                下載圖片
            </button>
            <button class="share-btn instagram-story-btn" onclick="shareToInstagramStory()">
                分享到 IG 限時動態
            </button>
        `;

        // 更新按鈕樣式
        const style = document.createElement('style');
        style.textContent = `
            .share-buttons {
                display: flex;
                gap: 12px;
                margin-top: 20px;
                justify-content: center;
            }
            
            .share-btn {
                padding: 12px 24px;
                border-radius: 8px;
                border: none;
                cursor: pointer;
                font-weight: bold;
                transition: all 0.2s;
            }
            
            .share-btn:hover {
                transform: translateY(-2px);
                opacity: 0.9;
            }
            
            .instagram-story-btn {
                background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
                color: white;
            }
            
            .download-btn {
                background: #6D28D9;
                color: white;
            }
            
            .copy-btn {
                background: #4F46E5;
                color: white;
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(buttonContainer);

        // Instagram 限時動態分享功能
        window.shareToInstagramStory = async function() {
            try {
                const imageBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
                const filesArray = [
                    new File([imageBlob], 'resignation-progress.png', {
                        type: 'image/png'
                    })
                ];
                
                if (navigator.share && navigator.canShare({ files: filesArray })) {
                    await navigator.share({
                        files: filesArray,
                    });
                    document.body.removeChild(buttonContainer);
                    document.head.removeChild(style);
                } else {
                    // 備用方案：下載圖片
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
        };

        setTimeout(async () => {
            const result = await Swal.fire({
                imageUrl,
                imageWidth: 400,
                imageAlt: '離職進度分享卡片',
                title: '分享卡片已生成',
                showDenyButton: true,
                showCancelButton: true,
                confirmButtonText: '儲存圖片',
                denyButtonText: '複製圖片',
                cancelButtonText: '分享到 IG 限時動態',
                background: 'rgba(13, 12, 19, 0.95)',
                color: '#fff',
                confirmButtonColor: '#6D28D9',
                denyButtonColor: '#4F46E5',
                cancelButtonColor: '#E1306C',
                customClass: swalCustomClass,
                allowOutsideClick: false
            });

            if (result.isConfirmed) {
                try {
                    // 檢查是否為移動設備
                    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                    
                    if (isMobile) {
                        // 移動設備：使用 Blob URL
                        const blob = await fetch(imageUrl).then(r => r.blob());
                        const blobUrl = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = blobUrl;
                        a.download = '離職進度.png';
                        a.style.display = 'none';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(blobUrl);
                        
                        // 顯示提示
                        Swal.fire({
                            title: '圖片已準備好',
                            text: '請在彈出的選項中選擇「儲存圖片」',
                            icon: 'success',
                            background: 'rgba(13, 12, 19, 0.95)',
                            color: '#fff',
                            confirmButtonColor: '#6D28D9',
                            customClass: swalCustomClass
                        });
                    } else {
                        // 桌面設備：直接下載
                        const a = document.createElement('a');
                        a.href = imageUrl;
                        a.download = '離職進度.png';
                        a.style.display = 'none';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        
                        // 顯示成功提示
                        Swal.fire({
                            title: '儲存成功',
                            text: '圖片已儲存到你的下載資料夾',
                            icon: 'success',
                            background: 'rgba(13, 12, 19, 0.95)',
                            color: '#fff',
                            confirmButtonColor: '#6D28D9',
                            customClass: swalCustomClass
                        });
                    }
                } catch (error) {
                    console.error('儲存圖片失敗:', error);
                    Swal.fire({
                        title: '儲存失敗',
                        text: '請稍後再試',
                        icon: 'error',
                        background: 'rgba(13, 12, 19, 0.95)',
                        color: '#fff',
                        confirmButtonColor: '#6D28D9',
                        customClass: swalCustomClass
                    });
                }
            } else if (result.isDenied) {
                try {
                    const blob = await fetch(imageUrl).then(r => r.blob());
                    await navigator.clipboard.write([
                        new ClipboardItem({ [blob.type]: blob })
                    ]);
                    Swal.fire({
                        title: '已複製到剪貼簿',
                        icon: 'success',
                        background: 'rgba(13, 12, 19, 0.95)',
                        color: '#fff',
                        confirmButtonColor: '#6D28D9',
                        customClass: swalCustomClass
                    });
                } catch (error) {
                    console.error('複製圖片失敗:', error);
                    Swal.fire({
                        title: '複製失敗',
                        text: '請使用下載圖片的方式',
                        icon: 'error',
                        background: 'rgba(13, 12, 19, 0.95)',
                        color: '#fff',
                        confirmButtonColor: '#6D28D9',
                        customClass: swalCustomClass
                    });
                }
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                // 處理 Instagram 限時動態分享
                try {
                    const imageBlob = await fetch(imageUrl).then(r => r.blob());
                    const filesArray = [
                        new File([imageBlob], 'resignation-progress.png', {
                            type: 'image/png'
                        })
                    ];
                    
                    // 檢查是否為移動設備
                    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                    
                    if (isMobile) {
                        // 嘗試直接開啟 Instagram Stories
                        const instagramUrl = `instagram-stories://share`;
                        window.location.href = instagramUrl;
                        
                        // 延遲一下再觸發檔案選擇
                        setTimeout(async () => {
                            if (navigator.share && navigator.canShare({ files: filesArray })) {
                                try {
                                    await navigator.share({
                                        files: filesArray,
                                    });
                                } catch (error) {
                                    // 如果分享失敗，提供備用方案
                                    const blobUrl = URL.createObjectURL(imageBlob);
                                    const a = document.createElement('a');
                                    a.href = blobUrl;
                                    a.download = 'resignation-progress.png';
                                    a.click();
                                    URL.revokeObjectURL(blobUrl);
                                    
                                    Swal.fire({
                                        title: '請手動分享',
                                        text: '圖片已儲存，請開啟 Instagram 並選擇此圖片發布限時動態',
                                        icon: 'info',
                                        background: 'rgba(13, 12, 19, 0.95)',
                                        color: '#fff',
                                        confirmButtonColor: '#6D28D9',
                                        customClass: swalCustomClass
                                    });
                                }
                            } else {
                                // 不支援 Web Share API 的情況
                                const blobUrl = URL.createObjectURL(imageBlob);
                                const a = document.createElement('a');
                                a.href = blobUrl;
                                a.download = 'resignation-progress.png';
                                a.click();
                                URL.revokeObjectURL(blobUrl);
                                
                                Swal.fire({
                                    title: '請手動分享',
                                    text: '圖片已儲存，請開啟 Instagram 並選擇此圖片發布限時動態',
                                    icon: 'info',
                                    background: 'rgba(13, 12, 19, 0.95)',
                                    color: '#fff',
                                    confirmButtonColor: '#6D28D9',
                                    customClass: swalCustomClass
                                });
                            }
                        }, 500);
                    } else {
                        // 桌面設備：提供儲存選項
                        const url = URL.createObjectURL(imageBlob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'resignation-progress.png';
                        a.click();
                        URL.revokeObjectURL(url);
                        
                        Swal.fire({
                            title: '請使用手機分享',
                            text: '圖片已儲存，請在手機上開啟 Instagram 並選擇此圖片發布限時動態',
                            icon: 'info',
                            background: 'rgba(13, 12, 19, 0.95)',
                            color: '#fff',
                            confirmButtonColor: '#6D28D9',
                            customClass: swalCustomClass
                        });
                    }
                } catch (error) {
                    console.error('分享到 Instagram 時發生錯誤:', error);
                    Swal.fire({
                        title: '分享失敗',
                        text: '請稍後再試',
                        icon: 'error',
                        background: 'rgba(13, 12, 19, 0.95)',
                        color: '#fff',
                        confirmButtonColor: '#6D28D9',
                        customClass: swalCustomClass
                    });
                }
            }
        }, 100);

    } catch (error) {
        console.error('生成分享圖片時發生錯誤:', error);
        alert('生成分享圖片失敗，請稍後再試');
    }
}

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

// 進度條繪製函數
function drawProgressBar(ctx, x, y, width, height, progress, label, text, color1, color2) {
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

    // 如果有標籤和文字要顯示
    if (label || text) {
        ctx.font = '24px sans-serif';
        ctx.fillStyle = '#ffffff';
        if (label) {
            ctx.textAlign = 'left';
            ctx.fillText(label, x, y - 10);
        }
        if (text) {
            ctx.textAlign = 'right';
            ctx.fillText(text, x + width, y - 10);
        }
    }
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

// 升級時的特效
function showLevelUpEffect() {
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
async function resetGameData() {
    try {
        // 顯示確認對話框
        const result = await Swal.fire({
            title: '確定要重置所有進度？',
            text: '此操作將清除所有數據，且無法復原',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: '是的，清除所有進度',
            cancelButtonText: '取消',
            background: 'rgba(13, 12, 19, 0.95)',
            color: '#fff',
            customClass: swalCustomClass
        });

        // 如果用戶確認要重置
        if (result.isConfirmed) {
            // 重置遊戲數據到初始狀態
            game = {
                data: {
                    level: 1,
                    exp: 0,
                    expToNext: 1000, // 基礎經驗值
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

            // 清除所有本地存儲
            localStorage.clear();
            
            // 保存新的初始狀態
            saveGameState();
            
            // 更新 UI
            updateUI();

            // 顯示成功提示
            await Swal.fire({
                title: '重置成功',
                text: '所有進度已清除',
                icon: 'success',
                confirmButtonColor: '#6D28D9',
                background: 'rgba(13, 12, 19, 0.95)',
                color: '#fff',
                customClass: swalCustomClass
            });

            // 重新載入頁面
            window.location.reload();
        }
    } catch (error) {
        console.error('重置遊戲數據時發生錯誤:', error);
        // 顯示具體錯誤信息
        Swal.fire({
            title: '重置失敗',
            text: '發生錯誤：' + error.message,
            icon: 'error',
            confirmButtonColor: '#6D28D9',
            background: 'rgba(13, 12, 19, 0.95)',
            color: '#fff',
            customClass: swalCustomClass
        });
    }
}

// 保存遊戲狀態
function saveGameState() {
    try {
        localStorage.setItem('gameState', JSON.stringify(game.data));
    } catch (error) {
        console.error('保存遊戲狀態時發生錯誤:', error);
    }
}

// 確保函數在全局範圍可用
window.resetGameData = resetGameData;   