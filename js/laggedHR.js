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

// Add the labels
var xAxisLabels = svg
  .filter(function(d){return (d=="Oppositional defiant disorder" || d=="Nicotine dependence" || d=="Alcohol abuse" || d=="Alcohol dependence" || d=="Drug abuse" || d=="Drug dependence" ) })
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




// ======================= //
// Y SCALE AND AXIS
// ======================= //

// A scale for the Y axis
var y = d3.scaleLinear()
  .domain([0,200])
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





// ------------------------------------------------------------------------ //
// TOOLTIP
// ------------------------------------------------------------------------ //

// create a tooltip
var tooltip = d3.select("#dataviz_evolution")
  .append("div")
    .attr("class", "tooltip")
    .style("font-size", "16px")
    .style("display", "block")
    .style("opacity", 1)


// Three function that change the tooltip when user hover / move / leave a cell
var mouseover = function(d) {
  tooltip
    .style("display", "block")
  tooltip
    .html(
      "<span style='color:grey'>Prior disorder: </span>" + d.Prior_disorder +
      "<br>" +
      "<span style='color:grey'>Later disorder: </span>" + d.Later_disorder +
      "<br>" +
      "<span style='color:grey'>HR: </span>" + d.Value + " [" + d.Low + "-" + d.High + "]" +
      "<br>" +
      "<span style='color:grey'>Time: </span>" + buildLabelFromId(d.Time)
    )
}
var mousemove = function(d) {
  tooltip
    .style("left", (d3.mouse(this)[0]+590) + "px")
    .style("top", (d3.mouse(this)[1]+450) + "px")
}
var mouseleave = function(d) {
  tooltip
    .style("display", "none")

}




// ======================= //
// A function that builds the chart
// ======================= //

function updateChart(){

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
      .attr("class", "myCircle")
      .attr("cx", function(d,i){ return(x(+d.Time)) } )
      .attr("cy", function(d,i){ return(y(+d.Value)) } )
      .attr("r", 5)
      .style("fill", d => myColor(myGroup(d.Later_disorder)) )
      .style("opacity",0)
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
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
