/**
 * disegna il calendario annuale
 */
function refreshYear() {
	width = 960, height = 136, cellSize = 17; // cell size

	percent = d3.format(".1%"), format = d3.time.format("%Y-%m-%d");

	color = d3.scale.quantize().domain([ -.05, .05 ]).range(
			d3.range(11).map(function(d) {
				return "q" + d + "-11";
			}));

	svg = d3.select("#year-chart").data(d3.range(2014,2015))
			.enter().append("svg").attr("width", width).attr("height", height)
			.attr("class", "RdYlGn").append("g").attr(
					"transform",
					"translate(" + ((width - cellSize * 53) / 2) + ","
							+ (height - cellSize * 7 - 1) + ")");

	svg.append("text").attr("transform",
			"translate(-6," + cellSize * 3.5 + ")rotate(-90)").style(
			"text-anchor", "middle").text(function(d) {
		return d;
	});

	rect = svg.selectAll(".day").data(function(d) {
		return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1));
	}).enter().append("rect").attr("class", "day").attr("width", cellSize)
			.attr("height", cellSize).attr("x", function(d) {
				return d3.time.weekOfYear(d) * cellSize;
			}).attr("y", function(d) {
				return d.getDay() * cellSize;
			}).datum(format);

	rect.append("title").text(function(d) {
		return d;
	});

	svg.selectAll(".month").data(function(d) {
		return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1));
	}).enter().append("path").attr("class", "month").attr("d", monthPath);

	d3.csv("dji.csv", function(error, csv) {
		if (error)
			throw error;

		var data = d3.nest().key(function(d) {
			return d.Date;
		}).rollup(function(d) {
			return (d[0].Close - d[0].Open) / d[0].Open;
		}).map(csv);

		rect.filter(function(d) {
			return d in data;
		}).attr("class", function(d) {
			return "day " + color(data[d]);
		}).select("title").text(function(d) {
			return d + ": " + percent(data[d]);
		});
	});

	function monthPath(t0) {
		var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0), d0 = t0
				.getDay(), w0 = d3.time.weekOfYear(t0), d1 = t1.getDay(), w1 = d3.time
				.weekOfYear(t1);
		return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize + "H" + w0
				* cellSize + "V" + 7 * cellSize + "H" + w1 * cellSize + "V"
				+ (d1 + 1) * cellSize + "H" + (w1 + 1) * cellSize + "V" + 0
				+ "H" + (w0 + 1) * cellSize + "Z";
	}

	//d3.select(self.frameElement).style("height", "2910px");
}
/**
 * disegna il calendario mensile
 */
function refreshMonth(result) {

}
function getCounts() {
	$.ajax({
		type : 'POST',
		url : "GetCount?collection=incidenti&field=ora",
		dataType : 'json',
		success : function(result) {
			result.sort(function(a,b){
				return a._id<=b._id?(-1):(1);
			});
			refreshDay(result);
		},
		error : function(result) {
			alert("Error in retrieving data from the database. ");
			//console.log(result); //"Data fetch from db failed: "+
		}
	});
	$.ajax({
		type : 'POST',
		url : "GetCount?collection=incidenti&field=mese",
		dataType : 'json',
		success : function(result) {
			result.sort(function(a,b){
				return a._id<=b._id?(-1):(1);
			});
			refreshMonth(result);
		},
		error : function(result) {
			alert("Error in retrieving data from the database. ");
			//console.log(result); //"Data fetch from db failed: "+
		}
	});
	$.ajax({
		type : 'POST',
		url : "GetCount?collection=incidenti&field=anno",
		dataType : 'json',
		success : function(result) {
			result.sort(function(a,b){
				return a._id<=b._id?(-1):(1);
			});
			refreshYear(result);
		},
		error : function(result) {
			alert("Error in retrieving data from the database. ");
			//console.log(result); //"Data fetch from db failed: "+
		}
	});
}
/**
 * disegna l'istogramma giornaliero
 */
function refreshDay(result) {
	
	var margin = {
			top : 20,
			right : 20,
			bottom : 240,
			left : 80
		};
		var width = 1000 - margin.left - margin.right, height = 500 - margin.top
				- margin.bottom;

		var x = d3.scale.ordinal().rangeRoundBands([ 0, width ], .1, 1);
		var y = d3.scale.linear().range([ height, 0 ]);
		var xAxis = d3.svg.axis().scale(x).orient("bottom");
		var yAxis = d3.svg.axis().scale(y).orient("left");

		var svg = d3.select("#day-chart")
			.attr("width",width + margin.left + margin.right)
			.attr("height",height + margin.top + margin.bottom)
			.append("g")
			//.attr("id", "maing")
			.attr("transform","translate(" + margin.left + "," + margin.top + ")");
		//************************************************

	result.forEach(function(d) {
		d.count = +d.count;
	});

	x.domain(result.map(function(d) {
		if(d._id=="" || d._id==null){
			d._id=0;
		}
		return d._id;					// assegna il dominio x alle label
	}));
	y.domain([ 0, d3.max(result, function(d) {
		return d.count;					// dominio y ai valori count
	}) ]);
	svg.html("");		// cancella eventuali chart precedenti

	//asse x
	svg.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(0," + height + ")")
	.call(xAxis)
	.selectAll("text")
	.style("text-anchor", "end")
	.attr("dx", "-.8em")
	.attr("dy", ".15em")
	.attr("transform","rotate(-90)")
	.append("svg:title")
	.text(function(d){
		return "Fascia oraria "+d+":00-"+(d+1)+":00";
	});

	// asse y
	svg.append("g")
	.attr("class", "y axis")
	.call(yAxis)
	.append("text")
	.attr("y", 6)
	.attr("dy",".71em")
	.attr("transform", "rotate(-90)")
	.style("text-anchor", "end")
	.text("Count");
	 
	// barre sull'asse x
	svg.selectAll(".bar")
	.data(result).enter().append("rect")
	.attr("class","bar")
	.attr("x", function(d) {
		return x(d._id);
		})
	.attr("width", x.rangeBand())
	.attr("y", function(d) {
		return y(d.count);
	})
	.attr("height", function(d) {
		return height - y(d.count);
	})
	.append("svg:title")
	.text(function(d){
		return d.count+" incidenti nella fascia oraria "+d._id+"-"+(d._id+1);
	});
}