// set the dimensions and margins of the graph
var margin = {top: 80, right: 25, bottom: 30, left: 40},
  width = 900 - margin.left - margin.right,
  height = 650 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg1 = d3.select("#dataviz_worldmap")
.append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
.append("g")
  .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

// Map and projection
var path = d3.geoPath();
var projection = d3.geoNaturalEarth()
  .scale(width / 1.4 / Math.PI)
  .translate([width / 2, height / 2]);

// Data and color scale
var data = d3.map();
var colorScale = d3.scaleThreshold()
  .domain([30, 40, 50, 60, 70, 80])
  .range(d3.schemeBlues[7]);

// Load external data and boot
d3.queue()
  .defer(d3.json, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
  .defer(d3.csv, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/data_map.csv",
    function(d) { data.set(d.code, {
      response_rate: +d.response_rate,
      country: d.country,
      sample_size1: d.sample_size1,
      year: d.field_date
    });
  })
  .await(ready);


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
      console.log(d.myDetail)
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
          "Sample size: " + d.myDetail.sample_size1 +
          "<br>" +
          "Response rate (%): " + d.myDetail.response_rate +
          "<br>" +
          "Year: " + d.myDetail.year
        )
        .style("left", (d3.mouse(this)[0]+670) + "px")
        .style("top", (d3.mouse(this)[1]+500) + "px")
        .style("display", "block")

      if(d.myDetail.country==="Colombia"){
        tooltip
          .html(
            "<b>"+d.myDetail.country+"</b>" +
            "<br>" +
            "Sample size: " + d.myDetail.sample_size1 +
            "<br>" +
            "Response rate (%): " + d.myDetail.response_rate +
            "<br>" +
            "Year: " + d.myDetail.year +
            "<br>" + "<br>" +
            "<b>"+"Colombia (Medellin)"+"</b>" +
            "<br>" +
            "Sample size: " + "4261" +
            "<br>" +
            "Response rate (%): " + "97.2" +
            "<br>" +
            "Year: " + "2011-12"
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


function ready(error, topo) {
  if (error) throw error;

  // Draw the map
  svg1.append("g")
    .selectAll("path")
    .data(topo.features)
    .enter()
    .append("path")
      // draw each country
      .attr("d", d3.geoPath()
        .projection(projection)
      )
      // set the color of each country
      .attr("fill", colorScale(0))
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave)

  svg1
    .selectAll("path")
    .transition()
    .duration(3000)
    .attr("fill", function (d) {
      d.myDetail= data.get(d.id) || 0;
      var valForChoro = d.myDetail.response_rate || 0
      return colorScale(valForChoro);
    })

}
