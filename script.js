let currentDate = new Date();
let selectedDateStr = null;
let tasksData = JSON.parse(localStorage.getItem('calendar_tasks_v3')) || {};

const months = ['Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень', 'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'];

document.addEventListener('DOMContentLoaded', () => {
  renderCalendar();
  checkTomorrowTasks();
});

function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  document.getElementById('month-year-title').textContent = `${months[month]} ${year}`;

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  let startingDay = firstDay.getDay() - 1;
  if (startingDay === -1) startingDay = 6;

  const totalDays = lastDay.getDate();
  const prevMonthLastDay = new Date(year, month, 0).getDate();

  const daysContainer = document.getElementById('calendar-days');
  daysContainer.innerHTML = '';

  for (let i = startingDay - 1; i >= 0; i--) {
    const dayDiv = document.createElement('div');
    dayDiv.className = 'day-cell other-month';
    dayDiv.textContent = prevMonthLastDay - i;
    daysContainer.appendChild(dayDiv);
  }

  const tomorrowStr = getTomorrowDateString();

  for (let day = 1; day <= totalDays; day++) {
    const dayDiv = document.createElement('div');
    dayDiv.className = 'day-cell';
    dayDiv.textContent = day;

    const dateKey = formatDateKey(year, month, day);

    if (tasksData[dateKey] && tasksData[dateKey].some(t => t.subject.trim() || t.text.trim())) {
      dayDiv.classList.add('has-tasks');
    }

    if (dateKey === tomorrowStr) {
      dayDiv.classList.add('is-tomorrow');
    }

    if (dateKey === selectedDateStr) {
      dayDiv.classList.add('selected');
    }

    dayDiv.onclick = () => selectDate(dateKey, dayDiv);
    daysContainer.appendChild(dayDiv);
  }
}

function selectDate(dateKey, element) {
  document.querySelectorAll('.day-cell').forEach(el => el.classList.remove('selected'));
  element.classList.add('selected');

  selectedDateStr = dateKey;
  
  const [y, m, d] = dateKey.split('-');
  document.getElementById('selected-date-title').textContent = `${parseInt(d)} ${months[parseInt(m)]}`;
  
  const tomorrowBadge = document.getElementById('tomorrow-badge');
  if (dateKey === getTomorrowDateString()) {
    tomorrowBadge.classList.remove('hidden');
  } else {
    tomorrowBadge.classList.add('hidden');
  }

  document.getElementById('add-task-btn').classList.remove('hidden');
  renderTasks();
}

function renderTasks() {
  const tasksList = document.getElementById('tasks-list');
  tasksList.innerHTML = '';

  const dayTasks = tasksData[selectedDateStr] || [];

  if (dayTasks.length === 0) {
    tasksList.innerHTML = '<p class="empty-state">На цей день немає завдань.</p>';
    return;
  }

  dayTasks.forEach((task, index) => {
    const taskDiv = document.createElement('div');
    taskDiv.className = 'task-item';
    
    const inputSubject = document.createElement('input');
    inputSubject.type = 'text';
    inputSubject.placeholder = 'Предмет...';
    inputSubject.value = task.subject;
    inputSubject.oninput = (e) => updateTask(index, 'subject', e.target.value);
    inputSubject.onchange = () => { renderCalendar(); checkTomorrowTasks(); };

    const textareaTask = document.createElement('textarea');
    textareaTask.placeholder = 'Домашнє завдання...';
    textareaTask.value = task.text;
    textareaTask.oninput = (e) => updateTask(index, 'text', e.target.value);
    textareaTask.onchange = () => { renderCalendar(); checkTomorrowTasks(); };

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'Видалити';
    deleteBtn.onclick = () => removeTask(index);

    taskDiv.appendChild(inputSubject);
    taskDiv.appendChild(textareaTask);
    taskDiv.appendChild(deleteBtn);
    
    tasksList.appendChild(taskDiv);
  });
}

function addNewTaskInput() {
  if (!selectedDateStr) return;
  if (!tasksData[selectedDateStr]) tasksData[selectedDateStr] = [];

  tasksData[selectedDateStr].push({ subject: '', text: '' });
  saveData();
  renderTasks();
  renderCalendar();
}

function updateTask(index, field, value) {
  if (tasksData[selectedDateStr] && tasksData[selectedDateStr][index]) {
    tasksData[selectedDateStr][index][field] = value;
    saveData();
  }
}

function removeTask(index) {
  tasksData[selectedDateStr].splice(index, 1);
  if (tasksData[selectedDateStr].length === 0) {
    delete tasksData[selectedDateStr];
  }
  saveData();
  renderTasks();
  renderCalendar();
  checkTomorrowTasks();
}

function saveData() {
  localStorage.setItem('calendar_tasks_v3', JSON.stringify(tasksData));
}

function changeMonth(delta) {
  currentDate.setMonth(currentDate.getMonth() + delta);
  renderCalendar();
}

function checkTomorrowTasks() {
  const tomorrowStr = getTomorrowDateString();
  const tomorrowTasks = tasksData[tomorrowStr] || [];

  const tasksWithContent = tomorrowTasks.filter(t => t.text.trim() !== '' || t.subject.trim() !== '');

  const banner = document.getElementById('notification-banner');
  const bannerText = document.getElementById('notification-text');

  if (tasksWithContent.length > 0) {
    document.body.classList.add('alert-mode');
    
    const subjectsList = tasksWithContent.map(t => t.subject ? `"${t.subject}"` : 'Предмет').join(', ');
    bannerText.innerHTML = `<strong>На завтра є домашнє завдання!</strong> Предмети: ${subjectsList}`;
    banner.classList.remove('hidden');
  } else {
    document.body.classList.remove('alert-mode');
    banner.classList.add('hidden');
  }
}

function getTomorrowDateString() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return formatDateKey(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
}

function formatDateKey(year, month, day) {
  return `${year}-${month}-${day}`;
}
