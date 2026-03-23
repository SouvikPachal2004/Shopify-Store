// Account Dashboard Management
document.addEventListener('DOMContentLoaded', () => {
  const currentUser = localStorage.getItem('currentUser');
  
  if (!currentUser && window.location.pathname.includes('account.html')) {
    // Redirect to login if not authenticated
    window.location.href = 'login.html';
    return;
  }
  
  if (currentUser) {
    const user = JSON.parse(currentUser);
    
    const userNameElement = document.getElementById('account-name');
    if (userNameElement) {
      userNameElement.textContent = user.name || user.email.split('@')[0];
    }

    const userEmailElement = document.getElementById('account-email');
    if (userEmailElement) {
      userEmailElement.textContent = user.email;
    }

    const initials = document.getElementById('account-initials');
    if (initials) {
      const first = (user.name || user.email.split('@')[0]).split(' ')[0].charAt(0).toUpperCase();
      const second = (user.name || user.email.split('@')[0]).split(' ')[1]?.charAt(0)?.toUpperCase() || '';
      initials.textContent = `${first}${second}`;
    }
  }
});
