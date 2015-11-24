var dataPoint = function (total_pop, pop_density, country_code, area, name) {
  this.total_pop = total_pop;
  this.pop_density = pop_density;
  this.country_code = country_code;
  this.area = area;
  this.name = name;
};

/* use this to test out your function */
window.onload = function() {
    removeStyle();
    dataPoints = loadData();
    drawData(dataPoints);
}

/* changeColor takes a path ID and a color (hex value) and changes that path's fill color */
function changeColor(datapoint, color) {
    id = datapoint.country_code
    document.getElementById(id).style.fill = color;
    document.getElementById(id).addEventListener("mouseover", function() { this.style.fill = "#99182C"});
    document.getElementById(id).addEventListener("mouseout", function() { this.style.fill = color});
    document.getElementById(id).addEventListener("click", function() {
        document.getElementById('tooltip').style.visibility = 'visible';
        document.getElementById('tooltip').textContent = datapoint.name + ", area = " + datapoint.area +
        " km\xB2, total population = " + datapoint.total_pop + ", population density = " + datapoint.pop_density
        + " per km\xB2";
        });
}

/* removes color formatting from SVG path's */
function removeStyle() {
    var array = document.getElementsByTagName('path')
    for (var i in array) {
        if(!isNaN(i)){
            array[i].style.fill = "#EBEBEB";
            array[i].style.stroke = ""
        }
    }
}

/* loads html JSON data into an array */
function loadData(){
    // flatten list to facilitate search for country name
    var flattened_country_codes = country_codes.reduce(function(a, b) {
        return a.concat(b);
    });
    // iterate through JSON and save data in new array dataPoints
	var jsonObj = JSON.parse(document.getElementById("JSON").innerHTML)
	dataPoints = [];
	jsonObj.forEach(function(entry) {
        code_index = flattened_country_codes.indexOf(entry.name)
        country_code = flattened_country_codes[code_index - 2]
        // only acquire data of countries having a valid country code and an area surface larger than 500 /km2
        if (country_code && entry.area > 500 ){
            dataPoints.push(new dataPoint(entry.total_pop, entry.pop_dens, country_code, entry.area, entry.name));
        }
	});
	return dataPoints;
}

/* returnColor calculates RGB in white to red gradient based on given intensity (float between 0 - 1*/
function returnColor(intensity) {
    r_rgb = "FF";
    g_rgb = Math.ceil(255 - (255 * intensity)).toString(16);
    if (g_rgb.length == 1){
        g_rgb = "0" + g_rgb;
    }
    b_rgb = Math.ceil(255 - (255 * intensity)).toString(16);
    if (b_rgb.length == 1){
        b_rgb = "0" + b_rgb;
    }
    color = '#' + r_rgb + g_rgb + b_rgb;
    return color;
}

/* Iterate through data point array and apply corresponding data and color value to svg elements */
function drawData(dataPoints) {
    //get min and max and take its root to acquire normalised scaling
    min = Math.min.apply(Math,dataPoints.map(function(d){return d.pop_density;}));
    max = Math.max.apply(Math,dataPoints.map(function(d){return d.pop_density;}));
    root_min = Math.sqrt(min);
    root_max = Math.sqrt(max);
    range = root_max - root_min;
    for (var i = 0; i < dataPoints.length; i++) {
        intensity = (Math.sqrt(dataPoints[i].pop_density) - root_min)/ range;
        color = returnColor(intensity);
	    changeColor(dataPoints[i], color);
	    document.getElementById(dataPoints[i].country_code).style.stroke = "#000000";
    }
    addLegend(min,max);
}

/* adds legend to canvas, population densities were transformed with root transformation to acquire
 more red to white color contrast*/
function addLegend(min,max) {
    var canvas = document.getElementById('legend');
    var ctx = canvas.getContext('2d');
    var x0 = 0;
    var y0 = 20;
    var x1 = 20;
    var y1 = canvas.height - (y0*2);
    var grd = ctx.createLinearGradient(x0,y0,x1,y1);
    grd.addColorStop(0,"#FF0000");
    grd.addColorStop(1,"#FFFFFF");
    ctx.fillStyle=grd;
    ctx.fillRect(canvas.width-100,y0,x1,y1);
    ctx.rect(canvas.width-100,y0,x1,y1);
    ctx.lineWidth = 2;
    ctx.stroke();
    // add labels
    ctx.font = "15px Courier New, sans-serif";
    ctx.fillStyle = 'black';
    var amount = 20;
    var root_min = Math.sqrt(min);
    var root_max = Math.sqrt(max);
    var range = root_max - root_min;
    for (var i = 0; i <= amount; i++) {
        var intensity = 1 - i*(1.0/amount)
        var pop_density = Math.ceil(Math.pow((intensity * range) + root_min,2))
        var y_pos = (i*y1/amount*1.0) + y0
        ctx.fillText(pop_density, canvas.width-60, y_pos);
        ctx.beginPath();
		ctx.moveTo(canvas.width-100,y_pos);
		ctx.lineTo(canvas.width-100 + x1, y_pos);
		ctx.stroke();
    }
}