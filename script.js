// selecting Elements
const contactForm = document.getElementById("contactForm");
const searchInput = document.getElementById("searchInput");
const contactList = document.getElementById("contactList");

//selecting  Input elements
const phoneInput = document.getElementById("phoneNumber");
const nameInput = document.getElementById("contactName");
const emailInput = document.getElementById("emailId");

// Selecting button elements
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");

// Global variable
let editId = null;
let contacts = []; // We will store fetched contacts here for search and edit filtering

// Display cantacts
async function displayContacts(filteredData = null) {
  try{
    // if condition is applied and fetch all data
    if(!filteredData){
      const res = await fetch("https://api-mockforge.onrender.com/api/databases/69f078982c9134e30a4486e3/resources/contact");
      if(!res.ok) throw new Error ("failed to loaded contacts");
      const rawData = await res . json();
      // Hadling to API response structures
      contacts = rawData.data?.items || rawData.data || rawData || [];
    } else{
      contacts = filteredData;
    }
    // contactList first so dosn't duplicate
    contactList.innerHTML = "";
    // handel empty state
    if(contacts.length ===0){
      contactList.innerHTML = `
      <div class="col-12"> 
      <div class="alert alert-info text-center">
      No contacts found
      </div>
      </div>`;
      return;
    }
     // to maping this data
    contacts.map((contact)=>{
      const contactId = contact._id || contact.id;
      // to display the innerhtml 
      contactList.innerHTML +=`
      <div class="col-md-6 col-lg-4 mb-3 ">
            <div class="card ">
                <div class="card-body">
                    <h4 class="card-title text-primary">${contact.name}</h4>
                    <p class="card-text">📞 ${contact.phone}</p>
                    <p class="card-text">✉️ ${contact.email}</p>
                    <div class="d-flex gap-2">
                        <button class="btn btn-warning w-100" onclick="editContact('${contactId}')">Edit</button>
                        <button class="btn btn-danger w-100" onclick="deleteContact('${contactId}')">Delete</button>
                    </div>
                </div>
            </div>
        </div>
      `;
    });
    }catch (error) {
    console.log(error);
    showMessage(error.message, "error");
  }  
}

// create contact -POST Method
async function createContact(contactData) {
  try {
    const res = await fetch(
      "https://api-mockforge.onrender.com/api/databases/69f078982c9134e30a4486e3/resources/contact",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(contactData),
      },
    );
    if (!res.ok) throw new Error("Failed to add contact");

    const data = await res.json();
    console.log("Contact Created...", data);

    showMessage("Contact added successfully!", "success");
    // Refresh the list automatically!
    resetForm();
    displayContacts();
  } catch (error) {
    console.log(error);
    showMessage(error.message, "error");
  }
}

// Update contact -PUT Method

async function updateContact(contactId, contactData) {
  try {
    // FIX: Simplified the template literal so it correctly outputs /contact/ID without double slashes
    const res = await fetch(
      `https://api-mockforge.onrender.com/api/databases/69f078982c9134e30a4486e3/resources/contact/${contactId}`,
      {
        method: "PUT",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(contactData),
      },
    );

    if (!res.ok) throw new Error("Failed to update contact");

    const data = await res.json();
    console.log("Contact Updated...", data);

    showMessage("Contact updated successfully!", "success");
    // Refresh the list automatically!
    resetForm();
    displayContacts();
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

 // Delete, Edit, Search, UI (utility function)

async function deleteContact(id) {
  if (!confirm("Are you sure you want to delete this contact?")) return;

  try {
    // FIX: Updated database ID and removed the invalid '/:id/' from the endpoint
    const response = await fetch(
      `https://api-mockforge.onrender.com/api/databases/69f078982c9134e30a4486e3/resources/contact/${id}`,
      {
        method: "DELETE",
      },
    );
    if (!response.ok) throw new Error("Failed to delete contact");

    showMessage("Contact deleted successfully!", "success");
    displayContacts(); 
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
    contact.name.toLowerCase().includes(keyword),
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
  alert.className = `alert alert-${type === "error" ? "danger" : "success"} custom-alert position-fixed top-0 end-0 m-3 z-3`;
  alert.textContent = message;
  document.body.appendChild(alert);

  setTimeout(() => {
    alert.remove();
  }, 3000);
}

// Load Contacts on Page Load
document.addEventListener("DOMContentLoaded", () => displayContacts());
