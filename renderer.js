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
    document.getElementById('submit').setAttribute("disabled", true);
    document.getElementById('loading').classList.remove('hidden');
    fetch(url, {
        method: 'PUT',
        body: file
    }).then(() => {
        // If multiple files are uploaded, append upload status on the next line.
        // document.querySelector('#status').innerHTML += `<br>Uploaded ${file.name}.`;
        document.getElementById('submit').removeAttribute("disabled");
        document.getElementById('loading').classList.add('hidden');
        alert('File uploaded successfully');
    }).catch((e) => {
        console.error(e);
        document.getElementById('error').classList.remove('hidden');
        document.getElementById('error').innerHTML = `<span style="color: red;margin-top: 20px; display: inline-block">Error</span>`;
    });
}
document.getElementById('upload').addEventListener('change', function (e) {
    e.preventDefault();
    var file = this.files[0];
    document.getElementById('error').classList.add('hidden');
    window.cloudlay.selectFile(file);
});

// document.getElementById('connect').addEventListener('click', function (e) {
//     e.preventDefault();
//     window.cloudlay.connect();
// });

document.getElementById('submit').addEventListener('click', async function (e) {
    // e.preventDefault();
    // window.cloudlay.submitFile();
    upload(document.getElementById('upload').files);
    // const fileInput = document.getElementById('upload');
    // const file = fileInput.files[0];
    // if (!file) {
    //     alert('Please select a file first.');
    //     return;
    // }

    // const fileName = file.name;

    // try {
    //     // Request a pre-signed URL from the main process
    //     const presignedUrl = await window.cloudlay.getPresignedUrl(fileName);
    //     console.log({ presignedUrl });

    //     // Upload the file directly to MinIO using the pre-signed URL
    //     document.getElementById('submit').setAttribute("disabled", true);
    //     document.getElementById('loading').classList.remove('hidden');
    //     fetch(presignedUrl, {
    //         method: 'PUT',
    //         body: file
    //     }).then(() => {
    //         // If multiple files are uploaded, append upload status on the next line.
    //         // document.querySelector('#status').innerHTML += `<br>Uploaded ${file.name}.`;
    //         document.getElementById('submit').removeAttribute("disabled");
    //         document.getElementById('loading').classList.add('hidden');
    //     }).catch((e) => {
    //         console.log(e);
    //         document.getElementById('error').classList.remove('hidden');
    //         document.getElementById('error').innerHTML = `<span style="color: red;margin-top: 20px; display: inline-block">Error</span>`;
    //     });
    // } catch (error) {
    //     console.error('Error uploading file:', error);
    //     alert('Error uploading file');
    // }
});

window.cloudlay.onStartUpload(() => {
    document.getElementById('submit').setAttribute("disabled", true);
    document.getElementById('loading').classList.remove('hidden');
})

window.cloudlay.onUploaded((value) => {
    document.getElementById('submit').removeAttribute("disabled");
    document.getElementById('loading').classList.add('hidden');
    if (value.status === 'error') {
        document.getElementById('error').classList.remove('hidden');
        document.getElementById('error').innerHTML = `<span style="color: red;margin-top: 20px; display: inline-block">${String(value.error)} - ${JSON.stringify(value.error)}</span>`;
    }
})

