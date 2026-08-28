const daysMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

document.addEventListener('DOMContentLoaded', () => {
  loadDiary();
  checkTomorrowTasks();
});

function addLesson(day, name = '', task = '') {
  const container = document.querySelector(`.day-card[data-day="${day}"] .schedule`);
  
  const lessonDiv = document.createElement('div');
  lessonDiv.className = 'lesson-item';
  
  lessonDiv.innerHTML = `
    <input type="text" placeholder="Назва уроку..." value="${name}" oninput="saveDiary()">
    <textarea placeholder="Домашнє завдання..." oninput="saveDiary()">${task}</textarea>
    <button class="delete-btn" onclick="removeLesson(this)">Видалити</button>
  `;
  
  container.appendChild(lessonDiv);
  saveDiary();
}

function removeLesson(button) {
  button.parentElement.remove();
  saveDiary();
}

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
  
  localStorage.setItem('myDiaryData_v2', JSON.stringify(diaryData));
  checkTomorrowTasks();
}

function loadDiary() {
  const saved = localStorage.getItem('myDiaryData_v2');
  if (!saved) return;
  
  const diaryData = JSON.parse(saved);
  
  for (const day in diaryData) {
    diaryData[day].forEach(lesson => {
      addLesson(day, lesson.name, lesson.task);
    });
  }
}

function checkTomorrowTasks() {
  const todayIndex = new Date().getDay();
  const tomorrowIndex = (todayIndex + 1) % 7;
  const tomorrowKey = daysMap[tomorrowIndex];
  
  const saved = localStorage.getItem('myDiaryData_v2');
  if (!saved) return;
  
  const diaryData = JSON.parse(saved);
  const tomorrowLessons = diaryData[tomorrowKey] || [];
  
  const tasksToDisplay = tomorrowLessons.filter(l => l.task.trim() !== '');
  
  const banner = document.getElementById('notification-banner');
  const bannerText = document.getElementById('notification-text');
  
  if (tasksToDisplay.length > 0) {
    document.body.classList.add('alert-mode');
    
    const lessonList = tasksToDisplay.map(l => l.name ? `"${l.name}"` : 'Урок').join(', ');
    bannerText.textContent = `Завдання на завтра з предметів: ${lessonList}`;
    banner.classList.remove('hidden');
    
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
