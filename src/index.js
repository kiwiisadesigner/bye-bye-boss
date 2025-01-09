import './styles.css';

// 遊戲狀態
const gameState = {
    level: 1,
    title: '職場新鮮人',
    energy: parseInt(process.env.MAX_ENERGY) || 100,
    mood: parseInt(process.env.MAX_MOOD) || 100,
    quitProgress: 0,
    maxEnergy: parseInt(process.env.MAX_ENERGY) || 100,
    maxMood: parseInt(process.env.MAX_MOOD) || 100,
    events: [],
    punchIns: 0,
    dailyPunchIns: {
        不爽: 0,
        加班: 0,
        會議: 0,
        被罵: 0,
        被同事雷: 0
    },
    maxDailyPunchIns: parseInt(process.env.MAX_DAILY_PUNCH_INS) || 3
};

// 職場迷因列表
const memes = [
    "「這個很簡單」 = 這個很麻煩",
    "「幫我看一下」 = 幫我做完",
    "「盡快完成」 = 現在立刻馬上",
    "「下班前做完」 = 加班吧你",
    "「我們是一個團隊」 = 你要配合我",
    "「這是一個機會」 = 有麻煩了",
    "「我只是建議」 = 這是命令",
    "「開個小會」 = 浪費兩小時",
    "「這個很急」 = 我拖了三天",
    "「我們研究一下」 = 我也不知道"
];

// 離職小語列表
const quitQuotes = [
    "加班不是我工作能力差，是你工作分配有問題",
    "工作要確實，離職要即時",
    "如果是欣梅爾，也會離職的",
    "工作教會我的第一課是 deadline，第二課是如何假裝它不存在。",
    "『我們是一個團隊』的意思是，你要幫忙加班，而別人已經下班了。",
    "我的工作分兩部分：在會議裡浪費時間，和用剩下的時間補救浪費掉的進度。",
    "對老闆來說，5分鐘能完成的事情，可能只是需要我重寫整個系統。",
    "一個人要同時扮演專案經理、設計師、工程師，唯一缺的就是一個醫生。",
    "工作中最大的壓力來自兩方面：白癡同事的行為，和我無法直接指出來。",
    "你看到那邊那台法拉利了嗎？只要你今年也維持每週70小時的工時，明年你老闆就可以買得起了。",
    "算我求你了，我想下班",
    "吃了下午茶，就更有力氣加班了",
    "為了避免同仁拿到年終就離職，今年我們就不發了",
    "別人能者多勞，你就能者過勞",
    "三分我努力，七分主管定，剩下九十靠親戚",
    "工作只有你名字，升遷不關你的事"
];

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    updateUI();
    setupEventListeners();
});

// 更新 UI
function updateUI() {
    document.getElementById('level').textContent = `Lv.${gameState.level}`;
    document.getElementById('title').textContent = gameState.title;
    document.getElementById('energy').textContent = `${gameState.energy}/${gameState.maxEnergy}`;
    document.getElementById('mood').textContent = `${gameState.mood}/${gameState.maxMood}`;
    document.getElementById('quitProgress').textContent = `${gameState.quitProgress}%`;
    
    // 更新進度條
    document.getElementById('energyBar').style.width = `${(gameState.energy / gameState.maxEnergy) * 100}%`;
    document.getElementById('moodBar').style.width = `${(gameState.mood / gameState.maxMood) * 100}%`;
    document.getElementById('quitBar').style.width = `${gameState.quitProgress}%`;
    
    // 更新進度條顏色
    const energyBar = document.getElementById('energyBar');
    const moodBar = document.getElementById('moodBar');
    
    // 精力條顏色
    if (gameState.energy <= 30) {
        energyBar.classList.replace('bg-green-500', 'bg-red-500');
    } else if (gameState.energy <= 60) {
        energyBar.classList.replace('bg-green-500', 'bg-yellow-500');
    } else {
        energyBar.classList.replace('bg-red-500', 'bg-green-500');
        energyBar.classList.replace('bg-yellow-500', 'bg-green-500');
    }
    
    // 心情條顏色
    if (gameState.mood <= 30) {
        moodBar.classList.replace('bg-yellow-500', 'bg-red-500');
    } else if (gameState.mood <= 60) {
        moodBar.classList.replace('bg-yellow-500', 'bg-orange-500');
    } else {
        moodBar.classList.replace('bg-red-500', 'bg-yellow-500');
        moodBar.classList.replace('bg-orange-500', 'bg-yellow-500');
    }

    // 更新打卡次數顯示
    document.getElementById('punchInCount').textContent = gameState.maxDailyPunchIns - gameState.dailyPunchIns['不爽'];
    document.getElementById('overtimeCount').textContent = gameState.maxDailyPunchIns - gameState.dailyPunchIns['加班'];
    document.getElementById('meetingCount').textContent = gameState.maxDailyPunchIns - gameState.dailyPunchIns['會議'];
    document.getElementById('scoldedCount').textContent = gameState.maxDailyPunchIns - gameState.dailyPunchIns['被罵'];
    document.getElementById('annoyedCount').textContent = gameState.maxDailyPunchIns - gameState.dailyPunchIns['被同事雷'];
}

// 設置事件監聽器
function setupEventListeners() {
    document.getElementById('punchIn').addEventListener('click', () => handlePunchIn('不爽'));
    document.getElementById('overtime').addEventListener('click', () => handlePunchIn('加班'));
    document.getElementById('meeting').addEventListener('click', () => handlePunchIn('會議'));
    document.getElementById('scolded').addEventListener('click', () => handlePunchIn('被罵'));
    document.getElementById('annoyed').addEventListener('click', () => handlePunchIn('被同事雷'));
    
    document.getElementById('generateMeme').addEventListener('click', generateMeme);
    document.getElementById('generateQuote').addEventListener('click', generateQuote);
}

// 處理打卡
function handlePunchIn(type) {
    if (gameState.dailyPunchIns[type] >= gameState.maxDailyPunchIns) {
        alert('今天這種打卡已經達到上限了！');
        return;
    }

    gameState.dailyPunchIns[type]++;
    
    let message = '';
    switch(type) {
        case '不爽':
            gameState.mood -= parseInt(process.env.MOOD_DECREASE_RATE) || 10;
            gameState.quitProgress += parseInt(process.env.QUIT_PROGRESS_INCREASE_RATE) || 5;
            message = '又是不爽的一天...';
            break;
        case '加班':
            gameState.energy -= 15;
            gameState.mood -= 15;
            gameState.quitProgress += 10;
            message = '今天又要加班！';
            break;
        case '會議':
            gameState.energy -= 20;
            gameState.mood -= 5;
            message = '無止盡的會議...';
            break;
        case '被罵':
            gameState.mood -= 25;
            gameState.quitProgress += 15;
            message = '今天被老闆罵了...';
            break;
        case '被同事雷':
            gameState.mood -= 12;
            gameState.energy -= 8;
            gameState.quitProgress += 7;
            message = '今天又被同事雷到了...';
            break;
    }

    gameState.energy = Math.max(0, Math.min(100, gameState.energy));
    gameState.mood = Math.max(0, Math.min(100, gameState.mood));
    gameState.quitProgress = Math.min(100, gameState.quitProgress);

    addToLog(message);
    updateUI();
    checkGameStatus();
}

// 產生迷因
function generateMeme() {
    const meme = memes[Math.floor(Math.random() * memes.length)];
    const memeResult = document.getElementById('memeResult');
    memeResult.textContent = meme;
    memeResult.classList.add('animate-bounce');
    setTimeout(() => memeResult.classList.remove('animate-bounce'), 1000);
    addToLog('獲得新的職場迷因！');
}

// 產生離職小語
function generateQuote() {
    const quote = quitQuotes[Math.floor(Math.random() * quitQuotes.length)];
    const quoteResult = document.getElementById('quoteResult');
    quoteResult.textContent = quote;
    quoteResult.classList.add('animate-fade-in');
    setTimeout(() => quoteResult.classList.remove('animate-fade-in'), 1000);
    addToLog('獲得一條離職小語！');
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
    if (gameState.energy <= 20) {
        alert('你已經快精疲力竭了！該休息一下了。');
    }
    if (gameState.mood <= 20) {
        alert('你的心情非常低落，要不要考慮請個假？');
    }
    if (gameState.quitProgress >= 100) {
        alert('恭喜你！你已經準備好離職了！');
        resetGame();
    }
}

// 重置遊戲
function resetGame() {
    gameState.energy = parseInt(process.env.MAX_ENERGY) || 100;
    gameState.mood = parseInt(process.env.MAX_MOOD) || 100;
    gameState.quitProgress = 0;
    gameState.level += 1;
    gameState.title = updateTitle(gameState.level);
    Object.keys(gameState.dailyPunchIns).forEach(key => {
        gameState.dailyPunchIns[key] = 0;
    });
    updateUI();
    addToLog('開始新的職場生活！');
}

// 更新職稱
function updateTitle(level) {
    const titles = {
        1: '職場新鮮人',
        3: '職場生存者',
        5: '職場老手',
        7: '職場達人',
        10: '職場大師'
    };
    
    let title = '職場新鮮人';
    for (let lvl in titles) {
        if (level >= parseInt(lvl)) {
            title = titles[lvl];
        }
    }
    return title;
}