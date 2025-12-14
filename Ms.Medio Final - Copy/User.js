// ============================================
// USER SESSION CHECK - FOR EVERY FUNCTION
// ============================================
function checkUserSession() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    const userType = sessionStorage.getItem('userType');
    
    if (!isLoggedIn || userType !== 'user') {
        alert("Please login to access this page");
        sessionStorage.clear();
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('userEmail');
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

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
    if (!checkUserSession()) return;
    
    const overlay = document.getElementById('modalOverlay');
    const modalMessage = document.getElementById('modalMessage');
    const confirmBtn = document.getElementById('modalConfirm');
    const cancelBtn = document.getElementById('modalCancel');

    modalMessage.textContent = message;
    overlay.style.display = 'flex';

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
    if (!checkUserSession()) return;
    
    showModal("Are you sure you want to Book Appointment?", function(confirmed) {
        if (confirmed) {
            window.location.href = "info.html";
        }
    });
}

function logout() {
    if (confirm("Are you sure you want to log out?")) {
        sessionStorage.clear();
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('userEmail');
        window.location.href = 'login.html';
    }
}

// =========================
// GET USER EMAIL - FIXED FUNCTION
// =========================
function getUserEmail() {
    // Try to get email from multiple sources
    let email = sessionStorage.getItem('email');
    
    if (!email) {
        // Try localStorage
        email = localStorage.getItem('userEmail');
    }
    
    if (!email) {
        // Try from loggedInUser object
        const loggedInUser = localStorage.getItem('loggedInUser');
        if (loggedInUser) {
            try {
                const userObj = JSON.parse(loggedInUser);
                email = userObj.email;
            } catch (e) {
                console.error("Error parsing loggedInUser:", e);
            }
        }
    }
    
    return email;
}

// =========================
// INBOX FUNCTIONALITY - FIXED VERSION
// =========================
function updateInboxBadge() {
    if (!checkUserSession()) return;
    
    // Get user email using the fixed function
    const userEmail = getUserEmail();
    if (!userEmail) {
        console.warn("Could not find user email for inbox badge");
        return;
    }
    
    const messages = JSON.parse(localStorage.getItem("messages")) || [];
    const unreadCount = messages.filter(msg => 
        msg.to === userEmail && !msg.read
    ).length;
    
    const inboxBtn = document.querySelector('button[onclick="inbox()"]');
    if (inboxBtn) {
        let badge = inboxBtn.querySelector('.inbox-badge');
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'inbox-badge';
            inboxBtn.style.position = 'relative';
            inboxBtn.appendChild(badge);
        }
        
        if (unreadCount > 0) {
            badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }
}

function inbox() {
    if (!checkUserSession()) return;
    
    // Get user email using the fixed function
    const userEmail = getUserEmail();
    if (!userEmail) {
        alert("User information not found. Please login again.");
        window.location.href = 'login.html';
        return;
    }
    
    // Get messages from localStorage
    const messages = JSON.parse(localStorage.getItem("messages")) || [];
    
    // Filter messages for current user only
    const userMessages = messages.filter(msg => msg.to === userEmail);
    
    // Sort messages by newest first
    userMessages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Count unread messages
    const unreadCount = userMessages.filter(m => !m.read).length;
    
    // Create inbox modal
    createInboxModal(userMessages, unreadCount, userEmail);
}

function createInboxModal(messages, unreadCount, userEmail) {
    // Remove existing modal if any
    const existingModal = document.getElementById('messageModalOverlay');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'messageModalOverlay';
    modalOverlay.className = 'message-modal-overlay';
    
    // Create modal content
    const modalHTML = `
        <div class="message-modal">
            <div class="message-modal-header">
                <h3><i class="fas fa-inbox"></i> Health Center Messages</h3>
                <button class="close-btn" onclick="closeMessageModal()">&times;</button>
            </div>
            
            <div class="message-modal-stats">
                <div>
                    <strong>Total Messages:</strong> ${messages.length} 
                    | <strong>Unread:</strong> <span style="color:${unreadCount > 0 ? 'red' : 'green'}">
                        ${unreadCount}
                    </span>
                </div>
                ${unreadCount > 0 ? 
                    `<button class="mark-all-btn" onclick="markAllAsRead()">
                        <i class="fas fa-check-double"></i> Mark All as Read
                    </button>` : ''
                }
            </div>
            
            <div class="message-modal-content">
                ${messages.length === 0 ? 
                    `<div class="empty-messages">
                        <i class="fas fa-envelope-open"></i>
                        <p>No messages yet</p>
                        <p>Your appointment confirmations will appear here once scheduled.</p>
                    </div>` : 
                    messages.map(msg => `
                        <div id="msg-${msg.id}" class="message-item ${msg.read ? '' : 'unread'}">
                            <div class="message-header">
                                <div class="message-sender">
                                    <i class="fas fa-hospital"></i> ${msg.from}
                                </div>
                                <div class="message-time">
                                    ${new Date(msg.timestamp).toLocaleDateString()} 
                                    ${new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    ${!msg.read ? '<span class="unread-indicator">●</span>' : ''}
                                </div>
                            </div>
                            <div class="message-subject">
                                ${msg.subject}
                            </div>
                            <div class="message-body">
                                ${msg.message}
                            </div>
                            ${msg.appointmentDetails ? 
                                `<div class="appointment-details">
                                    <div class="appointment-title">
                                        <i class="fas fa-calendar-check"></i> Appointment Details
                                    </div>
                                    <div class="appointment-grid">
                                        <span class="appointment-label">📅 Date:</span>
                                        <span>${new Date(msg.appointmentDetails.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                        <span class="appointment-label">⏰ Time:</span>
                                        <span>${msg.appointmentDetails.time}</span>
                                        <span class="appointment-label">🏥 Service:</span>
                                        <span>${msg.appointmentDetails.service}</span>
                                        ${msg.appointmentDetails.notes ? `
                                            <span class="appointment-label">📝 Notes:</span>
                                            <span>${msg.appointmentDetails.notes}</span>
                                        ` : ''}
                                    </div>
                                </div>` : ''}
                            ${!msg.read ? 
                                `<div class="message-actions">
                                    <button class="mark-read-btn" onclick="markSingleAsRead('${msg.id}')">
                                        <i class="fas fa-check"></i> Mark as Read
                                    </button>
                                </div>` : ''}
                        </div>
                    `).join('')
                }
            </div>
            
            <div class="message-modal-footer">
                <button class="close-messages-btn" onclick="closeMessageModal()">
                    Close Messages
                </button>
            </div>
        </div>
    `;
    
    modalOverlay.innerHTML = modalHTML;
    document.body.appendChild(modalOverlay);
    
    // Update badge after opening
    setTimeout(updateInboxBadge, 100);
}

function markSingleAsRead(messageId) {
    if (!checkUserSession()) return;
    
    const messages = JSON.parse(localStorage.getItem("messages")) || [];
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    
    if (messageIndex !== -1) {
        messages[messageIndex].read = true;
        localStorage.setItem("messages", JSON.stringify(messages));
        
        // Update the message display
        const messageDiv = document.getElementById(`msg-${messageId}`);
        if (messageDiv) {
            messageDiv.classList.remove('unread');
            
            // Remove the mark as read button
            const buttonDiv = messageDiv.querySelector('.message-actions');
            if (buttonDiv) {
                buttonDiv.remove();
            }
            
            // Remove unread indicator
            const timeDiv = messageDiv.querySelector('.message-time');
            if (timeDiv) {
                const indicator = timeDiv.querySelector('.unread-indicator');
                if (indicator) {
                    indicator.remove();
                }
            }
        }
        
        // Update badge
        updateInboxBadge();
    }
}

function markAllAsRead() {
    if (!checkUserSession()) return;
    
    // Get user email using the fixed function
    const userEmail = getUserEmail();
    if (!userEmail) return;
    
    const messages = JSON.parse(localStorage.getItem("messages")) || [];
    
    let updated = false;
    messages.forEach(msg => {
        if (msg.to === userEmail && !msg.read) {
            msg.read = true;
            updated = true;
        }
    });
    
    if (updated) {
        localStorage.setItem("messages", JSON.stringify(messages));
        
        // Refresh the inbox view
        inbox();
        
        // Update badge
        updateInboxBadge();
    }
}

function closeMessageModal() {
    const messageModal = document.getElementById('messageModalOverlay');
    if (messageModal) {
        messageModal.remove();
    }
    
    // Update badge when closing
    updateInboxBadge();
}

// =========================
// Initialize page - FIXED VERSION
// =========================
document.addEventListener('DOMContentLoaded', function() {
    // Check if user content should be shown
    const userContent = document.getElementById('userContent');
    if (userContent && userContent.style.display === 'block') {
        initializeTagline();
        setActiveNav();
        
        // Update inbox badge (with delay to ensure DOM is ready)
        setTimeout(() => {
            updateInboxBadge();
        }, 500);
        
        // Smooth scroll for anchor links
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
        
        // Close modal when clicking outside
        document.addEventListener('click', function(e) {
            const messageModal = document.getElementById('messageModalOverlay');
            if (messageModal && e.target === messageModal) {
                closeMessageModal();
            }
        });
        
        // Listen for storage changes (for real-time updates)
        window.addEventListener('storage', function(e) {
            if (e.key === 'messages') {
                updateInboxBadge();
            }
        });
        
        // Update badge periodically
        setInterval(updateInboxBadge, 30000);
    }
});