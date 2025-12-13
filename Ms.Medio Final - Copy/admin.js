    // Initialize data
            let patients = JSON.parse(localStorage.getItem("patients")) || [];
            let approvedPatients = JSON.parse(localStorage.getItem("approvedPatients")) || [];
            let currentPatientIndex = null;
            let sortByNewest = true; // Default to sorting newest first

            const tableBody = document.getElementById("adminTableBody");
            const totalPatientsEl = document.getElementById("totalPatients");
            const approvedCountEl = document.getElementById("approvedCount");
            const pendingCountEl = document.getElementById("pendingCount");
            const newTodayCountEl = document.getElementById("newTodayCount");
            const searchInput = document.getElementById("searchInput");
            const currentDateEl = document.getElementById("currentDate");

            // Set current date
            const today = new Date();
            const todayString = today.toISOString().split('T')[0];
            currentDateEl.textContent = today.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            // Load table data
            function loadTable() {
                patients = JSON.parse(localStorage.getItem("patients")) || [];
                approvedPatients = JSON.parse(localStorage.getItem("approvedPatients")) || [];
                
                // Sort patients based on current sort setting
                sortPatients();
            
                
                // Update stats
                totalPatientsEl.textContent = patients.length;
                approvedCountEl.textContent = approvedPatients.length;
                pendingCountEl.textContent = patients.length;
           
                
                tableBody.innerHTML = "";
                
                if (patients.length === 0) {
                    tableBody.innerHTML = `
                        <tr>
                            <td colspan="8" style="text-align: center; padding: 40px; color: var(--gray);">
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
                    
                    // Highlight new patients
                    if (isNewToday) {
                        row.style.backgroundColor = "rgba(234, 67, 53, 0.03)";
                        row.style.borderLeft = "4px solid var(--danger)";
                    }
                    
                    row.innerHTML = `
                        <td>
                            <div class="patient-name ${isNewToday ? 'new-user-indicator' : ''}">${patient.patientname}</div>
                            <div class="date-submitted">Submitted: ${formatDate(patient.submissionDate || patient.date)}</div>
                        </td>
                        <td>${patient.email}</td>
                        <td>${patient.age}</td>
                        <td>${patient.contact}</td>
                        <td>${truncateText(patient.address, 25)}</td>
                        <td>
                            <span style="background-color: rgba(26, 115, 232, 0.1); padding: 4px 10px; border-radius: 15px; font-size: 13px; color: var(--primary);">
                                ${patient.service}
                            </span>
                        </td>
                        <td>
                            ${isNewToday ? 
                                `<span class="status status-new">NEW</span>` : 
                                `<span class="status status-pending">PENDING</span>`
                            }
                        </td>
                        <td>
                            <div class="action-btns">
                                <button class="btn btn-view" onclick="viewPatient(${index})">
                                    <i class="fas fa-eye"></i> View
                                </button>
                                <button class="btn btn-approve" onclick="approvePatient(${index})">
                                    <i class="fas fa-calendar-check"></i> Set Schedule
                                
                            </div>
                        </td>
                    `;
                    
                    tableBody.appendChild(row);
                });
            }

            // Sort patients by newest first
            function sortPatients() {
                if (sortByNewest) {
                    patients.sort((a, b) => {
                        const dateA = a.submissionDate || a.date || '';
                        const dateB = b.submissionDate || b.date || '';
                        return dateB.localeCompare(dateA);
                    });
                } else {
                    // Sort by oldest first
                    patients.sort((a, b) => {
                        const dateA = a.submissionDate || a.date || '';
                        const dateB = b.submissionDate || b.date || '';
                        return dateA.localeCompare(dateB);
                    });
                }
            }

            // Toggle sort order
            function sortNewestFirst() {
                sortByNewest = !sortByNewest;
                const sortBtn = document.getElementById("sortNewestBtn");
                
                if (sortByNewest) {
                    sortBtn.innerHTML = '<i class="fas fa-sort-amount-down"></i> Newest First';
                    sortBtn.style.backgroundColor = "rgba(26, 115, 232, 0.1)";
                } else {
                    sortBtn.innerHTML = '<i class="fas fa-sort-amount-up"></i> Oldest First';
                    sortBtn.style.backgroundColor = "rgba(52, 168, 83, 0.1)";
                }
                
                loadTable();
            }

            // Generate patient ID
            function generatePatientId(index) {
                return `PAK-${String(index + 1).padStart(3, '0')}`;
            }

            // Generate approved appointment ID
            function generateApprovedId(index) {
                return `APPT-${String(index + 1).padStart(4, '0')}`;
            }

            // Truncate text for display
            function truncateText(text, maxLength) {
                if (text.length <= maxLength) return text;
                return text.substring(0, maxLength) + '...';
            }

            // Format date for display
            function formatDate(dateString) {
                if (!dateString) return "Not specified";
                
                try {
                    const date = new Date(dateString);
                    if (isNaN(date.getTime())) return dateString;
                    
                    // If it's today, show "Today"
                    const today = new Date();
                    if (date.toDateString() === today.toDateString()) {
                        return "Today";
                    }
                    
                    // If it's yesterday, show "Yesterday"
                    const yesterday = new Date(today);
                    yesterday.setDate(yesterday.getDate() - 1);
                    if (date.toDateString() === yesterday.toDateString()) {
                        return "Yesterday";
                    }
                    
                    // Otherwise show the date
                    return date.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    });
                } catch (error) {
                    return dateString;
                }
            }

            // ============================================
            // NEW FUNCTION: View All Approved Appointments
            // ============================================
            function viewAllApprovedAppointments() {
                approvedPatients = JSON.parse(localStorage.getItem("approvedPatients")) || [];
                
                if (approvedPatients.length === 0) {
                    document.getElementById("approvedAppointmentsContent").innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-calendar-check"></i>
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
                            <button class="btn btn-approve" onclick="exportApprovedAppointments()">
                                <i class="fas fa-download"></i> Export List
                            </button>
                        </div>
                        
                        <div style="overflow-x: auto;">
                            <table class="approved-table">
                                <thead>
                                    <tr>
                                        <th>Appointment ID</th>
                                        <th>Patient Name</th>
                                        <th>Service</th>
                                        <th>Scheduled Date</th>
                                        <th>Scheduled Time</th>
                                        <th>Contact</th>
                                        <th>Approved Date</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                    `;
                    
                    // Sort appointments by scheduled date (most recent first)
                    const sortedAppointments = [...approvedPatients].sort((a, b) => {
                        const dateA = a.scheduledDate ? new Date(a.scheduledDate) : new Date(0);
                        const dateB = b.scheduledDate ? new Date(b.scheduledDate) : new Date(0);
                        return dateB - dateA;
                    });
                    
                    sortedAppointments.forEach((appointment, index) => {
                        const formattedDate = formatDate(appointment.scheduledDate);
                        const approvedDate = appointment.approvedDate ? formatDate(appointment.approvedDate) : "N/A";
                        
                        // Check if appointment is upcoming or past
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const appointmentDate = appointment.scheduledDate ? new Date(appointment.scheduledDate) : null;
                        let status = "UPCOMING";
                        let statusColor = "var(--secondary)";
                        
                        if (appointmentDate) {
                            appointmentDate.setHours(0, 0, 0, 0);
                            if (appointmentDate < today) {
                                status = "COMPLETED";
                                statusColor = "var(--gray)";
                            } else if (appointmentDate.getTime() === today.getTime()) {
                                status = "TODAY";
                                statusColor = "var(--accent)";
                            }
                        }
                        
                        tableHTML += `
                            <tr>
                                <td>${generateApprovedId(index)}</td>
                                <td><strong>${appointment.patientname}</strong></td>
                                <td>${appointment.service}</td>
                                <td><span class="appointment-date">${formattedDate}</span></td>
                                <td><span class="appointment-time">${appointment.scheduledTime || "Not specified"}</span></td>
                                <td>${appointment.contact || "N/A"}</td>
                                <td>${approvedDate}</td>
                                <td>
                                    <span style="
                                        display: inline-block;
                                        padding: 4px 10px;
                                        border-radius: 15px;
                                        font-size: 12px;
                                        font-weight: 600;
                                        background-color: ${status === "UPCOMING" ? "rgba(52, 168, 83, 0.15)" : 
                                                        status === "TODAY" ? "rgba(251, 188, 5, 0.15)" : 
                                                        "rgba(95, 99, 104, 0.15)"};
                                        color: ${statusColor};
                                    ">
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
                        
                        <div style="margin-top: 25px; padding: 15px; background-color: rgba(52, 168, 83, 0.05); border-radius: 8px; border-left: 4px solid var(--secondary);">
                            <p style="margin: 0; color: var(--secondary); font-size: 14px;">
                                <i class="fas fa-info-circle"></i> 
                                <strong>Legend:</strong> 
                                <span style="color: var(--secondary);">● UPCOMING</span> | 
                                <span style="color: var(--accent);">● TODAY</span> | 
                                <span style="color: var(--gray);">● COMPLETED</span>
                            </p>
                        </div>
                    `;
                    
                    document.getElementById("approvedAppointmentsContent").innerHTML = tableHTML;
                }
                
                // Show the modal
                document.getElementById("approvedAppointmentsModal").style.display = "flex";
            }

            // ============================================
            // NEW FUNCTION: Export Approved Appointments
            // ============================================
            function exportApprovedAppointments() {
                let csvContent = "data:text/csv;charset=utf-8,";
                
                // Add header row
                csvContent += "Appointment ID,Patient Name,Email,Age,Contact,Address,Service,Scheduled Date,Scheduled Time,Approved Date,Notes\n";
                
                // Add approved patients data
                approvedPatients.forEach((appointment, index) => {
                    const row = [
                        generateApprovedId(index),
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
                
                // Create download link
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", "approved_appointments.csv");
                document.body.appendChild(link);
                
                // Trigger download
                link.click();
                document.body.removeChild(link);
                
                alert("Approved appointments exported to CSV file successfully!");
            }

            // View patient details
            function viewPatient(index) {
                const patient = patients[index];
                const isNewToday = patient.submissionDate === todayString;
                
                document.getElementById("patientModalContent").innerHTML = `
                    <div style="margin-bottom: 25px;">
                        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
                            <div style="width: 70px; height: 70px; border-radius: 50%; background-color: ${isNewToday ? 'rgba(234, 67, 53, 0.1)' : 'rgba(26, 115, 232, 0.1)'}; display: flex; align-items: center; justify-content: center; font-size: 28px; color: ${isNewToday ? 'var(--danger)' : 'var(--primary)'};">
                                ${patient.patientname.charAt(0)}
                            </div>
                            <div>
                                <h3 style="color: var(--primary); margin-bottom: 5px;">${patient.patientname} ${isNewToday ? '<span style="font-size: 12px; background-color: var(--danger); color: white; padding: 2px 8px; border-radius: 10px; margin-left: 5px;">NEW</span>' : ''}</h3>
                                <p style="color: var(--gray); font-size: 14px;">Submitted: ${formatDate(patient.submissionDate || patient.date)}</p>
                            </div>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                            <div style="background-color: rgba(26, 115, 232, 0.05); padding: 15px; border-radius: 8px;">
                                <div style="font-size: 13px; color: var(--gray); margin-bottom: 5px;">Email</div>
                                <div style="font-weight: 600;">${patient.email}</div>
                            </div>
                            <div style="background-color: rgba(26, 115, 232, 0.05); padding: 15px; border-radius: 8px;">
                                <div style="font-size: 13px; color: var(--gray); margin-bottom: 5px;">Contact</div>
                                <div style="font-weight: 600;">${patient.contact}</div>
                            </div>
                        </div>
                        
                        <div style="background-color: rgba(26, 115, 232, 0.05); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                            <div style="font-size: 13px; color: var(--gray); margin-bottom: 5px;">Address</div>
                            <div style="font-weight: 600;">${patient.address}</div>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px;">
                            <div style="background-color: rgba(52, 168, 83, 0.05); padding: 15px; border-radius: 8px;">
                                <div style="font-size: 13px; color: var(--gray); margin-bottom: 5px;">Age</div>
                                <div style="font-weight: 600; color: var(--secondary);">${patient.age} years</div>
                            </div>
                            <div style="background-color: rgba(251, 188, 5, 0.05); padding: 15px; border-radius: 8px;">
                                <div style="font-size: 13px; color: var(--gray); margin-bottom: 5px;">Service Requested</div>
                                <div style="font-weight: 600; color: #b38700;">${patient.service}</div>
                            </div>
                        </div>
                        
                    </div>
                    
                    <div style="display: flex; gap: 15px;">
                        <button class="btn btn-approve" style="flex: 1;" onclick="approvePatient(${index}); document.getElementById('patientModal').style.display='none';">
                            <i class="fas fa-calendar-check"></i> Set Schedule
                        </button>
                        
                    </div>
                `;
                
                document.getElementById("patientModal").style.display = "flex";
            }
            // Approve patient (open schedule modal)
            function approvePatient(index) {
                currentPatientIndex = index;
                const patient = patients[index];
                
                // Set minimum date to today
                const today = new Date().toISOString().split('T')[0];
                const scheduleDateInput = document.getElementById("scheduleDate");
                if (scheduleDateInput) {
                    scheduleDateInput.setAttribute('min', today);
                    
                    // Set default date to tomorrow
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    scheduleDateInput.value = tomorrow.toISOString().split('T')[0];
                }
                
                // Clear previous values
                const scheduleTimeInput = document.getElementById("scheduleTime");
                const scheduleNotesInput = document.getElementById("scheduleNotes");
                
                if (scheduleTimeInput) scheduleTimeInput.value = "";
                if (scheduleNotesInput) scheduleNotesInput.value = "";
                
                document.getElementById("scheduleModal").style.display = "flex";
            }

        
            // Logout function
            function logout() {
                const confirmLogout = confirm("Are you sure you want to log out?");
                if (confirmLogout) {
                    window.location.href = "login.html";
                }
            }

            // Search functionality
            searchInput.addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase();
                const rows = tableBody.querySelectorAll('tr');
                
                rows.forEach(row => {
                    const text = row.textContent.toLowerCase();
                    row.style.display = text.includes(searchTerm) ? '' : 'none';
                });
            });


            // Modal close functionality
            document.getElementById("closePatientModal").addEventListener('click', function() {
                document.getElementById("patientModal").style.display = "none";
            });
            
            document.getElementById("closeScheduleModal").addEventListener('click', function() {
                document.getElementById("scheduleModal").style.display = "none";
            });
            
            document.getElementById("closeApprovedModal").addEventListener('click', function() {
                document.getElementById("approvedAppointmentsModal").style.display = "none";
            });
            
            document.getElementById("cancelScheduleBtn").addEventListener('click', function() {
                document.getElementById("scheduleModal").style.display = "none";
            });
            // Admin page access control
            const isAdminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
                if (!isAdminLoggedIn) {
                    alert("Login First!")
            // Redirect unauthorized users to login page
            window.location.href = 'login.html';
        }

            // Confirm schedule
            document.getElementById("confirmScheduleBtn").addEventListener('click', function() {
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
                
                // Add to approved patients
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
                
                // Format date for display
                const formattedDate = new Date(scheduleDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                
                // Show confirmation
                alert(`Appointment scheduled for ${patient.patientname}:\nDate: ${formattedDate}\nTime: ${scheduleTime}\n\nAn email/SMS confirmation will be sent to the patient.`);
                
                // Close modal and reload table
                document.getElementById("scheduleModal").style.display = "none";
                loadTable();
                
                // Reset current patient index
                currentPatientIndex = null;
            });

            // Close modals when clicking outside
            window.addEventListener('click', function(event) {
                if (event.target === document.getElementById("patientModal")) {
                    document.getElementById("patientModal").style.display = "none";
                }
                if (event.target === document.getElementById("scheduleModal")) {
                    document.getElementById("scheduleModal").style.display = "none";
                }
                if (event.target === document.getElementById("approvedAppointmentsModal")) {
                    document.getElementById("approvedAppointmentsModal").style.display = "none";
                }
            });

            // Load table on page load and refresh
            window.addEventListener('DOMContentLoaded', function() {
                loadTable();
            });

            window.addEventListener('pageshow', function (event) {
                loadTable();
            });

            document.addEventListener('visibilitychange', function() {
                if (document.visibilityState === 'visible') loadTable();
            });
            
            window.addEventListener('focus', function() { 
                loadTable(); 
            });
     