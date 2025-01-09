import './styles.css';

// 遊戲狀態
const gameState = {
    mentalHealth: 100,
    savings: 0,
    experience: 0,
    events: []
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    updateUI();
    setupEventListeners();
});

// 更新 UI
function updateUI() {
    document.getElementById('mentalHealth').textContent = `${gameState.mentalHealth}%`;
    document.getElementById('savings').textContent = `$${gameState.savings}`;
    document.getElementById('experience').textContent = `${gameState.experience} 年`;
}

// 設置事件監聽器
function setupEventListeners() {
    document.getElementById('option1').addEventListener('click', () => handleChoice('work'));
    document.getElementById('option2').addEventListener('click', () => handleChoice('rest'));
}

// 處理選擇
function handleChoice(choice) {
    if (choice === 'work') {
        // 工作效果
        gameState.savings += 1000;
        gameState.mentalHealth -= 10;
        gameState.experience += 0.1;
        addToLog('努力工作賺取報酬！');
    } else {
        // 休息效果
        gameState.mentalHealth += 20;
        gameState.savings -= 500;
        addToLog('休息一天恢復精神！');
    }

    // 確保數值在合理範圍內
    gameState.mentalHealth = Math.max(0, Math.min(100, gameState.mentalHealth));
    gameState.savings = Math.max(0, gameState.savings);
    gameState.experience = Number(gameState.experience.toFixed(1));

    // 更新界面
    updateUI();
    checkGameStatus();
}

// 添加日誌
function addToLog(message) {
    const logDiv = document.getElementById('eventLog');
    const entry = document.createElement('div');
    entry.className = 'text-sm text-gray-300';
    entry.textContent = `${new Date().toLocaleTimeString()} - ${message}`;
    logDiv.insertBefore(entry, logDiv.firstChild);
}

// 檢查遊戲狀態
function checkGameStatus() {
    if (gameState.mentalHealth <= 0) {
        alert('你已經精疲力竭了！需要好好休息一下。');
        gameState.mentalHealth = 100;
        updateUI();
    }
}