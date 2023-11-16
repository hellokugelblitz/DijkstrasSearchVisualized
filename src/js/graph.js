// create a graph class
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
 
    // bfs(v)
    // dfs(v)
}