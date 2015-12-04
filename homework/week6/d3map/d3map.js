/*
    D3 - Interactive map,  Week 6
    10209735 - Willem Bruin

    Resources used:
    Markmarkoh's Ongoing military conflicts datamap - example: http://bl.ocks.org/markmarkoh/4127667
*/

var flattened_country_codes = country_codes.reduce(function(a, b) {
        return a.concat(b);
    });


var dataPoint = function (x, y) {
  this.date = x;
  this.temperature = y;
};

d3.json("data.json", function(error, json) {
    if (error)
        return console.warn(error);
    data = json;
    data.sort(function (a, b) {
        num1 = parseInt(a.pop_dens);
        num2 = parseInt(b.pop_dens);
        if (num1 > num2)
          return 1;
        if (num1 < num2)
          return -1;
        return 0;
    });
    datadict = {};
    colorscheme = ['#ffffcc','#ffeda0','#fed976','#feb24c','#fd8d3c','#fc4e2a','#e31a1c','#bd0026','#800026']
    fillsdict = {defaultFill: '#D3D3D3'};
    var i = 0, c = 0, bin = data.length / colorscheme.length;
    fillkeys = ['<'+data[Math.floor(bin)].pop_dens]
    for (x = Math.floor(bin); x < data.length - (2 * Math.floor(bin)); x += Math.floor(bin)) {
        fillkeys.push(data[x].pop_dens + '-' + data[x + Math.floor(bin)].pop_dens)
    }
    fillkeys.push('>' + data[data.length - Math.floor(bin)].pop_dens)
    fillkeys.forEach(function(key) {
        fillsdict[key] = colorscheme[c];
        c++;
    });
    data.forEach(function(entry) {
        code_index = flattened_country_codes.indexOf(entry.name);
        country_code = flattened_country_codes[code_index - 1];
        entry.fillKey = fillkeys[Math.floor(i/bin)];
        entry.area = parseInt(entry.area);
        entry.pop_dens = parseInt(entry.pop_dens);
        entry.total_pop = parseInt(entry.total_pop);
        datadict[country_code] = entry;
        i++;
    });

    var myMap = new Datamap({
        scope: 'world',
        element: document.getElementById('container1'),
        projection: "mercator",
        geographyConfig: {
            borderColor: 'rgba(255,255,255,0.3)',
            highlightFillColor: 'rgba(63, 191, 63,1)',
            highlightBorderColor: 'rgba(0,0,0,0.5)',
            popupTemplate: function(geo, data) {
                if (!data) {
                    return ['<div class="hoverinfo">',
                    '<strong>' + geo.properties.name + '</strong>: N/A',
                    '</div>'].join('');
                    }
                return ['<div class="hoverinfo">',
                '<strong>' + data.name + '</strong><br/>',
                'Area (km): ' + data.area + '<br/>',
                'Total population: ' + data.total_pop + '<br/>',
                'Population density:' + data.pop_dens + '<br/>',
                '</div>'].join('');
                }
            },
        fills: fillsdict,
        data: datadict,
    });
    myMap.legend();
});