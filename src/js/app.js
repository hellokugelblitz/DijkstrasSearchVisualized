NODE_WIDTH = 50;
NODE_HEIGHT = 50;
ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

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
    addVertex(v)
    {
        // initialize the adjacent list with a
        // null array
        this.AdjList.set(v, []);
    }

    // add edge to the graph
    addEdge(v, w)
    {
        // get the list for vertex v and put the
        // vertex w denoting edge between v and w
        this.AdjList.get(v).push(w);
    
        // Since graph is undirected,
        // add an edge from w to v also
        this.AdjList.get(w).push(v);
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
                conc += j + " ";
    
            // print the vertex and its adjacency list
            console.log(i + " -> " + conc);
        }
    }

    //Returns current number of nodes in the graph
    currentLength(){
        return this.AdjList.size;
    }
 
    // bfs(v)

    // dfs(v)
}

var graph = new Graph();

document.addEventListener('DOMContentLoaded', function () {
    document.addEventListener('click', function (event) {
        // Get the coordinates of the click
        var x = event.clientX;
        var y = event.clientY;

        //Create the DOM element
        const newNode = document.createElement("div");
        newNode.className = "circle";
        newNode.style.width = NODE_WIDTH + "px";
        newNode.style.height = NODE_HEIGHT + "px";
        newNode.style.top = (y-NODE_HEIGHT/2) + "px";
        newNode.style.left = (x-NODE_WIDTH/2) + "px";
        newNode.innerHTML = "<p>" + ALPHABET[graph.currentLength()] + "</p>";
        document.body.appendChild(newNode);

        //We want to add this new node to the graph
        //Each is a TUPLE, where we have a reference to the DOM element and a letter associated with it.
        graph.addVertex((newNode, ALPHABET[graph.currentLength()]));

        //Defining newNode Behaviors
        newNode.onmouseover = onNodeHover;
        newNode.onmouseout = onNodeHover;

        //Print x and y of new node.
        console.log(x,y); 
        graph.printGraph();
    });
});


// Node Based functions

function onNodeIn(){

}

function onNodeHover(){
    // newNode.style.width = NODE_WIDTH + "px";
    // newNode.style.height = NODE_HEIGHT + "px";
    console.log("hovering")
}

function onNodeOut(){

}