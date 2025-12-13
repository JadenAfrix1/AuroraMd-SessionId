const express = require('express');
const path = require('path');
const app = express();
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 5000;

let server = require('./qr'),
    code = require('./pair');

require('events').EventEmitter.defaultMaxListeners = 500;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/qr-scan', server);
app.use('/code', code);

app.get('/qr', (req, res) => {
    res.sendFile(path.join(__dirname, 'qr.html'));
});

app.get('/pair', (req, res) => {
    res.sendFile(path.join(__dirname, 'pair.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'main.html'));
});

if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`AURORA MD Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;
