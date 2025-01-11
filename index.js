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

// 離職小語陣列
const quotesList = [
    "加班不是我工作能力差，是你工作分配有問題",
    "工作要確實，離職要即時",
    "如果是欣梅爾，也會離職的",
    "工作教會我的第一課是 deadline，第二課是如何假裝它不存在",
    "「我們是一個團隊」的意思是，你要幫忙加班，而別人已經下班了",
    "我的工作分兩部分：在會議裡浪費時間，和用剩下的時間補救浪費掉的進度",
    "對老闆來說，5分鐘能完成的事情，可能只是需要我重寫整個系統",
    "一個人要同時扮演專案經理、設計師、工程師，唯一缺的就是一個醫生",
    "工作中最大的壓力來自兩方面：白癡同事的行為，和我無法直接指出來",
    "你看到那邊那台法拉利了嗎？只要你今年也維持每週70小時的工時，明年你老闆就可以買得起了",
    "算我求你了，我想下班",
    "吃了下午茶，就更有力氣加班了",
    "為了避免同仁拿到年終就離職，今年我們就不發了",
    "別人能者多勞，你就能者過勞",
    "三分我努力，七分主管定，剩下九十靠親戚",
    "工作只有你名字，升遷不關你的事"
];

let currentQuoteIndex = 0;

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
    const prevButton = document.querySelector('.quote-prev');
    const nextButton = document.querySelector('.quote-next');
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
        currentQuoteIndex = (currentQuoteIndex + 1) % quotesList.length;
    } else {
        currentQuoteIndex = (currentQuoteIndex - 1 + quotesList.length) % quotesList.length;
    }
    
    // 添加淡出效果
    quoteElement.style.opacity = '0';
    
    setTimeout(() => {
        quoteElement.textContent = quotesList[currentQuoteIndex];
        // 添加淡入效果
        quoteElement.style.opacity = '1';
    }, 300);
}

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
        canvas.width = 1080;
        canvas.height = 1920;

        // 優化背景漸層，增加深度
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#0f0f2d');    // 更深的藍紫色
        gradient.addColorStop(0.5, '#1a1b3c');
        gradient.addColorStop(1, '#2d1b4e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 添加星星效果
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const radius = Math.random() * 2;
            const opacity = Math.random() * 0.5 + 0.5; // 提高星星亮度
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }

        await document.fonts.ready;
        await document.fonts.load('bold 96px "Noto Sans TC"');
        await document.fonts.load('normal 48px "Noto Sans TC"');

        const centerX = canvas.width / 2;
        const padding = 60;
        const cardY = canvas.height * 0.15;
        const cardHeight = canvas.height * 0.7;

        // 主卡片背景（增加透明度對比）
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';  // 降低背景透明度
        roundRect(ctx, padding, cardY, canvas.width - padding * 2, cardHeight, 30);

        // 頂部標題區域（增加對比度）
        const headerGradient = ctx.createLinearGradient(padding, cardY, canvas.width - padding, cardY);
        headerGradient.addColorStop(0, 'rgba(123, 58, 237, 0.8)');  // 更鮮豔的紫色
        headerGradient.addColorStop(1, 'rgba(236, 72, 153, 0.8)');  // 更鮮豔的粉色
        ctx.fillStyle = headerGradient;
        roundRect(ctx, padding, cardY, canvas.width - padding * 2, 140, 30);

        // 標題文字（增加對比度）
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 64px "Noto Sans TC"';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';  // 添加文字陰影
        ctx.shadowBlur = 10;
        ctx.fillText('我的離職進度', centerX, cardY + 70);
        ctx.shadowBlur = 0;

        // 暱稱（提高對比度）
        ctx.font = '36px "Noto Sans TC"';
        ctx.fillStyle = '#c4b5fd';  // 更亮的紫色
        ctx.fillText(`${name} 的離職日記`, centerX, cardY + 120);

        // 等級顯示（增強光暈效果）
        const lvY = cardY + 300;
        ctx.shadowColor = 'rgba(123, 58, 237, 0.5)';
        ctx.shadowBlur = 30;
        const lvText = `Lv.${game.data.level}`;
        ctx.font = 'bold 144px "Noto Sans TC"';
        const lvGradient = ctx.createLinearGradient(centerX - 150, lvY, centerX + 150, lvY);
        lvGradient.addColorStop(0, '#8b5cf6');
        lvGradient.addColorStop(1, '#ec4899');
        ctx.fillStyle = lvGradient;
        ctx.fillText(lvText, centerX, lvY);
        ctx.shadowBlur = 0;

        // 經驗值進度條（增強視覺效果）
        const barWidth = canvas.width - padding * 4;
        const barHeight = 20;
        const barY = lvY + 80;
        
        // 進度條背景
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        roundRect(ctx, padding * 2, barY, barWidth, barHeight, barHeight / 2);
        
        // 進度條（增加彩度）
        const expProgress = game.data.exp / game.data.expToNext;
        const expGradient = ctx.createLinearGradient(padding * 2, 0, padding * 2 + barWidth, 0);
        expGradient.addColorStop(0, '#8b5cf6');
        expGradient.addColorStop(1, '#ec4899');
        ctx.shadowColor = 'rgba(123, 58, 237, 0.5)';
        ctx.shadowBlur = 15;
        ctx.fillStyle = expGradient;
        roundRect(ctx, padding * 2, barY, barWidth * expProgress, barHeight, barHeight / 2);
        ctx.shadowBlur = 0;

        // 經驗值文字
        ctx.font = '32px "Noto Sans TC"';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`${game.data.exp} / ${game.data.expToNext}`, centerX, barY + 50);

        // 心情統計區域
        const moodY = barY + 150;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
        roundRect(ctx, padding * 2, moodY, barWidth, 180, 20);

        // 心情標題
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px "Noto Sans TC"';
        ctx.fillText('今日心情', centerX, moodY + 50);

        // 心情數據
        const emojiY = moodY + 120;
        const spacing = 160;

        // 開心數據
        ctx.font = '56px "Noto Sans TC"';
        ctx.fillText('😊', centerX - spacing, emojiY);
        ctx.font = 'bold 48px "Noto Sans TC"';
        ctx.fillStyle = '#34d399';
        ctx.fillText(game.data.happyCount.toString(), centerX - spacing, emojiY + 60);

        // 分隔線
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(centerX - 1, emojiY - 30, 2, 100);

        // 生氣數據
        ctx.font = '56px "Noto Sans TC"';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('😡', centerX + spacing, emojiY);
        ctx.font = 'bold 48px "Noto Sans TC"';
        ctx.fillStyle = '#f87171';
        ctx.fillText(game.data.angryCount.toString(), centerX + spacing, emojiY + 60);

        // 壓力指數區域
        const stressY = moodY + 230;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
        roundRect(ctx, padding * 2, stressY, barWidth, 180, 20);

        // 壓力標題
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px "Noto Sans TC"';
        ctx.fillText('壓力指數', centerX, stressY + 50);

        // 壓力數值
        const stressValue = (game.data.stress / GAME_CONFIG.MAX_STRESS * 100).toFixed(1);
        ctx.font = 'bold 72px "Noto Sans TC"';
        const stressGradient = ctx.createLinearGradient(centerX - 100, stressY + 120, centerX + 100, stressY + 120);
        stressGradient.addColorStop(0, '#8b5cf6');
        stressGradient.addColorStop(1, '#ec4899');
        ctx.fillStyle = stressGradient;
        ctx.fillText(`${stressValue}%`, centerX, stressY + 120);

        // 底部資訊（提高可讀性）
        ctx.font = '36px "Noto Sans TC"';
        ctx.fillStyle = '#c4b5fd';
        ctx.fillText('掃描 QR Code 開始你的離職之旅', centerX, canvas.height - 100);

        // 添加裝飾性圓點
        drawDecorativeDots(ctx, canvas.width, canvas.height);

        // 生成圖片
        const imageUrl = canvas.toDataURL('image/png');

        // 關閉載入提示
        Swal.close();
        
        setTimeout(async () => {
            const result = await Swal.fire({
                imageUrl,
                imageWidth: 400,
                imageAlt: '離職進度分享卡片',
                title: '分享卡片已生成',
                showDenyButton: true,
                showCancelButton: true,
                confirmButtonText: '下載圖片',
                denyButtonText: '分享到 Instagram',
                cancelButtonText: '取消',
                background: 'rgba(13, 12, 19, 0.95)',
                color: '#fff',
                confirmButtonColor: '#6D28D9',
                customClass: swalCustomClass
            });

            if (result.isConfirmed) {
                // 下載圖片
                const link = document.createElement('a');
                link.href = imageUrl;
                link.download = '離職進度.png';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else if (result.isDenied) {
                // 分享到 Instagram Stories
                try {
                    // 檢查是否在手機上
                    if (/Android|iPhone/i.test(navigator.userAgent)) {
                        // 轉換為 Blob
                        const response = await fetch(imageUrl);
                        const blob = await response.blob();
                        
                        // 使用 Web Share API
                        if (navigator.share) {
                            await navigator.share({
                                files: [new File([blob], '離職進度.png', { type: 'image/png' })]
                            });
                        } else {
                            throw new Error('此裝置不支援分享功能');
                        }
                    } else {
                        throw new Error('請使用手機開啟以分享到 Instagram');
                    }
                } catch (error) {
                    console.error('分享到 Instagram 失敗:', error);
                    Swal.fire({
                        title: '無法直接分享到 Instagram',
                        text: '請下載圖片後手動分享到 Instagram',
                        icon: 'info',
                        background: 'rgba(13, 12, 19, 0.95)',
                        color: '#fff',
                        confirmButtonColor: '#6D28D9',
                        customClass: swalCustomClass
                    });
                }
            }
        }, 100);

    } catch (error) {
        console.error('分享功能發生錯誤:', error);
        Swal.fire({
            title: '分享功能發生錯誤',
            text: '請稍後再試',
            icon: 'error',
            background: 'rgba(13, 12, 19, 0.95)',
            color: '#fff',
            confirmButtonColor: '#6D28D9',
            customClass: swalCustomClass
        });
    }
}

// 繪製統計卡片的輔助函數
function drawStatsCard(ctx, x, y, width, height, title, contentDrawer) {
    // 卡片背景
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    roundRect(ctx, x, y, width, height, 20);

    // 卡片標題
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px "Noto Sans TC"';
    ctx.textAlign = 'center';
    ctx.fillText(title, x + width / 2, y + 50);

    // 繪製內容
    contentDrawer();
}

// 添加裝飾性圓點
function drawDecorativeDots(ctx, width, height) {
    const dots = [
        { x: 100, y: 100, r: 3 },
        { x: width - 100, y: 100, r: 5 },
        { x: 100, y: height - 100, r: 4 },
        { x: width - 100, y: height - 100, r: 3 }
    ];

    dots.forEach(dot => {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
        ctx.fill();
    });
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