/**
 * 
 */
function getTotal(collection){
	$.ajax({
		type : 'POST',
		url : "GetTotal?collection=" + collection,
		dataType : 'json',
		success : function(result) {

			d3.select("#"+result.collezione).html(result.totale);
			console.log(result);

		},
		error : function(result) {
			alert("error in retrieving data from the database. " + result);
			console.log("risultato: "+result)
		}
	});
}
// chiama i totali TODO: le collezioni si devono chiamare incidenti, veicoli e persone
getTotal("veicoli");
getTotal("persone");
getTotal("incidenti");