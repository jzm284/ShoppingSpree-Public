let grid;
function generateGrid() {
    const x = document.getElementById('x-dim').value;
    const y = document.getElementById('y-dim').value;
    grid = new Array(x);
    for (let i = 0; i < x; i++) {
        grid[i] = new Array(y);
    }
    const container = document.getElementById('store-canvas');

    // Clear existing grid if any
    container.innerHTML = '';

    for (let i = 0; i < x; i++) {
        const row = document.createElement('div');
        row.className = 'row';
        for (let j = 0; j < y; j++) {
            const button = document.createElement('button');
            button.setAttribute('data-x', i);  // Set x coordinate
            button.setAttribute('data-y', j);  // Set y coordinate
            button.classList.add('map-button');
            button.style.width = "25px";
            button.style.height = "25px";
            grid[i][j] = new Node(i, j, "", false);

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
    
    mapButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            // Remove the active class from all buttons
            mapButtons.forEach(btn => btn.classList.remove('active'));
            // Set the background color based on wall status
            mapButtons.forEach(btn => {
                const x = parseInt(btn.getAttribute('data-x'));
                const y = parseInt(btn.getAttribute('data-y'));
                btn.style.backgroundColor = grid[x][y].isWall ? "red" : "";
            });

            // Add the active class to the clicked button
            button.classList.add('active');
            button.style.backgroundColor = grid[parseInt(button.getAttribute('data-x'))][parseInt(button.getAttribute('data-y'))].isWall ? "red" : "gray";
            
            selectedI = parseInt(button.getAttribute('data-x')); // Get the x coordinate from the data attribute
            selectedJ = parseInt(button.getAttribute('data-y')); // Get the y coordinate from the data attribute

            let coords = document.getElementById("grid-coords");
            coords.innerHTML = `Section (${selectedI + 1}, ${selectedJ + 1})`;
            let wallCheck = document.getElementById("wall-check");
            let entranceCheck = document.getElementById("is-entrance");
            document.getElementById("section-descriptor").style.visibility = "visible";

            // Display the current state of the node in the edit box
            wallCheck.checked = grid[selectedI][selectedJ].isWall;
            wallCheck.onchange = function() {
                grid[selectedI][selectedJ].isWall = wallCheck.checked;
                if (wallCheck.checked) {
                    grid[selectedI][selectedJ].labels = [];
                    grid[selectedI][selectedJ].isEntrance = false;
                    document.getElementById("is-entrance").disabled = true;
                    button.style.backgroundColor = "red";
                } else {
                    button.style.backgroundColor = "gray";
                    document.getElementById("is-entrance").disabled = false;
                }
            };
            entranceCheck.onchange = function() {
                grid[selectedI][selectedJ].isEntrance = entranceCheck.checked;
                if (entranceCheck.checked) {
                    document.getElementById("wall-check").disabled = true;
                    grid[selectedI][selectedJ].isWall = false;
                    button.style.backgroundColor = "green";
                } else {
                    document.getElementById("wall-check").disabled = false;
                    button.style.backgroundColor = "gray";
                }
            }
        });
    });
}


/**
 * We represent the store layout as a 2D grid of the below Nodes.
 */
class Node {
    constructor(x, y, isWall) {
        this.x = x;             // X-coordinate on the grid
        this.y = y;             // Y-coordinate on the grid
        this.isWall = isWall;   // Boolean indicating whether this node is a wall
        this.labels = [];       // List of labels (grocery items present) at this node
        this.visited = false;   
        this.distance = Infinity;
        this.prev = null; 
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