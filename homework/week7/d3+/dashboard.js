/*
    D3 - Dashboard,  Week 7
    10209735 - Willem Bruin

    Resources used:
    Markmarkoh's datamap example:       http://bl.ocks.org/markmarkoh/4127667
    mbostock's linegraph tutorial:      http://bl.ocks.org/mbostock/3883245
    mikehadlow's crosshairs example:    http://bl.ocks.org/mikehadlow/93b471e569e31af07cd3
    Stackoverflow:                      http://stackoverflow.com/questions/29440455/how-to-as-mouseover-to-line-graph-interactive-in-d3

*/

var digit2billion = function (digit) {
    billion = Math.floor(digit/1000000000)
    return billion
};
var flattened_country_codes = country_codes.reduce(function(a, b) {
        return a.concat(b);
    });
var dataPoint = function (x, y) {
    this.date = x;
    this.birthrate = y;
};
popdensdatadict = {};
d3.json("pop_dens_data.json", function(error, json) {
    if (error)
        return console.warn(error);
    popdens_data = json;
    popdens_data.forEach(function(entry) {
        entry.area = parseInt(entry.area);
        entry.pop_dens = parseInt(entry.pop_dens);
        entry.total_pop = parseInt(entry.total_pop);
        popdensdatadict[entry.name] = entry;
    });
});

d3.json("GDPdata.json", function(error, json) {
    if (error)
        return console.warn(error);
    data = json;
    GDP_data_global = data;
    for (i = 2014; i >= 1960 ; i--) {
        var x = document.getElementById("mySelect");
        var option = document.createElement("option");
        option.text = i;
        option.value = i;
        x.add(option);
    }
    var countries = Datamap.prototype.worldTopo.objects.world.geometries;
    var valid_country_ids = {}
    for (var i = 0, j = countries.length; i < j; i++) {
        valid_country_ids[countries[i].id] = countries[i].id;
    }
    drawWorldmap = function () {
        d3.select("#container1").html("");
        var e = document.getElementById("mySelect");
        year_digit = e.options[e.selectedIndex].value;
        year = 'year' + year_digit
        GDP_copy = [];
        GDP_data_global.forEach(function(entry) {
            if (entry[year] !== undefined){
                code_index = flattened_country_codes.indexOf(entry.countryname);
                if (valid_country_ids[flattened_country_codes[code_index - 1]] !== undefined) {
                    country_template = {};
                    country_template["countryname"] = entry.countryname;
                    country_template["year"] = entry[year];
                    GDP_copy.push(country_template);
                }
            }
        });
        GDP_copy.sort(function (a, b) {
            num1 = a.year;
            num2 = b.year;
            if (num1 > num2)
              return 1;
            if (num1 < num2)
              return -1;
            return 0;
        });
        datadict = {};
        colorscheme = ['#ffffd9','#edf8b1','#c7e9b4','#7fcdbb','#41b6c4','#1d91c0','#225ea8','#253494','#081d58']
        fillsdict = {defaultFill: '#D3D3D3'};
        var i = 0, c = 0, bin = GDP_copy.length / colorscheme.length;
        fillkeys = ['<' + digit2billion(GDP_copy[Math.floor(bin)].year) + ' B $']
        for (x = Math.floor(bin); x < GDP_copy.length - (2 * Math.floor(bin)); x += Math.floor(bin)) {
            fillkeys.push(digit2billion(GDP_copy[x].year) + '-' + digit2billion(GDP_copy[x + Math.floor(bin)].year)+ ' B $' )
        }
        fillkeys.push('>' + digit2billion(GDP_copy[GDP_copy.length - Math.floor(bin)].year) + ' B $')
        fillkeys.forEach(function(key) {
            fillsdict[key] = colorscheme[c];
            c++;
        });
        GDP_copy.forEach(function(entry) {
            code_index = flattened_country_codes.indexOf(entry.countryname);
            country_code = flattened_country_codes[code_index - 1];
            entry.fillKey = fillkeys[Math.floor(i/bin)];
            datadict[country_code] = entry;
            i++;
        });
        var myMap = new Datamap({
            scope: 'world',
            element: document.getElementById('container1'),
            fills: fillsdict,
            data: datadict,
            geographyConfig: {
                borderColor: 'rgba(0,0,0,0.3)',
                highlightFillColor: 'rgba(252, 78, 42,1)',
                highlightBorderColor: 'rgba(0,0,0,0.9)',
                popupTemplate: function(geo, data) {
                    if (!data) {
                        return ['<div class="hoverinfo">',
                        '<strong>' + geo.properties.name + '</strong>: N/A',
                        '</div>'].join('');
                        }
                    return ['<div class="hoverinfo">',
                    '<strong>' + data.countryname + '</strong><br/>',
                    Math.round((data.year / 1000000000)*100)/100 + ' billion US $<br/>',
                    '</div>'].join('');
                    }
                },
            done: function(datamap) {
                datamap.svg.selectAll('.datamaps-subunit').on('click', function(geography) {
                    code_index = flattened_country_codes.indexOf(geography.id);
                    country_name = flattened_country_codes[code_index + 1];
                    drawBirthGraph(country_name);
                });
            }
        });
        myMap.legend();
        document.getElementsByClassName('datamaps-legend')[0].style.top =
            (document.getElementsByClassName('datamap')[0].height.baseVal.value - 15) + 'px';
        document.getElementsByClassName('datamaps-legend')[0].style.left =
            (document.getElementsByClassName('datamap')[0].width.baseVal.value)/2 - document.getElementById('tooltip').offsetWidth  + 'px';
    };
    drawWorldmap();
});

d3.json("fertility.json", function(error, json) {
    if (error)
        return console.warn(error);
    birthrates = json;
    birthrates_dict = {};
    birthrates.forEach(function(entry) {
        template = [];
        for (var property in entry) {
            if (entry.hasOwnProperty(property)) {
                year = String(property).slice(4, 8)
                if (!isNaN(year)){
                    yearly_birthrate = []
                    yearly_birthrate.push(year);
                    yearly_birthrate.push(entry[property]);
                    template.push(yearly_birthrate);
                }
            }
        }
        birthrates_dict[entry.countryname] = template;
    });
});

var drawBirthGraph = function (country) {
    country_data = birthrates_dict[country]
    if (country_data === undefined){
        console.log(country);
        return d3.select("#container2").html(""), d3.select("#tooltipcontainer").html("");
    }
    d3.select("#container2").html(""), d3.select("#tooltipcontainer").html("");
    dataPoints = [];
    country_data.forEach(function(entry) {
        var date = new Date(entry[0]);
        var birthrate = entry[1];
        dataPoints.push(new dataPoint(date, birthrate));
    });
    var format = d3.time.format("%Y");
    var padding = {top: 25, right: 0, bottom: 30, left: 30};
    var width = 960 - padding.left - padding.right;
    var height = 240 - padding.top - padding.bottom;
    var xDomain = d3.extent(dataPoints, function(d) { return d.date; });
    var yDomain = d3.extent(dataPoints, function(d) { return d.birthrate; });
    var xScale = d3.time.scale().range([0, width]).domain(xDomain);
    //var yScale = d3.scale.linear().range([height, 0]).domain(yDomain);
    var yScale = d3.scale.linear().domain([0, 10]).range([height, 0]);
    var xAxis = d3.svg.axis().scale(xScale).orient('bottom');
    var yAxis = d3.svg.axis().scale(yScale).orient('left');
    var lineFunction = d3.svg.line()
        .x(function(d) { return xScale(d.date); })
        .y(function(d) { return yScale(d.birthrate); });
    var svg = d3.select("#container2").append("svg")
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
        .text("Fertility (births per woman)");
    svg.append("path").datum(dataPoints).attr("class", "line").attr("d", lineFunction);
    var crosshair = svg.append('g').style('display', 'none');
    crosshair.append('circle').attr('id', 'crosshair_Circle').attr('r', 5).attr('class', 'crosshair_Circle');
    var date2index = d3.bisector(function(d) { return d.date; }).left;
    var tooltip = svg.append('svg:text').attr('class', 'textinfo');
    var svg2 = d3.select("#tooltipcontainer").append("svg")
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
                var d = mouseDate - d0.date > d1.date - mouseDate ? d1 : d0;
                var x = xScale(d.date);
                var y = yScale(d.birthrate);
                crosshair.select('#crosshair_Circle')
                    .attr('cx', x)
                    .attr('cy', y);
                drawTooltip(d.date, d.birthrate);
            }
        });
    var title = svg2.append("text")
    title
        .attr("x", 0)
        .attr("y", 20)
        .attr("text-anchor", "left")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text(country);
    if (popdensdatadict[country] !== undefined)
    {
        var area = svg2.append("text")
        area
            .attr("x", 25)
            .attr("y", 75)
            .attr("text-anchor", "left")
            .style("font-size", "15px")
            .text('Area: ' + popdensdatadict[country].area + ' km\xB2');
        var pop_dens = svg2.append("text")
        pop_dens
            .attr("x", 25)
            .attr("y", 100)
            .attr("text-anchor", "left")
            .style("font-size", "15px")
            .text('Population density: ' + popdensdatadict[country].pop_dens + ' per km\xB2');
        var total_pop = svg2.append("text")
        total_pop
            .attr("x", 25)
            .attr("y", 125)
            .attr("text-anchor", "left")
            .style("font-size", "15px")
            .text('Total population: ' + popdensdatadict[country].total_pop);
    }
    var setVisible = function() {
        d3.select('.textinfo').style('visibility', 'visible');
	};
	var drawTooltip = function(date, birthrate) {
	    var timer;
        clearTimeout(timer);
        timer = setTimeout(setVisible, 2000);
        tooltip
            .attr("x", xScale(date) + 10)
            .attr("y", yScale(birthrate))
            .attr("dx", -5)
            .attr("dy", -5)
            .attr("text-anchor", "start")
            .text(format(date) + ', ' + birthrate + ' births per woman, ')
            .attr("fill", "black")
            .style("font-size","15px")
            .style("font-weight", "bold")
            .style('visibility', 'hidden');
        if (xScale(date) > width/2) {
                tooltip.attr("x", xScale(date) - 5)
                tooltip.attr("text-anchor", "end")
            }
	};
};