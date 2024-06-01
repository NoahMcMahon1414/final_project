// Global function called when select element is changed
function onCategoryChanged() {
    index = document.getElementById("categorySelect").selectedIndex;
    return index;
}

var svg = d3.select('svg');
var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');
var padding = {t: 15, r: 5, b: 45, l: 55};
chartWidth = svgWidth - padding.r - padding.l;
chartHeight = svgHeight - padding.t - padding.b;

var parseDate = d3.utcFormat("%Y-%m-%d");
var dateDomain = [new Date(2014, 7, 1), new Date(2015, 6, 30)];
var tempDomain = [-20, 120];

var xScale = d3.scaleTime()
    .domain(dateDomain)
    .range([0, chartWidth])

var yScale = d3.scaleLinear()
    .domain(tempDomain)
    .range([chartHeight, 0])

var clip = svg.append("defs").append("svg:clipPath")
    .attr("id", "clip")
    .append("svg:rect")
    .attr("width", svgWidth )
    .attr("height", svgHeight )
    .attr("x", 0)
    .attr("y", 0);

var brush = d3.brushX()
    .extent( [ [0,0], [svgWidth, svgHeight] ] )
    .on("end", zoomChart)

var f = [];

Promise.all([
  d3.csv('CLT.csv'),
  d3.csv('CQT.csv'),
  d3.csv('IND.csv'),
  d3.csv('JAX.csv'),
  d3.csv('MDW.csv'),
  d3.csv('PHL.csv'),
  d3.csv('PHX.csv')
]).then(function(files) {
  id = onCategoryChanged();

  weather = files[id];

  f = files;

  document.getElementById('categorySelect').addEventListener('input', function() {
    onCategoryChanged()
    updateChart(files[onCategoryChanged()]);
  })

  updateChart(weather);
});

function updateChart(weather) {
  d3.selectAll("svg > *").remove();

  console.log(xScale.domain());

  const months = {0 : 'Jan', 1 : 'Feb', 2 : 'Mar', 3 : 'Apr', 4 : 'May', 5 : 'Jun', 6 : 'Jul', 7 : 'Aug', 8 : 'Sep', 9 : 'Oct', 10 : 'Nov', 11 : 'Dec'}

	function dateFormat(dateStr) {
    var parts = String(dateStr).split('-')
    return new Date(Number(parts[0]), Number(parts[1]), Number(parts[2]))
  }
	for (var i = 0; i < weather.length; i++) {
		weather[i]['Date'] = dateFormat(weather[i]['date'])
	}

  weather = weather.filter(function(d) {
    return (d.Date < xScale.domain()[1] && d.Date > xScale.domain()[0]);
  });

  var dates = _.map(weather, 'Date');

  var xBand = d3.scaleBand().domain(d3.range(-1, dates.length)).range([0, chartWidth]).padding(0.3);

  var chart = svg.append('g')
    .attr('transform', 'translate('+[padding.l, padding.t]+')');

  var xScale2 = d3.scaleLinear()
    .domain([-1, dates.length])
    .range([0, chartWidth])

  svg.append("g")
    .attr("clip-path", "url(#clip)")
    .append('g')
    .attr("class", "brush")
    .call(brush);

  var candles = chart.selectAll('.candle')
    .data(weather)
    .enter()
    .append('rect')
    .attr('class', 'candle')
    .attr('x', (d, i) => xScale2(i) - xBand.bandwidth())
    .attr('y', d => yScale(Math.max(d.actual_min_temp, d.actual_max_temp)))
    .attr('width', xBand.bandwidth())
    .attr('height', d => (d.actual_min_temp === d.actual_max_temp) ? 1 : yScale(Math.min(d.actual_min_temp, d.actual_max_temp))-yScale(Math.max(d.actual_min_temp, d.actual_max_temp)))
    .attr("fill", d => (d.actual_min_temp === d.actual_max_temp) ? "yellow" : (d.actual_min_temp > d.actual_max_temp) ? "blue" : "red");

  var stems = chart.selectAll("g.line")
    .data(weather)
    .enter()
    .append("line")
    .attr("class", "stem")
    .attr("x1", (d, i) => xScale2(i) - xBand.bandwidth()/2)
    .attr("x2", (d, i) => xScale2(i) - xBand.bandwidth()/2)
    .attr("y1", d => yScale(d.average_max_temp))
    .attr("y2", d => yScale(d.average_min_temp))
    .attr("stroke", d => (d.actual_min_temp === d.actual_max_temp) ? "white" : (d.actual_min_temp > d.actual_max_temp) ? "blue" : "red");

  var line = chart.append("path")
    .datum(weather)
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("stroke-width", 3)
    .attr("d", d3.line()
      .x(function(d, i) { return (xScale2(i) - xBand.bandwidth()) })
      .y(function(d) { return (yScale(d.actual_mean_temp)) })
    )

  var xAxis = chart.append('g')
    .call(d3.axisBottom(xScale))
    .attr("transform", "translate(0,"+chartHeight+")")
    .attr('class', 'x axis');

  chart.append("g")
    .call(d3.axisLeft(yScale))
    .attr("class", "y axis");

  chart.append("text")
    .attr("class", "x axis-label")
    .text("Date")
    .attr("transform", "translate("+[(chartWidth/2),(chartHeight + 34)]+")")

  chart.append("text")
    .attr("class", "y axis-label")
    .text("Temperature (\u00B0C)")
    .attr("transform", "translate("+[-30,(chartHeight/2) + 80]+")rotate(-90)")
}

var idleTimeout
function idled() { idleTimeout = null; }

function zoomChart() {
  extent = d3.event.selection

  // If no selection, back to initial coordinate. Otherwise, update X axis domain
  if(!extent){
    if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
      xScale.domain(dateDomain);
    }else{
      xScale.domain([ xScale.invert(extent[0]), xScale.invert(extent[1]) ])
      svg.select(".brush").call(brush.move, null) // This remove the grey brush area as soon as the selection has been done
    }

  // Update axis and line position
  //xAxis.transition().duration(1000).call(d3.axisBottom(xScale))
  updateChart(f[onCategoryChanged()]);
}

// If user double click, reinitialize the chart
svg.on("dblclick",function(){
  xScale.domain(dateDomain);
  updateChart(f[onCategoryChanged()]);
});