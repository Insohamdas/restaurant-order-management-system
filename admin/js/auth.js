/**
 * Admin Authentication & Session Guard
 * Note: Demonstration authentication for student/portfolio project.
 */

const ADMIN_SESSION_KEY = 'restaurant_admin_auth';

const AuthService = {
  /**
   * Validate credentials
   */
  login(username, password) {
    if (username === 'admin' && password === 'admin123') {
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({
        username: 'admin',
        role: 'ADMIN',
        loggedInAt: new Date().toISOString()
      }));
      return true;
    }
    return false;
  },

  /**
   * Check if logged in
   */
  isAuthenticated() {
    return localStorage.getItem(ADMIN_SESSION_KEY) !== null;
  },

  /**
   * Logout admin
   */
  logout() {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    window.location.href = 'login.html';
  },

  /**
   * Protect route
   */
  requireAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = 'login.html';
    }
  }
};
