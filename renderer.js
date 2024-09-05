const uploadInput = document.getElementById('upload');
const btnSubmit = document.getElementById('submit');
const progressBar = document.getElementById('progress');
const listData = document.getElementById('listData');

uploadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    document.querySelector('.file-name').outerHTML = file.name;
})

document.getElementById('submit').addEventListener('click', async function (e) {
    const file = uploadInput.files[0];
    if (!file) {
        alert('Please select a file first.');
        return;
    }

    const fileName = file.name;
    document.querySelector('.progress-bar').classList.remove('hide');

    try {
        // Request a pre-signed URL from the main process
        const presignedUrl = await window.cloudlay.getPresignedUrl(fileName);

        // Upload the file directly to MinIO using the pre-signed URL
        await axios.put(presignedUrl, file, {
            headers: {
                'Content-Type': file.type
            },
            onUploadProgress: (progress) => {
                const percent = Math.round(progress.loaded * 100 / progress.total);
                progressBar.style.width = percent + '%';
            }
        });
        alert('File uploaded successfully!');
    } catch (error) {
        alert('Error uploading file');
    } finally {
        document.querySelector('.progress-bar').classList.add('hide');
    }
});

const download = async (name, versionId) => {
    try {
        document.querySelector('.loading').classList.remove('hidden');
        // Request a pre-signed URL from the main process
        const presignedUrl = await window.cloudlay.downloadFile(name, versionId);

        const response = await fetch(presignedUrl);
        console.log({ response });
        // if (!response.ok) throw new Error('Network response was not ok');

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        console.log({ error });
        alert('Error downloading file');
    } finally {
        document.querySelector('.loading').classList.add('hidden');
    }
}

const renderDataListBucket = async () => {
    const data = await window.cloudlay.getDataBucket();
    data.forEach(element => {
        console.log({ element });

        const node = document.createElement("div");
        const textnode = document.createTextNode(`${element.name}${element.versionId !== 'null' ? ` - Version: ${element.versionId}` : ''}`);
        node.onclick = () => download(element.name, element.versionId);
        node.appendChild(textnode);
        listData.appendChild(node);
    });
}

renderDataListBucket();