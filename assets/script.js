const DEMO_KEY = 'safe_social_login_demo_records';
/*const REDACTED_PLACEHOLDER = '* raw data redacted *';*/
const REDACTED_PLACEHOLDER = 'raw data';

function getDemoRecords() {
  try {
    return JSON.parse(localStorage.getItem(DEMO_KEY)) || [];
  } catch (error) {
    return [];
  }
}

function setDemoRecords(records) {
  localStorage.setItem(DEMO_KEY, JSON.stringify(records));
}

function saveRedactedRecord(usernameInput, passwordInput) {
  const records = getDemoRecords();

  records.unshift({
    id: Date.now(),
    username: usernameInput,
    password: passwordInput,
    submittedAt: new Date().toLocaleString(),
    hasUsernameInput: Boolean(usernameInput && usernameInput.trim()),
    hasPasswordInput: Boolean(passwordInput && passwordInput.trim())
  });

  setDemoRecords(records);
  return true;
}

function renderDemoTable() {
  const tableBody = document.getElementById('recordsTableBody');
  if (!tableBody) return;

  const records = getDemoRecords();

  if (!records.length) {
    tableBody.innerHTML = '<tr><td colspan="4">No demo data yet. Submit the form from the home page.</td></tr>';
    return;
  }

  tableBody.innerHTML = records.map((record, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${escapeHtml(record.username)}</td>
      <td>${escapeHtml(record.password)}</td>
      <td>${escapeHtml(record.submittedAt)}</td>
    </tr>
  `).join('');
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('demoForm');
  const clearRecords = document.getElementById('clearRecords');

  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();

      const usernameInput = document.getElementById('demo_username').value;
      const passwordInput = document.getElementById('demo_password').value;

      if (!usernameInput.trim() || !passwordInput.trim()) {
        alert('Please fill in both fields.');
        return;
      }

      if (saveRedactedRecord(usernameInput, passwordInput)) {
        window.location.href = 'success.html';
      }
    });
  }

  if (clearRecords) {
    clearRecords.addEventListener('click', (event) => {
      event.preventDefault();
      localStorage.removeItem(DEMO_KEY);
      renderDemoTable();
    });
  }
});
