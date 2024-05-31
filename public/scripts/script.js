//interactions with owner/customer buttons on the registration page
function toggleOwner() {
  let ownerButton = document.getElementById("owner-btn");
  let customerButton = document.getElementById("customer-btn");
  let userType = document.getElementById("userType");
  ownerButton.classList.remove("inactive");
  customerButton.classList.remove("active");
  ownerButton.classList.add("active");
  customerButton.classList.add("inactive");
  userType.value = "owner";
}

//interactions with owner/customer buttons on the registration page
function toggleCustomer() {
  let ownerButton = document.getElementById("owner-btn");
  let customerButton = document.getElementById("customer-btn");
  let userType = document.getElementById("userType");
  ownerButton.classList.remove("active");
  customerButton.classList.remove("inactive");
  ownerButton.classList.add("inactive");
  customerButton.classList.add("active");
  userType.value = "customer";
}

// function store_page(){
// let ownerButton = document.getElementById('owner');
// let customerButton = document.getElementById('customer');
// if(ownerButton.classList.contains('active'))
// {
//     document.location='store_page.html';
// }
// else if(customerButton.classList.contains('active')){
//     document.location='customer_page.html';
// }
// }
// function typeUser(){
//     let type = document.getElementsByName('type');
//     let value = "";

// }

// function submit(){
//     let email = document.getElementById("register-email").value;
//     let pass = document.getElementById("register-password").value;
//     let valid = true;
//     const emailRE = /^[a-z.!#$%&'*+/=?^_`{|}~-]+@[a-z]+.[a-z]{13}$/i;
//     const sCharRE = /[`!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?~ ]/;
//     if(emailRE.test(email)){
//         valid = false
//     }
//     if(user.length == ""){
//         valid = false
//     }
//     //8 characters long
//     if(password < 8 || !sCharRE.test(password)){
//         valid = false
//     }
//     alert(valid);
// }

// function toStore(id){
//     document.location='store_maker.html';
// }

// function addStore()
// {
//     const newStore = document.createElement('div');
//     newStore.id = "store_card";
//     newStore.onclick = function(){toStore(this.id)};
//     const container = document.getElementById('store_container');
//     container.appendChild(newStore);
// }

// //LLM stuff

// const API_TOKEN = "[redacted]";

// async function query(data) {
//     const response = await fetch(
//         "https://api-inference.huggingface.co/models/google/flan-t5-small",
//         {
//             headers: { Authorization: `Bearer ${API_TOKEN}` },
//             method: "POST",
//             body: JSON.stringify(data),
//         }
//     );

//     if (!response.ok) {
//         throw new Error(`API call failed with status ${response.status}`);
//     }

//     const result = await response.json();
//     return result;
// }

// function getInference(userInput) {
//     let apiResult = "";
//     const queryString = "Which of the following categories does " + userInput + " best fit into?\n" + "Choose one of the following labels:\n";
//     for (let i = 0; i < categories.length; i++) {
//         queryString += "\n" + categories[i];
//     }
//     query({ "inputs": queryString })
//         .then(response => {
//             apiResult = JSON.stringify(response);
//         })
//         .catch(error => {
//             console.error("Error querying the API:", error);
//         });
//     return apiResult;
// }
// let grid;
// function generateGrid() {
//     const x = parseInt(document.getElementById('x-dim').value, 10);
//     const y = parseInt(document.getElementById('y-dim').value, 10);
//     grid = new Array(x);
//     for (let i = 0; i < x; i++) {
//         grid[i] = new Array(y);
//     }
//     const container = document.getElementById('gridContainer');

//     // Clear existing grid if any
//     container.innerHTML = '';

//     for (let i = 0; i < y; i++) {
//         const row = document.createElement('div');
//         row.className = 'row';
//         for (let j = 0; j < x; j++) {
//             const button = document.createElement('button');
//             button.setAttribute('data-x', i);  // Set x coordinate
//             button.setAttribute('data-y', j);  // Set y coordinate
//             button.className = 'mapButton';
//             button.style.width = "25px";
//             button.style.height = "25px";
//             grid[i][j] = new Node(i, j, "", false);

//             // Reflect the node's state on the button's appearance
//             button.style.backgroundColor = grid[i][j].isWall ? "red" : "";
//             row.appendChild(button);
//         }
//         container.appendChild(row);
//     }
//     listenMapButtons();
// }
// window.generateGrid = generateGrid;

// let selectedI = null;
// let selectedJ = null;

// function listenMapButtons() {
//     let mapButtons = document.querySelectorAll(".mapButton");
//     mapButtons.forEach(function(button) {
//         button.addEventListener('click', function() {
//             selectedI = parseInt(button.getAttribute('data-x')); // Get the i value from the data attribute
//             selectedJ = parseInt(button.getAttribute('data-y')); // Get the j value from the data attribute

//             let wallCheck = document.getElementById("wall-check");
//             document.getElementById("edit-box").style.visibility = "visible";
//             document.getElementById("button-name").innerHTML = "Button coordinates: (" + (selectedI + 1) + ", " + (selectedJ + 1) + ")";

//             // Display the current state of the node in the edit box
//             wallCheck.checked = grid[selectedI][selectedJ].isWall;
//             wallCheck.onchange = function() {
//                 grid[selectedI][selectedJ].isWall = wallCheck.checked;
//                 button.style.backgroundColor = wallCheck.checked ? "red" : "";
//             };

//             renderLabelsForNode(selectedI, selectedJ);
//         });
//     });

//     // Separate keypress listener
//     $(document).on('keypress', function(event) {
//         if (selectedI === null || selectedJ === null) return; // No button selected
//         let keycode = (event.keyCode ? event.keyCode : event.which);
//         if (keycode == '13') {
//             let tempInputText = document.getElementById('item_list_input').value;
//             if (tempInputText == "") {
//                 return; //if blank, do nothing
//             }
//             grid[selectedI][selectedJ].labels.push(tempInputText);
//             renderLabelsForNode(selectedI, selectedJ); // Re-render after adding a new label
//             document.getElementById('item_list_input').value = ""; // Clear the input box
//         }
//     });
// }

// function renderLabelsForNode(i, j) {
//     const container = document.getElementById('item_list_container');
//     while (container.firstChild) {
//         container.removeChild(container.firstChild);
//     }

//     // Assuming you've already initialized the grid elsewhere with instances of Node.
//     let labelsCopy = [...grid[i][j].labels].reverse();

//     labelsCopy.forEach(label => {
//         const newStore = createLabelDiv(label);
//         container.appendChild(newStore);
//     });
// }

// function createLabelDiv(labelText) {
//     const newStore = document.createElement('div');
//     newStore.classList.add("itemListContainer");

//     const inputText = document.createElement('input');
//     inputText.id = "listItem";
//     inputText.disabled = true;
//     inputText.value = labelText;
//     newStore.appendChild(inputText);

//     const newX = document.createElement('button');
//     newX.classList.add("removeListItem");
//     newX.onclick = function() {
//         newStore.remove();
//         const index = grid[selectedI][selectedJ].labels.indexOf(labelText);
//         if (index > -1) {
//             grid[selectedI][selectedJ].labels.splice(index, 1);
//         }
//     }
//     newX.textContent = "X";
//     newStore.appendChild(newX);

//     return newStore;
// }

// //class for grid, Djikstra's
// class Node {
//     constructor(x, y, isWall) {
//         this.x = x;             // X-coordinate on the grid
//         this.y = y;             // Y-coordinate on the grid
//         this.isWall = isWall;   // Boolean indicating whether this node is a wall
//         this.labels = [];       // List of items/labels present at this node. This might be empty or contain one or more items
//         this.visited = false;   // Boolean indicating whether the node has been visited
//         this.distance = Infinity; // Distance from the start node; initialized to Infinity
//         this.prev = null;       // Reference to the previous node on the path from the start node
//     }
//     // Method to add labels to the node. This is just a utility; how you manage labels might depend on your application's logic
//     addLabel(label) {
//         // Check if the label is not already in the list to avoid duplicates
//         if (!this.labels.includes(label)) {
//             this.labels.push(label);
//         }
//     }

//     // Method to reset the node's state in case you need to clear the grid and perform a new pathfinding operation
//     reset() {
//         this.visited = false;
//         this.distance = Infinity;
//         this.prev = null;
//         // Do not reset isWall or labels as they are properties of the grid setup
//     }
// }

// //DJIKSTRAS STUFF OR A* STUFF

// //GET LABELS FROM CUSTOMER INPUTS
// const customerListContainer = document.getElementById("customer_list_container");
// const customerInputs = Array.from(customerListContainer.children);

// function getCustomerLabels() {
//     let results = [];
//     customerInputs.forEach(input => {
//         results.push(getInference(input.value));
//     });
//     return results;
// }



// function findShortestPath(startNode, grid) {
//     // Assuming grid is a 2D array of nodes
//     let rows = grid.length;
//     let cols = grid[0].length;

//     // Get labels from customer inputs
//     let customerLabels = getCustomerLabels();

//     // Each node should have properties like: isWall, labels (an array of items), visited, distance, prev (previous node)
//     for (let i = 0; i < rows; i++) {
//         for (let j = 0; j < cols; j++) {
//             grid[i][j].visited = false;
//             grid[i][j].distance = Infinity;
//             grid[i][j].prev = null;
//         }
//     }

//     // The start node's distance is set to 0
//     startNode.distance = 0;

//     let priorityQueue = [startNode];
//     let labelsCollected = new Set();

//     while (priorityQueue.length > 0) {
//         let currentNode = priorityQueue.shift();

//         // If the current node is a wall, skip it
//         if (currentNode.isWall) continue;

//         // Mark the current node as visited
//         currentNode.visited = true;

//         // Add any new labels from the current node to the labelsCollected set
//         for (let label of currentNode.labels) {
//             labelsCollected.add(label);
//         }

//         // If we have collected all required labels, we break
//         if (containsAllLabels(labelsCollected, customerLabels)) {
//             break;
//         }

//         // Check neighbors
//         let neighbors = getNeighbors(currentNode, grid);
//         for (let neighbor of neighbors) {
//             if (!neighbor.visited && !neighbor.isWall) {
//                 let newDistance = currentNode.distance + 1;  // Assuming all edges have weight 1
//                 if (newDistance < neighbor.distance) {
//                     neighbor.distance = newDistance;
//                     neighbor.prev = currentNode;

//                     // Re-insert the neighbor to the priority queue with updated distance
//                     priorityQueue.push(neighbor);
//                 }
//             }
//         }

//         // Keep the queue sorted based on distance
//         priorityQueue.sort((a, b) => a.distance - b.distance);
//     }

//     // Backtrack from the last visited node to construct the path
//     let path = [];
//     let temp = currentNode;  // Using currentNode since it's the last visited node before the break
//     while (temp) {
//         path.unshift(temp);
//         temp = temp.prev;
//     }
//     grid.reset();
//     return path;
// }

// function getNeighbors(node, grid) {
//     // This function returns valid neighbors for a given node from the grid
//     let neighbors = [];
//     let dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]]; // Right, Down, Left, Up

//     for (let dir of dirs) {
//         let newRow = node.x + dir[0];
//         let newCol = node.y + dir[1];

//         // Check if the new coordinates are within the grid's boundaries
//         if (newRow >= 0 && newRow < grid.length && newCol >= 0 && newCol < grid[0].length) {
//             neighbors.push(grid[newRow][newCol]);
//         }
//     }

//     return neighbors;
// }

// function containsAllLabels(collectedLabels, customerLabels) {
//     for (let label of customerLabels) {
//         if (!collectedLabels.has(label)) {
//             return false;
//         }
//     }
//     return true;
// }

// function submitList(){
//     window.location.href = "../route.html";
// }
