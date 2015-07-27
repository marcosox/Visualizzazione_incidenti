/**
 * disegna il calendario annuale
 */
function refreshCalendar(result) {

	
	width = 960;
	height = 136;
	cellSize = 17; // cell size

	percent = d3.format(".1%");
	format = d3.time.format("%Y-%m-%d");

	massimo = Math.max.apply(Math,result.map(function(o){return o.count;}));
	console.log("massimo: "+massimo);
	
	color = d3.scale.quantize()
	.domain([ 0, massimo ])		// dominio valori: da 0 a 100.000 (gli incidenti sono 91.000 in tutto)
	.range(
			d3.range(8)		// range colori (8 colori)
			.map(function(d) {
		return "color-"+d;
	}));

	
	div = d3.select("#calendar-div");
	div.html("");
	svg = div.selectAll("svg")
	.data(d3.range(2012, 2015))
	.enter()
	.append("svg")		// li appende nel body...perche'?
	.attr("width", width)
	.attr("height",height)
	.attr("class", "RdYlGn")
	.append("g")
	.attr("transform","translate(" + ((width - cellSize * 53) / 2) + "," + (height - cellSize * 7 - 1) + ")");

	svg.append("text")
	.attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)")
	.style("text-anchor","middle")
	.text(function(d) {
		return d;
	});
	
	rect = svg.selectAll(".day")
	.data(function(d) {
		return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1));
	}).enter()
	.append("rect")
	.attr("class", "day")
	.attr("width", cellSize)
	.attr("height", cellSize)
	.attr("x",function(d) {
				return d3.time.weekOfYear(d) * cellSize;
			})
	.attr("y", function(d) {
		return d.getDay() * cellSize;
	})
	.datum(format);
	rect.append("title").text(function(d) {
		return d;
	});

	// disegna i mesi
	svg.selectAll(".month")
	.data(function(d) {
		return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1));
	})
	.enter()
	.append("path")
	.attr("class", "month")
	.attr("d", monthPath);
	
	// ********************************** mapping dati
	var data = d3.nest().key(function(d) {
		return d.data;
	}).rollup(function(d) {
		return d[0].count;
	}).map(result);

	rect.filter(function(d) {	// d e' la data, data[d] e' il totale
		return d in data;	// filtra in base alla data
	}).attr("class", function(d) {
		//console.log("color: "+color(data[d]));
		//return "day color-"+(data[d]+"");
		return "day "+color(data[d]);	// colora il giorno in base alla data
	}).select("title").text(function(d) {
		return d + ": " + (data[d]);
	});

	function monthPath(t0) {
		var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0), d0 = t0.getDay(), w0 = d3.time.weekOfYear(t0), d1 = t1
				.getDay(), w1 = d3.time.weekOfYear(t1);
		return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize + "H" + w0 * cellSize + "V" + 7 * cellSize + "H" + w1
				* cellSize + "V" + (d1 + 1) * cellSize + "H" + (w1 + 1) * cellSize + "V" + 0 + "H" + (w0 + 1)
				* cellSize + "Z";
	}

	 d3.select(self.frameElement).style("height", "2910px");
}

function getCounts() {
	$.ajax({
		type : 'POST',
		url : "GetDailyAccidents",
		dataType : 'json',
		success : function(result) {
			
			refreshCalendar(result);
			refreshChart(result);
		},
		error : function(result) {
			alert("Error in retrieving data from the database. ");
			// console.log(result); //"Data fetch from db failed: "+
		}
	});
}
/**
 * disegna la line chart
 */
function refreshChart(result) {
	// Set the dimensions of the canvas / graph
	var margin = {top: 30, right: 20, bottom: 30, left: 50},
	    width = 600 - margin.left - margin.right,
	    height = 270 - margin.top - margin.bottom;

	// Parse the date / time
	var parseDate = d3.time.format("%d-%b-%y").parse;

	// Set the ranges
	var x = d3.time.scale().range([0, width]);
	var y = d3.scale.linear().range([height, 0]);

	// Define the axes
	var xAxis = d3.svg.axis().scale(x)
	    .orient("bottom").ticks(5);

	var yAxis = d3.svg.axis().scale(y)
	    .orient("left").ticks(5);

	// Define the line
	var valueline = d3.svg.line()
	    .x(function(d) { return x(d.date); })
	    .y(function(d) { return y(d.close); });
	    
	// Adds the svg canvas
	var svg = d3.select("#chart-div")
	    .append("svg")
	        .attr("width", width + margin.left + margin.right)
	        .attr("height", height + margin.top + margin.bottom)
	    .append("g")
	        .attr("transform", 
	              "translate(" + margin.left + "," + margin.top + ")");

	// Get the data
	d3.csv("data.csv", function(error, data) {
	    data.forEach(function(d) {
	        d.date = parseDate(d.date);
	        d.close = +d.close;
	    });

	    // Scale the range of the data
	    x.domain(d3.extent(data, function(d) { return d.date; }));
	    y.domain([0, d3.max(data, function(d) { return d.close; })]);

	    // Add the valueline path.
	    svg.append("path")
	        .attr("class", "line")
	        .attr("d", valueline(data));

	    // Add the X Axis
	    svg.append("g")
	        .attr("class", "x axis")
	        .attr("transform", "translate(0," + height + ")")
	        .call(xAxis);

	    // Add the Y Axis
	    svg.append("g")
	        .attr("class", "y axis")
	        .call(yAxis);

	});

	
}