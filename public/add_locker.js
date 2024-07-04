let selectedLockerId = null;
let currentUserPhone = localStorage.getItem('currentUserPhone');
let lockerDataFileName = localStorage.getItem('lockerDataFileName'); // Get the locker data file name

if (!currentUserPhone) {
    alert('User information not found. Please login again.');
    window.location.href = 'index.html';
    throw new Error('User information not found'); // Terminate script execution
}

if (!lockerDataFileName) {
    alert('Locker data file information not found. Please scan the QR code again.');
    window.location.href = 'index.html';
    throw new Error('Locker data file information not found'); // Terminate script execution
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded');
    
    fetch('/getLockerData', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fileName: lockerDataFileName }) // Send the file name to the server
    })
    .then(response => response.json())
    .then(data => {
        console.log('Locker data:', data);
        
        const lockerContainer = document.getElementById('lockerContainer');
        for (let i = 1; i <= 16; i++) {
            const locker = document.createElement('div');
            locker.className = 'locker';
            locker.textContent = `Locker ${i}`;
            const occupiedLocker = data.occupiedLockers.find(locker => locker.lockerId === i.toString());

            if (occupiedLocker) {
                locker.classList.add('occupied');
            } else {
                locker.addEventListener('click', function() {
                    if (selectedLockerId !== null) {
                        document.querySelector(`.locker.selected`).classList.remove('selected');
                    }
                    selectedLockerId = i;
                    locker.classList.add('selected');
                });
            }
            lockerContainer.appendChild(locker);
        }
    })
    .catch(error => {
        console.error('Error fetching locker data:', error);
        alert('An error occurred while fetching locker data.');
    });
});

function selectLocker() {
    const duration = document.getElementById('duration').value;
    if (!selectedLockerId) {
        alert('Please select a locker first.');
        return;
    }
    if (!duration || duration <= 0) {
        alert('Please enter a valid duration.');
        return;
    }

    fetch('/selectLocker', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ lockerId: selectedLockerId, duration: duration, phoneNumber: currentUserPhone, fileName: lockerDataFileName })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Server response:', data); // Log server response for debugging
        if (data.success) {
            window.location.href = 'main_page.html';
        } else {
            alert('Failed to select locker');
        }
    })
    .catch(error => {
        console.error('Error selecting locker:', error);
        alert('An error occurred while selecting the locker.');
    });
}
