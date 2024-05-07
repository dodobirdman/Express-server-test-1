// Function to delete a cookie by name
function deleteCookie(name) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}

// Function to redirect the user to login.html
function redirectToLogin() {
    window.location.href = 'login.html';
}

// Function to clear localStorage
function clearLocalStorage() {
    localStorage.clear();
}

// Delete the "username" cookie, clear localStorage, and redirect to login.html when the page loads
window.onload = function() {
    deleteCookie('username');
    clearLocalStorage();
    redirectToLogin();
};
