const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('cloudlay', {
    selectFile: (fileData) => {
        ipcRenderer.send('selectFile', fileData)
    },
    submitFile: () => {
        ipcRenderer.invoke('submit');
    },
    onUploaded: (callback) => ipcRenderer.on('uploaded', (_event, value) => callback(value)),
    onStartUpload: (callback) => ipcRenderer.on('startUpload', (_event) => callback()),
    getPresignedUrl: (fileName) => ipcRenderer.invoke('get-presigned-url', fileName)
})