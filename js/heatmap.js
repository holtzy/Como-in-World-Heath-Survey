// ------------------------------------------------------------------------ //
// SVG AREA
// ------------------------------------------------------------------------ //

// set the dimensions and margins of the graph
var margin = {top: 80, right: 210, bottom: 180, left: 210},
  width = 1040 - margin.left - margin.right,
  height = 840 - margin.top - margin.bottom;

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
    .text(function(d){ return d})
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
    .text(function(d){ return d})
    .attr("x", -10 )
    .attr("y", function(d) { return (y(d) + myPaddingY(myGroup(d)) + 15) })
    .style("font-size", 12)
    .style("text-anchor", "end")
    .style("fill", function(d){ return( myColor(myGroup(d)) ) })




// ------------------------------------------------------------------------ //
// TOOLTIP
// ------------------------------------------------------------------------ //

// create a tooltip
var tooltip = d3.select("#dataviz_heatmap")
  .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("font-size", "16px")

// Three function that change the tooltip when user hover / move / leave a cell
var mouseover = function(d) {
  tooltip
    .transition()
    .duration(200)
    .style("opacity", 1)
  tooltip
      .html("<span style='color:grey'>Prior disorder: </span>" + d.Prior_disorder + "<br>" + "<span style='color:grey'>Later disorder: </span>" + d.Later_disorder + "<br>" + "HR: " + d.HR + " [" + d.Lower + "-" + d.Upper + "]")
      .style("left", (d3.mouse(this)[0]+150) + "px")
      .style("top", (d3.mouse(this)[1]+100) + "px")
}
var mousemove = function(d) {
  tooltip
    .style("left", (d3.mouse(this)[0]+150) + "px")
    .style("top", (d3.mouse(this)[1]+100) + "px")
}
var mouseleave = function(d) {
  tooltip
    .transition()
    .duration(200)
    .style("opacity", 0)
}






// ------------------------------------------------------------------------ //
// SHAPES
// ------------------------------------------------------------------------ //

// add the squares
svg_heatmap.selectAll()
  .data(dataHeatmap, function(d) {return d.Prior_disorder+':'+d.Later_disorder;})
  .enter()
  .append("rect")
    .attr("x", function(d) { return (x(d.Prior_disorder) + myPadding(myGroup(d.Prior_disorder))) })
    .attr("y", function(d) { console.log(d.Later_disorder) ; console.log(y(d.Later_disorder)) ; return (y(d.Later_disorder) + myPaddingY(myGroup(d.Later_disorder))) })
    .attr("rx", 0)
    .attr("ry", 0)
    .attr("width", 0 )
    .attr("height", 0 )
    .style("fill", function(d) { return myColor2(d.HR)} )
    .style("stroke-width", 4)
    .style("stroke", "none")
    .style("opacity", 0.8)
  .on("mouseover", mouseover)
  .on("mousemove", mousemove)
  .on("mouseleave", mouseleave)

// Animation at start
svg_heatmap
    .selectAll("rect")
    .transition()
    .duration(1000)
    .delay(function(d,i){ return i*3 })
    .attr("width", x.bandwidth() )
    .attr("height", y.bandwidth() )
