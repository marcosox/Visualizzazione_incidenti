var dataset1; // ci salvo il risultato della request ajax 
var dataset2; 
var svg;
var svg2;
var currentSelection = {}; // global con il campo highlight
currentSelection.field = "";
currentSelection.value = "";


/**
 * legge i dati dal database e chiama la funzione di popolamento della chart passandogli il risultato.
 */
function getCount(field, limit) {
	$.ajax({
		type : 'POST',
		url : "GetCount?field=" + field +"&limit=" + limit,
		dataType : 'json',
		success : function(result) {
			dataset1 = result;
			draw();	// chiama draw e visualizza i dati

		},
		error : function(result) {
			alert("Error in retrieving data from the database. ");
			//console.log(result); //"Data fetch from db failed: "+
		}
	});
}
/**
 * legge i dati dal database e chiama la funzione di popolamento della chart passandogli il risultato.
 */
function getCountWithHighlight(field, limit) {
	$.ajax({
		type : 'POST',
		url : "GetCountWithHighlight?field=" + field +"&limit=" + limit + "&highlight-field="+ currentSelection.field + "&highlight-value="+currentSelection.value,
		dataType : 'json',
		success : function(result) {

			for(i=0;i<result.length;i++){
				result[i].count=result[i].count-result[i].highlight;
			}

			dataset2 = result;
			drawHighlightChart(dataset2);	// chiama draw e visualizza i dati

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
		bottom : 40,
		left : 80
};
var width = 1100 - margin.left - margin.right;
var height = 600 - margin.top - margin.bottom;

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


	var limit = d3.select("#limit")[0][0].value	// prendi il nome del campo su cui aggregare
	if(limit<=0 || limit>=100){
		alert("invalid limit!");	// should never happen
	}
	if( selection !=""){
		if(selection=="ora"){
			d3.select("#limit")[0][0].value = 24;
			limit=24;
		}
		if(selection=="mese"){
			d3.select("#limit")[0][0].value = 12;
			limit=12;
		}
		if(selection=="giorno"){
			d3.select("#limit")[0][0].value = 31;
			limit=31;
		}
		getCount(selection, limit);	
		// chiama getCount
	}
}

/**
 * Disegna sulla chart i dati passati con il parametro result
 * @param result i dati da mostrare
 */
function draw(){

	svg = d3.select("#maing");

	dataset1.forEach(function(d) {
		d.count = +d.count;	// converte in int
	});

	x.domain(dataset1.map(function(d) {
		return d._id;					// assegna il dominio x alle label
	}));

	y.domain([ 0, d3.max(dataset1, function(d) {
		return d.count;					// dominio y ai valori count
	}) ]);
	svg.html("");		// cancella eventuali chart precedenti

	svg.append("g")
	.attr("class", "x axis")
	.attr("id","x_axis")
	.attr("transform", "translate(0," + height + ")")
	.call(xAxis)
	.selectAll("text")
	/*.append("svg:title")
	.text(function(d){
		return d;
	})*/
	.style("text-anchor", "end")
	.attr("dx", "-.7em")	//-.7em
	.attr("dy", ".15em")	//.15em
	.attr("y","0")	// non ne vuole sapere
	.attr("transform", function(d) {
		return "rotate(-90)";
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
	.data(dataset1).enter().append("rect")
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

	// tooltip sulle label dell'asse x
	svg.selectAll("#x_axis g text").append("svg:title").text(function(d){
		return d;
	});

//	d3.select(".x.axis").selectAll("g").selectAll("text").attr("y","0");
//	console.log(d3.select(".x.axis").selectAll("g").selectAll("text").attr("y"));
	d3.selectAll(".bar").on("click", highLightItem);	// listener per la checkbox di sort
	change();// qui cambia ma poi sparisce

}
/**
 * La funzione che gestisce la transizione durante il sorting
 */
function change() {


	// Copy-on-write since tweens are evaluated after a
	// delay.
	var x0 = x.domain(
			dataset1.sort(						// sort dei valori
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

	d3.select(".x.axis").selectAll("g").selectAll("text")
	.attr("y","0") // non lo fa.
	.attr("dx", "-1em")// verticale
	.attr("dy", "-.5em") // orizzontale, non toccare
	.attr("transform", function(d) {
		return "rotate(-90)";
	})
	.style("text-anchor", "end");	// riconfigura il testo altrimenti finisce a meta' dell'asse x
}
/**
 * Funzione che gestisce la selezione di una colonna per l'highlight
 * @param d i dati della colonna: _id e value
 * @param i l'indice della colonna nella selezione
 */
function highLightItem(d,i){

	if(this.style.fill!=""){	// se clicchi su una gia' scelta, viene cancellata la selezione

		this.style.fill="";
		currentSelection.field = "";
		currentSelection.value = "";
		d3.select("#highlight-div")[0][0].style.display="none";		// nasconde la seconda chart
		return;								// cancella ed esce dalla funzione senza fare altro

	}else{												//altrimenti evidenzia la barra scelta

		d3.selectAll(".bar")[0].forEach(function(d){d.style.fill=""});	// resetta il colore di tutte le barre
		this.style.fill="red";	// evidenzia quella selezionata di rosso
		// salva le variabili necessarie
		currentSelection.field = d3.select("#menu")[0][0].value;
		currentSelection.value = d._id;
	}

	//console.log("Highlight su: "+currentSelection.field+" = "+currentSelection.value);
	refresh2();
}

/**
 * refresh la seconda chart
 */
function refresh2(){

	fieldName = d3.select("#menu2")[0][0].value	

	var limit = d3.select("#limit2")[0][0].value	// prendi il nome del campo su cui aggregare
	if(limit<=0 || limit>=100){
		alert("invalid limit!");	// should never happen
	}
	if(fieldName!=""){
		if(fieldName=="ora"){
			d3.select("#limit2")[0][0].value = 24;
			limit=24;
		}
		if(fieldName=="mese"){
			d3.select("#limit2")[0][0].value = 12;
			limit=12;
		}
		if(fieldName=="giorno"){
			d3.select("#limit2")[0][0].value = 31;
			limit=31;
		}
		d3.select("#highlight-label").html("Visualizzo <strong>"+fieldName+"</strong> evidenziando gli incidenti in cui <strong>"+currentSelection.field+"="+currentSelection.value+"</strong>");
		getCountWithHighlight(fieldName,limit);
	}
}

function drawHighlightChart(result){

	// create canvas
	d3.select("#chart2").html("");
	d3.select("#highlight-div")[0][0].style.display="";		// mostra la seconda chart       

	var width2 = 960,
	height2 = 500,
	p = [20, 50, 30, 20],

	x = d3.scale.ordinal().rangeRoundBands([0, width2 - p[1] - p[0]]),	// originale
	y = d3.scale.linear().range([0, height - p[3] - p[2]]),
	z = d3.scale.ordinal().range(["lightblue", "red"]),
	format = d3.time.format("%b");

	svg2 = d3.select("#chart2")
	.attr("width", width2)
	.attr("height", height2)
	.append("svg:g")
	.attr("transform", "translate(" + p[3] + "," + (height2 - p[2]) + ")");


	// Transpose the data into layers by cause.
	var layers = d3.layout.stack()(["count", "highlight"].map(function(valueType) {
		return result.map(function(d) {
			return {x: d._id, y: +d[valueType]};
		});
	}));


	// Compute the x-domain (by id) and y-domain (by top).
	x.domain(layers[0].map(function(d) { return d.x; }));
	y.domain([0, d3.max(layers[layers.length - 1], function(d) { return d.y0 + d.y; })]);

	// Add a group for each cause.
	var cause = svg2.selectAll("g.cause")
	.data(layers)
	.enter().append("svg:g")
	.attr("class", "cause")
	.style("fill", function(d, i) { return z(i); })
	.style("stroke", function(d, i) { return d3.rgb(z(i)).darker(); });

	// Add a rect for each date.
	var rect = cause.selectAll("rect")
	.data(Object)
	.enter().append("svg:rect")
	.attr("x", function(d) { return x(d.x); })
	.attr("y", function(d) { return -y(d.y0) - y(d.y); })
	.attr("height", function(d) { return y(d.y); })
	.attr("width", x.rangeBand())
	.append("svg:title")
	.text(function(d){
		//console.log(d);
		return d.x+": "+d.y;
	});

	// Add a label per date.
	var label = svg2.selectAll(".rule text")
	.data(x.domain())
	.enter().append("svg:text")
	.attr("x", function(d) {
		//console.log(d+" - x: "+x(d));
		return x(d) + x.rangeBand() / 2; })
		.attr("dx", function(d) { 
			//console.log(d+" - x: "+x(d));
			return x(d) + x.rangeBand() / 2; })
			//.attr("dx", "-.7em")	//-.7em
			.attr("y", 6)
			.attr("text-anchor", "end")
			.attr("dy", ".71em")
			.text( function(d){return d;})
			.attr("transform", function(d) {
				return "rotate(-90)";	//-90
			})
			.append("svg:title")
			.text(function(d){
				return d;
			});


	/*
var xAxis2 = d3.svg.axis().scale(x).orient("bottom"); 

  svg.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(0," + height2 + ")")
	.call(xAxis2)
	.selectAll("text")
	//.style("text-anchor", "end")
	.attr("dx", "0")	//-.7em
	.attr("dy", "0")	//.15em
	.attr("y","0")	// non ne vuole sapere
	//.attr("transform", function(d) {
		return "rotate(-90)";
	})
	.append("svg:title")
	.text(function(d){
		//console.log(d);
		return d;
	});

	 */
	// Add y-axis rules.
	var rule = svg2.selectAll("g.rule")
	.data(y.ticks(5))
	.enter().append("svg:g")
	.attr("class", "rule")
	.attr("transform", function(d) { return "translate(0," + -y(d) + ")"; });

	rule.append("svg:line")
	.attr("x2", width2 - p[1] - p[3])
	.style("stroke", function(d) { return d ? "#fff" : "#000"; })
	.style("stroke-opacity", function(d) { return d ? .7 : null; });

	rule.append("svg:text")
	.attr("x", width2 - p[1] - p[3])
	.attr("dy", ".35em")
	.text(function(d){return d;});
	
	

}