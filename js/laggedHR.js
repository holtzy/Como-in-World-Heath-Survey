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
  .domain([1,6])
  .range([ 10, width-10]);





// ======================= //
// Y SCALE AND AXIS
// ======================= //

// A scale for the Y axis
var y = d3.scaleLinear()
  .domain([0,200])
  .range([ height-10, 40]);











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





// ------------------------------------------------------------------------ //
// TOOLTIP
// ------------------------------------------------------------------------ //

// Time of transition
let transitionTime = 500

// Three function that change the tooltip when user hover / move / leave a cell
var mouseover = function(d) {

  // Recover the year that is hovered + Highlight it every where
  currentYear = "time"+buildLabelFromId(d.Time)
  d3.selectAll("."+currentYear)
    .attr("r", 13)
    .style("stroke-width", 2)

  // Highlight the disease compared to others
  currentDisease = d.Later_disorder.replace(/\s+/g, '')
  d3.selectAll(".myCircle")
    .style("opacity", 0.2)
  d3.selectAll("."+currentDisease)
    .style("opacity", 1)
    .attr("r", 9)

  // Add text to show exact value
  d3.selectAll(".myText" + " " + "." + currentDisease)
    .style("opacity", 1)
}

// Back to normal
var mouseleave = function(d) {
  d3.selectAll(".myCircle")
    .transition()
    .duration(transitionTime)
    .style("opacity", 1)
    .attr("r", 5)
    .style("stroke-width", 0)
  d3.selectAll(".myText")
    .style("opacity", 0)
  tooltip
    .style("display", "none")
}




// ======================= //
// A function that builds the chart
// ======================= //

function updateChart(){

  // How many cols am I gonna have? (depends on window width)
  let currentWidth = document.getElementById("dataviz_evolution").offsetWidth
  let colNumber = Math.floor( currentWidth / ( width + margin.left + margin.right) )

  // Add the X axis labels
  toDisplay = allDisorder.slice(1).slice(-colNumber)
  if (typeof xAxisLabels != "undefined") {
     xAxisLabels.remove();
  }
  xAxisLabels = svg
    .filter(function(d){return toDisplay.includes(d) })
    .selectAll("myXLabels")
    .data([1,2,3,4,5,6])
    .enter()
    .append("text")
      .attr('x', 0)
      .attr('y', 0)
      .style("text-anchor", "end")
      .text( d => buildLabelFromId(d) )
      .style("font-size", 9)
      .style("fill", 'grey')
      .attr("transform", function(d){ return( "translate(" + (x(d) + "," + (height+9) + ")rotate(-45)")) })

  // Add the Y Axis labels
  var toDisplayY = [];
  for (var i = 1; i <= allDisorder.length; i=i+colNumber) {
   toDisplayY.push(allDisorder[i-1]);
  }
  if (typeof myYaxis != "undefined") {
     myYaxis.remove();
  }
  myYaxis = svg.append("g")
    .filter(function(d){return toDisplayY.includes(d) })
    .call(d3.axisLeft(y).tickSize(0).ticks(4))
  myYaxis.selectAll("text")
      .style("font-size", 9)
      .style("fill", "grey")
  myYaxis.select(".domain").remove()

  // Recover the Mental Disorder option?
  var selector = document.getElementById('btnFocusDisorder');
  var selectedMentalDisOption = selector[selector.selectedIndex].value;

  // Recover the model used
  var btnModel = document.getElementById('btnModel');
  var selectedModel = btnModel[btnModel.selectedIndex].value;

  // Filter data
  var currentData = dataEvolutionHR
    .filter(function(d){return (d.Prior_disorder==selectedMentalDisOption && d.Model==selectedModel ) })

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
      .attr("class", function(d){ return "myCircle" + " time" + buildLabelFromId(d.Time) + " " + d.Later_disorder.replace(/\s+/g, '') })
      .attr("cx", function(d,i){ return(x(+d.Time)) } )
      .attr("cy", function(d,i){ return(y(+d.Value)) } )
      .attr("r", 5)
      .style("fill", d => myColor(myGroup(d.Later_disorder)) )
      .style("opacity",0)
      .style("stroke", "black")
      .style("stroke-width", 0)
    .on("mouseover", mouseover)
    .on("mouseleave", mouseleave)
    .transition()
    .duration(1000)
      .style("opacity", 1)
  u
    .exit()
    .transition()
    .duration(0)
    .style("opacity",0)
    .remove()


  // Add Text
  var w = svg
    .selectAll(".myText")
    .data(function(d,i){
      return(currentData.filter(function(c){return (c.Later_disorder==d)}))
    })
  w
    .enter()
    .append("text")
    .merge(w)
      .attr("class", function(d){ return "myText" + " " + d.Later_disorder.replace(/\s+/g, '') })
      .attr("x", function(d){ return(x(+d.Time) ) } )
      .attr("y", function(d){ return(y(+d.Value) - 16) } )
      .text( d => d.Value )
      .style("opacity", 0)
      .style("text-anchor", "middle")
      .style("font-size", 11)
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

// Listen to the Model
d3.select("#btnModel").on("change", updateChart)

// Listen to the type: absolute vs HR
d3.select("#btnData").on("change", updateChart)

// Listen to the type: absolute vs HR
d3.select("#btnSexAOO").on("change", updateChart)

// Add an event listener that run the function when dimension change
window.addEventListener('resize', updateChart );
