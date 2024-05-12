document.addEventListener('DOMContentLoaded', () => {
    // Henter signup-form fra HTML
    const signupForm = document.getElementById('signup-form');

    // Kører kode når brugeren trykker på signup knappen
    signupForm.addEventListener('submit', async (event) => {
        // Kode der stopper automatisk refresh af siden
        event.preventDefault();
        // Henter data fra input felterne
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const name = document.getElementById('name').value;
        const height = document.getElementById('height').value;
        const weight = document.getElementById('weight').value;
        const age = document.getElementById('age').value;
        const sex = document.getElementById('sex').value;
        // Kalder /signup api'en med POST, og sender en JSON fil med brugerens data
        try {
            const response = await fetch('/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password, name, height, weight, age, sex })
            });
            // Koden viser succesbeskeden fra serveren
            if (response.ok) {
                const message = await response.text();
                alert(message); 
                window.location.href = '/static/html/login.html';
            } else {
                // Hvis brugeren eksisterer i forvejen, vises en fejlbesked
                const errorMessage = await response.text();
                alert(errorMessage); // Fejlbesked
            }
            // Fejlbesked hvis forbindelsen til serveren fejler
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.'); 
        }
    });
});
