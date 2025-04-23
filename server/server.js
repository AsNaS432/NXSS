const express = require('express');
const webpush = require('web-push');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

const VAPID_KEYS = webpush.generateVAPIDKeys(); // для постоянного проекта — сгенерируй 1 раз и вставь

webpush.setVapidDetails(
    'mailto:example@pwa.app',
    VAPID_KEYS.publicKey,
    VAPID_KEYS.privateKey
);

let subscriptions = [];

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/vapidPublicKey', (req, res) => {
    res.send(VAPID_KEYS.publicKey);
});

app.post('/subscribe', (req, res) => {
    subscriptions.push(req.body);
    res.status(201).json({});
});

app.post('/notify', (req, res) => {
    const { title, text } = req.body;
    const payload = JSON.stringify({ title, text });

    subscriptions.forEach(sub => {
        webpush.sendNotification(sub, payload).catch(err => console.error(err));
    });

    res.status(200).json({});
});

// Отправка напоминаний 
setInterval(() => {
    const payload = JSON.stringify({
        title: 'Напоминание',
        text: 'У тебя есть невыполненные задачи!'
    });

    subscriptions.forEach(sub => {
        webpush.sendNotification(sub, payload).catch(err => console.error(err));
    });
}, 10 * 1000); 

const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
