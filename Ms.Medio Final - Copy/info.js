
async function loadServicesFromXML() {
    try {
        // Try to fetch the external XML file
        const response = await fetch('info.xml');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const xmlText = await response.text();
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
        // Fallback to default services if external XML fails
        return getDefaultServices();
    }
}


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


async function populateServices() {
    const serviceSelect = document.getElementById('service');
    
    serviceSelect.innerHTML = '<option value="">Please choose an option</option>';
    
    try {
        const xmlDoc = await loadServicesFromXML();
        const services = xmlDoc.getElementsByTagName('service');
        
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
        
        // Fallback to default services
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


function setupBackButton() {
    const backButton = document.getElementById('backButton');
    
    if (backButton) {
        backButton.addEventListener('click', function() {
        
            const confirmBack = confirm('Are you sure you want to go back?');
            if (confirmBack) {
                window.location.href = 'User.html'; 
            }
        });
    }
}

function setupFormSubmission() {
    const form = document.getElementById("userForm");
    
    if (form) {
        form.addEventListener("submit", function(e) {
            e.preventDefault();

            const patientname = document.getElementById("patientname").value;
            const email = document.getElementById("email").value;
            const age = document.getElementById("age").value;
            const address = document.getElementById("address").value;
            
            // Get the selected service
            const serviceSelect = document.getElementById("service");
            const selectedOption = serviceSelect.options[serviceSelect.selectedIndex];
            let service = serviceSelect.value;
            
            // If it's a custom service (not from the original XML), use the text content
            if (selectedOption && selectedOption.getAttribute('data-custom') === 'true') {
                service = selectedOption.textContent; // Use the actual text the user entered
            }

            const contactInput = document.getElementById("contact");
            const contactDigits = contactInput.value.replace(/\D/g, '');

        
            if (contactDigits.length !== 11) {
                alert("Contact number must be exactly 11 digits. Please retype it in the input field.");
                contactInput.focus(); 
                return; 
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

            alert("Patient information submitted successfully! The admin will contact you soon.");
            this.reset();
            
            // Remove any custom options added to the select after successful submission
            const customOptions = serviceSelect.querySelectorAll('option[data-custom="true"]');
            customOptions.forEach(option => option.remove());
        });
    }
}


function setupContactValidation() {
    const contactInput = document.getElementById("contact");
    
    if (contactInput) {
        contactInput.addEventListener('input', function() {
      
            this.value = this.value.replace(/\D/g, '');
            
            if (this.value.length > 11) {
                this.value = this.value.slice(0, 11);
            }
        });
    }
}

function setupOthersOption() {
    const serviceSelect = document.getElementById('service');
    const othersModal = document.getElementById('othersModal');
    const otherServiceInput = document.getElementById('otherServiceInput');
    const closeModal = document.getElementById('closeModal');
    const cancelModalBtn = document.getElementById('cancelModalBtn');
    const confirmModalBtn = document.getElementById('confirmModalBtn');
    
    // Track the original service value when others is selected
    let originalValue = '';
    
    if (serviceSelect) {
        serviceSelect.addEventListener('change', function() {
            if (this.value === 'others') {
                originalValue = this.value;
                othersModal.style.display = 'block';
                otherServiceInput.focus();
                // Reset the selection to prevent form submission with 'others' value
                this.value = '';
            }
        });
    }
    
    // Close modal functions
    function closeOthersModal() {
        othersModal.style.display = 'none';
        // Reset the selection if user closes without confirming
        if (serviceSelect) {
            serviceSelect.value = '';
        }
    }
    
    // Event listeners for closing modal
    closeModal.addEventListener('click', closeOthersModal);
    cancelModalBtn.addEventListener('click', closeOthersModal);
    
    // Confirm button functionality
    confirmModalBtn.addEventListener('click', function() {
        const customService = otherServiceInput.value.trim();
        
        if (customService) {
            // Set the custom service as the selected value
            if (serviceSelect) {
                // Create a temporary option for the custom service
                const customOption = document.createElement('option');
                customOption.value = customService.toLowerCase().replace(/\s+/g, '_');
                customOption.textContent = customService;
                customOption.setAttribute('data-custom', 'true');
                
                // Add the custom option to the select
                serviceSelect.appendChild(customOption);
                
                // Select the custom option
                serviceSelect.value = customOption.value;
            }
            
            othersModal.style.display = 'none';
            otherServiceInput.value = ''; // Clear the input
        } else {
            alert('Please enter a service name');
            otherServiceInput.focus();
        }
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === othersModal) {
            closeOthersModal();
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && othersModal.style.display === 'block') {
            closeOthersModal();
        }
    });
}


document.addEventListener('DOMContentLoaded', async function() {
    await populateServices();
    setupBackButton();
    setupFormSubmission();
    setupContactValidation();
    setupOthersOption();
    
    console.log('Form initialized with XML services');
});