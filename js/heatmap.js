// ------------------------------------------------------------------------ //
// SVG AREA
// ------------------------------------------------------------------------ //

// Get div size
let currentWidth = document.getElementById("dataviz_heatmap").offsetWidth

// set the dimensions and margins of the graph
var margin = {top: 20, right: currentWidth*0.19, bottom: 180, left: currentWidth*0.19},
  width = currentWidth - margin.left - margin.right,
  height = currentWidth*0.75 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg_heatmap = d3.select("#dataviz_heatmap")
.append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
.append("g")
  .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");




// ------------------------------------------------------------------------ //
// AXIS AND SCALES
// ------------------------------------------------------------------------ //

// Build X scales and axis:
var x = d3.scaleBand()
  .range([ 0, width ])
  .domain(allDisorder)
  .padding(0.05);

// Build Y scales and axis:
var y = d3.scaleBand()
  .range([ height, 0 ])
  .domain(allDisorder)
  .padding(0.05);

// Build color scale
var myColor2 = d3.scaleSequential()
  .interpolator(d3.interpolateInferno)
  .domain([0,50])

// A scale to add padding between groups
var myPadding = d3.scaleOrdinal()
  .domain(allGroup)
  .range([0, 10, 20, 30]);
var myPaddingY = d3.scaleOrdinal()
  .domain(allGroup)
  .range([30, 20, 10, 0]);

// add the X Labels
var xLabels = svg_heatmap.selectAll("Xlabels")
  .data(allDisorder)
  .enter()
  .append("text")
    .text(function(d){ return (currentWidth < 800)? giveVeryShortName(d) : d})
    .attr("x", 0)
    .attr("y", 0)
    .style("font-size", 12)
    .style("text-anchor", "end")
    .style("fill", function(d){ return( myColor(myGroup(d)) ) })
    .attr("transform", function(d){ return( "translate(" + (x(d) + myPadding(myGroup(d)) + 18) + "," + (height+41) + ")rotate(-45)")})

// add the Y Labels
svg_heatmap.selectAll("Ylabels")
  .data(allDisorder)
  .enter()
  .append("text")
    .text(function(d){ return (currentWidth < 800)? giveVeryShortName(d) : d})
    .attr("x", -10 )
    .attr("y", function(d) { return (y(d) + myPaddingY(myGroup(d)) + 15) })
    .style("font-size", 12)
    .style("text-anchor", "end")
    .style("fill", function(d){ return( myColor(myGroup(d)) ) })




// ======================= //
// BUILD BUTTON
// ======================= //

// btn: Sex
d3.select("#btnHeatmapSex")
  .selectAll('myOptions')
  .data(['All', 'Male', 'Female'])
  .enter()
  .append('option')
  .text(function (d) { return d }) // text showed in the menu
  .attr("value", function (d) { return d; }) // corresponding value returned by the button

// btn: Model
d3.select("#btnHeatmapModel")
  .selectAll('myOptions')
  .data(['A', 'B'])
  .enter()
  .append('option')
  .text(function (d) { return d }) // text showed in the menu
  .attr("value", function (d) { return d; }) // corresponding value returned by the button


// ------------------------------------------------------------------------ //
// TOOLTIP
// ------------------------------------------------------------------------ //

// create a tooltip
var tooltip = d3.select("#dataviz_heatmap")
  .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("font-size", "16px")
    .style("display", "none")

// Three function that change the tooltip when user hover / move / leave a cell
var mouseover = function(d) {
  tooltip
    .transition()
    .duration(200)
    .style("opacity", 1)
    .style("display", "block")
  tooltip
      .html(
        "<span style='color:grey'>Prior disorder: </span>" + d.Prior_disorder +
        "<br>" +
        "<span style='color:grey'>Later disorder: </span>" + d.Later_disorder +
        "<br>" +
        "HR: " + d.HR + " [" + d.Lower + "-" + d.Upper + "]"
      )
}
var mousemove = function(d) {
  tooltip
    .style("left", (d3.mouse(this)[0]+150) + "px")
    .style("top", (d3.mouse(this)[1]+50) + "px")
}
var mouseleave = function(d) {
  tooltip
    .transition()
    .duration(200)
    .style("opacity", 0)
    .style("display", "none")

}






// ------------------------------------------------------------------------ //
// SHAPES
// ------------------------------------------------------------------------ //

// Initialize square:
data = dataHeatmap.filter(function(d){ return (
  d.Sex == "All" &&
  d.Model == "A"
)})
svg_heatmap
  .selectAll(".heatmapRect")
  .data(data)
  .enter()
  .append("rect")
    .attr("class", "heatmapRect")
    .attr("x", function(d) { return (x(d.Prior_disorder) + myPadding(myGroup(d.Prior_disorder))) })
    .attr("y", function(d) { return (y(d.Later_disorder) + myPaddingY(myGroup(d.Later_disorder))) })
    .attr("rx", 0)
    .attr("ry", 0)
    .attr("width", x.bandwidth() )
    .attr("height", y.bandwidth() )
    //.style("fill", "grey" )
    .style("stroke-width", 4)
    .style("stroke", "none")
    .style("opacity", 0)
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)
  .transition()
  .duration(200)
   .style("opacity", 1)


function updateChart(){

  // Recover the Sex option
  var selector = document.getElementById('btnHeatmapSex');
  var selectedSex = selector[selector.selectedIndex].value;

  // Recover the Sex option
  var selector = document.getElementById('btnHeatmapModel');
  var selectedModel = selector[selector.selectedIndex].value;

  // filter appropriate data:
  let data = dataHeatmap.filter(function(d){ return (
    d.Sex == selectedSex &&
    d.Model == selectedModel
  )})

  // add the squares
  var v = svg_heatmap
    .selectAll(".heatmapRect")
    .data(data)
  v
    .enter()
    .append("rect")
    .merge(v)
    .transition()
    .duration(1000)
      .attr("class", "heatmapRect")
      .attr("x", function(d) { return (x(d.Prior_disorder) + myPadding(myGroup(d.Prior_disorder))) })
      .attr("y", function(d) { return (y(d.Later_disorder) + myPaddingY(myGroup(d.Later_disorder))) })
      .style("fill", function(d) { return d.HR === undefined ? "#DCDCDC" : myColor2(d.HR)} )
      .style("opacity", 1)

  v
    .exit()
    .transition()
    .remove()
}

// Initialize
updateChart()

// Event listener
d3.select("#btnHeatmapSex").on("change", updateChart)
d3.select("#btnHeatmapModel").on("change", updateChart)





// ------------------------------------------------------------------------ //
// HEATMAP LEGEND
// ------------------------------------------------------------------------ //

// Use d3.legend by Susie Lu.
// https://d3-legend.susielu.com

// Create svg object
var svgLegend = d3.select("#heatmapLegend")
  .attr("height", 150)
  .attr("width", 300)

svgLegend.append("g")
    .attr("class", "legendQuant")
    .attr("transform", "translate(40,47)");

var legend = d3.legendColor()
  .labelFormat(d3.format(".0f"))
  .title("Hazard Ratio:")
  .scale(myColor2)
  .orient('horizontal')
  .shapeWidth(40)
  .cells([0, 10, 20, 30, 40, 50])

// Call the legend
svgLegend
  .select(".legendQuant")
  .call(legend);
