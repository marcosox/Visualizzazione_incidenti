/**
 * legge i dati dal database e chiama la funzione di popolamento della chart passandogli il risultato.
 */

function getCount(collection, field, limit) {
	$.ajax({
		type : 'POST',
		url : "GetCount?collection=" + collection + "&field=" + field +"&limit=" + limit,
		dataType : 'json',
		success : function(result) {

			draw(result);	// chiama draw e visualizza i dati

		},
		error : function(result) {
			alert("Error in retrieving data from the database. ");
			//console.log(result); //"Data fetch from db failed: "+
		}
	});
}


/**
 * qui inizia il codice di inizializzazione della chart
 */
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
	var collectionName = selection.split("-")[0];	// prendi il nome della collezione
	var fieldName = selection.split("-")[1];	
	
	var limit = d3.select("#limit")[0][0].value	// prendi il nome del campo su cui aggregare
	if(limit<=0 || limit>=100){
		alert("invalid limit!");	// should never happen
	}
	if(collectionName!="" && fieldName!=""){
		if(fieldName=="ora"){
			d3.select("#limit")[0][0].value = 24;
			limit=24;
		}
		if(fieldName=="mese"){
			d3.select("#limit")[0][0].value = 12;
			limit=12;
		}
		if(fieldName=="giorno"){
			d3.select("#limit")[0][0].value = 31;
			limit=31;
		}
		getCount(collectionName, fieldName, limit);			// chiama getCount
		d3.select(".x.axis").selectAll("g").selectAll("text").attr("y","0");
	}
}

/**
 * Disegna sulla chart i dati passati con il parametro result
 * @param result i dati da mostrare
 */
function draw(result){
	
	var svg = d3.select("#maing");

	result.forEach(function(d) {
		d.count = +d.count;	// converte in int
	});

	x.domain(result.map(function(d) {
		return d._id;					// assegna il dominio x alle label
	}));
	y.domain([ 0, d3.max(result, function(d) {
		return d.count;					// dominio y ai valori count
	}) ]);
	svg.html("");		// cancella eventuali chart precedenti

	svg.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(0," + height + ")")
	.call(xAxis)
	.selectAll("text")
	.style("text-anchor", "end")
	.attr("dx", "-.7em")	//-.7em
	.attr("dy", ".15em")	//.15em
	.attr("y","0")	// non ne vuole sapere
	.attr("transform", function(d) {
		return "rotate(-90)";
	})
	.append("svg:title")
	.text(function(d){
		return d;
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
		return d._id+": "+d.count;
	});
	
	d3.select("#sort").on("change", change);	// listener per la checkbox di sort
	change();

	d3.select(".x.axis").selectAll("g").selectAll("text").attr("y","0");
	console.log(d3.select(".x.axis").selectAll("g").selectAll("text").attr("y"));	// qui cambia ma poi sparisce

	/**
	 * La funzione che gestisce la transizione durante il sorting
	 */
	function change() {

		// Copy-on-write since tweens are evaluated after a
		// delay.
		var x0 = x.domain(
				result.sort(						// sort dei valori
				d3.select("#sort")[0][0].checked ? function(a, b) {		// se e' checked...
					return b.count - a.count;		// ordini per count
				} : function(a, b) {				//... altrimenti
					return d3.ascending(a._id, b._id);	// ordini per id (alfabetico)
				})
		.map(function(d) {
					return d._id;
		})).copy();

		svg.selectAll(".bar").sort(function(a, b) {		// sort delle barre
			return x0(a._id) - x0(b._id);
		});

		var transition = svg.transition().duration(500), delay = function(
				d, i) {		// transizione
			return i * 50;
		};

		transition.selectAll(".bar").delay(delay).attr("x", function(d) {
			return x0(d._id);	// delay sulla transizione delle barre
		});

		transition.select(".x.axis").call(xAxis).selectAll("g")
				.delay(delay);	// delay per la transizione delle thick sull'asse x
		
		d3.select(".x.axis").selectAll("g").selectAll("text").attr("text-anchor", "end");
		d3.select(".x.axis").selectAll("g").selectAll("text").attr("y","0") // non lo fa.
		.attr("dx", "-.7em")
		.attr("dy", ".15em")
		.attr("transform", function(d) {
			return "rotate(-90)";
		});	// riconfigura il testo altrimenti finisce a meta' dell'asse x
	}
}