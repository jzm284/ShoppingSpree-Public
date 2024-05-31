//function to set dashboard buttons to active
function toggleDashButtons(pressed) {
    //get all three buttons
    let dashButtons = document.querySelectorAll(".nav-item button");
    //make pressed active and all the others inactive
    dashButtons.forEach((button) => {
        if (button === pressed) {
            button.classList.add("active");
            const sectionID = button.getAttribute("data-section");
            const section = document.getElementById(sectionID);
            section.classList.remove("hidden");
        } else {
            button.classList.remove("active");
            const sectionID = button.getAttribute("data-section");
            const section = document.getElementById(sectionID);
            section.classList.add("hidden"); //no dupes, classList is a set
        }
    });
}

/**
 * Function to toggle the profile sidebar on the dashboard
 */
function toggleProfileBar() {
    let profileBar = document.getElementById("profile-bar");
    let profileIcon = document.getElementById("profile-icon");
    console.log(profileIcon);
    profileBar.classList.toggle("sidebar-active");
    if (profileIcon.classList.contains("icon-active")) {
        profileIcon.style.outline = "none";
        profileIcon.style.borderRadius = "0%";
    } else {
        profileIcon.style.outline = "2px solid var(--site-yellow)";
        profileIcon.style.borderRadius = "50%";
    }
    profileIcon.classList.toggle("icon-active");
}

function toggleProfileItem(profileItem) {
    profileItem.classList.toggle("active");
    let sidebarContent = profileItem.querySelector(".sidebar-content");
    sidebarContent.classList.toggle("active");
}

/**
 * Function to "upgrade" the user's account
 */
function upgradeAccount() {
    let upgradeButton = document.getElementById("upgrade-acc");
    upgradeButton.style.color = "black";
    upgradeButton.style.height = "20%";
    upgradeButton.style.width = "100%";
    upgradeButton.style.left = "0%";
    upgradeButton.textContent =
        "Thanks for your support! ShoppingSpree will remain a free service for the foreseeable future. Enjoy!";
    upgradeButton.disabled = true;
    setTimeout(() => {
        upgradeButton.style.color = "green";
        upgradeButton.textContent = "Upgrade Account";
        upgradeButton.style.height = "15%";
        upgradeButton.style.width = "75%";
        upgradeButton.style.left = "12.5%";
        upgradeButton.disabled = false;
    }, 5000);
}

document.addEventListener("DOMContentLoaded", function () {
    const deleteButton = document.getElementById("delete-acc");
    //track if this is the first or second click on delete button
    let isConfirming = false;

    deleteButton.addEventListener("click", function () {
        if (!isConfirming) {
            // First click, switch to confirmation mode
            isConfirming = true;
            deleteButton.style.height = "20%";
            deleteButton.style.width = "100%";
            deleteButton.style.left = "0%";
            deleteButton.innerHTML =
                "Are you sure?<br> Press again to delete account.<br><b>There is no undoing this action.</b>";
        } else {
            // Second click, perform the deletion
            deleteAccount();
        }
    });

    document.addEventListener("click", function (event) {
        // Listen for clicks outside the button when in confirmation mode
        if (isConfirming && !deleteButton.contains(event.target)) {
            resetButton();
        }
    });

    function resetButton() {
        deleteButton.innerHTML = "Delete Account";
        deleteButton.style.width = "75%";
        deleteButton.style.height = "15%";
        deleteButton.style.left = "12.5%";
        deleteButton.disabled = false;
        isConfirming = false;
    }

    function deleteAccount() {
        deleteButton.innerHTML = "Deleting...";
        deleteButton.disabled = true;
        deleteButton.width = "75%";
        deleteButton.height = "15%";
        deleteButton.left = "12.5%";
        fetch("/api/delete-account", {
            method: "DELETE",
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.status === "success") {
                    alert("Account deleted successfully.");
                    window.location.href = "/";
                } else {
                    alert("Failed to delete account: " + data.message);
                    resetButton();
                }
            })
            .catch((error) => {
                console.error("Error:", error);
                alert("An error occurred while deleting the account.");
                resetButton();
            });
    }
});

async function changePassword() {
    const oldPass = document.getElementById("old-pass").value;
    const newPass = document.getElementById("new-pass").value;
    const confirmPass = document.getElementById("confirm-pass").value;

    const response = await fetch("/auth/change-password", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ oldPass, newPass, confirmPass }),
    });

    const result = await response.json();
    const message = document.getElementById("error-msg");
    if (result.error) {
        message.innerText = result.error;
        message.style.color = "red";
    } else {
        message.innerText = "Password successfully changed";
        message.style.color = "green";
    }
}

async function logOut() {
    const response = await fetch("/auth/logout", {
        method: "POST",
    });

    if (response.redirected) {
        window.location.href = response.url;
    }
}

let first = true;
document.addEventListener("keypress", function (event) {
    let keycode = event.keyCode ? event.keyCode : event.which;
    if (keycode == "13" && document.activeElement.id == "customer-list-input") {
        //if enter key is pressed, add a new item to the list
        let tempInputText = document.getElementById("customer-list-input").value;
        if (tempInputText == "") {
            return;
        }
        const newItem = document.createElement("div");
        newItem.classList.add("list-item-div");
        const inputText = document.createElement("input");
        inputText.classList.add("list-item");
        inputText.disabled = true;
        inputText.value = tempInputText;
        newItem.appendChild(inputText);

        const newX = document.createElement("button");
        newX.classList.add("remove-list-item");
        newX.onclick = function () {
            newItem.remove();
        };
        newX.textContent = "X";
        newItem.appendChild(newX);

        const container = document.getElementById("customer-list-div");
        if (first) {
            container.appendChild(newItem);
        } else {
            container.insertBefore(newItem, container.firstChild);
        }
        first = false;
        document.getElementById("customer-list-input").value = "";
    }
});


document.addEventListener("DOMContentLoaded", function() {
    let stores = [];

    // Fetch the list of stores from the server when the page loads
    fetch('/api/stores')
        .then(response => response.json())
        .then(data => {
            stores = data;
        })
        .catch(error => console.error("Error fetching stores:", error));

    const storeSearchInput = document.getElementById('store-search');
    const storeList = document.getElementById('store-list');

    storeSearchInput.addEventListener('input', function() {
        const query = storeSearchInput.value.toLowerCase();
        const filteredStores = stores.filter(store => store.name.toLowerCase().includes(query));
        populateStoreList(filteredStores);
        storeList.style.display = 'block';
    });

    document.addEventListener('click', function(event) {
        if (!event.target.closest('.search-container')) {
            storeList.style.display = 'none';
        }
    });

    storeSearchInput.addEventListener('click', function() {
        if (storeSearchInput.value === '') {
            populateStoreList(stores);
            storeList.style.display = 'block';
        }
    });

    function populateStoreList(storeArray) {
        storeList.innerHTML = '';
        storeArray.forEach(store => {
            const li = document.createElement('li');
            li.textContent = store.name;
            storeList.appendChild(li);
        });
    }
});


function submitList() {
    const customerListContainer = document.getElementById("customer-list-div");
    console.log(customerListContainer);
    //get a list of the values of the inputs in customerListContainer
    const customerList = customerListContainer.querySelectorAll("input");
    const list = [];
    customerList.forEach((item) => {
        list.push(item.value);
    });
    //send a POST request to the server with the list
    fetch("/api/new-list", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: /*get store name*/JSON.stringify({ list }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.status === "success") {
                alert("List saved successfully.");
            } else {
                alert("Failed to save list: " + data.message);
            }
        })
        .catch((error) => {
            console.error("Error:", error);
            alert("An error occurred while saving the list.");
        });
}
