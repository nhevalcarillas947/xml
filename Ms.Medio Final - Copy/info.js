// Function to load services from embedded XML
function loadServicesFromXML() {
    try {
        // Get the XML from the embedded script tag
        const xmlElement = document.getElementById('xmlServices');
        if (!xmlElement) {
            console.error('XML element not found');
            return getDefaultServices();
        }
        
        const xmlText = xmlElement.textContent;
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "text/xml");
        
        // Check for parsing errors
        if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
            console.error('Error parsing XML');
            return getDefaultServices();
        }
        
        return xmlDoc;
    } catch (error) {
        console.error('Error loading XML:', error);
        return getDefaultServices();
    }
}

// Function to get default services (fallback)
function getDefaultServices() {
    const defaultXML = `
    <services>
        <service id="prenatal" name="Pre-natal" />
        <service id="checkup" name="Check-up" />
        <service id="immunization" name="Immunization" />
        <service id="tb" name="TB DOTS treatment" />
        <service id="consultation" name="Regular consultation" />
        <service id="familyplanning" name="Family Planning" />
        <service id="others" name="Others" />
    </services>`;
    
    const parser = new DOMParser();
    return parser.parseFromString(defaultXML, "text/xml");
}

// Function to populate services dropdown from XML
function populateServices() {
    const serviceSelect = document.getElementById('service');
    
    // Clear the default "loading" option
    serviceSelect.innerHTML = '<option value="">Please choose an option</option>';
    
    try {
        const xmlDoc = loadServicesFromXML();
        const services = xmlDoc.getElementsByTagName('service');
        
        // Add services from XML
        for (let i = 0; i < services.length; i++) {
            const service = services[i];
            const id = service.getAttribute('id');
            const name = service.getAttribute('name');
            
            if (id && name) {
                const option = document.createElement('option');
                option.value = id;
                option.textContent = name;
                serviceSelect.appendChild(option);
            }
        }
        
        console.log(`Loaded ${services.length} services from XML`);
        
    } catch (error) {
        console.error('Error populating services:', error);
        
        // Add fallback options if XML fails
        const fallbackServices = [
            {id: 'prenatal', name: 'Pre-natal'},
            {id: 'checkup', name: 'Check-up'},
            {id: 'immunization', name: 'Immunization'},
            {id: 'tb', name: 'TB DOTS treatment'},
            {id: 'consultation', name: 'Regular consultation'},
            {id: 'familyplanning', name: 'Family Planning'},
            {id: 'others', name: 'Others'}
        ];
        
        fallbackServices.forEach(service => {
            const option = document.createElement('option');
            option.value = service.id;
            option.textContent = service.name;
            serviceSelect.appendChild(option);
        });
    }
}

// Back button validation - EXACTLY THE SAME AS BEFORE
function setupBackButton() {
    const backButton = document.getElementById('backButton');
    
    if (backButton) {
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
    }
}

// Form submission - EXACTLY THE SAME AS BEFORE
function setupFormSubmission() {
    const form = document.getElementById("userForm");
    
    if (form) {
        form.addEventListener("submit", function(e) {
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
    }
}

// Contact number validation (optional helper function)
function setupContactValidation() {
    const contactInput = document.getElementById("contact");
    
    if (contactInput) {
        contactInput.addEventListener('input', function() {
            // Remove any non-digit characters
            this.value = this.value.replace(/\D/g, '');
            
            // Limit to 11 digits
            if (this.value.length > 11) {
                this.value = this.value.slice(0, 11);
            }
        });
    }
}

// Initialize everything when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // First, populate services from XML
    populateServices();
    
    // Then set up all the same functions as before
    setupBackButton();
    setupFormSubmission();
    setupContactValidation();
    
    console.log('Form initialized with XML services');
});