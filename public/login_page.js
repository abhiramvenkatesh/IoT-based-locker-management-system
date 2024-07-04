document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const phone = document.getElementById('phone').value;

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            if (data.newUser) {
                const name = prompt('Phone number not found. Please enter your name:');
                if (name) {
                    fetch('/register', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ phone, name })
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            window.location.href = 'main_page.html';
                        } else {
                            alert('Registration failed');
                        }
                    })
                    .catch(error => console.error('Error:', error));
                }
            } else {
                window.location.href = 'main_page.html';
            }
        } else {
            alert('Login failed');
        }
    })
    .catch(error => console.error('Error:', error));
});
// local Storage creating starts
localStorage.setItem('currentUserPhone',phone);