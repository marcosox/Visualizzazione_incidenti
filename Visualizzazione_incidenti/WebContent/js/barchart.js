/**
 * legge i dati dal database e chiama la funzione di popolamento della chart passandogli il risultato.
 */

function getCount(collection, field) {
	$.ajax({
		type : 'POST',
		url : "GetCount?collection=" + collection + "&field=" + field,
		dataType : 'json',
		success : function(result) {

			draw(result);	// chiama draw e visualizza i dati

		},
		error : function(result) {
			alert("error in retrieving data from the database. " + result);
		}
	});
}
/**
 * qui inizia il codice di inizializzazione della chart
 */
var margin = {
	top : 20,
	right : 20,
	bottom : 30,
	left : 80
};
var width = 960 - margin.left - margin.right, height = 500 - margin.top
		- margin.bottom;

//var formatPercent = d3.format(".0%");
var x = d3.scale.ordinal().rangeRoundBands([ 0, width ], .1, 1);
var y = d3.scale.linear().range([ height, 0 ]);
var xAxis = d3.svg.axis().scale(x).orient("bottom");
var yAxis = d3.svg.axis().scale(y).orient("left");//.tickFormat(formatPercent);

var svg = d3.select("#chart")
	.attr("width",width + margin.left + margin.right)
	.attr("height",height + margin.top + margin.bottom)
	.append("g")
	.attr("id", "maing")
	.attr("transform","translate(" + margin.left + "," + margin.top + ")");

/**
 * chiamata quando scegli un dato da visualizzare, chiama a sua volta la richiesta ajax
 */
function refreshChart() {

	var selection = d3.select("#menu")[0][0].value
	var collectionName = selection.split("-")[0];
	var fieldName = selection.split("-")[1];
	getCount(collectionName, fieldName);
}

/**
 * Disegna sulla chart i dati passati con il parametro result
 * @param result i dati da mostrare
 */
function draw(result){
	console.log("ok, disegno");
	console.log(result);
	
	var svg = d3.select("#maing");

	result.forEach(function(d) {
		//d.frequency = +d.frequency;
		d.count = +d.count;
	});

	x.domain(result.map(function(d) {
		//return d.letter;
		return d._id;
	}));
	y.domain([ 0, d3.max(result, function(d) {
		//return d.frequency;
		return d.count;
	}) ]);
	svg.html("");

	svg.append("g").attr("class", "x axis").attr("transform",
			"translate(0," + height + ")").call(xAxis);

	svg.append("g").attr("class", "y axis").call(yAxis).append("text")
			.attr("transform", "rotate(-90)").attr("y", 6).attr("dy",
					".71em").style("text-anchor", "end").text("Count");
	
	// console.log(sharedResults);
/*	d3.tsv("data.tsv", function(error, data) {
		//console.log(data);

		data.forEach(function(d) {
			//d.frequency = +d.frequency;
			d.count = +d.count;
		});

		x.domain(data.map(function(d) {
			//return d.letter;
			return d._id;
		}));
		y.domain([ 0, d3.max(data, function(d) {
			//return d.frequency;
			return d.count;
		}) ]);

		svg.append("g").attr("class", "x axis").attr("transform",
				"translate(0," + height + ")").call(xAxis);

		svg.append("g").attr("class", "y axis").call(yAxis).append("text")
				.attr("transform", "rotate(-90)").attr("y", 6).attr("dy",
						".71em").style("text-anchor", "end").text("Frequency");

		svg.selectAll(".bar").data(data).enter().append("rect").attr("class",
				"bar").attr("x", function(d) {
			return x(d.letter);
		}).attr("width", x.rangeBand()).attr("y", function(d) {
			return y(d.frequency);
		}).attr("height", function(d) {
			return height - y(d.frequency);
		});

		d3.select("input").on("change", change);

		var sortTimeout = setTimeout(function() {
			d3.select("input")
			// .property("checked", true)
			.each(change);
		}, 2000);

		function change() {
			clearTimeout(sortTimeout);

			// Copy-on-write since tweens are evaluated after a
			// delay.
			var x0 = x.domain(data.sort(this.checked ? function(a, b) {
				return b.frequency - a.frequency;
			} : function(a, b) {
				return d3.ascending(a.letter, b.letter);
			}).map(function(d) {
				return d.letter;
			})).copy();

			svg.selectAll(".bar").sort(function(a, b) {
				return x0(a.letter) - x0(b.letter);
			});

			var transition = svg.transition().duration(750), delay = function(
					d, i) {
				return i * 50;
			};

			transition.selectAll(".bar").delay(delay).attr("x", function(d) {
				return x0(d.letter);
			});

			transition.select(".x.axis").call(xAxis).selectAll("g")
					.delay(delay);
		}
	});*/
}