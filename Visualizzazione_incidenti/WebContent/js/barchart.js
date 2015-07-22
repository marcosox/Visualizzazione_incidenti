/**
 * 
 */
$.ajax({
	type : 'POST',
	url : "GetCount",
	success : function(result) {
		alert("success: " + result);

	},
	complete : function() {
		alert("complete");
	}
});

var margin = {
	top : 50,
	right : 20,
	bottom : 30,
	left : 80
}, width = 960 - margin.left - margin.right, height = 500 - margin.top
		- margin.bottom;

var x = d3.scale.ordinal() // valori delle x
.rangeRoundBands([ 0, width ], .1);

var y = d3.scale.linear() // valori y
.range([ height, 0 ]);

var xAxis = d3.svg.axis().scale(x).orient("bottom");

var yAxis = d3.svg.axis().scale(y).orient("left").ticks(10, "%");

var svg = d3.select("#chart").append("svg") // TODO: anziche' appendere ogni
											// volta il svg dovrebbe riaprire la
											// pagina
.attr("width", width + margin.left + margin.right).attr("height",
		height + margin.top + margin.bottom).append("g").attr("transform",
		"translate(" + margin.left + "," + margin.top + ")");

d3.tsv("data.tsv", type, function(error, data) {
	if (error)
		throw error;

	x.domain(data.map(function(d) {
		return d.letter;
	})); // mappa le lettere all'asse x
	y.domain([ 0, d3.max(data, function(d) {
		return d.frequency;
	}) ]); // mappa le frequenze all'asse y

	svg.append("g").attr("class", "x axis").attr("transform",
			"translate(0," + height + ")").call(xAxis);

	svg.append("g").attr("class", "y axis").call(yAxis).append("text").attr(
			"transform", "rotate(-90)").attr("y", 6).attr("dy", ".71em").style(
			"text-anchor", "end").text("Frequency");

	svg.selectAll(".bar").data(data).enter().append("rect")
			.attr("class", "bar").attr("x", function(d) {
				return x(d.letter);
			}).attr("width", x.rangeBand()).attr("y", function(d) {
				return y(d.frequency);
			}).attr("height", function(d) {
				return height - y(d.frequency);
			});
});

function type(d) {
	d.frequency = +d.frequency;
	return d;
}