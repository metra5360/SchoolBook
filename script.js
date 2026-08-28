const daysMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Завантаження даних при відкритті
document.addEventListener('DOMContentLoaded', () => {
  loadDiary();
  checkTomorrowTasks();
});

// Додавання нового блоку уроку
function addLesson(day, name = '', task = '') {
  const container = document.querySelector(`.day-card[data-day="${day}"] .schedule`);
  
  const lessonDiv = document.createElement('div');
  lessonDiv.className = 'lesson-item';
  
  lessonDiv.innerHTML = `
    <input type="text" placeholder="Назва уроку" value="${name}" oninput="saveDiary()">
    <textarea placeholder="Завдання / Нагадування" oninput="saveDiary()">${task}</textarea>
    <button class="delete-btn" onclick="removeLesson(this)">Видалити</button>
  `;
  
  container.appendChild(lessonDiv);
  saveDiary();
}

// Видалення уроку
function removeLesson(button) {
  button.parentElement.remove();
  saveDiary();
}

// Автозбереження у localStorage
function saveDiary() {
  const diaryData = {};
  
  document.querySelectorAll('.day-card').forEach(dayCard => {
    const day = dayCard.dataset.day;
    diaryData[day] = [];
    
    dayCard.querySelectorAll('.lesson-item').forEach(item => {
      const name = item.querySelector('input').value;
      const task = item.querySelector('textarea').value;
      
      diaryData[day].push({ name, task });
    });
  });
  
  localStorage.setItem('myDiaryData', JSON.stringify(diaryData));
  checkTomorrowTasks();
}

// Завантаження збережених даних
function loadDiary() {
  const saved = localStorage.getItem('myDiaryData');
  if (!saved) return;
  
  const diaryData = JSON.parse(saved);
  
  for (const day in diaryData) {
    diaryData[day].forEach(lesson => {
      addLesson(day, lesson.name, lesson.task);
    });
  }
}

// Перевірка нагадувань на завтра
function checkTomorrowTasks() {
  const todayIndex = new Date().getDay();
  const tomorrowIndex = (todayIndex + 1) % 7;
  const tomorrowKey = daysMap[tomorrowIndex];
  
  const saved = localStorage.getItem('myDiaryData');
  if (!saved) return;
  
  const diaryData = JSON.parse(saved);
  const tomorrowLessons = diaryData[tomorrowKey] || [];
  
  // Шукаємо уроки, де є заповнене завдання
  const tasksToDisplay = tomorrowLessons.filter(l => l.task.trim() !== '');
  
  const banner = document.getElementById('notification-banner');
  const bannerText = document.getElementById('notification-text');
  
  if (tasksToDisplay.length > 0) {
    document.body.classList.add('alert-mode');
    
    const lessonList = tasksToDisplay.map(l => l.name ? `"${l.name}"` : 'Урок без назви').join(', ');
    bannerText.textContent = `Увага! На завтра є завдання з таких предметів: ${lessonList}`;
    banner.classList.remove('hidden');
    
    // Підсвічуємо картку завтрашнього дня
    document.querySelectorAll('.day-card').forEach(card => {
      if (card.dataset.day === tomorrowKey) {
        card.classList.add('tomorrow-highlight');
      } else {
        card.classList.remove('tomorrow-highlight');
      }
    });
  } else {
    document.body.classList.remove('alert-mode');
    banner.classList.add('hidden');
    document.querySelectorAll('.day-card').forEach(card => card.classList.remove('tomorrow-highlight'));
  }
}
