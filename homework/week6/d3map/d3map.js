/*
    D3 - Interactive map,  Week 6
    10209735 - Willem Bruin

    Resources used:
    Markmarkoh's Ongoing military conflicts datamap - example: http://bl.ocks.org/markmarkoh/4127667
*/

var flattened_country_codes = country_codes.reduce(function(a, b) {
        return a.concat(b);
    });

d3.json("data.json", function(error, json) {
    if (error)
        return console.warn(error);
    data = json;
    datadict = {};
    fillsdict = {
         defaultFill: '#D3D3D3'
    };
    data.forEach(function(entry) {
        code_index = flattened_country_codes.indexOf(entry.name);
        country_code = flattened_country_codes[code_index - 1];
        entry.fillKey = entry.name;
        entry.area = parseInt(entry.area)
        entry.pop_dens = parseInt(entry.pop_dens)
        entry.total_pop = parseInt(entry.total_pop)
        datadict[country_code] = entry;
    });
    var max = Math.max.apply(null, Object.keys(datadict).map(function(e) { return datadict[e]['pop_dens'];}));
    var min = Math.min.apply(null, Object.keys(datadict).map(function(e) { return datadict[e]['pop_dens'];}));
    var root_max = Math.sqrt(max);
    var root_min = Math.sqrt(min);
    var range = root_max - root_min;

    for (key in datadict) {
        intensity = (Math.sqrt(datadict[key].pop_dens) - root_min)/ range;
        color = returnColor(intensity);
        fillsdict[datadict[key].fillKey] = color;
    }
    /* returnColor calculates RGB in white to red gradient based on given intensity (float between 0 - 1*/
    function returnColor(intensity) {
        r_rgb = "ff";
        g_rgb = Math.ceil(220 - (220 * intensity)).toString(16);
        if (g_rgb.length == 1){
            g_rgb = "0" + g_rgb;
        }
        b_rgb = Math.ceil(220 - (220 * intensity)).toString(16);
        if (b_rgb.length == 1){
            b_rgb = "0" + b_rgb;
        }
        color = '#' + r_rgb + g_rgb + b_rgb;
        return color;
    }

    myMap = $("#container1").datamap({
        scope: 'world',
        element: document.getElementById('container1'),
        geography_config: {
            borderColor: 'rgba(255,255,255,0.3)',
            highlightBorderColor: 'rgba(0,0,0,0.5)',
            popupTemplate: _.template([
                '<div class="hoverinfo">',
                '<% if (data.name) { %>',
                '<strong><%= data.name %></strong><br/>',
                'Area (km): <%= data.area %><br/>',
                'Total population: <%= data.total_pop %><br/>',
                'Population density: <%= data.pop_dens %><br/> <% } else { %>',
                '<%= geography.properties.name %>  <% } %>',
                '</div>'
            ].join('') )
        },
        fills: fillsdict,
        data: datadict
    });
});