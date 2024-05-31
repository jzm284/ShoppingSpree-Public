let grid;
let rows;
let cols;

function generateGrid() {
  rows = document.getElementById("x-dim").value;
  cols = document.getElementById("y-dim").value;
  grid = new Array(rows);
  for (let i = 0; i < rows; i++) {
    grid[i] = new Array(cols);
  }
  const container = document.getElementById("store-canvas");
  document.getElementById("floor-plan").style.visibility = "visible";
  // Clear existing grid if any
  container.innerHTML = "";

  for (let i = 0; i < rows; i++) {
    const row = document.createElement("div");
    row.className = "row";
    for (let j = 0; j < cols; j++) {
      const button = document.createElement("button");
      button.setAttribute("data-x", i); // Set x coordinate
      button.setAttribute("data-y", j); // Set y coordinate
      button.classList.add("map-button");
      button.style.width = "25px";
      button.style.height = "25px";
      grid[i][j] = new Node(i, j);

      // Reflect the node's state on the button's appearance
      button.style.backgroundColor = grid[i][j].isWall ? "red" : "";
      row.appendChild(button);
    }
    container.appendChild(row);
  }
  listenMapButtons();
}

function listenMapButtons() {
  let mapButtons = document.querySelectorAll(".map-button");

  mapButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      // Remove the active class from all buttons
      mapButtons.forEach((btn) => btn.classList.remove("active"));

      // Set the background color based on wall status
      mapButtons.forEach((btn) => {
        const x = parseInt(btn.getAttribute("data-x"));
        const y = parseInt(btn.getAttribute("data-y"));
        const wallCheckbox = document.getElementById("wall-check");
        const entranceCheckbox = document.getElementById("is-entrance");
        if (grid[x][y].isWall) {
          btn.style.backgroundColor = "red";
          entranceCheckbox.checked = false;
          entranceCheckbox.disabled = true;
        } else if (grid[x][y].isEntrance) {
          btn.style.backgroundColor = "green";
          wallCheckbox.checked = false;
          wallCheckbox.disabled = true;
        } else {
          btn.style.backgroundColor = "";
          wallCheckbox.disabled = false;
          entranceCheckbox.disabled = false;
        }
      });

      // Add the active class to the clicked button
      button.classList.add("active");

      selectedI = parseInt(button.getAttribute("data-x")); // Get the x coordinate from the data attribute
      selectedJ = parseInt(button.getAttribute("data-y")); // Get the y coordinate from the data attribute

      //display the coordinates of the selected section
      let coords = document.getElementById("grid-coords");
      coords.innerHTML = `Section (${selectedI + 1}, ${selectedJ + 1})`;
      let wallCheck = document.getElementById("wall-check");
      let entranceCheck = document.getElementById("is-entrance");
      document.getElementById("section-descriptor").style.visibility =
        "visible";

      // Display the current state of the node in the section descriptor

      //is this section a wall?
      wallCheck.checked = grid[selectedI][selectedJ].isWall;
      wallCheck.onchange = function () {
        grid[selectedI][selectedJ].isWall = wallCheck.checked;
        if (wallCheck.checked) {
          grid[selectedI][selectedJ].labels = [];
          grid[selectedI][selectedJ].isEntrance = false;
          document.getElementById("is-entrance").disabled = true;
          button.style.backgroundColor = "red";
        } else {
          button.style.backgroundColor = grid[selectedI][selectedJ].isEntrance
            ? "green"
            : "gray";
          document.getElementById("is-entrance").disabled = false;
        }
      };

      //is this section an entrance?
      entranceCheck.checked = grid[selectedI][selectedJ].isEntrance;
      entranceCheck.onchange = function () {
        grid[selectedI][selectedJ].isEntrance = entranceCheck.checked;
        if (entranceCheck.checked) {
          document.getElementById("wall-check").disabled = true;
          grid[selectedI][selectedJ].isWall = false;
          button.style.backgroundColor = "green";
        } else {
          document.getElementById("wall-check").disabled = false;
          button.style.backgroundColor = grid[selectedI][selectedJ].isWall
            ? "red"
            : "gray";
        }
      };

      // Propagate labels in the input field
      let labelsInput = document.getElementById("section-items");
      labelsInput.value = grid[selectedI][selectedJ].labels.join(", ");

      // Update grid on input change
      labelsInput.addEventListener("change", function () {
        grid[selectedI][selectedJ].labels = this.value
          .split(",")
          .map((label) => label.trim()); // Split and trim labels to avoid extra spaces
      });
    });
  });
}

function saveStoreLayout() {
    let storeLayout = {
        rows: rows,
        cols: cols,
        grid: grid,
    };
    let name = document.getElementById("store-name").value;
    let address = document.getElementById("store-address").value;
    let public = document.getElementById("public-check").checked;

    const obj = JSON.stringify({
        name, 
        address, 
        layout: storeLayout,
        public
    });
    
    console.log(obj);
    //send layout to the server in a POST request to /api/new-store
    fetch("/api/new-store", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: obj
    })
        .then((response) => response.json())
        .then((data) => {
            console.log("Success:", data);
            alert("Store layout saved successfully!");
        })
        .catch((error) => {
            console.error("Error:", error);
            alert("Error saving store layout!");
        });
    }

/**
 * We represent the store layout as a 2D grid of the below Nodes.
 */
class Node {
  constructor(x, y) {
    this.x = x; // X-coordinate on the grid
    this.y = y; // Y-coordinate on the grid
    this.isWall = false; // Boolean indicating whether this node is a wall
    this.isEntrance = false; // Boolean indicating whether this node is the entrance
    this.labels = []; // List of labels (grocery items present) at this node
  }

  //Add a label to the node
  //i.e. say that a grocery item is present at this node
  addLabel(label) {
    //Avoid duplicates
    if (!this.labels.includes(label)) {
      this.labels.push(label);
    }
  }
}
