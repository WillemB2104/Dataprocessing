var dataPoint = function (date, temperature) {
  this.x = date;
  this.y = temperature;
};

function createTransform(domain, range){
	// domain is a two-element array of the domain's bounds
	// range is a two-element array of the range's bounds
	// implement the actual calculation here
	var beta = range[0];
	var alpha = (range[1] - range[0]) / (domain[1] - domain[0])
	return function(x){
		return alpha * (x - domain[0])+ beta;
	};
}
var lines = document.getElementById("rawdata").textContent.split('\n');
dataPoints = [];
lines.forEach(function(entry) {
    var line = entry.split('\t')
    var date = new Date(line[0])
    var temp = line[1]
    var current = new dataPoint(date,temp)
    dataPoints.push(current)
});

var inp_xMin = dataPoints[0].x.getTime();
var inp_xMax = dataPoints[(dataPoints.length)-1].x.getTime();
var inp_yMin = Math.min.apply(Math,dataPoints.map(function(d){return d.y;}));
var inp_yMax = Math.max.apply(Math,dataPoints.map(function(d){return d.y;}));

var canv_xMin = 0;
var canv_xMax = document.getElementById("canvas").width;
var canv_yMin = 0;
var canv_yMax = document.getElementById("canvas").height;

var x_transform = createTransform([inp_xMin, inp_xMax], [canv_xMin, canv_xMax]);
var y_transform = createTransform([inp_yMin, inp_yMax], [canv_yMin, canv_yMin]);

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

start_x = x_transform(dataPoints[0].x.getTime());
start_y = y_transform(dataPoints[0].y);
ctx.moveTo(0,0);
//ctx.moveTo(x_transform(dataPoints[0].x.getTime()),y_transform(dataPoints[0].y));
ctx.lineTo(200,100);
ctx.stroke();