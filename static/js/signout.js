// Slette brugerens cookie
function deleteCookie(name) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}

// videresender brugeren til login.html
function redirectToLogin() {
    window.location.href = 'login.html';
}

// Sletter data fra localStorage
function clearLocalStorage() {
    localStorage.clear();
}

// Sletter username cookie og localStorage data, og videresender brugeren til login siden
window.onload = function() {
    deleteCookie('username');
    clearLocalStorage();
    redirectToLogin();
};
