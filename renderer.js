const uploadInput = document.getElementById('upload');
const btnSubmit = document.getElementById('submit');
const progressBar = document.getElementById('progress');

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