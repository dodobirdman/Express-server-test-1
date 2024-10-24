// Kode til at vise/fjerne en loading GIF imens JS venter på svar fra API'en
function showLoadingOverlay() {
    document.getElementById('loading-foodinspector').style.display = 'flex';
}
function hideLoadingOverlay() {
    document.getElementById('loading-foodinspector').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', async () => {
    const loginForm = document.getElementById('login-form');
    // Kører kode når brugeren trykker på login knappen
    loginForm.addEventListener('submit', async (event) => {
        // Kode der stopper automatisk refresh af siden
        event.preventDefault();
        showLoadingOverlay();
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const username = usernameInput.value;
        const password = passwordInput.value;
        // Kalder /login api'en med brugernavn og password
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
                alert(errorMessage); // Viser fejlbesked fra serveren
                hideLoadingOverlay();
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.'); // Viser en generelt fejlbesked hvis serveren ikke svarer
            hideLoadingOverlay
        }
    });
});

// Kører fetchUserData til at hente brugerens data fra databasen
async function fetchUserData(username) {
    try {
        const response = await fetch('/fetch-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username })
        });
        // Viser fejlbesked hvis serveren ikke giver et OK svar
        if (!response.ok) {
            throw new Error('Failed to fetch data from the server');
        }
        // Venter på response dataen fra serveren
        const responseData = await response.json();
        // Loop der gemmer dataen i localStorage for alle objekter givet at API'en
        Object.entries(responseData).forEach(([key, value]) => {
            localStorage.setItem(key, value);
        });
        console.log('Data fetched and saved to localStorage successfully.');
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
}

async function measureRTT() {
    const startTime = performance.now(); // Starttidsstempel
  
    const response = await fetch('/api/ping', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ startTime }),
    });
  
    const endTime = performance.now(); // Sluttidsstempel
    const { serverTime } = await response.json();
  
    const RTT = endTime - startTime;
    console.log(`RTT: ${RTT} ms`);
    console.log(`Server Processing Time: ${serverTime - startTime} ms`);
  }
  
  measureRTT();
  