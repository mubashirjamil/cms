const API = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) lucide.createIcons();
  if (sessionStorage.getItem('campusflowUser')) {
    window.location.replace('./index.html');
    return;
  }

  const form = document.querySelector('#signin-form');
  const errorBox = document.querySelector('#signin-error');
  const submitButton = document.querySelector('#submit-button');
  const password = document.querySelector('#password');

  document.querySelector('#toggle-password').addEventListener('click', (event) => {
    const button = event.currentTarget;
    const showing = password.type === 'text';
    password.type = showing ? 'password' : 'text';
    button.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
    button.innerHTML = `<i data-lucide="${showing ? 'eye' : 'eye-off'}" class="h-4 w-4"></i>`;
    if (window.lucide) lucide.createIcons();
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    errorBox.classList.add('hidden');
    submitButton.disabled = true;
    submitButton.innerHTML = 'Signing in…';
    try {
      const email = document.querySelector('#email').value.trim().toLowerCase();
      const passwordValue = password.value;
      const response = await fetch(`${API}/users?email=${encodeURIComponent(email)}&password=${encodeURIComponent(passwordValue)}`);
      if (!response.ok) throw new Error('server');
      const users = await response.json();
      if (!users.length) {
        errorBox.textContent = 'Email or password is incorrect. Check the demo account details below and try again.';
        errorBox.classList.remove('hidden');
        return;
      }
      const { id, name, email: userEmail, role } = users[0];
      sessionStorage.setItem('campusflowUser', JSON.stringify({ id, name, email: userEmail, role }));
      window.location.href = './index.html';
    } catch {
      errorBox.textContent = 'Could not connect to the sign-in service. Start the project with npm run dev, then try again.';
      errorBox.classList.remove('hidden');
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = 'Sign in<i data-lucide="arrow-right" class="h-4 w-4"></i>';
      if (window.lucide) lucide.createIcons();
    }
  });
});
