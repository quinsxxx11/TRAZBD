let currentDate = new Date();
window.activeDate = new Date().toISOString().split('T')[0]; 

export function initCalendar() {
    if (!document.getElementById('prev-month')) {
        const navDiv = document.createElement('div');
        navDiv.className = 'calendar-nav';
        navDiv.innerHTML = `
            <button id="prev-month">&larr;</button>
            <span id="current-month-year" style="font-weight:600;"></span>
            <button id="next-month">&rarr;</button>
        `;
        const container = document.getElementById('calendar-header-container');
        if (container) {
            container.innerHTML = '';
            container.appendChild(navDiv);
        }
    }

    document.getElementById('prev-month').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar(window.currentData);
    });

    document.getElementById('next-month').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar(window.currentData);
    });
}

export function renderCalendar(data) {
    window.currentData = data;
    const grid = document.getElementById('calendar-grid');
    const monthYearDisplay = document.getElementById('current-month-year');
    if (!grid) return;
    
    grid.innerHTML = `
        <div class="weekday">Пн</div><div class="weekday">Вт</div><div class="weekday">Ср</div>
        <div class="weekday">Чт</div><div class="weekday">Пт</div><div class="weekday">Сб</div><div class="weekday">Вс</div>
    `;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
    if (monthYearDisplay) monthYearDisplay.textContent = `${monthNames[month]} ${year}`;

    let firstDay = new Date(year, month, 1).getDay();
    firstDay = firstDay === 0 ? 6 : firstDay - 1; 
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'day empty';
        grid.appendChild(emptyDiv);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'day';
        dayDiv.textContent = day;
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        if (data.history[dateStr] && data.history[dateStr].completed.length > 0) {
            dayDiv.classList.add('completed');
        }

        if (dateStr === window.activeDate) {
            dayDiv.classList.add('active');
        }

        dayDiv.addEventListener('click', () => {
            window.activeDate = dateStr;
            renderCalendar(data);
            window.dispatchEvent(new CustomEvent('dateChanged', { detail: dateStr }));
        });

        grid.appendChild(dayDiv);
    }
}