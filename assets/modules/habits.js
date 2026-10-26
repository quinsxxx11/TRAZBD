export function initHabits(data) {
    const form = document.getElementById('habit-form');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
        e.preventDefault(); 
        
        const nameInput = document.getElementById('habit-name');
        const targetInput = document.getElementById('habit-target');
        
        const name = nameInput.value.trim();
        const target = parseInt(targetInput.value) || 1;

        if (!name || name.length > 30) {
            alert('Название должно быть не пустым и не длиннее 30 символов!');
            return;
        }

        data.habits.push({
            id: 'habit_' + Date.now(),
            name: name,
            target: target
        });
        
        window.dispatchEvent(new Event('trackerDataUpdated'));
        
        form.reset();
        document.getElementById('habit-target').value = 1;
    });
}

function getCurrentWeekDates() {
    const today = new Date();
    const dayOfWeek = today.getDay() || 7; 
    const monday = new Date(today);
    monday.setDate(today.getDate() - dayOfWeek + 1);

    const week = [];
    const labels = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];
    
    for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        // Корректировка часового пояса
        const offset = d.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(d.getTime() - offset)).toISOString().split('T')[0];
        
        week.push({
            dateStr: localISOTime,
            label: labels[i]
        });
    }
    return week;
}

export function renderHabits(data) {
    const list = document.getElementById('habits-list');
    if (!list) return;
    list.innerHTML = '';

    if (data.habits.length === 0) {
        list.innerHTML = '<p style="color:var(--text-muted); text-align:center; padding: 40px 20px; font-size:16px;">Нажмите на фиолетовую кнопку <b>+</b>, чтобы добавить привычку</p>';
        return;
    }

    const currentWeek = getCurrentWeekDates();

    data.habits.forEach(habit => {
        const card = document.createElement('div');
        card.className = 'habit-card';
        
        // Формируем HTML карточки целиком
        let weekHtml = '';
        currentWeek.forEach(day => {
            const dayData = data.history[day.dateStr] || { completed: [], values: {} };
            const isDone = dayData.completed.includes(habit.id);
            
            weekHtml += `
                <div class="day-col">
                    <span class="day-label">${day.label}</span>
                    <button class="day-btn ${isDone ? 'done' : ''}" data-id="${habit.id}" data-date="${day.dateStr}">
                        ${isDone ? '✓' : ''}
                    </button>
                </div>
            `;
        });

        card.innerHTML = `
            <div class="habit-header">
                <div class="habit-title">${habit.name}</div>
                <div class="habit-target">${habit.target > 1 ? `Цель: ${habit.target} раз` : 'Ежедневно'}</div>
            </div>
            <div class="week-grid">
                ${weekHtml}
            </div>
        `;

        // Навешиваем события на кнопки дней
        card.querySelectorAll('.day-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const hId = e.currentTarget.getAttribute('data-id');
                const dateStr = e.currentTarget.getAttribute('data-date');
                
                toggleHabitForDate(data, dateStr, hId, habit.target);
                window.dispatchEvent(new Event('trackerDataUpdated'));
            });
        });

        list.appendChild(card);
    });
}

function toggleHabitForDate(data, dateStr, habitId, target) {
    if (!data.history[dateStr]) {
        data.history[dateStr] = { completed: [], values: {} };
    }

    const dayData = data.history[dateStr];
    const index = dayData.completed.indexOf(habitId);

    if (index > -1) {
        dayData.completed.splice(index, 1);
        if (dayData.values[habitId]) delete dayData.values[habitId];
    } else {
        if (target > 1) {
            const input = prompt(`Сколько раз выполнено? (Цель: ${target})`, target);
            const val = parseInt(input);
            if (isNaN(val) || val <= 0) return; 
            
            dayData.values[habitId] = val;
            if (val >= target) {
                dayData.completed.push(habitId);
            } else {
                alert('Цель не достигнута, привычка не засчитана.');
            }
        } else {
            dayData.completed.push(habitId);
            dayData.values[habitId] = 1;
        }
    }
}