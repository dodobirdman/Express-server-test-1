document.addEventListener('DOMContentLoaded', async () => {
    const loginForm = document.getElementById('login-form');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');

        const username = usernameInput.value;
        const password = passwordInput.value;

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

                // Call the function to fetch user data
                await fetchUserData(username);

                // Redirect to the dashboard
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

async function fetchUserData(username) {
    try {
        const response = await fetch('/fetch-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch data from the server');
        }

        const responseData = await response.json();

        Object.entries(responseData).forEach(([key, value]) => {
            localStorage.setItem(key, value);
        });

        console.log('Data fetched and saved to localStorage successfully.');
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
}
