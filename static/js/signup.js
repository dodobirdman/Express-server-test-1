document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');

    signupForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const name = document.getElementById('name').value;
        const height = document.getElementById('height').value;
        const weight = document.getElementById('weight').value;
        try {
            const response = await fetch('/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password, name, height, weight })
            });

            if (response.ok) {
                const message = await response.text();
                alert(message); // Display success message
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
