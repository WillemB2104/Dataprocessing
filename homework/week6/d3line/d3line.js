/*
    D3 - Linegraph,  Week 6
    10209735 - Willem Bruin

    Resources used:
    mbostock's linegraph tutorial:      http://bl.ocks.org/mbostock/3883245
    mikehadlow's crosshairs example:    http://bl.ocks.org/mikehadlow/93b471e569e31af07cd3
    Stackoverflow:                      http://stackoverflow.com/questions/29440455/how-to-as-mouseover-to-line-graph-interactive-in-d3
*/

var dataPoint = function (x, y) {
  this.date = x;
  this.temperature = y;
};

d3.json("KNMI.json", function(error, json) {
    if (error)
        return console.warn(error);
    data = json;
    dataPoints = [];
    data.forEach(function(entry) {
        var date = new Date(entry[0]);
        var temp = entry[1]/10.0;
        dataPoints.push(new dataPoint(date, temp));
    });
    var format = d3.time.format("%Y-%m-%d");
    var padding = {top: 25, right: 20, bottom: 30, left: 50};
    var width = 1000 - padding.left - padding.right;
    var height = 500 - padding.top - padding.bottom;
    var xDomain = d3.extent(dataPoints, function(d) { return d.date; });
    var yDomain = d3.extent(dataPoints, function(d) { return d.temperature; });
    var xScale = d3.time.scale().range([0, width]).domain(xDomain);
    var yScale = d3.scale.linear().range([height, 0]).domain(yDomain);
    var xAxis = d3.svg.axis().scale(xScale).orient('bottom');
    var yAxis = d3.svg.axis().scale(yScale).orient('left');
    var lineFunction = d3.svg.line()
        .x(function(d) { return xScale(d.date); })
        .y(function(d) { return yScale(d.temperature); });
    var svg = d3.select("body").append("svg")
        .attr("width", width + padding.left + padding.right)
        .attr("height", height + padding.top + padding.bottom)
        .append("g")
        .attr("transform", "translate(" + padding.left + "," + padding.top + ")");
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 10)
        .attr("dy", 10)
        .style("text-anchor", "end")
        .text("Temperature in \xB0C");
    svg.append("path").datum(dataPoints).attr("class", "line").attr("d", lineFunction);
    var crosshair = svg.append('g')
        .style('display', 'none');
    crosshair.append('line')
        .attr('id', 'crosshair_LineX')
        .attr('class', 'crosshair_Line');
    crosshair.append('line')
        .attr('id', 'crosshair_LineY')
        .attr('class', 'crosshair_Line');
    crosshair.append('circle')
        .attr('id', 'crosshair_Circle')
        .attr('r', 5)
        .attr('class', 'crosshair_Circle');

    var date2index = d3.bisector(function(d) { return d.date; }).left;

    var tooltip = svg.append('svg:text')
        .attr('class', 'textinfo')

    svg.append('svg:rect')
        .attr('width', width)
        .attr('height', height)
        .attr('fill', 'none')
        .attr('pointer-events', 'all')
        .on('mouseover', function(){
            crosshair.style('display', null);
        })
        .on('mouseout', function(){
            crosshair.style('display', 'none');
        })
        .on('mousemove', function() {
            var mouse = d3.mouse(this);
            var mouseDate = xScale.invert(mouse[0]);
            var i = date2index(dataPoints, mouseDate);
            if (i > 0) {
                var d0 = dataPoints[i - 1]
                var d1 = dataPoints[i];
                // work out which date value is closest to the mouse
                var d = mouseDate - d0.date > d1.date - mouseDate ? d1 : d0;
                var x = xScale(d.date);
                var y = yScale(d.temperature);
                crosshair.select('#crosshair_Circle')
                    .attr('cx', x)
                    .attr('cy', y);
                crosshair.select('#crosshair_LineX')
                    .attr('x1', x).attr('y1', yScale(yDomain[0]))
                    .attr('x2', x).attr('y2', yScale(yDomain[1]));
                crosshair.select('#crosshair_LineY')
                    .attr('x1', xScale(xDomain[0])).attr('y1', y)
                    .attr('x2', xScale(xDomain[1])).attr('y2', y);
                drawTooltip(d.date, d.temperature);
            }
        });

    var setVisible = function() {
        d3.select('.textinfo').style('visibility', 'visible');
	};
	var drawTooltip = function(date, temperature) {
	    var timer;
        clearTimeout(timer);
        timer = setTimeout(setVisible, 2000);
        tooltip
            .attr("x", xScale(date) + 10)
            .attr("y", yScale(temperature))
            .attr("dx", -5)
            .attr("dy", -5)
            .attr("text-anchor", "start")
            .text(format(date) + ', ' + temperature + '\xB0C')
            .attr("fill", "black")
            .style("font-size","15px")
            .style("font-weight", "bold")
            .style('visibility', 'hidden');
        if (xScale(date) > width/2) {
                tooltip.attr("x", xScale(date) - 5)
                tooltip.attr("text-anchor", "end")
            }
	};
});

