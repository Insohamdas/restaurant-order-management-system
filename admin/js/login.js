/**
 * Admin Login Page Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  if (AuthService.isAuthenticated()) {
    window.location.href = 'dashboard.html';
    return;
  }

  const loginForm = document.getElementById('adminLoginForm');
  const errorAlert = document.getElementById('loginErrorAlert');

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const usernameInput = document.getElementById('adminUsername');
      const passwordInput = document.getElementById('adminPassword');

      const username = usernameInput.value.trim();
      const password = passwordInput.value.trim();

      if (AuthService.login(username, password)) {
        window.location.href = 'dashboard.html';
      } else {
        if (errorAlert) {
          errorAlert.textContent = 'Invalid credentials! Use demo credentials: admin / admin123';
          errorAlert.style.display = 'block';
        }
      }
    });
  }
});
