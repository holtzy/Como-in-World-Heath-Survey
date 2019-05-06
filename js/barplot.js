// ------------------- //
// Initialize symmetrical barplot
// ------------------- //

// set the dimensions and margins of the graph
var margin = {top: 80, right: 0, bottom: 90, left: 0},
  propMiddle = 0.27,  // proportion of the width for the text in the middle
  width = 800 - margin.left - margin.right,
  height = 740 - margin.top - margin.bottom,
  lengthMiddle = width * propMiddle

// append the svg object to the body of the page
var svg_barplot = d3.select("#dataviz_barplot")
.append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
.append("g")
  .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");






// ------------------- //
// AXIS AND SCALES
// ------------------- //

// Initialize the first X axis (Left)
var x1 = d3.scaleLinear()
    .range([0, width/2 - lengthMiddle/2])
var x1Axis = svg_barplot.append("g")
    .attr("transform", "translate(0," + height + ")")

// Initialize the second X axis (Right)
var x2 = d3.scaleLinear()
    .range([width/2 + lengthMiddle/2, width ])
var x2Axis = svg_barplot.append("g")
    .attr("transform", "translate(0," + height + ")")

// Add axis labels
x1Axis
  .append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("fill", "#000")
    .attr("text-anchor", "start")
    //.attr("font-weight", "bold")
    .text("Hazard ratio");
x2Axis
  .append("text")
    .attr("x", width)
    .attr("y", 40)
    .attr("fill", "#000")
    .attr("text-anchor", "end")
    //.attr("font-weight", "bold")
    .text("Hazard ratio");







// ------------------- //
// DATA
// ------------------- //

// Reorder data
var data = dataBarplot.sort(function(a,b) { return d3.ascending(myGroup(a.Prior_disorder) , myGroup(b.Prior_disorder)) ||  d3.ascending(myGroup(a.Later_disorder) , myGroup(b.Later_disorder))})

// Labels of row and columns -> unique identifier of the column called 'group' and 'variable'
var myPrior = d3.map(data, function(d){return d.Prior_disorder;}).keys()
var myLater = d3.map(data, function(d){return d.Later_disorder;}).keys()

// //Create the dropdown button with all possibilities
// var select = d3.select("#dropdown")
//     .append('select')
//     .attr('id','dropdown-disorder')
//     .selectAll('option')
// 	  .data(myPrior).enter()
// 	  .append('option')
//     .text(function (d) { return d; })
//     .attr("value", function (d) { return d; });







// ------------------- //
// Create Symmetrical Barplot
// ------------------- //

// Set range and domain for Y axis
var y = d3.scaleBand()
    .domain(myPrior)
    .range([height, 0])
    .padding([0.13])

// Draw disorder names in the middle
var myText = svg_barplot.selectAll(".textMiddle")
  .data(myPrior)
  .enter()
  .append("text")
    .attr("x", width/2)
    .attr("y", function(d) { return( y(d)+y.bandwidth()/2 ) })
    .text(function(d){ return d })
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .attr("dominant-baseline", "central")
    .on("click", function(d,i){ update(d) } )
    .on("mouseover", function(d) {d3.select(this).style("cursor", "pointer")})

// Add the explanation in grey
var myExplanationLeft = svg_barplot
  .append("text")
    .attr("x", width/2 - lengthMiddle/2 )
    .attr("y", -10)
    .text( "As a prior disorder" )
    .style("font-size", "12px")
    .attr("text-anchor", "end")
    .style("fill", "grey")
    .style("font-style", "italic")
var myExplanationLeft = svg_barplot
  .append("text")
    .attr("x", width/2 + lengthMiddle/2 )
    .attr("y", -10)
    .text( "As a later disorder" )
    .style("font-size", "12px")
    .attr("text-anchor", "start")
    .style("fill", "grey")
    .style("font-style", "italic");

// Add the explanation in grey
svg_barplot
  .append("text")
    .attr("x", width/2 )
    .attr("y", height + 50)
    .text( "Click any of the disorder name" )
    .style("font-size", "12px")
    .attr("text-anchor", "middle")
    .style("fill", "#B8B8B8")
svg_barplot
  .append("text")
    .attr("x", width/2 )
    .attr("y", height + 50 + 20)
    .text( "above to study it in detail." )
    .style("font-size", "12px")
    .attr("text-anchor", "middle")
    .style("fill", "#B8B8B8")

// Add the title
var myTitle = svg_barplot
  .append("text")
    .attr("x", width/2)
    .attr("y", -50)
    .style("font-size", "22px")
    .attr("text-anchor", "middle")






// ------------------- //
// INTERACTIVITY
// ------------------- //

// A function that create / update the plot for a given variable:
function update(variable) {

  // get the data
  var don1 = data.filter(function(d){return d.Prior_disorder == variable;})
  var don2 = data.filter(function(d){return d.Later_disorder == variable;})

  // biggest HR?
  var a = d3.max(don1, function(d) { return +d.HR; })
  var b = d3.max(don2, function(d) { return +d.HR; })
  var HRmax = Math.max(a,b)

  // Update color of the text in the middle
  myText
    .transition()
    .duration(1000)
    .style("fill", function(d){ if(d==variable){ return "grey" } else { return myColor(myGroup(d)) } })
    .style("opacity", function(d){ if(d==variable){ return 0.1 } else { return 1 } })

  // Update title
  myTitle
    .transition()
    .duration(1000)
    .text(variable)

  // Update x1 axis
  x1.domain([HRmax, 0])
  x1Axis.transition().duration(1000).call(d3.axisBottom(x1).ticks(5))

  // Update x2 axis
  x2.domain([0, HRmax])
  x2Axis.transition().duration(1000).call(d3.axisBottom(x2).ticks(5))

  // Add bars graph left
  var u1 = svg_barplot.selectAll(".barleft")
    .data(don1)

  u1.enter()
    .append("rect")
    .attr("class", "barleft")
    .merge(u1)
    // Go to 0
    .transition()
    .duration(1000)
      .attr("x", function(d) { return x1(0) } )
      .attr("width", function(d) { return  0} )
      .attr("height", y.bandwidth())
      .attr("rx", 2)
      .attr("opacity", 0.7)
      .style("fill", function(d){ return myColor(myGroup(d.Later_disorder)) })
    // Go to right Y position
    .transition()
    .duration(0)
      .attr("y", function(d) { return y(d.Later_disorder); })
    // Go to new  X position
    .transition()
    .duration(1000)
      .attr("x", function(d) { return x1(d.HR) } )
      .attr("width", function(d) { return  x1(0) - x1(d.HR)  })

  u1.exit()
    .remove()

  //Add bars graph right
  var u2 = svg_barplot.selectAll(".barright")
    .data(don2)

  u2.enter()
    .append("rect")
    .attr("class", "barright")
    .merge(u2)
    .transition()
    .duration(1000)
      .attr("x", function(d) { return x2(0) } )
      .attr("width", function(d) { return  0 })
      .attr("height", y.bandwidth())
      .attr("rx", 2)
      .attr("opacity", 0.7)
      .style("fill", function(d){ return myColor(myGroup(d.Prior_disorder)) })
    // Go to right Y position
    .transition()
    .duration(0)
      .attr("y", function(d) { return y(d.Prior_disorder); })
    .transition()
    .duration(1000)
      .attr("width", function(d) { return  x2(d.HR)-x2(0)  })

  u2.exit()
    .remove()

}

// Initialize with Alcohol abuse
update("Alcohol dependence")

// If user clicks on the show nicotine button
d3.select("#linkShowNicotine")
  .on("click", function(){ update("Nicotine dependence") } )


// Add a listener to the button for selection and run the update function if needed
d3.select("#dropdown-disorder")
  .on("change",function(d){
    var selected = d3.select("#dropdown-disorder").node().value;
    update(selected)
})
