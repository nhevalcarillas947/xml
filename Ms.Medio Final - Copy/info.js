// Back button validation
document.addEventListener('DOMContentLoaded', function() {
    const backButton = document.getElementById('backButton');
    
    backButton.addEventListener('click', function() {
        // Check if any form field has been filled
        const patientname = document.getElementById("patientname").value.trim();
        const email = document.getElementById("email").value.trim();
        const age = document.getElementById("age").value.trim();
        const address = document.getElementById("address").value.trim();
        const service = document.getElementById("service").value;
        const contact = document.getElementById("contact").value.trim();
        
        // Check if any field has data
        const hasData = patientname || email || age || address || (service && service !== "") || contact;
        
        // If form has data, show confirmation alert
        if (hasData) {
            const confirmBack = confirm('You have unsaved changes. Are you sure you want to go back?');
            if (confirmBack) {
                window.location.href = 'User.html';
            }
        } else {
            // If no data, proceed directly
            window.location.href = 'User.html';
        }
    });
});

// Form submission - Your original code remains unchanged
document.getElementById("userForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const patientname = document.getElementById("patientname").value;
    const email = document.getElementById("email").value;
    const age = document.getElementById("age").value;
    const address = document.getElementById("address").value;
    const service = document.getElementById("service").value;

    const contactInput = document.getElementById("contact");
    const contactDigits = contactInput.value.replace(/\D/g, ''); // Remove non-digit characters

    // Validate contact number length
    if (contactDigits.length !== 11) {
        alert("Contact number must be exactly 11 digits. Please retype it in the input field.");
        contactInput.focus(); // Focus back on the input field
        return; // Stop form submission
    }

    const contact = contactDigits;

    const newUser = {
        patientname,
        email,
        age,
        contact,
        address,
        service
    };

    const records = JSON.parse(localStorage.getItem("patients")) || [];
    records.push(newUser);
    localStorage.setItem("patients", JSON.stringify(records));

    alert("Patient information submitted successfully! the admin will contact you soon.");
    this.reset(); // Reset form after submission
});

// Optional: Parse embedded XML
const xmlString = document.getElementById("serviceData").textContent;
const parser = new DOMParser();
const xmlDoc = parser.parseFromString(xmlString, "text/xml");
const services = xmlDoc.getElementsByTagName("service");
for (let i = 0; i < services.length; i++) {
    console.log(services[i].getAttribute("id"), ":", services[i].getAttribute("description"));
}