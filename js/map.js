// ======================= //
// GLOBAL INITIALIZATION
// ======================= //

// set the graph margins:
var margin = {top: 20, right: 20, bottom: 20, left: 20};

// Data and color scale
var data = d3.map();
var colorScale = d3.scaleThreshold()
  .domain([30, 40, 50, 60, 70, 80])
  .range(d3.schemeBlues[7]);

// append the svg object to the body of the page
var svg = d3.select("#dataviz_worldmap")
  .append("svg")

// Translate for margin
svg
  .append("g")
  .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

// Map and projection
var path = d3.geoPath();






// ======================= //
// TOOLTIP
// ======================= //
var tooltip = d3.select("#dataviz_worldmap")
  .append("div")
  .attr("class", "tooltip")
  .style("background-color", "black")
  .style("background-opacity", "0.1")
  .style("border", "none")
  .style("border-radius", "5px")
  .style("padding", "15px")
  .style("min-width", 150)
  .style("display", "none")

// Three function that change the tooltip when user hover / move / leave a cell
var mouseover = function(d) {
  if (d.myDetail.response_rate == null) { return }
  tooltip
    .style("opacity", 1)
  d3.select(this)
    .style("stroke", "black")
    .style("opacity", 1)
}
var mousemove = function(d) {
  tooltip
    .html(
      "<b>"+d.myDetail.country+"</b>" +
      "<br>" +
      "<span style='color:grey'>Sample size: </span>" + d.myDetail.sample_size1 +
      "<br>" +
      "<span style='color:grey'>Response rate (%): </span>" + d.myDetail.response_rate +
      "<br>" +
      "<span style='color:grey'>Year: </span>" + d.myDetail.year +
      "<br>" +
      "<span style='color:grey'>Survey code: </span>" + d.myDetail.survey
    )
    .style("left", (d3.mouse(this)[0]+270) + "px")
    .style("top", (d3.mouse(this)[1]+400) + "px")
    .style("display", "block")

  if(d.myDetail.country==="Colombia"){
    tooltip
      .html(
        "<b>"+d.myDetail.country+"</b>" +
        "<br>" +
        "<span style='color:grey'>Sample size: </span>" + d.myDetail.sample_size1 +
        "<br>" +
        "<span style='color:grey'>Response rate (%): </span>" + d.myDetail.response_rate +
        "<br>" +
        "<span style='color:grey'>Year: </span>" + d.myDetail.year +
        "<br>" +
        "<span style='color:grey'>Survey code: </span>" + d.myDetail.survey +
        "<br>" + "<br>" +
        "<b>"+"Colombia (Medellin)"+"</b>" +
        "<br>" +
        "<span style='color:grey'>Sample size: </span>" + "4261" +
        "<br>" +
        "<span style='color:grey'>Response rate (%): </span>" + "97.2" +
        "<br>" +
        "<span style='color:grey'>Year: </span>" + "2011-12" +
        "<br>" +
        "<span style='color:grey'>Survey code: </span>" + "MMHHS"
      )
  }
}
var mouseleave = function(d) {
  tooltip
    .style("opacity", 0)
    .style("display", "none")
  d3.select(this)
    .style("stroke", "none")
    .style("opacity", 0.8)
  }






// ======================= //
// FUNCTION THAT DRAWS THE CHART
// ======================= //

function ready(error, topo) {
  //if (error) throw error;

  // Remove current content of the svg element
  svg.selectAll("*").remove()

  // Compute current width
  let currentWidth = document.getElementById("dataviz_worldmap").offsetWidth

  // What is width and height of the chart:
  let width = currentWidth - margin.left - margin.right;
  let height = currentWidth*0.66 - margin.top - margin.bottom;

  // Update the svg
  svg
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)

  // Update the projection
  var projection = d3.geoNaturalEarth()
    .scale(width / 1.4 / Math.PI)
    .translate([width / 2, height / 2]);

  // Draw the map
  svg.append("g")
    .selectAll("path")
    .data(topo.features)
    .enter()
    .append("path")
    // draw each country
    .attr("d", d3.geoPath()
        .projection(projection)
    )
    // set the color of each country
    .attr("fill", function (d) {
      d.myDetail= data.get(d.id) || 0;
      var valForChoro = d.myDetail.response_rate || 0
      return colorScale(valForChoro);
    })
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)
}


// Load external data and boot = initialization
function updateChart(){
  d3.queue()
  .defer(d3.json, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
  .defer(d3.csv, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/data_map.csv",
    function(d) { data.set(d.code, {
      response_rate: +d.response_rate,
      country: d.country,
      sample_size1: d.sample_size1,
      year: d.field_date,
      survey: d.survey
    });
  })
  .await(ready);
}

// Initialize
updateChart()

// Add an event listener that run the function when dimension change
window.addEventListener('resize', updateChart );
