const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('cloudlay', {
    getPresignedUrl: (fileName) => ipcRenderer.invoke('get-presigned-url', fileName),
    getDataBucket: () => ipcRenderer.invoke('get-bucket-data'),
    downloadFile: (fileName, versionId) => ipcRenderer.invoke('download-file', { fileName, versionId })
})