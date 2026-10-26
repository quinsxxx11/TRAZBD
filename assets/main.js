// --- 1. Состояние приложения ---
let appData = { habits: [], history: {} };
let currentUser = null;
let currentDate = new Date();
let selectedDateStr = new Date().toISOString().split('T')[0];

// --- 2. Логика авторизации ---
function initAuth() {
    const users = JSON.parse(localStorage.getItem('app_users')) || {};
    const session = localStorage.getItem('app_session');

    // Переключение табов
    document.getElementById('tab-login').addEventListener('click', () => {
        document.getElementById('tab-login').classList.add('active');
        document.getElementById('tab-register').classList.remove('active');
        document.getElementById('login-form-box').style.display = 'block';
        document.getElementById('register-form-box').style.display = 'none';
        document.getElementById('auth-error').style.display = 'none';
    });

    document.getElementById('tab-register').addEventListener('click', () => {
        document.getElementById('tab-register').classList.add('active');
        document.getElementById('tab-login').classList.remove('active');
        document.getElementById('register-form-box').style.display = 'block';
        document.getElementById('login-form-box').style.display = 'none';
        document.getElementById('auth-error').style.display = 'none';
    });

    // Регистрация
    document.getElementById('btn-register').addEventListener('click', () => {
        const user = document.getElementById('reg-username').value.trim();
        const pass = document.getElementById('reg-password').value.trim();
        const err = document.getElementById('auth-error');

        if (!user || !pass) { showError('Заполните все поля'); return; }
        if (users[user]) { showError('Пользователь уже существует'); return; }

        users[user] = pass;
        localStorage.setItem('app_users', JSON.stringify(users));
        loginSuccess(user);
    });

    // Вход
    document.getElementById('btn-login').addEventListener('click', () => {
        const user = document.getElementById('login-username').value.trim();
        const pass = document.getElementById('login-password').value.trim();

        if (!user || !pass) { showError('Заполните все поля'); return; }
        if (users[user] !== pass) { showError('Неверный логин или пароль'); return; }

        loginSuccess(user);
    });

    function showError(msg) {
        const err = document.getElementById('auth-error');
        err.textContent = msg;
        err.style.display = 'block';
    }

    // Выход
    document.getElementById('btn-logout').addEventListener('click', () => {
        localStorage.removeItem('app_session');
        currentUser = null;
        document.getElementById('main-app').style.display = 'none';
        document.getElementById('auth-screen').style.display = 'flex';
        document.getElementById('settings-modal').classList.remove('show');
    });

    // Проверка сессии при загрузке
    if (session) {
        loginSuccess(session, false);
    }
}

function loginSuccess(username, showApp = true) {
    currentUser = username;
    localStorage.setItem('app_session', username);
    document.getElementById('user-display-name').textContent = username;
    
    if (showApp) {
        document.getElementById('auth-screen').style.display = 'none';
        document.getElementById('main-app').style.display = 'flex';
    } else {
        document.getElementById('auth-screen').style.display = 'none';
        document.getElementById('main-app').style.display = 'flex';
    }
    
    // Загружаем данные конкретного пользователя
    loadUserData();
}

// --- 3. Загрузка/Сохранение данных ---
function loadUserData() {
    appData = { habits: [], history: {} };
    try {
        const key = 'trackerData_' + currentUser;
        const stored = localStorage.getItem(key);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.habits) appData.habits = parsed.habits;
            if (parsed.history) appData.history = parsed.history;
        }
    } catch (e) { console.error("Ошибка данных:", e); }

    renderHabitsList();
    renderCalendarUI();
    renderDayDetails();
    updateStatsUI();
}

function saveData() {
    if (!currentUser) return;
    localStorage.setItem('trackerData_' + currentUser, JSON.stringify(appData));
}

// --- 4. Рендер (Привычки, Календарь, Статистика) ---
function renderHabitsList() {
    const list = document.getElementById('habits-list');
    list.innerHTML = '';
    if (appData.habits.length === 0) {
        list.innerHTML = '<p style="color: #6c757d; text-align: center; padding: 20px;">Нет привычек. Нажмите "+", чтобы добавить.</p>';
        return;
    }
    appData.habits.forEach(habit => {
        const card = document.createElement('div');
        card.className = 'habit-card';
        card.innerHTML = `
            <div class="habit-header">
                <div class="habit-title">${habit.name}</div>
                <div class="habit-target">${habit.target > 1 ? 'Цель: ' + habit.target : 'Ежедневно'}</div>
            </div>
            <div style="color: #8b5cf6; font-size: 13px; font-weight: 500; cursor: pointer;" onclick="document.querySelector('[data-target=\\'view-calendar\\']').click()">
                Отмечайте в календаре →
            </div>
        `;
        list.appendChild(card);
    });
}

function renderCalendarUI() {
    const grid = document.getElementById('calendar-grid');
    const display = document.getElementById('month-year-display');
    if (!grid) return;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
    display.textContent = `${monthNames[month]} ${year}`;
    grid.innerHTML = '';

    let firstDay = new Date(year, month, 1).getDay();
    firstDay = firstDay === 0 ? 6 : firstDay - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        grid.innerHTML += `<div class="cal-day empty"></div>`;
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const d = new Date(year, month, day);
        const offset = d.getTimezoneOffset() * 60000;
        const dateStr = (new Date(d.getTime() - offset)).toISOString().split('T')[0];

        let classes = 'cal-day';
        if (appData.history[dateStr] && appData.history[dateStr].completed.length > 0) classes += ' has-completed';
        if (dateStr === selectedDateStr) classes += ' selected';

        const dayDiv = document.createElement('div');
        dayDiv.className = classes;
        dayDiv.textContent = day;
        dayDiv.addEventListener('click', () => {
            selectedDateStr = dateStr;
            renderCalendarUI();
            renderDayDetails();
        });
        grid.appendChild(dayDiv);
    }
}

function renderDayDetails() {
    const title = document.getElementById('selected-date-title');
    const list = document.getElementById('day-habits-list');
    if (!list || !title) return;

    const [y, m, d] = selectedDateStr.split('-');
    title.textContent = `Привычки на ${d}.${m}.${y}`;
    list.innerHTML = '';
    
    const dayData = appData.history[selectedDateStr] || { completed: [] };

    if (appData.habits.length === 0) {
        list.innerHTML = '<p style="color: #6c757d; font-size: 14px;">Добавьте привычки на главной странице.</p>';
        return;
    }

    appData.habits.forEach(habit => {
        const isDone = dayData.completed.includes(habit.id);
        const row = document.createElement('div');
        row.className = 'day-habit-row';
        row.innerHTML = `
            <span class="day-habit-name">${habit.name}</span>
            <button class="check-btn ${isDone ? 'checked' : ''}" data-id="${habit.id}">${isDone ? '✓' : ''}</button>
        `;

        row.querySelector('.check-btn').addEventListener('click', (e) => {
            const hId = e.currentTarget.getAttribute('data-id');
            if (!appData.history[selectedDateStr]) appData.history[selectedDateStr] = { completed: [] };
            
            const completed = appData.history[selectedDateStr].completed;
            const index = completed.indexOf(hId);

            if (index > -1) completed.splice(index, 1);
            else completed.push(hId);

            saveData();
            renderCalendarUI();
            renderDayDetails();
            updateStatsUI();
        });
        list.appendChild(row);
    });
}

function updateStatsUI() {
    let totalCompletions = 0;
    for (const date in appData.history) totalCompletions += appData.history[date].completed.length;
    document.getElementById('stat-total-completions').textContent = totalCompletions;
    document.getElementById('stat-total-habits').textContent = appData.habits.length;

    let streak = 0;
    let checkDate = new Date();
    while (true) {
        const offset = checkDate.getTimezoneOffset() * 60000;
        const dStr = (new Date(checkDate.getTime() - offset)).toISOString().split('T')[0];
        if (appData.history[dStr] && appData.history[dStr].completed.length > 0) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            if (streak === 0 && dStr === new Date().toISOString().split('T')[0]) {
                checkDate.setDate(checkDate.getDate() - 1);
                const yStr = (new Date(checkDate.getTime() - offset)).toISOString().split('T')[0];
                if (appData.history[yStr] && appData.history[yStr].completed.length > 0) continue;
            }
            break;
        }
    }
    document.getElementById('stat-streak').textContent = streak;

    let perfectDays = 0;
    const totalHabits = appData.habits.length;
    if (totalHabits > 0) {
        for (const date in appData.history) {
            if (appData.history[date].completed.length >= totalHabits) perfectDays++;
        }
    }
    document.getElementById('stat-perfect-days').textContent = perfectDays;
}

// --- 5. Инициализация ---
document.addEventListener('DOMContentLoaded', () => {
    initAuth(); // Сначала проверяем вход

    // Навигация и модалки
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view-section');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(n => n.classList.remove('active'));
            views.forEach(v => v.classList.remove('active'));
            item.classList.add('active');
            const targetId = item.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
            if (targetId === 'view-stats') updateStatsUI();
            if (targetId === 'view-calendar') renderCalendarUI();
        });
    });

    const habitModal = document.getElementById('habit-modal');
    document.getElementById('fab-add').addEventListener('click', () => habitModal.classList.add('show'));
    document.getElementById('btn-cancel-habit').addEventListener('click', () => habitModal.classList.remove('show'));
    document.getElementById('btn-close-settings').addEventListener('click', () => document.getElementById('settings-modal').classList.remove('show'));
    document.getElementById('btn-settings').addEventListener('click', () => document.getElementById('settings-modal').classList.add('show'));

    // Сохранение привычки
    document.getElementById('btn-save-habit').addEventListener('click', () => {
        const name = document.getElementById('habit-name').value.trim();
        const target = parseInt(document.getElementById('habit-target').value) || 1;
        if (!name) return alert('Введите название!');

        appData.habits.push({ id: 'habit_' + Date.now(), name, target });
        saveData();
        renderHabitsList();
        renderDayDetails();
        updateStatsUI();
        
        habitModal.classList.remove('show');
        document.getElementById('habit-name').value = '';
    });

    // Навигация календаря
    document.getElementById('prev-month').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendarUI();
    });
    document.getElementById('next-month').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendarUI();
    });
});