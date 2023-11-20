// *** Global Constants ***
const NODE_WIDTH = 50;
const NODE_HEIGHT = 50;

const LINE_START = "START";
const LINE_END = "END";
const VERTEX_DOM = 0;
const VERTEX_LINE = 1;
const VERTEX_START_OR_END = 2;
const DEFAULT_LINE_WEIGHT = 1;

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const LINE_HOLDER = document.getElementById("lineHolder");
const CONTROL_PANEL = document.getElementById("controls");
const NODE_SELECTOR = document.getElementById("selector-one");
const D_ONE_SELECTOR = document.getElementById("selector-two");
const D_TWO_SELECTOR = document.getElementById("selector-three");

//This class is used for handling user interaction. 
//Basically just a struct that holds a bunch of data that I don't want to be global.
class UI {
    constructor(){
        this.isMouseDown = false;
        this.isMouseOnControls = false;
        this.shiftPressed = false;
        this.useWeighted = false;
        this.linePlaceHolder = document.createElementNS("http://www.w3.org/2000/svg", "line");
        LINE_HOLDER.appendChild(this.linePlaceHolder);

        //These are the coordinates for the new connect we are making at any given time and the node we start with.
        this.currentNewLine = {startingNode:null,x1:"0",x2:"0",y1:"0",y2:"0"}
    }
}

//Que Class is used for the searching algorithms -- Credit (mostly): GeeksForGeeks
class Queue {
    constructor() {
        this.items = {};
        this.frontIndex = 0;
        this.backIndex = 0;
    }

    //Enqueues and element in the list with a priority, returns a string for confirmation.
    enqueue(element, priority) {
        this.items[this.backIndex] = { element, priority };
        this.backIndex++;
        return element + ' inserted';
    }

    //Dequeues an element, returns the element dequeued or null.
    dequeue() {
        let minPriority = Infinity;
        let minIndex = -1;

        for (let i = this.frontIndex; i < this.backIndex; i++) {
            try{
                if (this.items[i].priority < minPriority) {
                    minPriority = this.items[i].priority;
                    minIndex = i;
                }
            } catch {
                console.log("HERE -> " + this.items[i])
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

    //Used to determine if the queue is empty 
    isEmpty() {
        return this.frontIndex === this.backIndex;
    }
}

// GRAPH CLASS
class Graph {

    //Define a record of node distances (used for weighted traversal)
    distances = {};

    // defining vertex array and
    // adjacent list
    constructor(noOfVertices = 0)
    {
        this.noOfVertices = noOfVertices;
        this.AdjList = new Map();
    }
 
    // add vertex to the graph
    addVertex(node)
    {
        // initialize the adjacent list
        this.AdjList.set(node, []);
    }

    // add edge to the graph
    addEdge(node, node_two, line)
    {
        //We add the connection one way
        this.AdjList.get(node).push([node_two, line, LINE_START]);
        
        //Since the its undirected we add it in the opposite way as well.
        this.AdjList.get(node_two).push([node, line, LINE_END]);
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

    //Returns the list of connects associated with a specific node
    getNodeConnections(vertex){
        var getValues = this.AdjList.get(vertex);    
        var lineElements = [];

        for (var j of getValues)
            lineElements.push(j);
        
        return lineElements;
    }

    //Returns the html Line element that connects two nodes.
    getNodeSpecificConnection(nodeOne, nodeTwo){
        var nodeOneConnections = this.AdjList.get(nodeOne);

        console.log("Current number of connections: " + nodeOneConnections.length);
    
        for (let i = 0; i < nodeOneConnections.length; i++) {
            console.log(nodeTwo[0], " == ", nodeOneConnections[i][0])
            if(nodeOneConnections[i][0] == nodeTwo[0]){
                var currentLine = nodeOneConnections[i][1];
                return currentLine;
            }
        }
    }

    //Return a node from a given letter, for example 'A'
    returnNodeFromLetter(letter){
        var get_keys = this.AdjList.keys();
        for (var i of get_keys) {
            if(i[1] == letter){
                return i;
            }
        }
    }

    //Used to determine if a dom element is a node.
    isEventTargetInMap(eventTarget){
        var get_keys = this.AdjList.keys();
        for (var i of get_keys) {
            if(eventTarget == i[0]){
                return true;
            }
        }
        return false;
    }


    //Removes a node, all you need is the letter
    //it also removes the corresponding item from the gui and all of its connections
    removeNodeFromLetter(letter){
        this.removeNode(this.returnNodeFromLetter(letter))
    }


    //clear essentially deletes the entire graph
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

    dijkstra(startingNode, endingNode) {
        // Set initial distances to some really high value for all nodes
        const predecessors = {};
        for (const key of this.AdjList.keys()) {
            this.distances[key] = 999999;
            predecessors[key] = null;
        }

        // Set the distance to the starting node to 0
        this.distances[startingNode] = 0;

        // Create a priority queue
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

                var distanceToNeighbor = currentDistance;

                // Here we make the check, are we doing a weighted or unweighted calculation?
                if(!userInterface.useWeighted){
                    distanceToNeighbor += DEFAULT_LINE_WEIGHT;
                } else {
                    var thisLine = this.getNodeSpecificConnection(currentVertex, neighbor);
                    var thisLinePos = [parseInt(thisLine.getAttribute("x1")), parseInt(thisLine.getAttribute("x2")), parseInt(thisLine.getAttribute("y1")),parseInt(thisLine.getAttribute("y2"))];
                    distanceToNeighbor += Math.floor(this.calculateLineLength(thisLinePos[0], thisLinePos[2], thisLinePos[1], thisLinePos[3]));
                }

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

    //Helper method, used to determine the distance between two (x,y) coordinates
    calculateLineLength(x1, y1, x2, y2) {
        var distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        return distance;
    }

    //Helper method, used to generate the path created in graph.dijkstra()
    buildPath(predecessors, node) {
        const path = [];
        while (node !== null) {
            path.push(node);
            node = predecessors[node];
        }
        return path;
    }

    // ** GETTERS **

    getCurrentLength(){
        return this.AdjList.size;
    }

    getCurrentList(){
        return this.AdjList.keys();
    }
}

//This is the global instance of our graph.
var userInterface = new UI();
var graph = new Graph();

// ****** EVENT LISTENERS ******

//Window resize event
window.addEventListener("resize", function () {
    windowResize();
});

//These events deal with user input
document.addEventListener('DOMContentLoaded', function () {

        var currentElementTarget = null;

        document.addEventListener('mousedown', function (event) {
            // Get the coordinates of the click
            var x = event.clientX;
            var y = event.clientY;

            //Current target we are over.
            currentElementTarget = event.target;

            //If we aren't interacting with the UI. 
            if (!userInterface.isMouseOnControls) {
                //Or a node that already exists. We also cant create more nodes than letters in the alphabet.
                if(graph.isEventTargetInMap(currentElementTarget) == false && graph.getCurrentLength() < ALPHABET.length){
                    console.log("Placing new node")

                    //Remove and previously defined paths.
                    resetHighlighting();
                    
                    //Create the new node physically
                    const newNode = document.createElement("div");
                    newNode.className = "circle";
                    newNode.style.width = NODE_WIDTH + "px";
                    newNode.style.height = NODE_HEIGHT + "px";
                    newNode.style.top = (y-NODE_HEIGHT/2) + "px";
                    newNode.style.left = (x-NODE_WIDTH/2) + "px";
                    newNode.innerHTML = "<p>" + ALPHABET[graph.getCurrentLength()] + "</p>";
                    newNode.id = ALPHABET[graph.getCurrentLength()];
                    document.body.appendChild(newNode);

                    //We want to add this new node to the graph
                    //Each is a, where we have a reference to the DOM element and a letter associated with it.
                    graph.addVertex([newNode, ALPHABET[graph.getCurrentLength()]]);
                    
                    //update our drop down with the correct list of nodes
                    updateDropDown();
                } else {
                    //If we are clicking on a node.
                    node = graph.returnNodeFromLetter(currentElementTarget.id);
                    userInterface.isMouseDown = true;
                }
            }
        });

        document.addEventListener('mouseup', function (event) {
            //Current Element we are over at this moment.
            currentElementTarget = event.target;

            if(userInterface.isMouseDown == true && userInterface.shiftPressed != true) {
                //If the target we are on is part of our node list
                if (graph.isEventTargetInMap(currentElementTarget)) {
                    //Remove the placeholder line
                    linePlaceHolderReset();

                    //Current reference to node in graph. The other is currentNewLine.startingNode
                    endingNode = graph.returnNodeFromLetter(currentElementTarget.id);

                    //We want to make sure the line is fully straight each time.
                    startingNodeX = parseInt(userInterface.currentNewLine.startingNode[0].style.left.slice(0,-2)) + NODE_WIDTH/2;
                    startingNodeY = parseInt(userInterface.currentNewLine.startingNode[0].style.top.slice(0,-2)) + NODE_WIDTH/2;
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
                    console.log("New connection: " + userInterface.currentNewLine.startingNode[1] + " <-> " + endingNode[1])

                    //Finally, we add it to our model.
                    graph.addEdge(userInterface.currentNewLine.startingNode, endingNode, newNodeLine);
                } else {
                    //Delete the line placeholder, we don't want you silly.
                    linePlaceHolderReset();
                }
            }

            //Set isMouseDown to false
            userInterface.isMouseDown = false; 
        });

        document.addEventListener('mousemove', function (event) {
            //We keep track of where the mouse is.
            var x = event.clientX;
            var y = event.clientY;

            //Here is is the dragging functionality
            if(userInterface.isMouseDown){

                //For moving the nodes around!
                if(userInterface.shiftPressed){
                    resetHighlighting();

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
                                line.setAttribute("x1", nodeX + "px");
                                line.setAttribute("y1", nodeY + "px");
                            } else {
                                line.setAttribute("x2", nodeX + "px");
                                line.setAttribute("y2", nodeY + "px");
                            }
                        }
                    });

                }

                //For connecting nodes!
                if(!userInterface.shiftPressed){
                    if(node != undefined){
                        //If the target we are on is part of our node list
                        if (graph.isEventTargetInMap(currentElementTarget)) {
                            node = graph.returnNodeFromLetter(currentElementTarget.id);

                            userInterface.currentNewLine.startingNode = node;
                            userInterface.currentNewLine.x1 = "" + (parseInt(node[0].style.left.slice(0,-2)) + NODE_WIDTH/2);
                            userInterface.currentNewLine.y1 = "" + (parseInt(node[0].style.top.slice(0,-2)) + NODE_HEIGHT/2);
                            userInterface.currentNewLine.x2 = "" + x;
                            userInterface.currentNewLine.y2 = "" + y;

                            userInterface.linePlaceHolder.setAttribute("stroke", "#37345e");
                            userInterface.linePlaceHolder.setAttribute("stroke-width", "10");
                            userInterface.linePlaceHolder.setAttribute("x1", "" + (parseInt(node[0].style.left.slice(0,-2)) + NODE_WIDTH/2));
                            userInterface.linePlaceHolder.setAttribute("x2", "" + x);
                            userInterface.linePlaceHolder.setAttribute("y1", "" + (parseInt(node[0].style.top.slice(0,-2)) + NODE_HEIGHT/2));
                            userInterface.linePlaceHolder.setAttribute("y2", "" + y);
                        }
                    }
                }
            }
        });

        document.addEventListener("keydown", function (event) {
            if(event.key == "Shift"){
                userInterface.shiftPressed = true
                // console.log("Shift is pressed")
            }
        });

        document.addEventListener("keyup", function (event) {
            if(event.key == "Shift"){
                userInterface.shiftPressed = false
                // console.log("Shift is released")
            }
        });
});

CONTROL_PANEL.addEventListener('mouseenter', function() {
    // The mouse is over the "controls" div or its children
    userInterface.isMouseOnControls = true;
});

CONTROL_PANEL.addEventListener('mouseleave', function() {
    // The mouse left the "controls" div and its children
    userInterface.isMouseOnControls = false;
});

// ******** Front End Functionality ***********

//Called on window resize
function windowResize(){
    LINE_HOLDER.setAttribute("width", ""+ window.innerWidth);
    LINE_HOLDER.setAttribute("height", ""+ window.innerHeight);
}

//Used to delete the place-holder line.
function linePlaceHolderReset(){
    userInterface.linePlaceHolder.setAttribute("stroke", "#37345e");
    userInterface.linePlaceHolder.setAttribute("stroke-width", "0");
    userInterface.linePlaceHolder.setAttribute("x1", "0");
    userInterface.linePlaceHolder.setAttribute("x2", "0");
    userInterface.linePlaceHolder.setAttribute("y1", "0");
    userInterface.linePlaceHolder.setAttribute("y2", "0");
}

//Clears the current graph
function clearGraph(){
    console.log("Clearing Board...")
    graph.clear();
}

//Deletes a specific node
function deleteNode(){
    resetHighlighting();
    graph.removeNodeFromLetter(NODE_SELECTOR.value);
    updateDropDown();
}

//Prints the graph the console.
function printGraph(){
    graph.printGraph();
}

//Updates drop down options once new nodes are added or removed.
function updateDropDown(){
    NODE_SELECTOR.innerHTML = "";
    D_TWO_SELECTOR.innerHTML = "";
    D_ONE_SELECTOR.innerHTML = "";
    for (node of graph.getCurrentList()){
        D_TWO_SELECTOR.appendChild(createDropDownOption(node));
        D_ONE_SELECTOR.appendChild(createDropDownOption(node));
        NODE_SELECTOR.appendChild(createDropDownOption(node));
    }
}

//Helper function used to efficiently create new dropdown elements in the dom.
function createDropDownOption(node){
    var newOption = document.createElement('option');
    newOption.value = node[1];
    newOption.innerHTML = node[1];
    return newOption;
}

//Handles front end for dijkstra algorithm.
function dijkstrasPath(){
    resetHighlighting();
    var letter = D_ONE_SELECTOR.value;
    var letter2 = D_TWO_SELECTOR.value;

    var shortestPath = graph.dijkstra(graph.returnNodeFromLetter(letter),graph.returnNodeFromLetter(letter2));
    // console.log("The distance is: " + shortestPath.distance);
    // console.log("Shortest path is: " + shortestPath.path);
    for(var element of shortestPath.path){
        var connections = graph.getNodeConnections(element);

        for(let i = 0; i < connections.length; i++){
            
            if(shortestPath.path.includes(connections[i][0])){
                connections[i][1].setAttribute("stroke", "#ba4c4c");
                connections[i][1].style.zIndex = "999";
            }
            
        }

        element[0].style.borderColor = "#ba4c4c";
        element[0].style.color = "#ba4c4c";
    }
}

//Resets all the highlighting after a path is found.
function resetHighlighting(){
    var currentNodes = graph.getCurrentList();
    for(var node of currentNodes){
        node[0].style.borderColor = "#3e37a1";
        node[0].style.color = "#3e37a1";
        for(var connection of graph.getNodeConnections(node)){
            connection[1].setAttribute("stroke", "#3e37a1");
        }
    }
}

//Handles determination for wether line weight should be taken into account.
function handleCheckBox() {
    // Get the checkbox
    var checkBox = document.getElementById("weighted");
  
    // If the checkbox is checked, display the output text
    if (checkBox.checked == true){
        userInterface.useWeighted = true;
    } else {
        userInterface.useWeighted = false;
    }
}
