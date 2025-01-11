// 遊戲初始數據
const GAME_CONFIG = {
    MAX_LEVEL: 100,
    MAX_STRESS: 100,
    EXP_PER_LEVEL: 1000,
};

// 初始化遊戲數據
const game = {
    data: {
        level: 1,
        exp: 0,
        expToNext: GAME_CONFIG.EXP_PER_LEVEL,
        stress: 0,
        happyCount: 0,
        angryCount: 0
    }
};

// 確保數值都是有效的數字
function validateGameData() {
    game.data.level = Number(game.data.level) || 1;
    game.data.exp = Number(game.data.exp) || 0;
    game.data.expToNext = Number(game.data.expToNext) || GAME_CONFIG.EXP_PER_LEVEL;
    game.data.stress = Number(game.data.stress) || 0;
    game.data.happyCount = Number(game.data.happyCount) || 0;
    game.data.angryCount = Number(game.data.angryCount) || 0;
}

// 在載入遊戲時驗證數據
window.addEventListener('load', () => {
    validateGameData();
    updateUI();  // 確保UI更新
});

// 更新UI時的數值格式化
function formatNumber(num) {
    return isNaN(num) ? 0 : num;
}

// 更新UI時使用
function updateUI() {
    // 等級顯示
    document.querySelector('.level').textContent = `Lv.${formatNumber(game.data.level)}`;
    
    // 經驗值顯示
    document.querySelector('.exp').textContent = 
        `${formatNumber(game.data.exp)} / ${formatNumber(game.data.expToNext)}`;
    
    // 壓力指數顯示
    const stressPercentage = (formatNumber(game.data.stress) / GAME_CONFIG.MAX_STRESS * 100).toFixed(1);
    document.querySelector('.stress').textContent = `${stressPercentage}%`;
    
    // 心情計數顯示
    document.querySelector('.happy-count').textContent = formatNumber(game.data.happyCount);
    document.querySelector('.angry-count').textContent = formatNumber(game.data.angryCount);
}

async function shareProgress() {
    try {
        // ... 前面的代碼保持不變 ...

        // 生成 QR Code
        const qr = new QRCode({
            content: "https://kiwiisadesigner.github.io/bye-bye-boss/",
            width: 180,
            height: 180,
            padding: 0,
            background: "rgba(255, 255, 255, 0.1)",
            color: "#ffffff"
        });
        
        // 將 QR Code 繪製到 canvas
        const qrImage = await loadImage(qr.toDataURL());
        ctx.drawImage(qrImage, centerX - 90, canvas.height - 280, 180, 180);

        // 添加作者資訊
        ctx.font = '32px "Noto Sans TC"';
        ctx.fillStyle = '#a78bfa';
        ctx.fillText('掃描 QR Code 開始你的離職之旅', centerX, canvas.height - 80);
        
        // 添加 Instagram 資訊
        ctx.font = '28px "Noto Sans TC"';
        ctx.fillStyle = '#8b5cf6';
        ctx.fillText('Follow @_kiwi_go_', centerX, canvas.height - 40);

        // ... 後續的代碼保持不變 ...
    } catch (error) {
        // ... 錯誤處理保持不變 ...
    }
}

// 添加輔助函數來載入圖片
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}