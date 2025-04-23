import {
    requestNotificationPermission,
    showPushNotification,
    scheduleReminder,
    disableNotifications
} from './push-notifications.js';

let tasks = [];
let filter = 'all';

const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');

// Загрузка при старте
window.onload = () => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
            .then(() => console.log('Service Worker зарегистрирован'))
            .catch(err => console.error('Ошибка регистрации SW:', err));
    }

    const stored = localStorage.getItem('tasks');
    tasks = stored ? JSON.parse(stored) : [];
    renderTasks();
    scheduleReminder();

    document.getElementById('enable-notifications').onclick = requestNotificationPermission;
    document.getElementById('disable-notifications').onclick = disableNotifications;

    // Добавление задачи при отправке формы
    document.getElementById('task-form').addEventListener('submit', (e) => {
        e.preventDefault();
        addTask();
    });

    // Кнопки фильтра
    document.getElementById('filter-all').addEventListener('click', () => filterTasks('all'));
    document.getElementById('filter-active').addEventListener('click', () => filterTasks('active'));
    document.getElementById('filter-completed').addEventListener('click', () => filterTasks('completed'));
};

// Добавление новой задачи
function addTask() {
    const text = taskInput.value.trim();
    if (!text) return;

    const task = {
        id: Date.now(),
        text,
        completed: false
    };

    tasks.push(task);
    saveTasks();
    renderTasks();
    taskInput.value = '';

    showPushNotification('Новая задача добавлена: ' + text);
}

// Сохранение в localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Отрисовка списка задач
function renderTasks() {
    taskList.innerHTML = '';
    const filtered = tasks.filter(task => {
        if (filter === 'active') return !task.completed;
        if (filter === 'completed') return task.completed;
        return true;
    });

    filtered.forEach(task => {
        const li = document.createElement('li');
        li.className = task.completed ? 'completed' : '';

        const span = document.createElement('span');
        span.textContent = task.text;
        span.style.flex = '1';
        span.onclick = () => toggleTask(task.id);

        const editBtn = document.createElement('button');
        editBtn.textContent = '✏️';
        editBtn.style.border = 'none';
        editBtn.style.background = 'transparent';
        editBtn.style.cursor = 'pointer';
        editBtn.style.marginRight = '8px';
        editBtn.onclick = (e) => {
            e.stopPropagation();
            startEditing(task.id, span, li);
        };

        const delBtn = document.createElement('button');
        delBtn.textContent = '🗑️';
        delBtn.style.border = 'none';
        delBtn.style.background = 'transparent';
        delBtn.style.cursor = 'pointer';
        delBtn.onclick = (e) => {
            e.stopPropagation();
            deleteTask(task.id);
        };

        li.style.display = 'flex';
        li.style.alignItems = 'center';
        li.appendChild(span);
        li.appendChild(editBtn);
        li.appendChild(delBtn);
        taskList.appendChild(li);
    });
}

// Начать редактирование задачи
function startEditing(id, span, li) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const input = document.createElement('input');
    input.type = 'text';
    input.value = task.text;
    input.style.flex = '1';
    input.style.fontSize = '16px';
    input.style.padding = '4px 8px';
    input.style.borderRadius = '4px';
    input.style.border = '1px solid #4caf50';

    // Заменяем span на input
    li.replaceChild(input, span);
    input.focus();

    // Сохранить при потере фокуса
    input.onblur = () => finishEditing(id, input, li);

    // Сохранить при нажатии Enter
    input.onkeydown = (e) => {
        if (e.key === 'Enter') {
            input.blur();
        }
        if (e.key === 'Escape') {
            // Отмена редактирования
            li.replaceChild(span, input);
        }
    };
}

// Завершить редактирование задачи
function finishEditing(id, input, li) {
    const newText = input.value.trim();
    if (!newText) {
        // Если пусто, не меняем текст, просто перерисовываем
        renderTasks();
        return;
    }
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.text = newText;
        saveTasks();
        renderTasks();
    }
}

// Переключение выполнения задачи
function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
}

// Удаление задачи
function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks();
}

// Фильтрация задач
function filterTasks(mode) {
    filter = mode;
    renderTasks();
}
