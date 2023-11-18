NODE_WIDTH = 50;
NODE_HEIGHT = 50;

LINE_START = "START";
LINE_END = "END";
VERTEX_DOM = 0;
VERTEX_LINE = 1;
VERTEX_START_OR_END = 2;
DEFAULT_LINE_WEIGHT = 1;

//For Creating nodes
ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

//Grabbing some references to our main html elements
LINE_HOLDER = document.getElementById("lineHolder");
CONTROL_PANEL = document.getElementById("controls");
NODE_SELECTOR = document.getElementById("selector-one");
D_ONE_SELECTOR = document.getElementById("selector-two");
D_TWO_SELECTOR = document.getElementById("selector-three");

//Some global variables for user interaction.
var hovering = false;
var isMouseDown = false;
var isMouseOnControls = false;
var currentSelectedDom = null;
var shiftPressed = false;

//Instantiating line placeholder
var linePlaceHolder = document.createElementNS("http://www.w3.org/2000/svg", "line");
LINE_HOLDER.appendChild(linePlaceHolder);

//These are the coordinates for the new connect we are making at any given time and the node we start with.
var currentNewLine = {startingNode:null,x1:"0",x2:"0",y1:"0",y2:"0"}

//Que Class is used for the searching algorithms -- Credit: GeeksForGeeks
class Queue {
    constructor() {
        this.items = {};
        this.frontIndex = 0;
        this.backIndex = 0;
    }

    enqueue(element, priority) {
        this.items[this.backIndex] = { element, priority };
        this.backIndex++;
        return element + ' inserted';
    }

    dequeue() {
        let minPriority = Infinity;
        let minIndex = -1;

        for (let i = this.frontIndex; i < this.backIndex; i++) {
            if (this.items[i].priority < minPriority) {
                minPriority = this.items[i].priority;
                minIndex = i;
            }
        }

        if (minIndex !== -1) {
            const element = this.items[minIndex].element;
            delete this.items[minIndex];
            this.frontIndex++;
            return { element, priority: minPriority };
        }

        return null;
    }

    isEmpty() {
        return this.frontIndex === this.backIndex;
    }

    get printQueue() {
        return this.items;
    }
}

// GRAPH CLASS
class Graph {
    // defining vertex array and
    // adjacent list
    constructor(noOfVertices = 0)
    {
        this.noOfVertices = noOfVertices;
        this.AdjList = new Map();
    }
 
    // add vertex to the graph
    //[DOM Element, "A"]
    addVertex(vertex)
    {
        // initialize the adjacent list with a
        // null array
        this.AdjList.set(vertex, []);
    }

    // add edge to the graph
    // [DOM Element, "A"] : [[DOM Element, "B"], Line Dom Element, "START"]
    addEdge(vertex, vertexTwo, line)
    {
        //We add the connection between 
        this.AdjList.get(vertex).push([vertexTwo, line, LINE_START]);
    
        // Since graph is undirected,
        // add an edge from w to v also
        this.AdjList.get(vertexTwo).push([vertex, line, LINE_END]);
    }

    // Prints the vertex and adjacency list
    printGraph()
    {
        // get all the vertices
        var get_keys = this.AdjList.keys();
    
        // iterate over the vertices
        for (var i of get_keys) 
        {
            // get the corresponding adjacency list
            // for the vertex
            var get_values = this.AdjList.get(i);
            var conc = "";
    
            // iterate over the adjacency list
            // concatenate the values into a string
            for (var j of get_values)
                conc += j[0][1] + " ";
    
            // print the vertex and its adjacency list
            console.log(i[1] + " -> " + conc);
        }
    }

    //Returns current number of nodes in the graph
    currentLength(){
        return this.AdjList.size;
    }

    currentList(){
        return this.AdjList.keys();
    }

    //Returns letter and DOM element from just letter
    returnNodeFromLetter(letter){
        var get_keys = this.AdjList.keys();
    
        for (var i of get_keys) {
            if(i[1] == letter){
                return i;
            }
        }
    }

    isEventTargetInMap(eventTarget){
        var get_keys = this.AdjList.keys();
    
        for (var i of get_keys) {
            if(eventTarget == i[0]){
                return true;
            }
        }

        return false;
    }

    //Returns the list of connects associated with a specific node
    getNodeConnections(vertex){
        var get_values = this.AdjList.get(vertex);    
        var lineElements = [];

        for (var j of get_values)
            lineElements.push(j);
        
        return lineElements;
    }

    //Removes a node, all you need is the letter
    //it also removes the corresponding item from the gui and all of its connections
    removeNodeFromLetter(letter){
        this.removeNode(this.returnNodeFromLetter(letter))
    }


    //clear graph essentially deletes the entire graph
    clear(){
        for(var key of this.AdjList.keys()){
            this.removeNode(key);
        }
    }

    //Removes a node, removes it from GUI and everything
    removeNode(node) {
        //Start by removing the connections to the node.
        this.removeConnections(node);

        //Then remove the node form the graph itself.
        node[0].remove(); // View removal
        this.AdjList.delete(node); // Model removal
    }


    //Removes all connections to a node.
    removeConnections(node) {
        const vertexConnections = this.AdjList.get(node);

        //Remove connections
        for(var otherNode of vertexConnections){
            this.removeRelation(node,otherNode[0]);
        }
    }

    //Removes all connection between two nodes
    removeRelation(vertex, vertex_two){
        const updatedVertexListOne = [];
        const vertexConnections1 = this.AdjList.get(vertex);
        
        for (const item of vertexConnections1) {
            if (item[0][0] !== vertex_two[VERTEX_DOM]) {
                updatedVertexListOne.push(item);
            } else {
                item[1].remove();
            }
        }
        this.AdjList.set(vertex, updatedVertexListOne);
        
        const updatedVertexListTwo = [];
        const vertexConnections2 = this.AdjList.get(vertex_two);
        
        for (const item of vertexConnections2) {
            if (item[0][0] !== vertex[VERTEX_DOM]) {
                updatedVertexListTwo.push(item);
            } else {
                item[1].remove();
            }
        }
        
        this.AdjList.set(vertex_two, updatedVertexListTwo);
    }
 
    // function to performs BFS
    bfs(startingNode)
    {
    
        // create a visited object
        var visited = {};
    
        // Create an object for queue
        var q = new Queue();
    
        // add the starting node to the queue
        visited[startingNode] = true;
        q.enqueue(startingNode);
    
        // loop until queue is empty
        while (!q.isEmpty()) {
            // get the element from the queue
            var getQueueElement = q.dequeue();
    
            // passing the current vertex to callback function
            console.log(getQueueElement);
    
            // get the adjacent list for current vertex
            var get_List = this.AdjList.get(getQueueElement);
    
            // loop through the list and add the element to the
            // queue if it is not processed yet
            for (var i in get_List) {
                var neigh = get_List[i];
    
                if (!visited[neigh]) {
                    visited[neigh] = true;
                    q.enqueue(neigh);
                }
            }
        }
    }

    distances = {};

    dijkstra(startingNode, endingNode) {
        // Set initial distances to Infinity for all nodes
        const predecessors = {};
        for (const key of this.AdjList.keys()) {
            this.distances[key] = 9999;
            predecessors[key] = null;
        }

        // Set the distance to the starting node to 0
        this.distances[startingNode] = 0;

        // Create a priority queue (using your Queue class)
        const priorityQueue = new Queue();

        // Enqueue the starting node with its distance
        priorityQueue.enqueue(startingNode, 0);

        // Process nodes until the priority queue is empty
        while (!priorityQueue.isEmpty()) {
            const { element: currentVertex, priority: currentDistance } = priorityQueue.dequeue();

            // If the current node is the ending node, stop the algorithm
            if (currentVertex === endingNode) {
                break;
            }

            // Get the neighbors of the current vertex
            const neighbors = this.AdjList.get(currentVertex);

            // Update distances to neighbors
            for (const neighbor of neighbors) {
                const [neighborVertex, line, lineStart] = neighbor;

                const distanceToNeighbor = currentDistance + DEFAULT_LINE_WEIGHT;

                if (distanceToNeighbor < this.distances[neighborVertex]) {
                    this.distances[neighborVertex] = distanceToNeighbor;
                    predecessors[neighborVertex] = currentVertex;
                    priorityQueue.enqueue(neighborVertex, distanceToNeighbor);
                }
            }
        }

        // Build the path from the ending node to the starting node
        const path = this.buildPath(predecessors, endingNode);

        // Return an object containing the shortest distance and the path
        return {
            distance: this.distances[endingNode],
            path: path.reverse() // Reverse the path to get it from starting to ending node
        };
    }

    buildPath(predecessors, node) {
        const path = [];
        while (node !== null) {
            path.push(node);
            node = predecessors[node];
        }
        return path;
    }

    // dfs(v)
}

window.addEventListener("resize", function () {
    windowResize();
});

function windowResize(){
    LINE_HOLDER.setAttribute("width", ""+ window.innerWidth);
    LINE_HOLDER.setAttribute("height", ""+ window.innerHeight);
}

var graph = new Graph();

document.addEventListener('DOMContentLoaded', function () {

        var currentElementTarget = null;

        document.addEventListener('mousedown', function (event) {
            // Get the coordinates of the click
            var x = event.clientX;
            var y = event.clientY;

            //Current target we are over.
            currentElementTarget = event.target;

            //If we aren't interacting with the UI.
            if (!isMouseOnControls) {
                //Or a node that already exists
                if(graph.isEventTargetInMap(currentElementTarget) == false){
                    
                        console.log("Placing new node")
                        //Create the new node physically
                        const newNode = document.createElement("div");
                        newNode.className = "circle";
                        newNode.style.width = NODE_WIDTH + "px";
                        newNode.style.height = NODE_HEIGHT + "px";
                        newNode.style.top = (y-NODE_HEIGHT/2) + "px";
                        newNode.style.left = (x-NODE_WIDTH/2) + "px";
                        newNode.innerHTML = "<p>" + ALPHABET[graph.currentLength()] + "</p>";
                        newNode.id = ALPHABET[graph.currentLength()];
                        document.body.appendChild(newNode);

                        //We want to add this new node to the graph
                        //Each is a TUPLE, where we have a reference to the DOM element and a letter associated with it.
                        graph.addVertex([newNode, ALPHABET[graph.currentLength()]]);
                        
                        //update our drop down with the correct list of nodes
                        updateDropDown();

                        //Setting hovering = true because if we create a node we are automatically inside it.
                        hovering = true;
                    
                } else {
                    //If we are clicking on a node.
                    node = graph.returnNodeFromLetter(currentElementTarget.id);
                    isMouseDown = true;
                }
            }
        });

        document.addEventListener('mouseup', function (event) {
            //Current Element we are hovering over
            currentElementTarget = event.target;

            if(isMouseDown == true && shiftPressed != true) {
                //If the target we are on is part of our node list
                if (graph.isEventTargetInMap(currentElementTarget)) {
                    //Remove the line
                    linePlaceHolderReset();

                    //Current reference to node in graph.
                    endingNode = graph.returnNodeFromLetter(currentElementTarget.id);

                    //We want to make sure the line is fully straight each time.
                    startingNodeX = parseInt(currentNewLine.startingNode[0].style.left.slice(0,-2)) + NODE_WIDTH/2;
                    startingNodeY = parseInt(currentNewLine.startingNode[0].style.top.slice(0,-2)) + NODE_WIDTH/2;
                    endingNodeX = parseInt(endingNode[0].style.left.slice(0,-2)) + NODE_WIDTH/2;
                    endingNodeY = parseInt(endingNode[0].style.top.slice(0,-2)) + NODE_WIDTH/2;

                    //Physically create the line element on the screen and add it to our list of connections.
                    var constantOffset = 5;
                    var newNodeLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
                    newNodeLine.setAttribute("stroke", "#3e37a1");
                    newNodeLine.setAttribute("stroke-width", "10");
                    newNodeLine.setAttribute("x1", startingNodeX + constantOffset);
                    newNodeLine.setAttribute("x2", endingNodeX + constantOffset);
                    newNodeLine.setAttribute("y1", startingNodeY + constantOffset);
                    newNodeLine.setAttribute("y2", endingNodeY + constantOffset);

                    //append it to the DOM.
                    LINE_HOLDER.appendChild(newNodeLine);

                    //Add it to our model graph.
                    console.log("New connection: " + currentNewLine.startingNode[1] + " <-> " + endingNode[1])
                    graph.addEdge(currentNewLine.startingNode, endingNode, newNodeLine);
                } else {
                    //Delete the line placeholder, we don't want you silly.
                    linePlaceHolderReset();

                    //If we aren't over another node, hovering should be equal to false now.
                    //This is a sorta redundant check but I wanna do it anyways.
                    if (!graph.isEventTargetInMap(currentElementTarget)) {
                        hovering = false
                    }
                }
            }

            //Set isMouseDown to false
            isMouseDown = false; 
        });

        document.addEventListener('mousemove', function (event) {
            var x = event.clientX;
            var y = event.clientY;
            
            // currentElementTarget = event.target;

            handleNodeAction()

            //Here is is the dragging functionality
            if(isMouseDown){

                //For moving the nodes around!
                if(shiftPressed){

                    //Move node
                    node = graph.returnNodeFromLetter(currentElementTarget.id);

                    requestAnimationFrame(function () {
                        node[0].style.top = (y - NODE_HEIGHT / 2) + "px";
                        node[0].style.left = (x - NODE_WIDTH / 2) + "px";

                        //Move attached lines
                        for(connection of graph.getNodeConnections(node)){
                            var startOrEnd = connection[2];
                            var line = connection[1];
                            nodeX = parseInt(node[0].style.left.slice(0,-2)) + NODE_WIDTH/2;
                            nodeY = parseInt(node[0].style.top.slice(0,-2)) + NODE_WIDTH/2;

                            if(startOrEnd == LINE_START){
                                console.log("moving line")
                                // nodeX = parseInt(node[0].style.left.slice(0,-2)) + NODE_WIDTH/2;
                                // nodeY = parseInt(node[0].style.top.slice(0,-2)) + NODE_WIDTH/2;
                                line.setAttribute("x1", nodeX + "px");
                                line.setAttribute("y1", nodeY + "px");
                            } else {
                                // nodeX = parseInt(node[0].style.left.slice(0,-2)) + NODE_WIDTH/2;
                                // nodeY = parseInt(node[0].style.top.slice(0,-2)) + NODE_WIDTH/2;
                                line.setAttribute("x2", nodeX + "px");
                                line.setAttribute("y2", nodeY + "px");
                            }
                        }
                    });

                }

                //For connecting nodes!
                if(!shiftPressed){
                    if(node != undefined){
                        //If the target we are on is part of our node list
                        if (graph.isEventTargetInMap(currentElementTarget)) {
                            node = graph.returnNodeFromLetter(currentElementTarget.id);

                            currentNewLine.startingNode = node;
                            currentNewLine.x1 = "" + (parseInt(node[0].style.left.slice(0,-2)) + NODE_WIDTH/2);
                            currentNewLine.y1 = "" + (parseInt(node[0].style.top.slice(0,-2)) + NODE_HEIGHT/2);
                            currentNewLine.x2 = "" + x;
                            currentNewLine.y2 = "" + y;

                            linePlaceHolder.setAttribute("stroke", "#37345e");
                            linePlaceHolder.setAttribute("stroke-width", "10");
                            linePlaceHolder.setAttribute("x1", "" + (parseInt(node[0].style.left.slice(0,-2)) + NODE_WIDTH/2));
                            linePlaceHolder.setAttribute("x2", "" + x);
                            linePlaceHolder.setAttribute("y1", "" + (parseInt(node[0].style.top.slice(0,-2)) + NODE_HEIGHT/2));
                            linePlaceHolder.setAttribute("y2", "" + y);
                        }
                    }
                }
            }
        });

        document.addEventListener("keydown", function (event) {
            if(event.key == "Shift"){
                shiftPressed = true
                // console.log("Shift is pressed")
            }
        });

        document.addEventListener("keyup", function (event) {
            if(event.key == "Shift"){
                shiftPressed = false
                // console.log("Shift is released")
            }
        });
});

// Handle some node specific functionality
function handleNodeAction(){
    for([node, value] of graph.AdjList){
        var letter = node[1]
        var element = node[0]

        element.addEventListener('mouseout', function (event) {
            if(isMouseDown != true){
                hovering = false;
            }
        });

        element.addEventListener('mouseover', function (event) {
            hovering = true;
        });
    }
}

CONTROL_PANEL.addEventListener('mouseenter', function() {
    // The mouse is over the "controls" div or its children
    isMouseOnControls = true;
});

CONTROL_PANEL.addEventListener('mouseleave', function() {
    // The mouse left the "controls" div and its children
    isMouseOnControls = false;
});

function linePlaceHolderReset(){
    linePlaceHolder.setAttribute("stroke", "#37345e");
    linePlaceHolder.setAttribute("stroke-width", "0");
    linePlaceHolder.setAttribute("x1", "0");
    linePlaceHolder.setAttribute("x2", "0");
    linePlaceHolder.setAttribute("y1", "0");
    linePlaceHolder.setAttribute("y2", "0");
}

function clearGraph(){
    console.log("Clearing Board...")
    graph.clear();
}

function deleteNode(){
    graph.removeNodeFromLetter(NODE_SELECTOR.value);
    updateDropDown();
}

function printGraph(){
    graph.printGraph();
}

function updateDropDown(){
    NODE_SELECTOR.innerHTML = "";
    D_TWO_SELECTOR.innerHTML = "";
    D_ONE_SELECTOR.innerHTML = "";
    for (node of graph.currentList()){
        var opt = document.createElement('option');
        opt.value = node[1];
        opt.innerHTML = node[1];
        var two = document.createElement('option');
        two.value = node[1];
        two.innerHTML = node[1];
        var three = document.createElement('option');
        three.value = node[1];
        three.innerHTML = node[1];
        D_TWO_SELECTOR.appendChild(two);
        D_ONE_SELECTOR.appendChild(opt);
        NODE_SELECTOR.appendChild(three);
    }

}

function dijkstrasPath(){
    var letter = D_ONE_SELECTOR.value;
    var letter2 = D_TWO_SELECTOR.value;

    var shortestPath = graph.dijkstra(graph.returnNodeFromLetter(letter),graph.returnNodeFromLetter(letter2));
    console.log("The distance is: " + shortestPath.distance);
    console.log("Shortest path is: " + shortestPath.path);
    for(var element of shortestPath.path){
        var connections = graph.getNodeConnections(element);

        for(let i = 0; i < connections.length; i++){
            console.log(connections[i][0])
            
            if(shortestPath.path.includes(connections[i][0])){
                connections[i][1].setAttribute("stroke", "#ba4c4c");
                connections[i][1].style.zIndex = "999";
            }
            
        }

        element[0].style.borderColor = "#ba4c4c";
        element[0].style.color = "#ba4c4c";
    }

}
  
