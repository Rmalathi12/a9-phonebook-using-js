// selecting Elements
const contactForm = document.getElementById("contactForm");
const searchInput = document.getElementById("searchInput");
const contactList = document.getElementById("contactList"); // This is our 'container'

// Input selecting elements
const phoneInput = document.getElementById("phoneNumber");
const nameInput = document.getElementById("contactName");
const emailInput = document.getElementById("emailId");

// Selecting element on button
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");

// Global variable
let editId = null;
let contacts = []; // We will store fetched contacts here for search and edit filtering

// create contact
async function createContact(contactData) {
  try {
    const config = {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(contactData),
    };
    const res = await fetch("https://api-mockforge.onrender.com/api/databases/69f078982c9134e30a4486e3/resources/contact", config);
    if (!res.ok) throw new Error("Failed to add contact");
    
    const data = await res.json();
    console.log("Contact Created...", data);
    
    showMessage("Contact added successfully!", "success");
    resetForm();
    displayContacts(); // Refresh the list automatically!
  } catch (error) {
    console.log(error);
    showMessage(error.message, "error");
  }
}
// console.log(createContact(contactData));

// // update contact reference


async function updateContact(contactId, contactData) {
  try {
    const config = {
      method: "PUT", 
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(contactData),
    };

    // FIX: Simplified the template literal so it correctly outputs /contact/ID without double slashes
    const res = await fetch(`https://api-mockforge.onrender.com/api/databases/69f078982c9134e30a4486e3/resources/contact/${contactId}`, config);
    
    if (!res.ok) throw new Error("Failed to update contact");

    const data = await res.json();
    console.log("Contact Updated...", data);
    
    showMessage("Contact updated successfully!", "success");
    resetForm();
    displayContacts(); // Refresh the list automatically!
  } catch (error) {
    console.log(error);
    showMessage(error.message, "error");
  }
}
// form submit handler
contactForm.addEventListener("submit", async (e) => {
  e.preventDefault();  
  const contact = {
    name: nameInput.value.trim(),
    phone: phoneInput.value.trim(),
    email: emailInput.value.trim(),
  };
  if (!validateForm(contact)) return;
  // Decide whether to Update or Create based on editId
  if (editId) {
    await updateContact(editId, contact);
  } else {
    await createContact(contact);
  }
});

// // Delete, Edit, Search, UI (utility function)

async function deleteContact(id) {
  if (!confirm("Are you sure you want to delete this contact?")) return;
  
  try {
    // FIX: Updated database ID and removed the invalid '/:id/' from the endpoint
    const response = await fetch(`https://api-mockforge.onrender.com/api/databases/69f078982c9134e30a4486e3/resources/contact/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete contact");
    
    showMessage("Contact deleted successfully!", "success");
    displayContacts(); // Refresh after deleting
  } catch (error) {
    showMessage(error.message, "error");
  }
}
// Populate Form for Editing
function editContact(id) {
  // Find the specific contact in our saved array
  const contact = contacts.find((item) => (item._id || item.id) === id);
  if (!contact) return;

  nameInput.value = contact.name;
  phoneInput.value = contact.phone;
  emailInput.value = contact.email;
  editId = id;
  
  saveBtn.textContent = "Update Contact";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Search Contacts
searchInput.addEventListener("input", () => {
  const keyword = searchInput.value.toLowerCase().trim();
  const filtered = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(keyword)
  );
  // Pass the filtered array to displayContacts
  displayContacts(filtered); 
});

// Cancel Button
cancelBtn.addEventListener("click", resetForm);

// Form Validation
function validateForm(contact) {
  const phoneRegex = /^[6-9]\d{9}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!contact.name || !contact.phone || !contact.email) {
    showMessage("All fields are required.", "error");
    return false;
  }
  if (!phoneRegex.test(contact.phone)) {
    showMessage("Enter a valid 10-digit mobile number.", "error");
    return false;
  }
  if (!emailRegex.test(contact.email)) {
    showMessage("Enter a valid email address.", "error");
    return false;
  }
  return true;
}

// Reset Form
function resetForm() {
  contactForm.reset();
  editId = null;
  saveBtn.textContent = "Save Contact";
}

// Show Alert Message
function showMessage(message, type) {
  const existingAlert = document.querySelector(".custom-alert");
  if (existingAlert) {
    existingAlert.remove();
  }
  
  const alert = document.createElement("div");
  alert.className = `alert alert-${type === 'error' ? 'danger' : 'success'} custom-alert position-fixed top-0 end-0 m-3 z-3`;
  alert.textContent = message;
  document.body.appendChild(alert);
  
  setTimeout(() => {
    alert.remove();
  }, 3000);
}

// Load Contacts on Page Load
document.addEventListener("DOMContentLoaded", () => displayContacts());