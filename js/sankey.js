
// Append the button to select prior disorder
var selectPrior = d3.select("#dataviz_sankey")
  .append('select')
  .attr("class", "groupChoice")
var optionsPrior = selectPrior
   .selectAll('optionPrior')
 	 .data(allGroup)
   .enter()
	 .append('option')
      .text(function (d) { return d; })
      .attr("value", function (d) { return d; })

// set the dimensions and margins of the graph
var margin = {top: 60, right: 200, bottom: 150, left: 200},
    width = 850 - margin.left - margin.right,
    height = 1080 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#dataviz_sankey").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style("overflow", "visible")
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");





// ------------------------------------------------------------------------ //
// STEP 1: A FUNCTION THAT PREPARES DATA : FILTERING + SANKEY FORMAT
// ------------------------------------------------------------------------ //
function prepareData(data){

  // Recover the selected group
  var selectValue = selectPrior.property("value")

  // Filter: input is a specific group
  var data = data.filter(function(d){ return myGroup(d.Prior_disorder) == selectValue  })

  // Sort data: group by group
  var data = data.sort(function(a,b) { return d3.ascending(myGroup(a.Prior_disorder) , myGroup(b.Prior_disorder)) ||  d3.ascending(myGroup(a.Later_disorder) , myGroup(b.Later_disorder))})

  //set up a data structure in same style as original example but empty
  graph = {"nodes" : [], "links" : []};

  // Fill it reading csv lines one by one:
  data
  .forEach(function (d) {
    graph.nodes.push({ "name": d.Prior_disorder });
    graph.nodes.push({ "name": d.Later_disorder });
    graph.links.push({ "source": d.Prior_disorder,
                       "target": d.Later_disorder,
                       "value": +d.HR });
   });
  console.log(data)
  
  // return only the distinct / unique nodes
  graph.nodes = d3.keys(d3.nest()
    .key(function (d) { return d.name; })
    .object(graph.nodes));

  // loop through each link replacing the text with its index from node
  graph.links.forEach(function (d, i) {
     graph.links[i].source = graph.nodes.indexOf(graph.links[i].source);
     graph.links[i].target = graph.nodes.indexOf(graph.links[i].target);
  });

  // now loop through each nodes to make nodes an array of objects
  // rather than an array of strings
  graph.nodes.forEach(function (d, i) {
    graph.nodes[i] = { "name": d };
  });

  // Return the graph object
  return graph

}





// --------------------------- //
// STEP 2: A FUNCTION THAT BUILD THE SANKEY DIAGRAM
// --------------------------- //

function createChart(graph){

  // Start by removing previous chart? --> Would be better with a transition, but can't figure out how to do it.
  svg.selectAll("rect").remove()
  svg.selectAll("path").remove()
  svg.selectAll("text").remove()

  // Explain HR = 1
  svg
    .append("text")
      .attr("class", "textExplanation")
      .attr("text-anchor", "middle")
      .style("fill", "#B8B8B8")
      .attr("x", width/2)
      .attr("y", height + 40)
      .attr("width", 90)
      .html("Click on a disorder to highlight")
  svg
    .append("text")
      .attr("class", "textExplanation")
      .attr("text-anchor", "middle")
      .style("fill", "#B8B8B8")
      .attr("x", width/2)
      .attr("y", height + 40 + 20)
      .attr("width", 90)
      .html("it. Hover connection to get exact")
  svg
    .append("text")
      .attr("class", "textExplanation")
      .attr("text-anchor", "middle")
      .style("fill", "#B8B8B8")
      .attr("x", width/2)
      .attr("y", height + 40 + 20*2)
      .attr("width", 90)
      .html("values.")

  // Initialize the sankey diagram
  var sankey = d3.sankey()
      .nodeWidth(10)
      .nodePadding(4)
      .size([width, height])
      .nodes(graph.nodes)
      .links(graph.links)
      .layout(0) // Number of iteration to decide node position. If 0 -> keep initial order

  // add in the links
  var link = svg.append("g").selectAll(".link")
      .data(graph.links)
    .enter()
    .append("path")
      .attr("class", "link")
      .attr("d", sankey.link() )
      .style("stroke-width", function(d) { return Math.max(1, d.dy); })
      .sort(function(a, b) { return b.dy - a.dy; })

  // Tooltip of links
  link.append("title")
        .text(function(d) { return "Prior disorder: " + d.source.name + "\n" + "Later disorder: " + d.target.name + "\n" + "Hazard Ratio: " + d.value });

  // add in the nodes
  var node = svg.append("g").selectAll(".node")
      .data(graph.nodes)
    .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })

  // add the rectangles for the nodes
  node.append("rect")
      .attr("height", function(d) { return d.dy; })
      .attr("width", sankey.nodeWidth())
      .style("fill", function(d) { return d.color = myColor(myGroup(d.name)) })
      .style("stroke", function(d) {return d3.rgb(d.color).darker(2); })
      .style("stroke-width", "0px")
      .on("click", highlightLinks)
      .on("mouseover", function(d) {d3.select(this).style("cursor", "pointer")})

  // add in the title for the nodes
  node.append("text")
      .attr("x", 20)
      .attr("y", function(d) { return d.dy / 2; })
      .attr("dy", ".35em")
      .attr("text-anchor", "start")
      .attr("transform", null)
      .text(function(d) { return d.name; })
      .on("click", highlightLinks)
      .on("mouseover", function(d) {d3.select(this).style("cursor", "pointer")})
    .filter(function(d) { return d.x < width / 2; })
      .attr("x", -20 + sankey.nodeWidth())
      .attr("text-anchor", "end")

  // A function that highlights the link of a group
  function highlightLinks(d) {
    link.style("stroke-opacity", function(l) {
        if (l.source.name == d.name || l.target.name == d.name) { return 0.6; } else {return 0.02} ;
    });
  }

// Close the createChart function
}




// ----------------------------------------------------------------------- //
// STEP 3: RUN THE FUNCTIONS
// ----------------------------------------------------------------------- //

// Initialize chart
graph = prepareData(dataSankey)
createChart(graph)

// Event listener to the button --> updateChart
selectPrior.on("change", function(){
  graph = prepareData(dataSankey)
  createChart(graph)
})