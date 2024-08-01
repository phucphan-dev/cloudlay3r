const { app, BrowserWindow, ipcMain } = require('electron/main');
const path = require('node:path');
const fs = require('fs');
const minio = require('minio');
const { Notification } = require('electron');

function createWindow() {
    const win = new BrowserWindow({
        width: 1366,
        height: 768,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js')
        }
    })

    let fileUpload;

    ipcMain.handle('connect', async () => {
        const mc = new minio.Client({
            endPoint: 'sg-central-1.cloudlay3r.com',
            useSSL: true,
            accessKey: 'gBTMPBO5yMmFWD0Dvsg5',
            secretKey: 'NoomOCZ2utFwh9BqOEoDQ6x6LJuWtcEvdQJUlsar',
        });
        // list buckets
        const res = await mc.listBuckets();
    })

    ipcMain.on('selectFile', async (event, file) => {
        console.log({ file });
        fileUpload = file;
    })
    ipcMain.handle('submit', async (event) => {
        function upload(files) {
            // Get selected files from the input element.
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                // Retrieve a URL from our server.
                retrieveNewURL(file, (file, url) => {
                    // Upload the file to the server.
                    uploadFile(file, url);
                });
            }
        }

        // `retrieveNewURL` accepts the name of the current file and invokes the `/presignedUrl` endpoint to
        // generate a pre-signed URL for use in uploading that file: 
        function retrieveNewURL(file, cb) {
            console.log({ file });
            fetch(`http://api.cloudlay3r.com:8080/presignedUrl?name=${file.name}`).then((response) => {
                response.text().then((url) => {
                    cb(file, url);
                });
            }).catch((e) => {
                console.error(e);
            });
        }

        // ``uploadFile` accepts the current filename and the pre-signed URL. It then uses `Fetch API`
        // to upload this file to S3 at `play.min.io:9000` using the URL:
        function uploadFile(file, url) {
            // if (document.querySelector('#status').innerText === 'No uploads') {
            //     document.querySelector('#status').innerHTML = '';
            // }
            console.log({ file, url });
            fetch(url, {
                method: 'PUT',
                body: file
            }).then(() => {
                // If multiple files are uploaded, append upload status on the next line.
                // document.querySelector('#status').innerHTML += `<br>Uploaded ${file.name}.`;
            }).catch((e) => {
                console.error(e);
            });
        }
        if (!fileUpload) {
            return;
        }
        const fileStream = fs.readFile(fileUpload.path);
        upload([fileStream]);
        // win.webContents.send("startUpload");
        // const mc = new minio.Client({
        //     endPoint: 'sg-central-1.cloudlay3r.com',
        //     port: 443,
        //     useSSL: true,
        //     accessKey: 'gBTMPBO5yMmFWD0Dvsg5',
        //     secretKey: 'NoomOCZ2utFwh9BqOEoDQ6x6LJuWtcEvdQJUlsar',
        //     region: 'us-west-1',
        // });
        // // const fileStream = fs.createReadStream(fileUpload.path);
        // // console.log({ fileUpload });
        // try {
        //     const bucketName = await mc.makeBucket('loitran-20240517', 'us-west-1')
        //     const res = await mc.fPutObject(bucketName, fileUpload.name, fileUpload.path, {
        //         'Content-Type': fileUpload.type,
        //         'Size': fileUpload.size,
        //         'LastModified': fileUpload.lastModified
        //     });
        //     win.webContents.send("uploaded", { status: 'success', res });
        //     new Notification({ title: 'Upload Success', body: 'File uploaded successfully' }).show();
        // } catch (error) {
        //     console.log({ error });
        //     new Notification({ title: 'Upload Error', body: 'An error has occurred' }).show();
        //     win.webContents.send("uploaded", { status: 'error', error });
        // }
    })

    // new
    ipcMain.handle('get-presigned-url', async (event, fileName) => {
        const mc = new minio.Client({
            endPoint: 'sg-central-1.cloudlay3r.com',
            useSSL: true,
            accessKey: 'gBTMPBO5yMmFWD0Dvsg5',
            secretKey: 'NoomOCZ2utFwh9BqOEoDQ6x6LJuWtcEvdQJUlsar',
            region: 'us-west-1',
        });
        return new Promise((resolve, reject) => {
            mc.presignedPutObject('loitran-20240517', fileName, (err, url) => {
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