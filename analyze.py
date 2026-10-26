import json
from datetime import datetime
from collections import Counter
import os

def analyze_tracker(file_path):
    try:
        with open(file_path, 'rb') as f:
            binary_data = f.read()
            json_string = binary_data.decode('utf-8')
            data = json.loads(json_string)
            
    except FileNotFoundError:
        print(f"Файл {file_path} не найден. Запустите приложение и добавьте привычки.")
        return
    except Exception as e:
        print(f"Ошибка чтения файла: {e}")
        return

    habits = {h['id']: h['name'] for h in data.get('habits', [])}
    history = data.get('history', {})

    if not history:
        print("Нет данных для анализа.")
        return

    dates = sorted(history.keys())
    streaks = {h_id: 0 for h_id in habits}
    max_streaks = {h_id: 0 for h_id in habits}
    
    prev_date = None
    for date_str in dates:
        current_date = datetime.strptime(date_str, '%Y-%m-%d')
        day_data = history[date_str]
        completed_habits = day_data.get('completed', [])
        
        for h_id in habits:
            if h_id in completed_habits:
                if prev_date and (current_date - prev_date).days == 1:
                    streaks[h_id] += 1
                else:
                    streaks[h_id] = 1
                max_streaks[h_id] = max(max_streaks[h_id], streaks[h_id])
            else:
                streaks[h_id] = 0
        prev_date = current_date

    print("=== Анализ привычек ===")
    for h_id, name in habits.items():
        print(f"Привычка: {name} | Макс. серия: {max_streaks[h_id]} дн.")

    missed_counts = Counter()
    for date_str, day_data in history.items():
        completed = day_data.get('completed', [])
        for h_id in habits:
            if h_id not in completed:
                missed_counts[h_id] += 1
                
    if missed_counts:
        most_missed_id = missed_counts.most_common(1)[0][0]
        print(f"\nСамая частая пропущенная привычка: {habits[most_missed_id]}")

    total_tasks = sum(len(day.get('completed', [])) for day in history.values())
    avg_tasks = total_tasks / len(history) if history else 0
    print(f"Среднее число выполненных задач в день: {avg_tasks:.2f}")

if __name__ == "__main__":
    analyze_tracker(os.path.join('data', 'tracker_backup.db'))