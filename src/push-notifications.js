let notificationsEnabled = localStorage.getItem('notificationsEnabled') === 'true';
let reminderInterval;

export function requestNotificationPermission() {
    if (!('Notification' in window)) {
        alert('Браузер не поддерживает уведомления');
        return;
    }

    Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
            notificationsEnabled = true;
            localStorage.setItem('notificationsEnabled', 'true');
            console.log('Уведомления включены');
        } else {
            console.log('Уведомления не разрешены');
        }
    });
}

export function disableNotifications() {
    notificationsEnabled = false;
    localStorage.removeItem('notificationsEnabled');
    clearInterval(reminderInterval);
    console.log('Уведомления отключены');
}

export function showPushNotification(message) {
    if ('serviceWorker' in navigator && notificationsEnabled && Notification.permission === 'granted') {
        navigator.serviceWorker.ready.then(registration => {
            registration.showNotification('Умный список задач', {
                body: message,
                icon: '/icons/icon-192.png',
                tag: 'task-notification',
            });
        });
    }
}

export function scheduleReminder() {
    if (reminderInterval) clearInterval(reminderInterval);
    reminderInterval = setInterval(() => {
        const stored = localStorage.getItem('tasks');
        const tasks = stored ? JSON.parse(stored) : [];
        const hasActive = tasks.some(t => !t.completed);

        if (notificationsEnabled && hasActive) {
            showPushNotification('Напоминание: у вас есть невыполненные задачи!');
        }
    }, 10 * 1000); // каждые 2 часа
}
