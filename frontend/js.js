// ===== Sidebar Toggle =====
function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (!sidebar || !overlay) return;

    if (sidebar.classList.contains('-translate-x-full')) {
        // Open
        sidebar.classList.remove('-translate-x-full');
        sidebar.classList.remove('hidden');
        overlay.classList.remove('hidden');
    } else {
        // Close
        sidebar.classList.add('-translate-x-full');
        overlay.classList.add('hidden');
    }
}

// ===== Load Nav (Universal) =====
// ใช้: loadNav('ชื่อหน้า')
function loadNav(pageTitle) {
    return fetch('nav.html')
        .then(r => r.text())
        .then(html => {
            document.getElementById('nav-container').innerHTML = html;

            // Set page title
            const titleEl = document.getElementById('nav-page-title');
            if (titleEl && pageTitle) titleEl.textContent = pageTitle;

            // Set current date
            const dateEl = document.getElementById('current-date');
            if (dateEl) {
                dateEl.textContent = new Date().toLocaleDateString('th-TH', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                    timeZone: 'Asia/Bangkok'
                });
            }
        });
}

// ===== Logout =====
function logout() {
    Swal.fire({
        title: 'ออกจากระบบ?',
        text: 'คุณต้องการออกจากระบบใช่หรือไม่',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#2563eb',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'ออกจากระบบ',
        cancelButtonText: 'ยกเลิก',
        reverseButtons: true,
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem('token');
            window.location.replace('/index.html');
        }
    });
}