
// set the dimensions and margins of the graph
var margin = {top: 80, right: 25, bottom: 50, left: 175},
  width = 1180 - margin.left - margin.right,
  height = 750 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg_dotplot = d3.select("#dataviz_dotplot")
.append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
.append("g")
  .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");


d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/QBI/data_test.csv", function(data) {



  // ------------------------------------------------------------------------ //
  // BACKGROUND CHART INITIALIZATION
  // ------------------------------------------------------------------------ //

  // compute X scale and add axis
  var x = d3.scaleLinear()
      .range([0,width])
      .domain([0,20])
  var xAxis = svg_dotplot.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).ticks(10, ".0s"));

  // Add X axis title
  xAxis.append("text")
    .attr("x", width)
    .attr("y", 40)
    .attr("fill", "#000")
    .attr("text-anchor", "end")
    .attr("font-size", "14px")
    .text("Hazard ratio");

  // compute Y scale
  var y = d3.scaleLinear()
      .range([height, 0])
      .domain(d3.extent(data, function(d) { return +d.yPrim; }));

  // Build color scale
  var myColor = d3.scaleSequential()
    .interpolator(d3.interpolateInferno)
    .domain([0,20])

  // SHOW HR = 1 ------
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
      .style("opacity", 0)
      .style("font-size", "16px")
      .attr("class", "tooltip")

  // Three function that change the tooltip when user hover / move / leave a cell
  var mouseover = function(d) {
    tooltip
      .transition()
      .duration(200)
      .style("opacity", 1);
    tooltip
      .style("left", (d3.mouse(this)[0]+70) + "px")
      .style("top", (d3.mouse(this)[1]+30) + "px")
      .html("<span style='color:grey'>Prior disorder: </span>" + d.Prior_disorder + "<br>" + "<span style='color:grey'>Later disorder: </span>" + d.Later_disorder + "<br>" + "HR: " + d.HR + " [" + d.Lower_CL + "-" + d.Upper_CL + "]") // + d.Prior_disorder + "<br>" + "HR: " +  d.HR)
    }
  var mousemove = function(d) {
    tooltip
      .style("left", (d3.mouse(this)[0]+70) + "px")
      .style("top", (d3.mouse(this)[1]+30) + "px")
  }
  var mouseleave = function(d) {
    tooltip
      .transition()
      .duration(200)
      .style("opacity", 0)
  }


  // ------------------------------------------------------------------------ //
  // INITIALIZE CHART WITH DOTS AT Y=0
  // ------------------------------------------------------------------------ //

  svg_dotplot.selectAll(".circle")
    .data(data)
    .enter()
      .append("circle")
        .attr("class", "circle")
        .attr("r", 7)
        .attr("cx", function(d) { return x(+d.HR_rounded); })
        .attr("cy", function(d) { return y(10) })
        .style("fill", function(d){ return myColor(d.HR)})
        .style("opacity", "0.9")
        .style("stroke", function(d){if(d.HR>20){return "black"}else{return "none"} } )
        .style("stroke-width", "3px")
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave)


  // ------------------------------------------------------------------------ //
  // A FUNCTION TO CHANGE THE X LIMIT
  // ------------------------------------------------------------------------ //

  // UPDATE FUNCTION
  function update(myYlim) {

    // Update the scale
    x.domain([0,myYlim])
    xAxis.transition().duration(1000).call(d3.axisBottom(x).ticks(10, ".0s"));
    xAxis.select(".domain").remove()

    // Update vertical line
    verticalLine
      .transition()
      .duration(1000)
      .attr("x1", x(1))
      .attr("x2", x(1))

    // Update the circle
    svg_dotplot
      .selectAll(".circle")
      .transition()
      .delay(500)
      .duration(2000)
        .attr("cx", function(d) { return x(+d.HR_rounded); })
        .attr("cy", function(d) { return y(+d.yPrim) })
  }

  // Initialize
  update(20)

  // If reader clicks on 'show extreme' --> Change axis limit
  var mode = "normal"
  d3.select("#showExtreme")
    .on("click", function(){
      if( mode == "normal"){
        update(200)
        d3.selectAll(".textExplanation").transition().duration(1000).style("display", "none")
        d3.select("#showExtreme").text("back to normal")
        mode = "extreme"
      } else {
        mode = "normal"
        update(20)
        d3.selectAll(".textExplanation").transition().delay(1000).style("display", "block")
        d3.select("#showExtreme").text("Show them")
      }
    })



});
