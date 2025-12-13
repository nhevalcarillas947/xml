// Form submission
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

    alert("Patient information submitted successfully!");
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
