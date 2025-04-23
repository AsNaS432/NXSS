export function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('todoDB', 1);
        request.onupgradeneeded = event => {
            const db = event.target.result;
            db.createObjectStore('tasks', { keyPath: 'id', autoIncrement: true });
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function getTasks() {
    const db = await openDatabase();
    return new Promise(resolve => {
        const tx = db.transaction('tasks', 'readonly');
        const store = tx.objectStore('tasks');
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
    });
}

export async function addTask(text) {
    const db = await openDatabase();
    const task = { text, completed: false, created: new Date() };
    return new Promise(resolve => {
        const tx = db.transaction('tasks', 'readwrite');
        const store = tx.objectStore('tasks');
        store.add(task).onsuccess = () => resolve(task);
    });
}

export async function updateTask(id, updates) {
    const db = await openDatabase();
    const tx = db.transaction('tasks', 'readwrite');
    const store = tx.objectStore('tasks');
    const task = await new Promise(res => {
        const req = store.get(id);
        req.onsuccess = () => res(req.result);
    });
    Object.assign(task, updates);
    store.put(task);
}

export async function deleteTask(id) {
    const db = await openDatabase();
    const tx = db.transaction('tasks', 'readwrite');
    const store = tx.objectStore('tasks');
    store.delete(id);
}
