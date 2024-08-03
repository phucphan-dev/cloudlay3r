const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('cloudlay', {
    getPresignedUrl: (fileName) => ipcRenderer.invoke('get-presigned-url', fileName)
})