export function calculateStats(data) {
    const statsPanel = document.getElementById('stats-panel');
    if (!statsPanel) return;
    
    if (data.habits.length === 0) {
        statsPanel.innerHTML = '';
        return;
    }

    const totalHabits = data.habits.length;
    let totalCompleted = 0;
    
    for (const date in data.history) {
        totalCompleted += data.history[date].completed.length;
    }

    let currentStreak = 0;
    const today = new Date();
    
    for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const dateStr = checkDate.toISOString().split('T')[0];
        
        if (data.history[dateStr] && data.history[dateStr].completed.length > 0) {
            currentStreak++;
        } else if (i > 0) {
            break;
        }
    }

    statsPanel.innerHTML = `
        <div class="stat-item">
            <div class="stat-header"><span>🔥</span> <span class="stat-value">${currentStreak}</span></div>
            <span class="stat-label">Дней подряд</span>
        </div>
        <div class="stat-item">
            <div class="stat-header"><span>✅</span> <span class="stat-value">${totalCompleted}</span></div>
            <span class="stat-label">Всего задач</span>
        </div>
        <div class="stat-item">
            <div class="stat-header"><span>🎯</span> <span class="stat-value">${totalHabits}</span></div>
            <span class="stat-label">Привычек</span>
        </div>
        <div class="stat-item">
            <div class="stat-header"><span>📈</span> <span class="stat-value" style="color: var(--accent-orange)">100%</span></div>
            <span class="stat-label">Мотивация</span>
        </div>
    `;
}