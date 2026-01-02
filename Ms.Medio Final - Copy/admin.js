
function checkAdminSession() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    const userType = sessionStorage.getItem('userType');
    
    if (!isLoggedIn || userType !== 'admin') {
        alert("Please login as administrator");
        sessionStorage.clear();
        window.location.href = 'login.html';
        return false;
    }
    return true;
}
 (function(){
            emailjs.init("woy9PXJtsDYmHNawg"); 
        })();


let patients = JSON.parse(localStorage.getItem("patients")) || [];
let approvedPatients = JSON.parse(localStorage.getItem("approvedPatients")) || [];
let currentPatientIndex = null;

const tableBody = document.getElementById("adminTableBody");
const totalPatientsEl = document.getElementById("totalPatients");
const approvedCountEl = document.getElementById("approvedCount");
const pendingCountEl = document.getElementById("pendingCount");
const newTodayCountEl = document.getElementById("newTodayCount");
const searchInput = document.getElementById("searchInput");
const currentDateEl = document.getElementById("currentDate");

const today = new Date();
const todayString = today.toISOString().split('T')[0];
if (currentDateEl) {
    currentDateEl.textContent = today.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}


function loadTable() {
    if (!checkAdminSession()) return;
    
    patients = JSON.parse(localStorage.getItem("patients")) || [];
    approvedPatients = JSON.parse(localStorage.getItem("approvedPatients")) || [];
    

    patients.sort((a, b) => {
        const dateA = a.submissionDate || a.date || '';
        const dateB = b.submissionDate || b.date || '';
        return dateB.localeCompare(dateA);
    });


    totalPatientsEl.textContent = patients.length;
    approvedCountEl.textContent = approvedPatients.length;
    pendingCountEl.textContent = patients.length;

    const newTodayCount = patients.filter(p => p.submissionDate === todayString).length;
    newTodayCountEl.textContent = newTodayCount > 0 ? `${newTodayCount} new today` : "";

    if (tableBody) {
        tableBody.innerHTML = "";
        
        if (patients.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 40px; color: #666;">
                        <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 15px; opacity: 0.5;"></i>
                        <div style="font-size: 18px; margin-bottom: 10px;">No pending appointments</div>
                        <div>All appointment requests have been processed.</div>
                    </td>
                </tr>
            `;
            return;
        }
        
        patients.forEach((patient, index) => {
            const isNewToday = patient.submissionDate === todayString;
            const row = document.createElement("tr");
            
            if (isNewToday) {
                row.style.backgroundColor = "rgba(234, 67, 53, 0.03)";
                row.style.borderLeft = "4px solid #ea4335";
            }
            
            row.innerHTML = `
                <td>
                    <div class="patient-name" style="font-weight: 600; ${isNewToday ? 'color: #ea4335;' : ''}">${patient.patientname}</div>
                    <div class="date-submitted" style="font-size: 12px; color: #666;">Submitted: ${formatDate(patient.submissionDate || patient.date)}</div>
                </td>
                <td>${patient.email}</td>
                <td>${patient.age}</td>
                <td>${patient.contact}</td>
                <td title="${patient.address}">${truncateText(patient.address, 25)}</td>
                <td>
                    <span style="background-color: rgba(26, 115, 232, 0.1); padding: 4px 10px; border-radius: 15px; font-size: 13px; color: #1a73e8;">
                        ${patient.service}
                    </span>
                </td>
                <td>
                    ${isNewToday ? 
                        `<span style="background-color: #ea4335; color: white; padding: 3px 8px; border-radius: 10px; font-size: 11px; font-weight: bold;">NEW</span>` : 
                        `<span style="background-color: #fbbc05; color: #333; padding: 3px 8px; border-radius: 10px; font-size: 11px; font-weight: bold;">PENDING</span>`
                    }
                </td>
                <td>
                    <div style="display: flex; gap: 8px;">
                        <button class="btn-view" onclick="viewPatient(${index})" style="background: #1a73e8; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 13px; display: flex; align-items: center; gap: 5px;">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button class="btn-approve" onclick="approvePatient(${index})" style="background: #34a853; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 13px; display: flex; align-items: center; gap: 5px;">
                            <i class="fas fa-calendar-check"></i> Set Schedule
                        </button>
                    </div>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
    }
}


function truncateText(text, maxLength) {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}


function formatDate(dateString) {
    if (!dateString) return "Not specified";
    
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        
        const today = new Date();
        if (date.toDateString() === today.toDateString()) {
            return "Today";
        }
        
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) {
            return "Yesterday";
        }
        
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    } catch (error) {
        return dateString;
    }
}

function viewAllApprovedAppointments() {
    if (!checkAdminSession()) return;
    
    approvedPatients = JSON.parse(localStorage.getItem("approvedPatients")) || [];
    
    if (approvedPatients.length === 0) {
        document.getElementById("approvedAppointmentsContent").innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: #666;">
                <i class="fas fa-calendar-check" style="font-size: 60px; margin-bottom: 20px; opacity: 0.3;"></i>
                <div style="font-size: 18px; margin-bottom: 10px;">No Approved Appointments</div>
                <div>No appointments have been approved yet.</div>
            </div>
        `;
    } else {
        let tableHTML = `
            <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong>Total Approved Appointments:</strong> ${approvedPatients.length}
                </div>
                <button class="btn-approve" onclick="exportApprovedAppointments()" style="background: #34a853; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 5px;">
                    <i class="fas fa-download"></i> Export List
                </button>
            </div>
            
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background-color: #f5f5f5;">
                            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Appointment ID</th>
                            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Patient Name</th>
                            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Service</th>
                            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Scheduled Date</th>
                            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Scheduled Time</th>
                            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Contact</th>
                            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Approved Date</th>
                            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Status</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        const sortedAppointments = [...approvedPatients].sort((a, b) => {
            const dateA = a.scheduledDate ? new Date(a.scheduledDate) : new Date(0);
            const dateB = b.scheduledDate ? new Date(b.scheduledDate) : new Date(0);
            return dateB - dateA;
        });
        
        sortedAppointments.forEach((appointment, index) => {
            const formattedDate = formatDate(appointment.scheduledDate);
            const approvedDate = appointment.approvedDate ? formatDate(appointment.approvedDate) : "N/A";
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const appointmentDate = appointment.scheduledDate ? new Date(appointment.scheduledDate) : null;
            let status = "UPCOMING";
            let statusColor = "#34a853";
            
            if (appointmentDate) {
                appointmentDate.setHours(0, 0, 0, 0);
                if (appointmentDate < today) {
                    status = "COMPLETED";
                    statusColor = "#666";
                } else if (appointmentDate.getTime() === today.getTime()) {
                    status = "TODAY";
                    statusColor = "#fbbc05";
                }
            }
            
            tableHTML += `
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 12px;">APPT-${String(index + 1).padStart(4, '0')}</td>
                    <td style="padding: 12px;"><strong>${appointment.patientname}</strong></td>
                    <td style="padding: 12px;">${appointment.service}</td>
                    <td style="padding: 12px;"><span style="color: #1a73e8;">${formattedDate}</span></td>
                    <td style="padding: 12px;"><span style="color: #ea4335;">${appointment.scheduledTime || "Not specified"}</span></td>
                    <td style="padding: 12px;">${appointment.contact || "N/A"}</td>
                    <td style="padding: 12px;">${approvedDate}</td>
                    <td style="padding: 12px;">
                        <span style="display: inline-block; padding: 4px 10px; border-radius: 15px; font-size: 12px; font-weight: 600; background-color: ${status === "UPCOMING" ? "rgba(52, 168, 83, 0.15)" : status === "TODAY" ? "rgba(251, 188, 5, 0.15)" : "rgba(95, 99, 104, 0.15)"}; color: ${statusColor};">
                            ${status}
                        </span>
                    </td>
                </tr>
            `;
        });
        
        tableHTML += `
                </tbody>
            </table>
        </div>
        
        <div style="margin-top: 25px; padding: 15px; background-color: rgba(52, 168, 83, 0.05); border-radius: 8px; border-left: 4px solid #34a853;">
            <p style="margin: 0; color: #34a853; font-size: 14px;">
                <i class="fas fa-info-circle"></i> 
                <strong>Legend:</strong> 
                <span style="color: #34a853;">● UPCOMING</span> | 
                <span style="color: #fbbc05;">● TODAY</span> | 
                <span style="color: #666;">● COMPLETED</span>
            </p>
        </div>
        `;
        
        document.getElementById("approvedAppointmentsContent").innerHTML = tableHTML;
    }
    
    document.getElementById("approvedAppointmentsModal").style.display = "flex";
}


function exportApprovedAppointments() {
    if (!checkAdminSession()) return;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Appointment ID,Patient Name,Email,Age,Contact,Address,Service,Scheduled Date,Scheduled Time,Approved Date,Notes\n";
    
    approvedPatients.forEach((appointment, index) => {
        const row = [
            `APPT-${String(index + 1).padStart(4, '0')}`,
            `"${appointment.patientname}"`,
            `"${appointment.email}"`,
            appointment.age,
            `"${appointment.contact}"`,
            `"${appointment.address}"`,
            `"${appointment.service}"`,
            `"${formatDate(appointment.scheduledDate)}"`,
            `"${appointment.scheduledTime || ""}"`,
            `"${formatDate(appointment.approvedDate)}"`,
            `"${appointment.scheduleNotes || ""}"`
        ];
        
        csvContent += row.join(",") + "\n";
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "approved_appointments.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert("Approved appointments exported to CSV file successfully!");
}
function viewPatient(index) {
    if (!checkAdminSession()) return;
    
    const patient = patients[index];
    const isNewToday = patient.submissionDate === todayString;
    
    document.getElementById("patientModalContent").innerHTML = `
        <div style="margin-bottom: 25px;">
            <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
                <div style="width: 70px; height: 70px; border-radius: 50%; background-color: ${isNewToday ? 'rgba(234, 67, 53, 0.1)' : 'rgba(26, 115, 232, 0.1)'}; display: flex; align-items: center; justify-content: center; font-size: 28px; color: ${isNewToday ? '#ea4335' : '#1a73e8'};">
                    ${patient.patientname.charAt(0)}
                </div>
                <div>
                    <h3 style="color: #1a73e8; margin-bottom: 5px;">${patient.patientname} ${isNewToday ? '<span style="font-size: 12px; background-color: #ea4335; color: white; padding: 2px 8px; border-radius: 10px; margin-left: 5px;">NEW</span>' : ''}</h3>
                    <p style="color: #666; font-size: 14px;">Submitted: ${formatDate(patient.submissionDate || patient.date)}</p>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div style="background-color: rgba(26, 115, 232, 0.05); padding: 15px; border-radius: 8px;">
                    <div style="font-size: 13px; color: #666; margin-bottom: 5px;">Email</div>
                    <div style="font-weight: 600;">${patient.email}</div>
                </div>
                <div style="background-color: rgba(26, 115, 232, 0.05); padding: 15px; border-radius: 8px;">
                    <div style="font-size: 13px; color: #666; margin-bottom: 5px;">Contact</div>
                    <div style="font-weight: 600;">${patient.contact}</div>
                </div>
            </div>
            
            <div style="background-color: rgba(26, 115, 232, 0.05); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <div style="font-size: 13px; color: #666; margin-bottom: 5px;">Address</div>
                <div style="font-weight: 600;">${patient.address}</div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px;">
                <div style="background-color: rgba(52, 168, 83, 0.05); padding: 15px; border-radius: 8px;">
                    <div style="font-size: 13px; color: #666; margin-bottom: 5px;">Age</div>
                    <div style="font-weight: 600; color: #34a853;">${patient.age} years</div>
                </div>
                <div style="background-color: rgba(251, 188, 5, 0.05); padding: 15px; border-radius: 8px;">
                    <div style="font-size: 13px; color: #666; margin-bottom: 5px;">Service Requested</div>
                    <div style="font-weight: 600; color: #b38700;">${patient.service}</div>
                </div>
            </div>
            
        </div>
        
        <div style="display: flex; gap: 15px;">
            <button class="btn-approve" style="flex: 1; background: #34a853; color: white; border: none; padding: 12px; border-radius: 5px; cursor: pointer; font-size: 15px; display: flex; align-items: center; justify-content: center; gap: 8px;" onclick="approvePatient(${index}); document.getElementById('patientModal').style.display='none';">
                <i class="fas fa-calendar-check"></i> Set Schedule
            </button>
        </div>
    `;
    
    document.getElementById("patientModal").style.display = "flex";
}


function approvePatient(index) {
    if (!checkAdminSession()) return;
    
    currentPatientIndex = index;
    const patient = patients[index];
    

    const today = new Date().toISOString().split('T')[0];
    const scheduleDateInput = document.getElementById("scheduleDate");
    if (scheduleDateInput) {
        scheduleDateInput.setAttribute('min', today);
        

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        scheduleDateInput.value = tomorrow.toISOString().split('T')[0];
    }
    
    
    document.getElementById("scheduleTime").value = "";
    document.getElementById("scheduleNotes").value = "";
    
    document.getElementById("scheduleModal").style.display = "flex";
}


function sendMessageToPatient(patient, scheduleDate, scheduleTime, scheduleNotes) {
    console.log('Sending message to patient:', patient.patientname, 'at email:', patient.email);
    

    if (!localStorage.getItem("messages")) {
        localStorage.setItem("messages", JSON.stringify([]));
    }
    
    const messages = JSON.parse(localStorage.getItem("messages")) || [];
    

    const formattedDate = new Date(scheduleDate).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
    

    const message = {
        id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        to: patient.email, 
        from: "Paknaan Health Center Admin",
        subject: "Appointment Confirmation",
        message: `Dear ${patient.patientname},

Your appointment has been confirmed with the following details:

Date: ${formattedDate}
Time: ${scheduleTime}
Service: ${patient.service}
${scheduleNotes ? `Notes: ${scheduleNotes}\n` : ''}

Please arrive 15 minutes before your scheduled time. Bring your barangay ID and any previous medical records if applicable.

Thank you,
Barangay Paknaan Health Center`,
        timestamp: new Date().toISOString(),
        read: false,
        appointmentDetails: {
            date: scheduleDate,
            time: scheduleTime,
            service: patient.service,
            notes: scheduleNotes
        }
    };
    
    console.log('Created message object:', message);
    

    messages.push(message);
    localStorage.setItem("messages", JSON.stringify(messages));
    
    console.log('Message saved to localStorage. Total messages now:', messages.length);
  
    sendActualEmail(patient, scheduleDate, scheduleTime, scheduleNotes, formattedDate);
    
    return message;
}


function sendActualEmail(patient, scheduleDate, scheduleTime, scheduleNotes, formattedDate) {
   
    if (typeof emailjs === 'undefined') {
        console.warn('EmailJS is not loaded. Email will not be sent.');
        return;
    }
    
   
    const templateParams = {
        to_email: patient.email,
        to_name: patient.patientname,
        patient_name: patient.patientname,
        appointment_date: formattedDate,
        appointment_time: scheduleTime,
        service_type: patient.service,
        additional_notes: scheduleNotes || 'None',
        patient_contact: patient.contact,
        patient_age: patient.age
    };
    

    emailjs.send('service_o7jhart', 'template_se893u1', templateParams)
        .then(function(response) {
            console.log('Email sent successfully!', response.status, response.text);
          
            showEmailNotification('success', `Email sent to ${patient.email}`);
        }, function(error) {
            console.error('Failed to send email:', error);
          
            showEmailNotification('error', `Failed to send email to ${patient.email}. Check console for details.`);
        });
}


function showEmailNotification(type, message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: ${type === 'success' ? '#34a853' : '#ea4335'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
    `;
    
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}" style="font-size: 20px;"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
  
    if (!document.getElementById('emailNotificationStyles')) {
        const style = document.createElement('style');
        style.id = 'emailNotificationStyles';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(400px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(400px); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 300);
    }, 5000);
}


document.addEventListener('DOMContentLoaded', function() {
    checkAdminAccess();
    
    const confirmScheduleBtn = document.getElementById("confirmScheduleBtn");
    if (confirmScheduleBtn) {
        confirmScheduleBtn.addEventListener('click', function() {
            if (!checkAdminSession()) return;
            
            const scheduleDate = document.getElementById("scheduleDate").value;
            const scheduleTime = document.getElementById("scheduleTime").value;
            const scheduleNotes = document.getElementById("scheduleNotes").value;
            
            if (!scheduleDate || !scheduleTime) {
                alert("Please select both date and time for the appointment.");
                return;
            }
                
            if (currentPatientIndex === null || !patients[currentPatientIndex]) {
                alert("Patient information not found. Please try again.");
                return;
            }
            
            const patient = patients[currentPatientIndex];
            
        
            sendMessageToPatient(patient, scheduleDate, scheduleTime, scheduleNotes);
     
            approvedPatients.push({
                ...patient,
                scheduledDate: scheduleDate,
                scheduledTime: scheduleTime,
                scheduleNotes: scheduleNotes,
                approvedDate: new Date().toISOString().split('T')[0]
            });
            
            localStorage.setItem("approvedPatients", JSON.stringify(approvedPatients));
            
            // Remove from pending patients
            patients.splice(currentPatientIndex, 1);
            localStorage.setItem("patients", JSON.stringify(patients));
            
            // Format date for confirmation
            const formattedDate = new Date(scheduleDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            alert(`Appointment scheduled for ${patient.patientname}:
Date: ${formattedDate}
Time: ${scheduleTime}

✅ In-app message sent
📧 Email being sent to ${patient.email}...`);
            
            // Close modal and reload table
            document.getElementById("scheduleModal").style.display = "none";
            loadTable();
            currentPatientIndex = null;
        });
    }
    
    // Cancel schedule button
    const cancelScheduleBtn = document.getElementById("cancelScheduleBtn");
    if (cancelScheduleBtn) {
        cancelScheduleBtn.addEventListener('click', function() {
            document.getElementById("scheduleModal").style.display = "none";
            currentPatientIndex = null;
        });
    }
    
    // Modal close buttons
    const closeButtons = {
        "closePatientModal": "patientModal",
        "closeScheduleModal": "scheduleModal",
        "closeApprovedModal": "approvedAppointmentsModal"
    };
    
    for (const [buttonId, modalId] of Object.entries(closeButtons)) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.addEventListener('click', function() {
                document.getElementById(modalId).style.display = "none";
            });
        }
    }
    
    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const rows = tableBody.querySelectorAll('tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        const modals = ["patientModal", "scheduleModal", "approvedAppointmentsModal"];
        modals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (modal && event.target === modal) {
                modal.style.display = "none";
            }
        });
    });
    
    // Load table on page load
    loadTable();
});

function checkAdminAccess() {
    // Check if user is logged in and is an admin
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    const userType = sessionStorage.getItem('userType');
    
    if (!isLoggedIn || userType !== 'admin') {
        // Show alert and redirect
        alert("Please login as administrator");
        
        // Clear any existing session data
        sessionStorage.clear();
        
        // Redirect to login page immediately
        window.location.href = 'login.html';
    } else {
        // Show admin content
        const adminContent = document.getElementById('adminContent');
        if (adminContent) {
            adminContent.style.display = 'block';
            console.log('Admin content displayed');
            
            // Force reflow to ensure proper rendering
            adminContent.offsetHeight;
        } else {
            console.error('Admin content element not found');
        }
        
        // Update admin info in header
        const username = sessionStorage.getItem('username');
        if (username) {
            document.getElementById('adminName').textContent = username;
            document.getElementById('adminInitial').textContent = username.charAt(0).toUpperCase();
        }
    }
}

function logout() {
    if (confirm("Are you sure you want to log out?")) {
        // Redirect immediately WITHOUT clearing sessionStorage first
        // This prevents the checkAdminSession() from being triggered
        sessionStorage.clear();
        window.location.href = 'login.html';
        return false; // Prevent any further execution
    }
}