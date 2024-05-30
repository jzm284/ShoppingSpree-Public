//function to set dashboard buttons to active
function toggleDashButtons(pressed) {
  //get all three buttons
  let dashButtons = document.querySelectorAll(".nav-item button");
  //make pressed active and all the others inactive
  dashButtons.forEach((button) => {
    if (button === pressed) {
      button.classList.add("active");
    } else {
      button.classList.remove("active");
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
      console.log("Account deletion confirmed.");
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
    isConfirming = false;
  }

  function deleteAccount() {
    deleteButton.innerHTML = "Deleting...";
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
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("An error occurred while deleting the account.");
      });
  }
});
