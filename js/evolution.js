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
  .domain([1, 6])
  .range([ 0, width]);

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
  .domain([0, 250])
  .range([ height, 0]);



// ======================= //
// SHAPE
// ======================= //


function updateChart(){

  // Filter data to keep focus disorder
  var currentData = dataEvolution.filter(function(d){return (d.Prior_disorder=="Major depressive episode" && d.Model=="A") })

  // Nest data:
  var sumstat = d3.nest() // nest function allows to group the calculation per level of a factor
    .key(function(d) { return d.Later_disorder;})
    .entries(currentData);

  // Update circle position
  svg.selectAll('circle')
    .data( function(d,i){ console.log(d + "-" + i) ; console.log(sumstat[i]) ; return(sumstat[i]) })
    .enter()
    .append("path")
      .attr("fill", "none")
      .attr("stroke-width", 1.9)
      .attr("d", function(d){
        return d3.line()
          .x(function(d) { console.log(d) ; return x(d.HR); })
          .y(function(d) { return y(d.Time); })
          (d.values)
      })
  // u
  //   .enter()
  //   .append("circle")
  //   .merge(u)
  //   .transition()
  //   .duration(1000)
  //     .attr("class", "myLolliCircles")
  //     .attr("cx", function(d) { return x(d.MRR); })
  //     .attr("cy", function(d) { id = bothCOD.indexOf(d.COD) ; return posYaxis[id] + myPositionLolliSex(d.sex) })
  //     .attr('r', function(d,i){ if(typeCOD.includes(d.COD)){size = 5}else{size=5} ; return size  })
  //     .style("fill", function(d){ if(selectedSexOption!="both"){col=myColorLolliSex(d.sex)}else{col=myColorCOD(d.COD)} ; return col })
  //     .attr("class", function(d) { return d.COD.replace(/\s/g, '') })
  //     .style("display", function(d){
  //       if(selectedSexOption=="both"){
  //         if(d.sex=="both"){out="block"}else{out="none"}
  //       }else{
  //         if(d.sex=="both"){out="none"}else{out="block"}
  //       } ;
  //       return out })
  // u
  //   .exit()
  //   .transition()
  //   .duration(1000)
  //   .style("opacity",0)
  //   .remove()

}


updateChart()
