function closeSidebar() {
    if (document.getElementById('sidebar').classList.contains('hidden')) {
        document.getElementById('sidebar').classList.remove('hidden');
        document.getElementById('sidebar').classList.remove('-translate-x-full');
        document.getElementById('sidebar-overlay').classList.remove('hidden');
    } else {
        document.getElementById('sidebar').classList.add('hidden');
        document.getElementById('sidebar').classList.add('-translate-x-full');
        document.getElementById('sidebar-overlay').classList.add('hidden');
    }
}

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
        borderRadius: '1rem',
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem('token');
            window.location.replace('/index.html');
        }
    });
}