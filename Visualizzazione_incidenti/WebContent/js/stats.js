/**
 * ottiene il totale e lo visualizza nel rispettivo campo nominato come la collezione
 */
function getTotal(){
	$.ajax({
		type : 'POST',
		url : "GetTotal",
		dataType : 'json',
		success : function(result) {
			
			d3.select("#veicoli").text(result.veicoli);
			d3.select("#incidenti").text(result.incidenti);
			d3.select("#persone").text(result.persone);
			var formatoMedia = d3.format(".4r");
			d3.select("#mediaVeicoli").text(formatoMedia(result.veicoli/result.incidenti));
			d3.select("#mediaPersone").text(formatoMedia(result.persone/result.incidenti));

		},
		error : function(result) {
			alert("error in retrieving data from the database. " + result);
			console.log("risultato: "+result)
		}
	});
/*	$.ajax({
		type : 'POST',
		url : "GetCount?collection=incidenti&field=strada",
		dataType : 'json',
		success : function(result) {
			var sum=0;
			for(i=0;i<result.length;i++){
				sum+=result[i].count;
			}
			console.log(sum);
			//console.log(result);	// chiama draw e visualizza i dati

		},
		error : function(result) {
			alert("Error in retrieving data from the database. ");
			//console.log(result); //"Data fetch from db failed: "+
		}
	});*/
}
// chiama i totali
getTotal();