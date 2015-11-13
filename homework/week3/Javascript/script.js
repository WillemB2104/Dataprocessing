var dataPoint = function (date, temperature) {
  this.x = date;
  this.y = temperature;
};

var monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function loadData(){
	var lines = document.getElementById("rawdata").textContent.split('\n');
	dataPoints = [];
	lines.forEach(function(entry) {
		var line = entry.split('\t');
		var date = new Date(line[0]);
		var temp = line[1];
		var current = new dataPoint(date,temp);
		dataPoints.push(current);
	});
	return dataPoints;
}

function createTransform(domain, range){
	// domain is a two-element array of the domain's bounds
	// range is a two-element array of the range's bounds
	// implement the actual calculation here
	var beta = range[0];
	var alpha = (range[1] - range[0]) / (domain[1] - domain[0]);
	return function(x){
		return alpha * (x - domain[0]) + beta
	};
}

function drawLabels(dataPoints, rangeX, rangeY){
	// dataPoints is an array containing x and y values
	// rangeX is the amount of label tags to add to x axis
	// rangeY is the amount of label tags to add to y axis
	var xlabel_transform = createTransform([0, rangeX], [canv_xMin, canv_xMax]);
	var ylabel_transform = createTransform([0, rangeY], [canv_yMax, canv_yMin]);
	var ylabel_value = createTransform([0, rangeY], [inp_yMin, inp_yMax]);
	var scaleX = dataPoints.length / rangeX;
	var scaleY = dataPoints.length / rangeY;
	// build labels x axis
	ctx.beginPath();
	ctx.moveTo(xlabel_transform(0),ylabel_transform(0));
	ctx.lineWidth = 2;
	ctx.lineTo(xlabel_transform(0)+10,ylabel_transform(0)+10);
	ctx.stroke();
	for (var i = 0; i < rangeX; i++) {
		var xlabel = monthNames[dataPoints[Math.ceil(i*scaleX)].x.getMonth()];
		ctx.save();
		ctx.font = "16px serif";
		ctx.translate((xlabel_transform(i)+xlabel_transform(i+1))/2, ylabel_transform(-0.5));
		ctx.rotate(45 * Math.PI / 180);
		ctx.fillText(xlabel, 0, 0);
		ctx.restore();
		ctx.beginPath();
		ctx.moveTo(xlabel_transform(i+1),ylabel_transform(0));
		ctx.lineWidth = 2;
		ctx.lineTo(xlabel_transform(i+1)+10,ylabel_transform(0)+10);
		ctx.stroke();
	}
	// build labels y axis
	for (var i = 0; i <= rangeY; i++) {
		var ylabel = Math.floor(ylabel_value(i)/10)
		ctx.font = "16px serif";
		ctx.textAlign = 'center';
		ctx.fillText(ylabel, xlabel_transform(-0.5), ylabel_transform(i));

		ctx.beginPath();
		ctx.moveTo(canv_xMin - 10, ylabel_transform(i));
		ctx.lineWidth = 2;
		ctx.lineTo(canv_xMin - 20, ylabel_transform(i));
		ctx.stroke();
	}
};

// load raw data into array
var dataPoints = loadData();

// initialize data domain and canvas range globals
var padding = 80;
inp_xMin = dataPoints[0].x.getTime();
inp_xMax = dataPoints[(dataPoints.length)-1].x.getTime();
inp_yMin = Math.min.apply(Math,dataPoints.map(function(d){return d.y;}));
inp_yMax = Math.max.apply(Math,dataPoints.map(function(d){return d.y;}));
canv_xMin = padding;
canv_xMax = document.getElementById("canvas").width - padding;
canv_yMin = padding;
canv_yMax = document.getElementById("canvas").height - padding;

x_transform = createTransform([inp_xMin, inp_xMax], [canv_xMin, canv_xMax]);
y_transform = createTransform([inp_yMin, inp_yMax], [canv_yMax, canv_yMin]);
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

// draw data on canvas
ctx.moveTo(x_transform(dataPoints[0].x.getTime()),y_transform(dataPoints[0].y));
for (var i = 0; i < dataPoints.length; i++) {
	ctx.lineTo(x_transform(dataPoints[i].x.getTime()),y_transform(dataPoints[i].y));
}
ctx.stroke();

// draw x axis
ctx.beginPath();
ctx.moveTo(canv_xMin,canv_yMax);
ctx.lineWidth = 2;
ctx.lineTo(canv_xMax,canv_yMax);
ctx.stroke();

// draw y axis
ctx.beginPath();
ctx.moveTo(canv_xMin-10,canv_yMin);
ctx.lineWidth = 2;
ctx.lineTo(canv_xMin-10,canv_yMax);
ctx.stroke();

// draw labels
drawLabels(dataPoints, 12, 11);
ctx.save();
ctx.font = "18px serif";
ctx.translate(canv_xMin - padding + 20, canv_yMax/2);
ctx.rotate(270 * Math.PI / 180);
ctx.fillText("Temperature (\xB0C)", 0, 0);
ctx.restore();
ctx.font = "18px serif";
ctx.fillText("Months of the year", canv_xMax/2, canv_yMax + padding - 5);

// draw title
ctx.font = "bold 20px serif";
ctx.fillText("Temperature in de Bilt (NL) in the year 1993", canv_xMax/2, canv_yMin - padding + 20);

// draw freezing line
ctx.setLineDash([5, 15]);
ctx.beginPath();
ctx.moveTo(canv_xMin,y_transform(0));
ctx.lineWidth = 1.5;
ctx.lineTo(canv_xMax,y_transform(0));
ctx.strokeStyle = 'blue';
ctx.stroke();

// draw legend