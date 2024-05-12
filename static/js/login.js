// Kode til at vise/fjerne en loading GIF imens JS venter på svar fra API'en
function showLoadingOverlay() {
    document.getElementById('loading-foodinspector').style.display = 'flex';
}
function hideLoadingOverlay() {
    document.getElementById('loading-foodinspector').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', async () => {
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        showLoadingOverlay();
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
                // Sætter en cookie i browseren med brugernavnet
                document.cookie = `username=${username}; path=/`;
                // Kalder funktion til at hente brugerdata fra serveren
                await fetchUserData(username);
                // Fjern loading GIF'en
                hideLoadingOverlay();
                // Sender brugeren til profilsiden
                window.location.href = '/static/html/profile.html';
            } else {
                const errorMessage = await response.text();
                alert(errorMessage); // Display error message
                hideLoadingOverlay();
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.'); // Display generic error message
            hideLoadingOverlay
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
