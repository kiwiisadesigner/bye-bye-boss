import './styles.css';

console.log('Hello World!');

// 遊戲核心狀態
const gameState = {
    points: 0,
    energy: 100,
    maxEnergy: 100,
    level: 1,
    days: 1,
    achievements: [],
    lastEnergyUpdate: Date.now(),
    energyRecoveryRate: 1, // 每分鐘恢復 1 點能量
    inventory: {
        coffee: 3,    // 咖啡：恢復 20 能量
        pills: 2,     // 提神藥：恢復 50 能量
        games: 1      // 手遊：恢復 30 能量
    },
    streaks: {
        work: 0,
        overtime: 0,
        meeting: 0
    }
};

// 載入遊戲狀態
function loadGameState() {
    const savedState = localStorage.getItem('resignGameState');
    if (savedState) {
        Object.assign(gameState, JSON.parse(savedState));
        updateAllDisplays();
    }
}

// 保存遊戲狀態
function saveGameState() {
    localStorage.setItem('resignGameState', JSON.stringify(gameState));
}

// 點數系統
const pointsSystem = {
    work: { points: 2, energy: -10, message: "上班真的好累..." },
    overtime: { points: 3, energy: -20, message: "今天又要加班..." },
    meeting: { points: 2, energy: -15, message: "開了一個無意義的會議" },
    boss: { points: 5, energy: -25, message: "被老闆罵了..." }
};

// 增加點數
function addPoints(type) {
    // 檢查能量
    if (gameState.energy < Math.abs(pointsSystem[type].energy)) {
        showNotification("太累了，需要休息...", "warning");
        playSound("error");
        return;
    }

    // 增加點數
    gameState.points += pointsSystem[type].points;
    gameState.energy += pointsSystem[type].energy;
    gameState.streaks[type] = (gameState.streaks[type] || 0) + 1;

    // 更新顯示
    updateProgress();
    updateShareCard();
    showNotification(pointsSystem[type].message);
    playSound("click");
    
    // 檢查成就
    checkAchievements();
    
    // 保存遊戲狀態
    saveGameState();
}

// 減少點數
function deductPoints(type) {
    const deductions = {
        bonus: { points: 5, message: "發薪水了，猶豫ing..." },
        promotion: { points: 10, message: "升職加薪，要不要撐住？" }
    };

    gameState.points = Math.max(0, gameState.points - deductions[type].points);
    updateProgress();
    updateShareCard();
    showNotification(deductions[type].message);
    playSound("coin");
    saveGameState();
}

// 更新所有顯示
function updateAllDisplays() {
    updateProgress();
    updateShareCard();
    document.getElementById('energyLevel').textContent = `${gameState.energy}/100`;
}

// 更新進度顯示
function updateProgress() {
    const progressBar = document.getElementById('progressBar');
    const percentage = (gameState.points / 100) * 100;
    progressBar.style.width = `${percentage}%`;
    
    // 更新點數顯示
    document.getElementById('currentPoints').textContent = `${gameState.points}/100`;
    
    // 更新能量條
    document.getElementById('energyLevel').textContent = `${gameState.energy}/100`;
}

// 更新分享卡片
function updateShareCard() {
    document.getElementById('sharePoints').textContent = gameState.points;
    document.getElementById('shareProgress').style.width = `${(gameState.points / 100) * 100}%`;
    document.getElementById('dayCount').textContent = gameState.days;
    
    // 更新表情和狀態
    const progress = gameState.points / 100;
    let emoji, status;
    if (progress < 0.3) {
        emoji = "😫"; status = "堅持就是勝利...";
    } else if (progress < 0.6) {
        emoji = "🤔"; status = "離職計畫進行中...";
    } else if (progress < 0.9) {
        emoji = "😤"; status = "即將起飛！";
    } else {
        emoji = "🎉"; status = "自由在向我招手！";
    }
    
    document.getElementById('shareEmoji').textContent = emoji;
    document.getElementById('shareStatus').textContent = `"${status}"`;
}

// 通知系統
function showNotification(message, type = 'normal') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `fixed top-20 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg ${
        type === 'warning' ? 'text-red-400' : 'text-white'
    }`;
    notification.classList.remove('hidden');
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 2000);
}

// 音效系統
function playSound(type) {
    const audio = document.getElementById('clickSound');
    audio.play().catch(e => console.log('音效播放失敗'));
}

// 分享功能
function prepareShare() {
    updateShareCard();
    showNotification("準備好了！請截圖分享");
}

function copyShareText() {
    const shareText = `我的離職進度：${gameState.points}/100 🎯\n` +
                     `第 ${gameState.days} 天的職場生存之旅\n` +
                     `#職場生活 #離職倒數 #職場進化論\n` +
                     `APP by @_kiwi_go_`;
                     
    navigator.clipboard.writeText(shareText)
        .then(() => showNotification("分享文案已複製！"))
        .catch(() => showNotification("複製失敗，請手動複製", "warning"));
}

// 生成離職小語
function generateMeme() {
    const quotes = [
        { emoji: "💼", text: "加班不是我工作能力差", subtext: "是你工作分配有問題" },
        { emoji: "⏰", text: "工作要確實", subtext: "離職要即時" },
        { emoji: "🐕", text: "如果是欣梅爾", subtext: "也會離職的" },
        { emoji: "📅", text: "工作教會我的第一課是 deadline", subtext: "第二課是如何假裝它不存在" },
        { emoji: "👥", text: "『我們是一個團隊』的意思是", subtext: "你要幫忙加班，而別人已經下班了" },
        { emoji: "🗣️", text: "我的工作分兩部分", subtext: "在會議裡浪費時間，和用剩下的時間補救浪費掉的進度" },
        { emoji: "⚡️", text: "對老闆來說，5分鐘能完成的事情", subtext: "可能只是需要我重寫整個系統" },
        { emoji: "🎭", text: "一個人要同時扮演專案經理、設計師、工程師", subtext: "唯一缺的就是一個醫生" },
        { emoji: "🤐", text: "工作中最大的壓力來自兩方面", subtext: "白癡同事的行為，和我無法直接指出來" },
        { emoji: "🏎️", text: "你看到那邊那台法拉利了嗎？", subtext: "只要你今年也維持每週70小時的工時，明年你老闆就可以買得起了" },
        { emoji: "🙏", text: "算我求你了", subtext: "我想下班" },
        { emoji: "☕️", text: "吃了下午茶", subtext: "就更有力氣加班了" },
        { emoji: "💸", text: "為了避免同仁拿到年終就離職", subtext: "今年我們就不發了" },
        { emoji: "💪", text: "別人能者多勞", subtext: "你就能者過勞" },
        { emoji: "🎲", text: "三分我努力，七分主管定", subtext: "剩下九十靠親戚" },
        { emoji: "📝", text: "工作只有你名字", subtext: "升遷不關你的事" }
    ];

    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    document.getElementById('memeEmoji').textContent = quote.emoji;
    document.getElementById('memeText').textContent = quote.text;
    document.getElementById('memeSubtext').textContent = quote.subtext;
}

// 自動恢復能量
function recoverEnergy() {
    const now = Date.now();
    const timePassed = (now - gameState.lastEnergyUpdate) / (1000 * 60); // 轉換為分鐘
    const energyToRecover = Math.floor(timePassed * gameState.energyRecoveryRate);
    
    if (energyToRecover > 0) {
        gameState.energy = Math.min(gameState.maxEnergy, gameState.energy + energyToRecover);
        gameState.lastEnergyUpdate = now;
        updateEnergyDisplay();
        saveGameState();
    }
}

// 更新能量顯示
function updateEnergyDisplay() {
    const energyElement = document.getElementById('energyLevel');
    energyElement.textContent = `${Math.floor(gameState.energy)}/${gameState.maxEnergy}`;
    
    // 添加能量條顏色變化
    if (gameState.energy < 30) {
        energyElement.classList.add('text-red-400');
    } else {
        energyElement.classList.remove('text-red-400');
    }
}

// 在遊戲初始化時啟動能量恢復計時器
function initGame() {
    loadGameState();
    updateAllDisplays();
    generateMeme();
    
    // 每分鐘檢查一次能量恢復
    setInterval(recoverEnergy, 60000);
    // 每秒更新一次顯示
    setInterval(updateEnergyDisplay, 1000);
}

// 啟動遊戲
window.onload = initGame;

// 需要添加這些函數的實現
function showAchievements() {
    // 顯示成就的實現
    showNotification("成就系統即將推出！");
}

function showInventory() {
    const panel = document.getElementById('inventoryPanel');
    panel.classList.toggle('hidden');
    updateInventoryDisplay();
}

function updateInventoryDisplay() {
    document.getElementById('coffeeCount').textContent = gameState.inventory.coffee;
    document.getElementById('pillsCount').textContent = gameState.inventory.pills;
    document.getElementById('gamesCount').textContent = gameState.inventory.games;
}

function checkAchievements() {
    // 檢查成就的實現
    // 可以根據 gameState 來檢查各種成就
}

// 道具系統
const items = {
    coffee: {
        name: "咖啡",
        energy: 20,
        emoji: "☕️",
        description: "提供短暫的能量boost"
    },
    pills: {
        name: "提神藥",
        energy: 50,
        emoji: "💊",
        description: "立即恢復大量能量"
    },
    games: {
        name: "手遊",
        energy: 30,
        emoji: "🎮",
        description: "放鬆心情，恢復能量"
    }
};

// 使用道具
function useItem(itemType) {
    if (gameState.inventory[itemType] > 0) {
        const item = items[itemType];
        gameState.energy = Math.min(gameState.maxEnergy, gameState.energy + item.energy);
        gameState.inventory[itemType]--;
        
        showNotification(`使用了${item.name}，恢復了 ${item.energy} 點能量！`);
        updateEnergyDisplay();
        updateInventoryDisplay();
        saveGameState();
    } else {
        showNotification(`${items[itemType].name}用完了！`, "warning");
    }
}
