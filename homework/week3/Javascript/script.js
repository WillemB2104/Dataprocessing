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
		return alpha * (x - domain[0]) + beta;
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

var canv_xMin = 20;
var canv_xMax = document.getElementById("canvas").width - 20;
var canv_yMin = 20;
var canv_yMax = document.getElementById("canvas").height - 20;

var x_transform = createTransform([inp_xMin, inp_xMax], [canv_xMin, canv_xMax]);
var y_transform = createTransform([inp_yMin, inp_yMax], [canv_yMin, canv_yMax]);
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

// draw data
ctx.moveTo(x_transform(dataPoints[0].x.getTime()),y_transform(dataPoints[0].y));
for (var i = 0; i < dataPoints.length; i++) {
	ctx.lineTo(x_transform(dataPoints[i].x.getTime()),y_transform(dataPoints[i].y));
}
ctx.stroke();

ctx.beginPath();
ctx.moveTo(document.getElementById("canvas").width - 10,y_transform(0))
ctx.lineWidth = 2;
ctx.lineTo(10,y_transform(0));
ctx.stroke();

ctx.beginPath();
ctx.moveTo(10,10);
ctx.lineWidth = 2;
ctx.lineTo(10,document.getElementById("canvas").height - 10);
ctx.stroke();

//making a circle = arc with angles 0, 2pi , arc(x1,y1,r,01,02,direction)
//stroke OR fill