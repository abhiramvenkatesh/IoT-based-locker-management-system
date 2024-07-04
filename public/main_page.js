document.addEventListener('DOMContentLoaded', function() {
    fetch('/getUserData')
        .then(response => response.json())
        .then(data => {
            console.log('Received data:', data); // Log received data
            if (data.success) {
                document.getElementById('welcomeMessage').textContent = `Welcome, ${data.name}`;
                const lockerList = document.getElementById('lockerList');

                if (data.lockers.length > 0) { 
                    data.lockers.forEach(locker => { 
                        const listItem = document.createElement('li');
                        listItem.textContent = `Locker ID: ${locker.locker}, File Name: ${locker.fileName}, Expiry Time: ${locker.expiry}`; 

                        const releaseButton = document.createElement('button');
                        releaseButton.textContent = 'Release';
                        releaseButton.onclick = function() {
                            handleReleaseLocker(locker.locker,locker.fileName);
                        };

                        const extendButton = document.createElement('button');
                        extendButton.textContent = 'Extend';
                        extendButton.onclick = function() {
                            handleExtendLocker(locker.locker,locker.fileName);
                        };

                        const remainingTimeSpan = document.createElement('span');
                        remainingTimeSpan.className = 'remaining-time';
                        updateRemainingTime(locker.locker, locker.expiry,locker.fileName, remainingTimeSpan);

                        listItem.appendChild(releaseButton);
                        listItem.appendChild(extendButton);
                        listItem.appendChild(remainingTimeSpan);

                        lockerList.appendChild(listItem);
                    });
                } else {
                    lockerList.textContent = 'No lockers assigned.';
                }
            } else {
                alert(data.message || 'Failed to fetch user data');
                window.location.href = 'login_html.html';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while fetching user data.');
        });

    const storedLocation = localStorage.getItem('scannedLocation');
    if (storedLocation) {
        document.getElementById('addLockerButton').style.display = 'block';
    }
});

function updateRemainingTime(lockerId, expiryTime,file_name, remainingTimeElement) {
    const expiry = new Date(expiryTime);
    const currentTime = new Date();
    const timeDifference = expiry.getTime() - currentTime.getTime();

    if (timeDifference <= 0) {
        handleReleaseLocker(lockerId,file_name);
        remainingTimeElement.textContent = 'Locker released'; // Example message, adjust as needed
    } else {
        const remainingHours = Math.floor(timeDifference / (1000 * 60 * 60));
        const remainingMinutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
        remainingTimeElement.textContent = `Remaining Time: ${remainingHours}h ${remainingMinutes}m`;
        
        // Request animation frame to update remaining time continuously
        requestAnimationFrame(() => {
            updateRemainingTime(lockerId, expiryTime,file_name, remainingTimeElement);
        });
    }
}

function handleReleaseLocker(lockerId,filetoberemoved) {
    fetch('/releaseLocker', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ lockerId ,filetoberemoved})
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            location.reload();
        } else {
            alert('Failed to release locker');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while releasing the locker.');
    });
}

function handleExtendLocker(lockerId, dir) {
    fetch('/extendLocker', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ lockerId, dir })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            location.reload(); // Reload the page if locker extension is successful
        } else {
            console.log('Server response:', data); // Log server response in case of failure
            alert('Failed to extend locker: ' + data.message); // Display server-side error message
        }
    })
    .catch(error => {
        console.log('Fetch error:', error); // Log fetch operation errors
        alert('An error occurred while extending the locker.'); // Display an alert for any fetch errors
    });
}


function startScan() {
    const video = document.getElementById('preview');
    const constraints = { video: { facingMode: 'environment' } };

    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
        video.srcObject = stream;
        video.setAttribute('playsinline', true);
        video.play();
        requestAnimationFrame(tick);
    });
}

function tick() {
    const video = document.getElementById('preview');
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        const canvasElement = document.createElement('canvas');
        const canvas = canvasElement.getContext('2d');
        canvasElement.width = video.videoWidth;
        canvasElement.height = video.videoHeight;
        canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);

        const imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
            const qrData = code.data;
            if (qrData.includes('locationA.txt')) {
                scannedLocation = 'locationA';
            } else if (qrData.includes('locationB.txt')) {
                scannedLocation = 'locationB';
            } else if (qrData.includes('locationC.txt')) {
                scannedLocation = 'locationC';
            } else if (qrData.includes('locker_data.txt')) {
                scannedLocation = 'default location';
            } else {
                alert('Invalid QR code. Please scan a valid QR code.');
                return;
            }

            // Store the scanned location and file name in localStorage
            localStorage.setItem('scannedLocation', scannedLocation);
            localStorage.setItem('lockerDataFileName', qrData); // Assuming qrData is the filename without .txt

            setLockerDataFile(qrData);
            document.getElementById('addLockerButton').style.display = 'block';
            video.srcObject.getTracks().forEach(track => track.stop());
        }
    }
    requestAnimationFrame(tick);
}

function setLockerDataFile(filename) {
    fetch('/setLockerDataFile', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ filename })
    })
    .then(response => response.json())
    .then(data => {
        if (!data.success) {
            alert('Failed to set locker data file');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while setting the locker data file.');
    });
}
// creating the local storage for add_locker.js
localStorage.setItem('lockerDataFileName',lockerDataFilePath);

function refreshPage() {
    window.location.reload();
}
