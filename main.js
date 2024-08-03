const { app, BrowserWindow, ipcMain } = require('electron/main');
const path = require('node:path');
const fs = require('fs');
const minio = require('minio');
const { Notification } = require('electron');

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js')
        }
    })

    ipcMain.handle('get-presigned-url', async (event, fileName) => {
        const mc = new minio.Client({
            endPoint: 'sg-central-1.cloudlay3r.com',
            useSSL: true,
            accessKey: 'gBTMPBO5yMmFWD0Dvsg5',
            secretKey: 'NoomOCZ2utFwh9BqOEoDQ6x6LJuWtcEvdQJUlsar',
            region: 'us-west-1',
        });
        return new Promise((resolve, reject) => {
            mc.presignedPutObject('loitran-20240517', fileName, 24 * 60 * 60, (err, url) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(url);
                }
            });
        });
    });

    const env = process.env.NODE_ENV || 'development';
    // If development environment 
    // win.webContents.openDevTools();
    if (env === 'development') {
        try {
            require('electron-reloader')(module, {
                debug: true,
                watchRenderer: true
            });
        } catch (_) { console.log('Error'); }
    }
    win.loadFile('index.html')
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})