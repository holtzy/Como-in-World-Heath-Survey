// ======================= //
// SVG AREAS
// ======================= //

// set the dimensions and margins of the graph
var margin = {top: 5, right: 5, bottom: 5, left: 5},
    width = 185 - margin.left - margin.right,
    height = 185 - margin.top - margin.bottom;

// Remember the list of all disorders is available in allDisorder

// append the svg object to the body of the page
var svg = d3.select("#dataviz_evolution")
    .selectAll("uniqueChart")
    .data(allDisorder)
    .enter()
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .style("overflow", "visible")
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")" )

// Add background
svg
    .append("rect")
      .attr("x",0)
      .attr("y",0)
      .attr("width",width)
      .attr("height",height)
      .style("fill", "grey")
      .style("opacity", .1)

// Add titles to each subplot with disorder Name
svg
  .append("text")
  .attr("text-anchor", "start")
  .attr("y", 20)
  .attr("x", 5)
  .text(function(d){ return( giveShortName(d) )})
  .style("fill", d => myColor(myGroup(d)) )






// ======================= //
// X SCALE AND AXIS
// ======================= //

// A scale that transform a number in a label
var buildLabelFromId = d3.scaleOrdinal()
  .domain([1,2,3,4,5,6])
  .range(["0-1y", "1-2y", "2-5y", "5-10y", "10-15y", "15+y"]);

// A scale for the X axis
var x = d3.scaleLinear()
  .range([ 10, width-10]);

// Add the labels
var xAxisLabels = svg
  .filter(function(d){return (d=="Drug abuse" ) })
  .selectAll("myXLabels")
  .data([1,2,3,4,5,6])
  .enter()
  .append("text")
    .attr('x', function(d){ return x(d) })
    .attr('y', height+12)
    .text( d => buildLabelFromId(d) )
    .attr("text-anchor", "center")
    .style("font-size", 9)
    .style("fill", 'grey')




// ======================= //
// Y SCALE AND AXIS
// ======================= //

// A scale for the Y axis
var y = d3.scaleLinear()
  .range([ height-10, 10]);





// ======================= //
// BUILD BUTTON
// ======================= //

// btn: Disorder
d3.select("#btnFocusDisorder")
  .selectAll('myOptions')
  .data(allDisorder)
  .enter()
  .append('option')
  .text(function (d) { return d }) // text showed in the menu
  .attr("value", function (d) { return d; }) // corresponding value returned by the button

// btn: Model
d3.select("#btnModel")
  .selectAll('myOptions')
  .data(["A", "B"])
  .enter()
  .append('option')
  .text(function (d) { return "Model " + d }) // text showed in the menu
  .attr("value", function (d) { return d; }) // corresponding value returned by the button

// btn: HR or absolute
d3.select("#btnData")
  .selectAll('myOptions')
  .data(["dataEvolutionHR", "dataEvolutionAbsolute"])
  .enter()
  .append('option')
  .text(function (d) { return d == "dataEvolutionHR"? "Hazard Ratio" : "Absolute %" }) // text showed in the menu
  .attr("value", function (d) { return d; }) // corresponding value returned by the button

// btn: sex, all, or AOO
d3.select("#btnSexAOO")
  .selectAll('myOptions')
  .data(["All", "Sex", "AOO"])
  .enter()
  .append('option')
  .text(function (d) { return d }) // text showed in the menu
  .attr("value", function (d) { return d; }) // corresponding value returned by the button





// ======================= //
// WHICH CHART TO RUN - WITH WHAT FEATURES?
// ======================= //

function updateChart(){

  // Recover the Mental Disorder option?
  var selector = document.getElementById('btnFocusDisorder');
  var selectedMentalDisOption = selector[selector.selectedIndex].value;

  // Recover the model used
  var btnModel = document.getElementById('btnModel');
  var selectedModel = btnModel[btnModel.selectedIndex].value;

  // Recover the model used
  var btnSexAOO = document.getElementById('btnSexAOO');
  var selectedSexAOO = btnSexAOO[btnSexAOO.selectedIndex].value;

  // Recover the kind of data: HR vs Absolute
  var btnData = document.getElementById('btnData');
  var selectedData = btnData[btnData.selectedIndex].value;

  // If watching HR
  if( selectedData=="dataEvolutionHR"){
    d3.select("#btnModel").style("display", "inline")
    d3.select("#btnSexAOO").style("display", "none")
    y.domain([0, 250])
    x.domain([1, 6])
    var currentData = dataEvolutionHR
      .filter(function(d){return (d.Prior_disorder==selectedMentalDisOption && d.Model==selectedModel ) })
    buildChartHR(currentData)
  }

  // If watching absolute
  if( selectedData=="dataEvolutionAbsolute"){
    d3.select("#btnModel").style("display", "none")
    d3.select("#btnSexAOO").style("display", "inline")
    y.domain([0, 100])
    x.domain([1,60])
    var currentData = dataEvolutionAbsolute.filter(function(d){return (d.Prior_disorder==selectedMentalDisOption) })
    switch (selectedSexAOO) {
      case 'All': currentData = currentData.filter( d => (d.Model=="All") ) ; break;
      case 'Sex': currentData = currentData.filter( d => (d.Model=="M" || d.Model=="F") ) ; break;
      case 'AOO': currentData = currentData.filter( d => (d.Model=="20to40" || d.Model=="above40" || d.Model=="below 20") ) ; break;
    }
    buildChartAbsolute(currentData)
  }

}






// ======================= //
// BUILD LINE CHART
// ======================= //

function buildChartAbsolute(currentData){

  // Remove all circles and path
  svg.selectAll("circle").remove()
  svg.selectAll("path").remove()

  // Nest data:
  var sumstat = d3.nest() // nest function allows to group the calculation per level of a factor
    .key(function(d) { return d.Later_disorder;})
    .key(function(d) { return d.Model;})
    .entries(currentData);

  // --- Add lines
  var v = svg
    .selectAll(".myLines")
    .data(function(d,i){
      all = sumstat.map(function(l){return l.key})
      index = all.indexOf(d)
      if( index == -1){
        return []
      } else {
        out = [sumstat[index]][0].values
        return out;
      }
    }
    )
  v
    .enter()
    .append("path")
    .merge(v)
    .transition()
    .duration(1000)
      .attr("class", "myLines")
      .attr("fill", "none")
      .style("opacity", 1)
      .attr("stroke-width", 1)
      .attr("stroke", d => myColor(myGroup(d.key)) )
      .attr("d", function(d){
        return d3.line()
          .x(function(d) { return x(+d.Time); })
          .y(function(d) { return y(+d.Value); })
          (d.values)
      })
  v
    .exit()
    .transition()
    .duration(1000)
    .style("opacity",0)
    .remove()

  // Add annotation
  addAnnotation()

}






// ======================= //
// TOOLTIP ABSOLUTE / LINE CHART
// ======================= //

function addAnnotation(){
  console.log("hello")
  // A rect that will track mouse position on chart
  svg.append('rect')
    .attr("class", d => d)
    .style("fill", "none")
    .style("pointer-events", "all")
    .attr('width', width)
    .attr('height', height)
    .on('mouseover', mouseover)
    .on('mousemove', mousemove)
    .on('mouseout', mouseout);

  // This allows to find the closest X index of the mouse:
  var bisect = d3.bisector(function(d) { return d.Time; }).left;

  // Circle that travels along the curve of right chart
  var focus = svg.append('g')
    .append('line')
      .style("stroke", "#808080")
      .style("opacity", 0)

  // What happens when the mouse move -> show the annotations at the right positions.
  function mouseover() {
    focus.style("opacity", 1)
  }
  function mousemove() {
    // recover coordinate we need
    var x0 = x.invert(d3.mouse(this)[0]);
    // Recover the disease = the class
    selectedClass = d3.select(this).attr("class")
    var i = bisect(dataEvolutionAbsolute, x0, 1);
    selectedData = dataEvolutionAbsolute[i]
    focus
      .attr("x1", x(selectedData.Time))
      .attr("x2", x(selectedData.Time))
      .attr("y1", 30)
      .attr("y2", height)
  }
  function mouseout() {
    focus.style("opacity", 0)
  }
}






// ======================= //
// BUILD CONNECTED SCATTERPLOT
// ======================= //

function buildChartHR(currentData){

  // Remove all path
  svg.selectAll("path").remove()

  // Add circles
  var u = svg
    .selectAll(".myCircle")
    .data(function(d,i){
      return(currentData.filter(function(c){return (c.Later_disorder==d)}))
    })
  u
    .enter()
    .append("circle")
    .merge(u)
    .style("opacity", 1)
    .transition()
    .duration(1000)
      .attr("class", "myCircle")
      .attr("cx", function(d,i){ return(x(+d.Time)) } )
      .attr("cy", function(d,i){ return(y(+d.Value)) } )
      .attr("r", 5)
      .style("fill", d => myColor(myGroup(d.Later_disorder)) )
  u
    .exit()
    .transition()
    .duration(0)
    .style("opacity",0)
    .remove()

  // Nest data:
  var sumstat = d3.nest() // nest function allows to group the calculation per level of a factor
    .key(function(d) { return d.Later_disorder;})
    .key(function(d) { return d.Model;})
    .entries(currentData);

  // --- Add lines
  var v = svg
    .selectAll(".myLines")
    .data(function(d,i){
      all = sumstat.map(function(l){return l.key})
      index = all.indexOf(d)
      if( index == -1){
        return []
      } else {
        out = [sumstat[index]][0].values
        return out;
      }
    }
    )
  v
    .enter()
    .append("path")
    .merge(v)
    .transition()
    .duration(1000)
      .attr("class", "myLines")
      .attr("fill", "none")
      .style("opacity", 1)
      .attr("stroke-width", 1)
      .attr("stroke", d => myColor(myGroup(d.key)) )
      .attr("d", function(d){
        return d3.line()
          .x(function(d) { return x(+d.Time); })
          .y(function(d) { return y(+d.Value); })
          (d.values)
      })
  v
    .exit()
    .transition()
    .duration(1000)
    .style("opacity",0)
    .remove()
}





// ======================= //
// EVENT LISTENER
// ======================= //

// Initialize
updateChart()

// Listen to the mental disorder selection button
d3.select("#btnFocusDisorder").on("change", updateChart)

// Listen to the Model
d3.select("#btnModel").on("change", updateChart)

// Listen to the type: absolute vs HR
d3.select("#btnData").on("change", updateChart)

// Listen to the type: absolute vs HR
d3.select("#btnSexAOO").on("change", updateChart)