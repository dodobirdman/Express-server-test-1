document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                const message = await response.text();
                alert(message); // Display success message

                // Set cookie upon successful login
                document.cookie = `username=${username}; path=/`; // Set cookie with username
                

                // Redirect the user to another page (e.g., dashboard) after successful login
                window.location.href = '/static/html/dashboard.html';
            } else {
                const errorMessage = await response.text();
                alert(errorMessage); // Display error message
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.'); // Display generic error message
        }
    });
});
