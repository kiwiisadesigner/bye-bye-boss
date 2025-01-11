// 等待 DOM 完全載入後再執行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化狀態
    let state = {
        exp: 0,
        level: 1,
        expToNextLevel: 100,
        stress: 0,
        happyCount: 0,
        angryCount: 0,
        currentMood: '😊',
        moodHistory: [],
        checkInDays: 0,
        achievements: 0,
        lastCheckIn: null,
        overtimeCount: 0,
        salaryCount: 0,
        promotionCount: 0,
        happyStreak: 0
    };

    // 更新經驗值和等級
    function updateExp(amount) {
        console.log('獲得經驗值:', amount);
        
        state.exp += amount;
        
        // 檢查是否升級
        while (state.exp >= state.expToNextLevel) {
            state.exp -= state.expToNextLevel;
            state.level += 1;
            state.expToNextLevel = Math.floor(state.expToNextLevel * 1.2);
            showLevelUpNotice(state.level);
        }

        // 更新UI
        const expBar = document.getElementById('expBar');
        const expText = document.getElementById('exp');
        const levelText = document.getElementById('level');
        
        if (expBar && expText && levelText) {
            const expPercentage = (state.exp / state.expToNextLevel) * 100;
            expBar.style.width = `${expPercentage}%`;
            expText.textContent = `${state.exp}/${state.expToNextLevel} EXP`;
            levelText.textContent = `Lv.${state.level} 👑`;
        }
    }

    // 更新壓力值
    function updateStress(amount) {
        // 根據當前壓力值調整增減幅度
        let adjustedAmount = amount;
        
        // 當壓力值較高時，正面事件的效果更明顯
        if (amount < 0 && state.stress > 70) {
            adjustedAmount *= 1.2;  // 增加20%的減壓效果
        }
        
        // 當壓力值較低時，負面事件的效果更明顯
        if (amount > 0 && state.stress < 30) {
            adjustedAmount *= 1.2;  // 增加20%的增壓效果
        }
        
        state.stress = Math.max(0, Math.min(100, state.stress + adjustedAmount));
        const stressBar = document.getElementById('stressBar');
        const stressLevel = document.getElementById('stressLevel');
        
        if (stressBar && stressLevel) {
            stressBar.style.width = `${state.stress}%`;
            stressLevel.textContent = `${state.stress}%`;
            
            // 根據壓力值改變顏色
            if (state.stress < 30) {
                stressBar.className = 'shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500';
            } else if (state.stress < 70) {
                stressBar.className = 'shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-500';
            } else {
                stressBar.className = 'shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-orange-500 to-red-600 transition-all duration-500';
            }
        }
    }

    // 更新心情計數
    function updateMoodCount(isHappy) {
        const happyCount = document.getElementById('happyCount');
        const angryCount = document.getElementById('angryCount');
        
        if (isHappy && happyCount) {
            state.happyCount++;
            happyCount.textContent = state.happyCount;
        } else if (!isHappy && angryCount) {
            state.angryCount++;
            angryCount.textContent = state.angryCount;
        }
    }

    // 顯示升級提示
    function showLevelUpNotice(newLevel) {
        const notice = document.getElementById('levelUpNotice');
        const levelSpan = document.getElementById('newLevel');
        
        if (notice && levelSpan) {
            levelSpan.textContent = newLevel;
            notice.classList.remove('scale-0', 'opacity-0');
            notice.classList.add('scale-100', 'opacity-100');
            
            setTimeout(() => {
                notice.classList.remove('scale-100', 'opacity-100');
                notice.classList.add('scale-0', 'opacity-0');
            }, 3000);
        }
    }

    // 綁定按鈕事件
    const buttons = {
        'overtimeBtn': { exp: 15, stress: 8, happy: false },
        'meetingBtn': { exp: 10, stress: 5, happy: false },
        'scoldedBtn': { exp: 20, stress: 12, happy: false },
        'troubleBtn': { exp: 12, stress: 6, happy: false },
        'salaryBtn': { exp: 30, stress: -15, happy: true },
        'bonusBtn': { exp: 25, stress: -12, happy: true },
        'promotionBtn': { exp: 40, stress: -20, happy: true },
        'raiseBtn': { exp: 35, stress: -18, happy: true }
    };

    // 為每個按鈕添加事件監聽器
    Object.entries(buttons).forEach(([btnId, values]) => {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.addEventListener('click', () => {
                console.log(`${btnId} 被點擊`);
                updateExp(values.exp);
                updateStress(values.stress);
                updateMoodCount(values.happy);
            });
        }
    });

    // 初始化顯示
    updateExp(0);
    updateStress(0);

    // 載入心情歷史
    loadMoodHistory();
    
    // 如果當天還沒有選擇心情，顯示提示
    const today = new Date().toLocaleDateString();
    const hasRecordToday = state.moodHistory.some(record => 
        new Date(record.date).toLocaleDateString() === today
    );
    
    if (!hasRecordToday) {
        // 可以添加一個提示，提醒用戶記錄今天的心情
        const notice = document.createElement('div');
        notice.className = 'text-yellow-400 text-sm mt-2';
        notice.textContent = '別忘了記錄今天的心情！';
        document.querySelector('.mood-btn').parentNode.appendChild(notice);
    }

    loadState();
    updateCheckInStreak();
    updateAchievementDisplay();
});

// 更新心情的函數
function updateMoodEmoji(mood) {
    console.log('更新心情:', mood); // 調試用
    
    state.currentMood = mood;
    
    // 添加到心情歷史記錄
    const now = new Date();
    const timeStr = now.toLocaleTimeString('zh-TW', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    const dateStr = now.toLocaleDateString('zh-TW', { 
        month: 'long', 
        day: 'numeric' 
    });
    
    const moodRecord = {
        mood: mood,
        time: timeStr,
        date: dateStr
    };
    
    state.moodHistory.unshift(moodRecord);
    updateMoodHistory();
    saveMoodHistory();
}

// 更新心情歷史記錄顯示
function updateMoodHistory() {
    const historyContainer = document.getElementById('moodHistory');
    if (!historyContainer) return;
    
    historyContainer.innerHTML = state.moodHistory
        .slice(0, 10) // 只顯示最近10筆記錄
        .map(record => `
            <div class="flex items-center justify-between p-2 rounded-lg bg-black/30">
                <div class="flex items-center">
                    <span class="text-2xl mr-3">${record.mood}</span>
                    <span class="text-gray-300">${record.date}</span>
                </div>
                <span class="text-gray-400">${record.time}</span>
            </div>
        `)
        .join('');
}

// 保存心情歷史到 localStorage
function saveMoodHistory() {
    localStorage.setItem('moodHistory', JSON.stringify(state.moodHistory));
}

// 載入心情歷史
function loadMoodHistory() {
    const savedHistory = localStorage.getItem('moodHistory');
    if (savedHistory) {
        state.moodHistory = JSON.parse(savedHistory);
        updateMoodHistory();
    }
}

// 更新打卡天數
function updateCheckInStreak() {
    const today = new Date().toDateString();
    
    if (state.lastCheckIn === null) {
        state.checkInDays = 1;
    } else if (state.lastCheckIn === new Date(Date.now() - 86400000).toDateString()) {
        // 如果上次打卡是昨天
        state.checkInDays++;
        
        // 檢查是否達到打卡成就
        if (state.checkInDays === 7) {
            unlockAchievement('連續打卡 7 天');
        } else if (state.checkInDays === 30) {
            unlockAchievement('連續打卡 30 天');
        }
    } else if (state.lastCheckIn !== today) {
        // 如果不是連續打卡，重置計數
        state.checkInDays = 1;
    }
    
    state.lastCheckIn = today;
    updateUI();
    saveState();
}

// 解鎖成就
function unlockAchievement(achievementName) {
    state.achievements++;
    updateUI();
    
    // 顯示成就解鎖通知
    const notice = document.createElement('div');
    notice.className = 'fixed top-4 right-4 bg-yellow-600/80 text-white px-6 py-4 rounded-lg shadow-lg backdrop-blur-lg z-50 transform transition-all duration-500';
    notice.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-trophy text-yellow-300 text-2xl mr-3"></i>
            <div>
                <div class="font-bold">成就解鎖！</div>
                <div class="text-sm">${achievementName}</div>
            </div>
        </div>
    `;
    
    document.body.appendChild(notice);
    setTimeout(() => {
        notice.style.opacity = '0';
        setTimeout(() => notice.remove(), 500);
    }, 3000);
}

// 更新 UI 顯示
function updateUI() {
    document.getElementById('checkInDays').textContent = state.checkInDays;
    document.getElementById('achievements').textContent = state.achievements;
}

// 保存狀態
function saveState() {
    localStorage.setItem('workplaceRPG', JSON.stringify(state));
}

// 載入狀態
function loadState() {
    const savedState = localStorage.getItem('workplaceRPG');
    if (savedState) {
        state = {...state, ...JSON.parse(savedState)};
        updateUI();
    }
}

// 定義成就列表
const ACHIEVEMENTS = {
    // 打卡相關成就
    CHECKIN_STREAK_7: {
        id: 'checkin7',
        name: '打卡新人',
        description: '連續打卡 7 天',
        icon: '📅',
        condition: (state) => state.checkInDays >= 7,
        unlocked: false
    },
    CHECKIN_STREAK_30: {
        id: 'checkin30',
        name: '打卡達人',
        description: '連續打卡 30 天',
        icon: '🎯',
        condition: (state) => state.checkInDays >= 30,
        unlocked: false
    },
    
    // 等級相關成就
    LEVEL_5: {
        id: 'level5',
        name: '職場新鮮人',
        description: '達到 5 級',
        icon: '⭐',
        condition: (state) => state.level >= 5,
        unlocked: false
    },
    LEVEL_10: {
        id: 'level10',
        name: '職場老手',
        description: '達到 10 級',
        icon: '🌟',
        condition: (state) => state.level >= 10,
        unlocked: false
    },
    
    // 壓力相關成就
    HIGH_STRESS: {
        id: 'highStress',
        name: '壓力山大',
        description: '壓力值達到 100%',
        icon: '😱',
        condition: (state) => state.stress >= 100,
        unlocked: false
    },
    STRESS_MASTER: {
        id: 'stressMaster',
        name: '心如止水',
        description: '壓力值降到 0%',
        icon: '🧘',
        condition: (state) => state.stress <= 0,
        unlocked: false
    },
    
    // 心情相關成就
    HAPPY_STREAK: {
        id: 'happyStreak',
        name: '快樂工作人',
        description: '連續記錄 5 天開心心情',
        icon: '😊',
        condition: (state) => state.happyStreak >= 5,
        unlocked: false
    },
    MOOD_MASTER: {
        id: 'moodMaster',
        name: '情緒管理大師',
        description: '記錄 30 天的心情',
        icon: '🎭',
        condition: (state) => state.moodHistory.length >= 30,
        unlocked: false
    },
    
    // 特殊成就
    OVERTIME_WARRIOR: {
        id: 'overtimeWarrior',
        name: '加班戰士',
        description: '累積 10 次加班',
        icon: '💪',
        condition: (state) => state.overtimeCount >= 10,
        unlocked: false
    },
    SALARY_MASTER: {
        id: 'salaryMaster',
        name: '領薪水達人',
        description: '累積領取 12 次薪水',
        icon: '💰',
        condition: (state) => state.salaryCount >= 12,
        unlocked: false
    },
    PROMOTION_MASTER: {
        id: 'promotionMaster',
        name: '升職之路',
        description: '累積 3 次升職',
        icon: '👔',
        condition: (state) => state.promotionCount >= 3,
        unlocked: false
    },
    PERFECT_EMPLOYEE: {
        id: 'perfectEmployee',
        name: '完美員工',
        description: '解鎖所有其他成就',
        icon: '👑',
        condition: (state) => Object.values(ACHIEVEMENTS).filter(a => a.id !== 'perfectEmployee').every(a => a.unlocked),
        unlocked: false
    }
};

// 檢查成就
function checkAchievements() {
    let newUnlocks = false;
    
    Object.values(ACHIEVEMENTS).forEach(achievement => {
        if (!achievement.unlocked && achievement.condition(state)) {
            achievement.unlocked = true;
            newUnlocks = true;
            showAchievementUnlock(achievement);
            state.achievements++;
        }
    });
    
    if (newUnlocks) {
        updateAchievementDisplay();
        saveState();
    }
}

// 顯示成就解鎖通知
function showAchievementUnlock(achievement) {
    const notice = document.createElement('div');
    notice.className = 'fixed top-4 right-4 bg-yellow-600/80 text-white px-6 py-4 rounded-lg shadow-lg backdrop-blur-lg z-50 transform transition-all duration-500';
    notice.innerHTML = `
        <div class="flex items-center">
            <div class="text-3xl mr-3">${achievement.icon}</div>
            <div>
                <div class="font-bold">${achievement.name}</div>
                <div class="text-sm">${achievement.description}</div>
            </div>
        </div>
    `;
    
    document.body.appendChild(notice);
    setTimeout(() => {
        notice.style.opacity = '0';
        setTimeout(() => notice.remove(), 500);
    }, 3000);
}

// 更新成就顯示
function updateAchievementDisplay() {
    const container = document.getElementById('achievementList');
    if (!container) return;
    
    container.innerHTML = Object.values(ACHIEVEMENTS).map(achievement => `
        <div class="flex items-center p-4 rounded-lg ${achievement.unlocked ? 'bg-yellow-900/30' : 'bg-black/30'} transition-colors duration-300">
            <div class="text-3xl mr-4 ${achievement.unlocked ? 'opacity-100' : 'opacity-30'}">
                ${achievement.icon}
            </div>
            <div class="flex-1">
                <div class="font-bold ${achievement.unlocked ? 'text-yellow-400' : 'text-gray-400'}">
                    ${achievement.name}
                </div>
                <div class="text-sm text-gray-400">
                    ${achievement.description}
                </div>
            </div>
            <div class="text-xl ${achievement.unlocked ? 'text-yellow-400' : 'text-gray-600'}">
                <i class="fas ${achievement.unlocked ? 'fa-check-circle' : 'fa-lock'}"></i>
            </div>
        </div>
    `).join('');
    
    document.getElementById('achievementCount').textContent = state.achievements;
}