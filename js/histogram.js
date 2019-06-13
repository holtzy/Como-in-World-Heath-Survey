// ------------------------------------------------------------------------ //
// SVG AREA
// ------------------------------------------------------------------------ //

// What is the current div width? Deduce a proper height
let currentWidth = document.getElementById("dataviz_dotplot").offsetWidth

// set the dimensions and margins of the graph
var margin = {top: 0, right: 25, bottom: 50, left: 115},
  width = currentWidth - margin.left - margin.right,
  height = currentWidth*1 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg_dotplot = d3.select("#dataviz_dotplot")
.append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .style("overflow", "visible")
.append("g")
  .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");





// ------------------------------------------------------------------------ //
// AXIS AND SCXALE
// ------------------------------------------------------------------------ //

// compute X scale
var x = d3.scaleLinear()
    .range([0,width])
    .domain([0,60])

// Show X axis
var xAxis = svg_dotplot.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + (height+20) + ")")
    .call(d3.axisBottom(x).ticks(10, ".0s"));

// compute Y scale
var y = d3.scaleLinear()
    .range([height, 0])
    .domain([1,35]);

// Build color scale
var myColor = d3.scaleSequential()
  .interpolator(d3.interpolateInferno)
  .domain([0,50])


// ------------------------------------------------------------------------ //
// ANNOTATION
// ------------------------------------------------------------------------ //

// Add X axis title
xAxis.append("text")
  .attr("x", width)
  .attr("y", 40)
  .attr("fill", "#000")
  .attr("text-anchor", "end")
  .attr("font-size", "14px")
  .text("Hazard ratio");

// SHOW HR = 1
var verticalLine = svg_dotplot
  .append("line")
    .attr("y1", 0)
    .attr("y2", height)
    .attr("x1", x(1) )
    .attr("x2", x(1) )
    .style("stroke", "red")
    .style("stroke-width", 1.7)
    .style("opacity", 0.4)

// Explain HR = 1
svg_dotplot
  .append("text")
    .attr("class", "textExplanation")
    .attr("text-anchor", "end")
    .style("fill", "#B8B8B8")
    .attr("x", x(1)-9)
    .attr("y", 20)
    .attr("width", 90)
    .html("Without any comorbidity one would")
svg_dotplot
  .append("text")
    .attr("class", "textExplanation")
    .attr("text-anchor", "end")
    .style("fill", "#B8B8B8")
    .attr("x", x(1)-9)
    .attr("y", 20+20)
    .attr("width", 90)
    .html("expect a hazar ratio of 1, represented")
svg_dotplot
  .append("text")
    .attr("class", "textExplanation")
    .attr("text-anchor", "end")
    .style("fill", "#B8B8B8")
    .attr("x", x(1)-9)
    .attr("y", 20+20*2)
    .attr("width", 90)
    .html("by this verticla bar")




// ------------------------------------------------------------------------ //
// TOOLTIP CREATION
// ------------------------------------------------------------------------ //

// Create tooltip
var tooltip = d3.select("#dataviz_dotplot")
    .append("div")
    .style("display", "none")
    .style("opacity", 1)
    .style("font-size", "16px")
    .attr("class", "tooltip")

// Three function that change the tooltip when user hover / move / leave a cell
var mouseover = function(d) {
  tooltip
    .style("display", "block");
  tooltip
    .html("<span style='color:grey'>Prior disorder: </span>" + d.Prior_disorder + "<br>" + "<span style='color:grey'>Later disorder: </span>" + d.Later_disorder + "<br>" + "HR: " + d.HR + " [" + d.Lower + "-" + d.Upper + "]") // + d.Prior_disorder + "<br>" + "HR: " +  d.HR)
  }
var mousemove = function(d) {
  tooltip
    .style("left", (d3.mouse(this)[0]+70) + "px")
    .style("top", (d3.mouse(this)[1]-120) + "px")
}
var mouseleave = function(d) {
  tooltip
    .style("display", "none")
}




// ------------------------------------------------------------------------ //
// INITIALIZE CHART WITH DOTS AT Y=0
// ------------------------------------------------------------------------ //

var dots = svg_dotplot.selectAll(".circle")
  .data(dataHistogram)
  .enter()
    .append("circle")
      .attr("class", "circle")
      .attr("r", 4)
      .attr("cx", function(d) { return x(+d.HR_rounded); })
      .attr("cy", function(d) { return y(1) })
      .style("fill", function(d){ return myColor(d.HR)})
      .style("opacity", "0.9")
      .style("stroke", function(d){if(d.HR>80){return "black"}else{return "none"} } )
      .style("stroke-width", "3px")
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)

dots
  .transition()
  .duration(2000)
  .attr("cy", function(d) { return y(+d.y) })



// ------------------------------------------------------------------------ //
// A FUNCTION TO CHANGE X AXIS LIMITS
// ------------------------------------------------------------------------ //

// UPDATE FUNCTION
function update(myLim) {

  // Update the scale
  x.domain([0,myLim])
  xAxis
    .transition()
    .duration(2000)
    .call(d3.axisBottom(x).ticks(10, ".0s"));
  xAxis.select(".domain").remove()

  // Update vertical line
  verticalLine
    .transition()
    .duration(2000)
    .attr("x1", x(1))
    .attr("x2", x(1))

  // Update the circle
  dots
    .transition()
    .duration(2000)
      .attr("cx", function(d) { return x(+d.HR_rounded); })
}




// ------------------------------------------------------------------------ //
// LISTENER TO THE SHOW OUTLIER BUTTON
// ------------------------------------------------------------------------ //

// If reader clicks on 'show extreme' --> Change axis limit
var mode = "normal"
d3.select("#showExtreme")
  .on("click", function(){
    if( mode == "normal"){
      update(120)
      d3.selectAll(".textExplanation").transition().duration(1000).style("display", "none")
      d3.select("#showExtreme").text("back to normal")
      mode = "extreme"
    } else {
      mode = "normal"
      update(50)
      d3.selectAll(".textExplanation").transition().delay(1000).style("display", "block")
      d3.select("#showExtreme").text("Show them")
    }
  })
