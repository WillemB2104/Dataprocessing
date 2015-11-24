/* use this to test out your function */
window.onload = function() {
    removeStyle();
 	changeColor('de','#FF1493');
 	changeColor('is','#E31230');
 	changeColor('gl','#7CFC00');
 	changeColor('tr','#CD00CD');
}

/* changeColor takes a path ID and a color (hex value)
   and changes that path's fill color */
function changeColor(id, color) {
    document.getElementById(id).style.fill = color;
}

function removeStyle() {
    // removes existing colors from SVG path's
    var array = document.getElementsByTagName('path')
    for (var i in array) {
        if(!isNaN(i)){
            array[i].style.fill = "";
        }
    }
}

