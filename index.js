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
        this.achievements = this.loadAchievements();
        this.checkAchievements();
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
        this.checkAchievements();
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

    loadAchievements() {
        return JSON.parse(localStorage.getItem('resignGameAchievements')) || {
            unlocked: [],
            lastCheck: null
        };
    }

    saveAchievements() {
        localStorage.setItem('resignGameAchievements', JSON.stringify(this.achievements));
    }

    checkAchievements() {
        Object.values(ACHIEVEMENTS).forEach(achievement => {
            if (!this.achievements.unlocked.includes(achievement.id) &&
                achievement.condition(this.data)) {
                this.unlockAchievement(achievement);
            }
        });
    }

    unlockAchievement(achievement) {
        this.achievements.unlocked.push(achievement.id);
        this.saveAchievements();
        
        // 添加經驗值獎勵
        this.addExperience(achievement.reward);
        
        // 顯示成就解鎖通知
        Swal.fire({
            title: '🏆 成就解鎖！',
            html: `
                <div class="achievement-unlock">
                    <div class="achievement-icon">${achievement.icon}</div>
                    <div class="achievement-name">${achievement.name}</div>
                    <div class="achievement-desc">${achievement.description}</div>
                    <div class="achievement-reward">獎勵: ${achievement.reward} 經驗值</div>
                </div>
            `,
            background: 'rgba(13, 12, 19, 0.95)',
            color: '#fff',
            confirmButtonColor: '#6D28D9'
        });
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
    
    // 創建一個較大的 canvas 以獲得更好的渲染質量
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 設定基礎尺寸
    const baseWidth = 1080;
    const baseHeight = 1920;
    
    // 設定實際渲染尺寸（2倍於基礎尺寸以確保清晰度）
    canvas.width = baseWidth;
    canvas.height = baseHeight;
    
    // 設定顯示尺寸
    canvas.style.width = `${baseWidth / 2}px`;
    canvas.style.height = `${baseHeight / 2}px`;

    // 設置背景
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a1631');
    gradient.addColorStop(1, '#0f0c1d');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 添加主要卡片背景
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    roundRect(ctx, 40, 40, canvas.width - 80, canvas.height - 80, 30);

    // 設定文字渲染
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 添加標題
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 84px "Noto Sans TC"';
    ctx.fillText('我的離職進度', canvas.width/2, 160);

    // 添加暱稱
    ctx.font = '42px "Noto Sans TC"';
    ctx.fillStyle = '#a78bfa';
    ctx.fillText(`${nickname} 的離職日記`, canvas.width/2, 240);

    // 添加等級
    const levelGradient = ctx.createLinearGradient(
        canvas.width/2 - 150, 400,
        canvas.width/2 + 150, 400
    );
    levelGradient.addColorStop(0, '#a855f7');
    levelGradient.addColorStop(1, '#DB2777');
    ctx.fillStyle = levelGradient;
    ctx.font = 'bold 160px "Noto Sans TC"';
    ctx.fillText(`Lv.${game.data.level}`, canvas.width/2, 400);

    // 繪製經驗值進度條
    const expBarWidth = canvas.width * 0.8;
    const expBarHeight = 12;
    const expBarY = 500;
    
    // 進度條背景
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    roundRect(ctx, (canvas.width - expBarWidth)/2, expBarY, expBarWidth, expBarHeight, 6);
    
    // 實際進度
    const expProgress = game.data.exp / game.data.expToNext;
    ctx.fillStyle = '#a855f7';
    roundRect(ctx, (canvas.width - expBarWidth)/2, expBarY, expBarWidth * expProgress, expBarHeight, 6);

    // 添加經驗值文字
    ctx.font = '48px "Noto Sans TC"';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${game.data.exp} / ${game.data.expToNext}`, canvas.width/2, expBarY + 60);

    // 添加今日心情區塊
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    roundRect(ctx, 80, 650, canvas.width - 160, 280, 20);
    
    // 今日心情標題
    ctx.font = 'bold 72px "Noto Sans TC"';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('今日心情', canvas.width/2, 740);
    
    // 添加表情符號和數字
    ctx.font = '64px "Noto Sans TC"';
    // 分隔線
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width/2, 800);
    ctx.lineTo(canvas.width/2, 860);
    ctx.stroke();
    
    ctx.fillStyle = '#22c55e';
    ctx.fillText(`😊 ${game.data.happyCount}`, canvas.width/2 - 150, 830);
    ctx.fillStyle = '#ef4444';
    ctx.fillText(`😠 ${game.data.angryCount}`, canvas.width/2 + 150, 830);

    // 添加壓力指數區塊
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    roundRect(ctx, 80, 980, canvas.width - 160, 280, 20);
    
    // 壓力指數標題
    ctx.font = 'bold 72px "Noto Sans TC"';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('壓力指數', canvas.width/2, 1070);

    // 壓力值百分比
    const stressPercentage = ((game.data.stress / GAME_CONFIG.MAX_STRESS) * 100).toFixed(1);
    ctx.font = 'bold 84px "Noto Sans TC"';
    ctx.fillStyle = '#ef4444';
    ctx.fillText(`${stressPercentage}%`, canvas.width/2, 1160);

    // 添加 QR Code
    const qrSize = 200;
    const qrCodeData = await generateQRCode('byebyeboss.xyz');
    ctx.drawImage(
        qrCodeData,
        (canvas.width - qrSize) / 2,
        1320,
        qrSize,
        qrSize
    );

    // 添加掃描提示
    ctx.font = '48px "Noto Sans TC"';
    ctx.fillStyle = '#a78bfa';
    ctx.fillText('掃描 QR Code 開始你的離職之旅', canvas.width/2, 1600);

    return canvas.toDataURL('image/png', 1.0); // 使用最高品質輸出
}

// 生成 QR Code 的輔助函數
function generateQRCode(url) {
    return new Promise((resolve) => {
        // 創建一個臨時的 div 來生成 QR code
        const tempDiv = document.createElement('div');
        tempDiv.style.display = 'none';
        document.body.appendChild(tempDiv);

        // 使用 qrcode.js 生成 QR code
        const qr = new QRCode(tempDiv, {
            text: url,
            width: 200,
            height: 200,
            colorDark: '#FFFFFF', // QR Code 顏色設為白色
            colorLight: '#00000000', // 背景設為透明
            correctLevel: QRCode.CorrectLevel.H
        });

        // 等待 QR code 生成完成
        setTimeout(() => {
            // 獲取 QR code 的圖片
            const qrImage = tempDiv.querySelector('img');
            
            // 創建一個臨時的 Image 對象
            const img = new Image();
            img.onload = () => {
                // 清理臨時元素
                document.body.removeChild(tempDiv);
                resolve(img);
            };
            img.src = qrImage.src;
        }, 100);
    });
}

// 分享進度函數
async function shareProgress() {
    try {
        console.log('開始分享進度');
        
        const { value: nickname, isDismissed } = await Swal.fire({
            title: '分享你的離職進度',
            input: 'text',
            inputLabel: '你的暱稱',
            inputPlaceholder: '請輸入暱稱',
            inputValue: '匿名社畜',
            showCancelButton: true,
            confirmButtonText: '下一步',
            cancelButtonText: '取消',
            background: 'rgba(13, 12, 19, 0.95)',
            color: '#fff',
            confirmButtonColor: '#6D28D9'
        });

        if (isDismissed) return;

        const finalNickname = nickname || '匿名社畜';
        const shareImage = await generateShareCard(finalNickname);
        
        // 修改預覽對話框，添加關閉按鈕
        const result = await Swal.fire({
            title: '分享卡片預覽',
            imageUrl: shareImage,
            imageWidth: 600,
            imageHeight: 800,
            background: 'rgba(13, 12, 19, 0.95)',
            color: '#fff',
            showCloseButton: true,  // 添加關閉按鈕
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: '儲存圖片',
            denyButtonText: '複製圖片',
            cancelButtonText: '分享到 IG 限時動態',
            confirmButtonColor: '#6D28D9',
            denyButtonColor: '#4B5563',
            cancelButtonColor: '#E1306C',
            allowOutsideClick: true,  // 允許點擊外部關閉
            allowEscapeKey: true      // 允許按 ESC 關閉
        });

        // 如果用戶關閉對話框或點擊外部，直接返回
        if (result.dismiss === Swal.DismissReason.close || 
            result.dismiss === Swal.DismissReason.backdrop || 
            result.dismiss === Swal.DismissReason.esc) {
            return;
        }

        if (result.isConfirmed) {
            // 下載圖片
            const link = document.createElement('a');
            link.download = '離職進度分享.png';
            link.href = shareImage;
            link.click();
            
            Swal.fire({
                title: '儲存成功！',
                text: '圖片已儲存到你的裝置',
                icon: 'success',
                confirmButtonColor: '#6D28D9',
                showCloseButton: true,
                timer: 2000,
                timerProgressBar: true
            });
        } 
        else if (result.isDenied) {
            // 複製圖片到剪貼簿
            try {
                const response = await fetch(shareImage);
                const blob = await response.blob();
                await navigator.clipboard.write([
                    new ClipboardItem({
                        [blob.type]: blob
                    })
                ]);
                
                Swal.fire({
                    title: '複製成功！',
                    text: '圖片已複製到剪貼簿',
                    icon: 'success',
                    confirmButtonColor: '#6D28D9',
                    showCloseButton: true,
                    timer: 2000,
                    timerProgressBar: true
                });
            } catch (error) {
                console.error('複製圖片失敗:', error);
                Swal.fire({
                    title: '複製失敗',
                    text: '請改用儲存圖片功能',
                    icon: 'error',
                    confirmButtonColor: '#6D28D9',
                    showCloseButton: true
                });
            }
        }
        else if (result.dismiss === Swal.DismissReason.cancel) {
            // 分享到 Instagram 限時動態
            try {
                const response = await fetch(shareImage);
                const blob = await response.blob();
                const filesArray = [
                    new File([blob], 'resignation-progress.png', {
                        type: 'image/png'
                    })
                ];
                
                if (navigator.share && navigator.canShare({ files: filesArray })) {
                    await navigator.share({
                        files: filesArray,
                        title: '我的離職進度',
                        text: '來看看我的離職進度！'
                    });
                } else {
                    // 如果不支援直接分享，提供手動分享指引
                    const link = document.createElement('a');
                    link.download = '離職進度分享.png';
                    link.href = shareImage;
                    link.click();
                    
                    Swal.fire({
                        title: '手動分享到 IG',
                        html: `
                            1. 圖片已下載到你的裝置<br>
                            2. 開啟 Instagram App<br>
                            3. 點擊右上角 "+" 按鈕<br>
                            4. 選擇 "限時動態"<br>
                            5. 選擇剛才下載的圖片
                        `,
                        icon: 'info',
                        confirmButtonColor: '#6D28D9'
                    });
                }
            } catch (error) {
                console.error('分享到 Instagram 失敗:', error);
                Swal.fire({
                    title: '分享失敗',
                    text: '請改用儲存圖片功能',
                    icon: 'error',
                    confirmButtonColor: '#6D28D9'
                });
            }
        }
    } catch (error) {
        console.error('分享進度時發生錯誤:', error);
        Swal.fire({
            title: '分享失敗',
            text: '無法生成分享圖片',
            icon: 'error',
            confirmButtonColor: '#6D28D9'
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

// 修改顯示預覽的部分
async function showSharePreview(imageData) {
    const previewContainer = document.createElement('div');
    previewContainer.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        max-width: 90vw;
        max-height: 90vh;
        width: auto;
        height: auto;
        z-index: 1000;
    `;

    const img = new Image();
    img.src = imageData;
    img.style.cssText = `
        width: auto;
        height: auto;
        max-width: 100%;
        max-height: 90vh;
        object-fit: contain;
    `;

    previewContainer.appendChild(img);
    document.body.appendChild(previewContainer);
}   

// 成就系統配置
const ACHIEVEMENTS = {
    OVERTIME_MASTER: {
        id: 'overtime_master',
        name: '加班之王',
        description: '累積加班超過100次',
        condition: (state) => state.actionCounts?.overtime >= 100,
        reward: 1000,
        icon: '⏰'
    },
    STRESS_SURVIVOR: {
        id: 'stress_survivor',
        name: '抗壓之王',
        description: '壓力值達到100%後恢復到0%',
        condition: (state) => state.stressHistory?.includes(100) && state.stress === 0,
        reward: 2000,
        icon: '💪'
    },
    HAPPY_WORKER: {
        id: 'happy_worker',
        name: '開心職人',
        description: '累積50次開心心情',
        condition: (state) => state.happyCount >= 50,
        reward: 800,
        icon: '😊'
    },
    ANGRY_MASTER: {
        id: 'angry_master',
        name: '忍者之道',
        description: '累積100次生氣但仍在職',
        condition: (state) => state.angryCount >= 100,
        reward: 1500,
        icon: '😤'
    },
    STREAK_WARRIOR: {
        id: 'streak_warrior',
        name: '堅持不懈',
        description: '連續登入7天',
        condition: (state) => state.playStreak >= 7,
        reward: 1000,
        icon: '📅'
    }
};

// 添加查看成就列表的功能
function showAchievements() {
    if (!game) return;
    
    const achievementsList = Object.values(ACHIEVEMENTS).map(achievement => {
        const isUnlocked = game.achievements.unlocked.includes(achievement.id);
        return `
            <div class="achievement-item ${isUnlocked ? 'unlocked' : 'locked'}">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-info">
                    <div class="achievement-name">${achievement.name}</div>
                    <div class="achievement-desc">${achievement.description}</div>
                </div>
                <div class="achievement-status">
                    ${isUnlocked ? '✅' : '🔒'}
                </div>
            </div>
        `;
    }).join('');

    Swal.fire({
        title: '成就列表',
        html: `
            <div class="achievements-container">
                ${achievementsList}
            </div>
        `,
        background: 'rgba(13, 12, 19, 0.95)',
        color: '#fff',
        confirmButtonColor: '#6D28D9',
        width: '80%'
    });
}

// 添加成就按鈕到界面
document.addEventListener('DOMContentLoaded', () => {
    const achievementsButton = document.createElement('button');
    achievementsButton.className = 'achievements-button';
    achievementsButton.innerHTML = '<i class="fas fa-trophy"></i> 查看成就';
    achievementsButton.onclick = showAchievements;
    
    // 將按鈕添加到合適的位置
    document.querySelector('.container').appendChild(achievementsButton);
});   