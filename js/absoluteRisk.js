// ======================= //
// SVG AREAS
// ======================= //

// set the dimensions and margins of the graph
var margin = {top: 5, right: 5, bottom: 5, left: 5},
    width = 185 - margin.left - margin.right,
    height = 185 - margin.top - margin.bottom;

// Remember the list of all disorders is available in "allDisorder"

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
  .domain([0,40])
  .range([ 10, width-20]);





// ======================= //
// OTHER SCALES
// ======================= //

var reformatEndLabel = d3.scaleOrdinal()
  .domain(["below 20","20to40","above40", "All", "M", "F"])
  .range(["20-", "20-40", "40+", "All", "M", "F"]);

var colorLine = d3.scaleOrdinal()
  .domain(["below 20","20to40","above40", "All", "M", "F"])
  .range(["#668B8B", "#33A1C9", "#344152", "black", "blue", "pink"]);











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

// btn: sex, all, or AOO
d3.select("#btnSexAOO")
  .selectAll('myOptions')
  .data(["All", "Sex", "AOO"])
  .enter()
  .append('option')
  .text(function (d) { return d }) // text showed in the menu
  .attr("value", function (d) { return d; }) // corresponding value returned by the button

// btn: Scale
d3.select("#btnScale")
  .selectAll('myOptions')
  .data(["Linear", "Log"])
  .enter()
  .append('option')
  .text(function (d) { return d }) // text showed in the menu
  .attr("value", function (d) { return d; }) // corresponding value returned by the button






// ------------------------------------------------------------------------ //
// HIGHLIGHTING ON HOVER
// ------------------------------------------------------------------------ //
//
// // Time of transition
// let transitionTime = 500
//
// // When user hover a dot
// var mouseover = function(d) {
//
//   // Recover the year that is hovered + Highlight it every where
//   currentYear = "time"+buildLabelFromId(d.Time)
//   d3.selectAll("."+currentYear)
//     .attr("r", 13)
//     .style("stroke-width", 2)
//
//   // Highlight the disease compared to others
//   currentDisease = d.Later_disorder.replace(/\s+/g, '')
//   d3.selectAll(".myCircle")
//     .style("opacity", 0.2)
//   d3.selectAll("."+currentDisease)
//     .style("opacity", 1)
//     .attr("r", 9)
//
//   // Add text to show exact value
//   d3.selectAll(".myText" + " " + "." + currentDisease)
//     .style("opacity", 1)
// }
//
// // Back to normal
// var mouseleave = function(d) {
//   d3.selectAll(".myCircle")
//     .transition()
//     .duration(transitionTime)
//     .style("opacity", 1)
//     .attr("r", 5)
//     .style("stroke-width", 0)
//   d3.selectAll(".myText")
//     .style("opacity", 0)
// }




// ======================= //
// A function that builds the chart
// ======================= //

function updateChart(){

  // How many cols am I gonna have? (depends on window width)
  let currentWidth = document.getElementById("dataviz_evolution").offsetWidth
  let colNumber = Math.floor( currentWidth / ( width + margin.left + margin.right) )

  // Recover the Mental Disorder option?
  var selector = document.getElementById('btnFocusDisorder');
  var selectedMentalDisOption = selector[selector.selectedIndex].value;

  // Recover if split by sex or Age of Onset (AOO)
  var btnSexAOO = document.getElementById('btnSexAOO');
  var selectedSexAOO = btnSexAOO[btnSexAOO.selectedIndex].value;

  // Recover the scale used
  var btnScale = document.getElementById('btnScale');
  var selectedScale = btnScale[btnScale.selectedIndex].value;

  // Get the appropriate data
  var currentData = dataEvolutionAbsolute.filter(function(d){return (d.Prior_disorder==selectedMentalDisOption && d.Time<41) })
  switch (selectedSexAOO) {
    case 'All': currentData = currentData.filter( d => (d.Model=="All") ) ; break;
    case 'Sex': currentData = currentData.filter( d => (d.Model=="M" || d.Model=="F") ) ; break;
    case 'AOO': currentData = currentData.filter( d => (d.Model=="20to40" || d.Model=="above40" || d.Model=="below 20") ) ; break;
  }

  // Nest data:
  var sumstat = d3.nest() // nest function allows to group the calculation per level of a factor
    .key(function(d) { return d.Later_disorder;})
    .key(function(d) { return d.Model;})
    .entries(currentData);

  // Update the Y domain depending on prior disorder
  currentMax = d3.max(currentData, function(d) { return +d.Value; })
  var y = selectedScale === "Log" ?
    ( d3.scaleLog()
        .range([ height-10, 40])
        .domain([.1,currentMax])
    ) : (
      d3.scaleLinear()
        .range([ height-10, 40])
        .domain([0,currentMax])
    )

  // Add the X axis labels
  toDisplay = allDisorder.slice(1).slice(-colNumber)
  if (typeof myXaxis != "undefined") {
     myXaxis.remove();
  }
  myXaxis = svg.append("g")
    .attr("transform", "translate(0,"+height+")")
    .filter(function(d){return toDisplay.includes(d) })
    .call(d3.axisBottom(x).tickSize(0).ticks(5))
  myXaxis.selectAll("text")
      .style("font-size", 9)
      .style("fill", "grey")
  myXaxis.select(".domain").remove()


  // Add the Y Axis labels
  var toDisplayY = [];
  for (var i = 1; i <= allDisorder.length; i=i+colNumber) {
   toDisplayY.push(allDisorder[i-1]);
  }
  if (typeof myYaxis != "undefined") {
     myYaxis.remove();
  }
  let tickNum = selectedScale === "Log" ? 2 : 4
  myYaxis = svg.append("g")
    .filter(function(d){return toDisplayY.includes(d) })
    .call(d3.axisLeft(y).tickSize(0).tickFormat(d3.format("1")).ticks(tickNum) )
  myYaxis.selectAll("text")
      .style("font-size", 9)
      .style("fill", "grey")
  myYaxis.select(".domain").remove()

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
      .attr("stroke-width", 2)
      .attr("stroke", d => colorLine(d.key) )
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

  // --- Add labels at line end
  var w = svg
    .selectAll(".myEndLabels")
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
  w
    .enter()
    .append("text")
    .merge(w)
    .transition()
    .duration(1000)
      .attr("x", function(d){ len = d.values.length ; return x(d.values[len-1].Time)+ 5 })
      .attr("y", function(d){ len = d.values.length ; return y(d.values[len-1].Value) })
      .text(function(d){ len = d.values.length ; return reformatEndLabel(d.key) })
      .style("fill", d => colorLine(d.key) )
      .style("font-size", 10)
      .attr("class", "myEndLabels")
  w
    .exit()
    .remove()
}





// ======================= //
// EVENT LISTENER
// ======================= //

// Initialize
updateChart()

// Listen to the mental disorder selection button
d3.select("#btnFocusDisorder").on("change", updateChart)

// Listen to the type: absolute vs HR
d3.select("#btnData").on("change", updateChart)

// Listen to the type: absolute vs HR
d3.select("#btnSexAOO").on("change", updateChart)

// Listen to the Scale
d3.select("#btnScale").on("change", updateChart)

// Add an event listener that run the function when dimension change
window.addEventListener('resize', updateChart );

// Show bipolar disorder:
d3.select("#showDrugAbuse").on("click", function(){
  document.getElementById("btnFocusDisorder").value = "Drug abuse"
  updateChart()
})

// Show bipolar disorder:
d3.select("#showConductDisorder").on("click", function(){
  document.getElementById("btnFocusDisorder").value = "Conduct disorder"
  updateChart()
})

// Show bipolar disorder:
d3.select("#showDysthymia").on("click", function(){
  document.getElementById("btnFocusDisorder").value = "Dysthymia"
  updateChart()
})
