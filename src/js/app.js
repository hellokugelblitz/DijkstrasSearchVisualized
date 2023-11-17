NODE_WIDTH = 50;
NODE_HEIGHT = 50;
ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
LINE_HOLDER = document.getElementById("lineHolder");
var hovering = false;
var isMouseDown = false;
var currentSelectedDom = null;
var shiftPressed = false;

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

    //Returns letter and DOM element from just letter
    returnNodeFromLetter(letter){
        var get_keys = this.AdjList.keys();
    
        for (var i of get_keys) {
            if(i[1] == letter){
                return i;
            }
        }
    }
 
    // bfs(v)

    // dfs(v)
}

var graph = new Graph();

document.addEventListener('DOMContentLoaded', function () {

    var currentElementTarget = null;

        document.addEventListener('mousedown', function (event) {
            // Get the coordinates of the click
            var x = event.clientX;
            var y = event.clientY;

            if(hovering == false){
                //Create the DOM element
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

                //Print x and y of new node.
                console.log(x,y); 
                
                //Setting hovering = true because if we create a node we are automatically inside it.
                hovering = true;

            } else {
                //If we are clicking on a 
                currentElementTarget = event.target;
                node = graph.returnNodeFromLetter(currentElementTarget.id);
                isMouseDown = true;
            }
        });

        document.addEventListener('mouseup', function (event) {
            isMouseDown = false;
        });

        document.addEventListener('mousemove', function (event) {
            var x = event.clientX;
            var y = event.clientY;
            
            handleNodeAction()


            if(isMouseDown){
                if(shiftPressed){
                    requestAnimationFrame(function () {
                        node = graph.returnNodeFromLetter(currentElementTarget.id);
                        node[0].style.top = (y - NODE_HEIGHT / 2) + "px";
                        node[0].style.left = (x - NODE_WIDTH / 2) + "px";
                    });
                }
            }
        });

        document.addEventListener("keydown", function (event) {
            if(event.key == "Shift"){
                shiftPressed = true
                console.log("Shift is pressed")
            }
        });

        document.addEventListener("keyup", function (event) {
            if(event.key == "Shift"){
                shiftPressed = false
                console.log("Shift is released")
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
                console.log("setting hovering = false")
                hovering = false;
            }
        });

        element.addEventListener('mouseover', function (event) {
            console.log("setting hovering = true")
            hovering = true;
        });

        // function onNodeDown(){

        //     element.style.top = (y-NODE_HEIGHT/2) + "px";
        //     element.style.left = (x-NODE_WIDTH/2) + "px";
        // }

        // element.onmouseover = onNodeHover;
        // element.onmouseleave = onNodeOut;
        // element.onmouseout = onNodeOut;
    
        // element.on("mousedown", function(event){
        //     isDown = true;
            
        //     var pOffset = svg.offset();
        //     startX = event.clientX - pOffset.left,
        //     startY = event.clientY - pOffset.top;
          
        // })
        
        // element.on("mouseup", function(){
        //       isDown = false;
        // })
        
        // svg.on("mousemove", function(event){
        //   if(isDown){
          
        //    var pOffset = svg.offset(),
        //             px = event.clientX - pOffset.left,
        //             py = event.clientY - pOffset.top;
          
        //       line.attr("x1",startX)
        //     line.attr("x2",px)
        //     line.attr("y1",startY)
        //     line.attr("y2",py)
        //   }
        // })
    }
}



    // handleNodeAction()


