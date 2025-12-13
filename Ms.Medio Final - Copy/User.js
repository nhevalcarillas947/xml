const taglines = [
    '"Your Partner in Community Health and Wellness"',
    '"Quality Healthcare for Every Family"',
    '"Serving with Compassion and Excellence"',
    '"Building a Healthier Community Together"'
];

function initializeTagline() {
    const dynamicTagline = document.getElementById('dynamicTagline');
    if (!dynamicTagline) return;
    
    let currentTaglineIndex = 0;
    
    function rotateTagline() {
        dynamicTagline.style.opacity = 0;
        
        setTimeout(() => {
            currentTaglineIndex = (currentTaglineIndex + 1) % taglines.length;
            dynamicTagline.textContent = taglines[currentTaglineIndex];
            dynamicTagline.style.opacity = 1;
        }, 500);
    }
    
    setInterval(rotateTagline, 5000);
}

function setActiveNav() {
    const currentPage = window.location.pathname.split('/').pop() || 'user.html';
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href === currentPage) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// =========================
// Modal System
// =========================
function showModal(message, callback) {
    const overlay = document.getElementById('modalOverlay');
    const modalMessage = document.getElementById('modalMessage');
    const confirmBtn = document.getElementById('modalConfirm');
    const cancelBtn = document.getElementById('modalCancel');

    modalMessage.textContent = message;
    overlay.style.display = 'flex';

    // Remove previous listeners
    confirmBtn.onclick = null;
    cancelBtn.onclick = null;

    confirmBtn.onclick = () => {
        overlay.style.display = 'none';
        callback(true);
    };
    cancelBtn.onclick = () => {
        overlay.style.display = 'none';
        callback(false);
    };
}

// =========================
// Booking and Logout
// =========================
function book() {
    showModal("Are you sure you want to Book Appointment?", function(confirmed) {
        if (confirmed) {
            window.location.href = "info.html";
        }
    });
}

function logout() {
    showModal("Are you sure you want to log out?", function(confirmed) {
        if (confirmed) {
            window.location.href = "login.html";
        }
    });
}

// =========================
// Initialize page
// =========================
document.addEventListener('DOMContentLoaded', function() {
    initializeTagline();
    setActiveNav();

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 200,
                    behavior: 'smooth'
                });
            }
        });
    });
});
// =========================
// Inbox Messages Function with Header and Textarea
// =========================
// =========================
// Inbox Messages Function - Single Admin, Bigger Modal
// =========================
// =========================
// Simple Inbox Modal - Admin Name + Empty Textarea
// =========================
function inbox() {
    const overlay = document.getElementById('modalOverlay');
    const modalBox = document.getElementById('modalBox');
    const modalMessage = document.getElementById('modalMessage');
    const confirmBtn = document.getElementById('modalConfirm');
    const cancelBtn = document.getElementById('modalCancel');

    // Admin name
    const adminName = "Barangay Health Officer";

    // Set modal content: only admin name + empty textarea
    modalMessage.innerHTML = `
        <strong>Admin:</strong> ${adminName}<br><br>
        <textarea placeholder="Type your message here..." 
                  style="width: 100%; height: 150px; padding: 10px; border-radius: 6px; border: 1px solid #ccc; resize: none;"></textarea>
    `;

    // Make modal bigger
    modalBox.style.maxWidth = '600px';
    modalBox.style.width = '90%';
    modalBox.style.padding = '25px';

    // Hide Yes/No buttons
    confirmBtn.style.display = 'none';
    cancelBtn.style.display = 'none';

    // Show modal
    overlay.style.display = 'flex';

    // Close modal when clicking outside
    overlay.onclick = function(e) {
        if (e.target === overlay) {
            overlay.style.display = 'none';
            confirmBtn.style.display = 'inline-block';
            cancelBtn.style.display = 'inline-block';
        }
    };
}

