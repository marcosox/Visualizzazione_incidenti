
var municipi = [];
var coor = [];
var strade = [];
var veicoli = [];
var persone = [];

var poligono1;
var poligono2;
var poligono3;
var top10 = [];
var vertici;
var strada;
var polilinea;

var bound = new google.maps.LatLngBounds();
var bound1 = new google.maps.LatLngBounds();
var bound2 = new google.maps.LatLngBounds();
var bound3 = new google.maps.LatLngBounds();

var infowindow = new google.maps.InfoWindow(); 
var geocoder = new google.maps.Geocoder();
var poligonoArray1 = [];    
var poligonoArray2 = [];    
var poligonoArray3 = [];    

var infoWindow=Array();
var tooltip=Array(); 

var map1;
var map2;
var map3;

var strokeColors = ["#ff0000","#ff579D","#ffCCA9","#ffA37A","#CCA95B","#AA0000","#ff9235","#AA00C3","#ff4A1B","#BB4A1B","#33FF5F","#11FF98","#9F3644","#BB969C","#0037EB"] ;
var fillColors = ["#ff0000","#ff579D","#ffCCA9","#ffA37A","#CCA95B","#AA0000","#ff9235","#AA00C3","#ff4A1B","#BB4A1B","#33FF5F","#11FF98","#9F3644","#BB969C","#0037EB"] ;



function initialize() {
//	load_totale();
//	load_dinamica();
//	load_municipi();
	initialize_1();
	initialize_2();
	initialize_3();
//	load_strade();
//	load_veicoli();
//	load_persone();
}

function initialize_1() {

	var roma;

	var mapOptions = {
			zoom: 12,
			center: roma
	}

	map1 = new google.maps.Map(document.getElementById('map_canvas_1'), mapOptions);

	geocoder.geocode( { 'address': "roma"}, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			roma = results[0].geometry.location;
			map1.setCenter(roma);
		} else {
			alert('Geocode was not successful for the following reason: ' + status);
		}
	});

	

}


function initialize_2() {

	var roma;

	var mapOptions = {
			zoom: 12,
			center: roma
	}

	map2 = new google.maps.Map(document.getElementById('map_canvas_2'), mapOptions);

	geocoder.geocode( { 'address': "roma"}, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			roma = results[0].geometry.location;
			map2.setCenter(roma);
		} else {
			alert('Geocode was not successful for the following reason: ' + status);
		}
	});


}


function initialize_3() {

	var roma;

	var mapOptions = {
			zoom: 12,
			center: roma
	}

	map3 = new google.maps.Map(document.getElementById('map_canvas_3'), mapOptions);

	geocoder.geocode( { 'address': "roma"}, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			roma = results[0].geometry.location;
			map3.setCenter(roma);
		} else {
			alert('Geocode was not successful for the following reason: ' + status);
		}
	});



}

var marker;

function geocode(street){

	var image = 'http://chart.apis.google.com/chart?chst=d_map_spin&chld=0.25|0|990000|12|_|';

	
	geocoder.geocode( { 'address': street.innerHTML+" 00100 roma" }, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			city = results[0].geometry.location;

			marker = new google.maps.Marker({
				position: city,
				map: map1,
				draggable:false,
				icon:image,
				title:street.innerHTML
			});	 
			
			bound1.extend(city);
			top10.push(marker);
			map1.fitBounds(bound1);

		} else {
			alert('Geocode was not successful for the following reason: ' + status);
		}
	});




}
function load_strade(){

	$.ajax({
		type : 'POST',
		url: "strade",
		success: function(result){
			strade = result;

		},
		complete: function () {
			var streets="<table><tr><th>indirizzo</th><th>incidenti</th></tr>" ;

			for(var i = 0; i<strade.length;i++){

				if(strade[i].strada!=undefined&&strade[i].totale!=undefined){
//					geocode(strade[i].strada);
					streets += "<tr><td onclick='geocode(this)'>"+strade[i].strada+"</td><td align='right'>"+strade[i].totale+"</td></tr>";
				}


			}
			streets +="</table>" ;

			document.getElementById("strade").innerHTML="";
			document.getElementById("strade").innerHTML=streets;

			for(var i=0;i<top10.length;i++){
				top10[i].setMap(map1);
			}

		}
	});
}

function load_veicoli(){

	$.ajax({
		type : 'POST',
		url: "veicoli",
		success: function(result){
			veicoli = result;

		},
		complete: function () {

			var cars ;
			var tipi ;

			cars = "<p> numero totale veicoli:  "+veicoli.totale+""+
			"<p> numero tipologia veicoli:  "+veicoli.tipo_veicoli.length+""+
			"<p>media veicoli coinvolti per incidente: "+veicoli.media_veicoli.toFixed(2);+"</p>";
			


			document.getElementById("veicoli").innerHTML += cars;
			createSelect(veicoli.tipo_veicoli, "tipo_veicoli", "veicolo1");
			createSelect(veicoli.tipo_veicoli, "tipo_veicoli2", "veicolo2");


		}
	});
}


function load_persone(){

	$.ajax({
		type : 'POST',
		url: "personeStats",
		success: function(result){
			persone = result;

		},
		complete: function () {

			var per ;
	
			per = "<p> numero totale persone:  "+persone.totale+""+
			"<p>eta' media persone coinvolte: "+persone.media_totale.toFixed(2);+"</p>";
			


			document.getElementById("veicoli").innerHTML += per;


		}
	});
}

function load_totale(){

	$.ajax({
		type : 'POST',
		url: "GetTotaleIncidenti",
		success: function(result){
			var per ;
			
			per = "<p> incidenti analizzati:  "+result.totale+"";

			document.getElementById("veicoli").innerHTML += per;

		},
		complete: function () {

			


		}
	});
}


function createSelect(array, div, id){

	var myDiv = document.getElementById(div);


	//Create and append select list
	var selectList = document.createElement("select");
	selectList.setAttribute("id", id);
	myDiv.appendChild(selectList);

	var opt = document.createElement("option");
	opt.setAttribute("value", "");
	opt.text = "";
	selectList.appendChild(opt);
	
	//Create and append the options
	for (var i = 0; i < array.length; i++) {
		var option = document.createElement("option");
		option.setAttribute("value", array[i].tipo);
		option.text = array[i].tipo;
		selectList.appendChild(option);
	}

}



function getStatVeicoli(){

	var v = $("#veicolo1").val();
	var v2 = $("#veicolo2").val();

	$.ajax({
		type : 'POST',
		url: "TipoIncidente?veicolo1="+v+"&veicolo2="+v2,
		success: function(result){
			document.getElementById("tot_tipo_inc").innerHTML="";
			document.getElementById("tot_tipo_inc").innerHTML="<p> trovati "
				+result.totale+" incidenti che coinvolgono: "+v+"</p><p>"+v2+"</p>";
		},
		complete: function () {}
	});


}


function load_dinamica(){
	


	var v = $("#veicolo1").val();
	var v2 = $("#veicolo2").val();

	$.ajax({
		type : 'POST',
		url: "DinamicaIncidente",
			success: function(result){ 
				
				var dinamica="<table><tr><th>Dinamica</th><th>incidenti</th></tr>" ;

				for(var i = 0; i<result.length;i++){

					if(result[i].tipo!=undefined&&result[i].totale!=undefined){
//						geocode(strade[i].strada);
						dinamica += "<tr><td>"+result[i].tipo+"</td><td align='right'>"+result[i].totale+"</td></tr>";
					}


				}
				dinamica +="</table>" ;
				
				document.getElementById("dinamica").innerHTML="";
				document.getElementById("dinamica").innerHTML=dinamica;
				
				
				
			},
		complete: function () {}
	});



	
	
}



function load_municipi(){

	$.ajax({
		type : 'POST',
		url: "municipi",
		success: function(result){
			municipi = result;
			
//			for(var i=0; i<municipi.length;i++){
//				disegnaPoligono1(municipi[i], i);
//			}


		},
		complete: function () {
 
		}
	});
}

function clearMap1(){
	for(var i=0; i<poligonoArray1.length;i++){
		poligonoArray1[i].setMap(null);
	}
}

function clearMap2(){

	for(var i=0; i<poligonoArray2.length;i++){
		poligonoArray2[i].setMap(null);
	}

}

function clearMap3(){

	for(var i=0; i<poligonoArray3.length;i++){
		poligonoArray3[i].setMap(null);
	}
}


function reloadMappa1(){

	var anno = $("#anno1").val();
	var mese = $("#mese1").val();
	var giorno = $("#giorno1").val();


	$.ajax({
		type : 'POST',
		url: "Incidenti?anno="+anno+"&mese="+mese+"&giorno="+giorno,
		success: function(result){

			var temp = municipi;

			for(var i=0; i<temp.length;i++){
				if(temp[i].numero==1){
					temp[i].incidenti = result["1"];
					temp[i].totale = result["totale"];


				}
				if(temp[i].numero==2){
					temp[i].incidenti = result["2"];
					temp[i].totale = result["totale"];

				}
				if(temp[i].numero==3){
					temp[i].incidenti = result["3"];
					temp[i].totale = result["totale"];

				}
				if(temp[i].numero==4){
					temp[i].incidenti = result["4"];
					temp[i].totale = result["totale"];

				}
				if(temp[i].numero==5){
					temp[i].incidenti = result["5"];
					temp[i].totale = result["totale"];

				}
				if(temp[i].numero==6){
					temp[i].incidenti = result["6"];
					temp[i].totale = result["totale"];

				}
				if(temp[i].numero==7){
					temp[i].incidenti = result["7"];
					temp[i].totale = result["totale"];

				}
				if(temp[i].numero==8){
					temp[i].incidenti = result["8"];
					temp[i].totale = result["totale"];

				}
				if(temp[i].numero==9){
					temp[i].incidenti = result["9"];
					temp[i].totale = result["totale"];

				}
				if(temp[i].numero==10){
					temp[i].incidenti = result["10"];
					temp[i].totale = result["totale"];

				}
				if(temp[i].numero==11){
					temp[i].incidenti = result["11"];
					temp[i].totale = result["totale"];

				}
				if(temp[i].numero==12){
					temp[i].incidenti = result["12"];
					temp[i].totale = result["totale"];

				}
				if(temp[i].numero==13){
					temp[i].incidenti = result["13"];
					temp[i].totale = result["totale"];

				}
				if(temp[i].numero==14){
					temp[i].incidenti = result["14"];
					temp[i].totale = result["totale"];

				}
				if(temp[i].numero==15){
					temp[i].incidenti = result["15"];
					temp[i].totale = result["totale"];

				}
				if(temp[i].numero==16){
					temp[i].incidenti = result["16"];
					temp[i].totale = result["totale"];

				}
				if(temp[i].numero==17){
					temp[i].incidenti = result["17"];
					temp[i].totale = result["totale"];

				}
				if(temp[i].numero==18){
					temp[i].incidenti = result["18"];
					temp[i].totale = result["totale"];	
				}	

				if(temp[i].numero==19){
					temp[i].incidenti = result["19"];
					temp[i].totale = result["totale"];		
				}

				if(temp[i].numero==20){
					temp[i].incidenti = result["20"];
					temp[i].totale = result["totale"];		
				}
			}

			clearMap1();

			for(var i=0; i<temp.length;i++){
				disegnaPoligono1(temp[i]);
			}

		},
		complete: function () {
		}
	});






}

function reloadMappa2(){

	var anno = $("#anno2").val();
	var mese = $("#mese2").val();
	var giorno = $("#giorno2").val();


	$.ajax({
		type : 'POST',
		url: "Incidenti?anno="+anno+"&mese="+mese+"&giorno="+giorno,
		success: function(result){

			var temp = municipi;

			for(var i=0; i<temp.length;i++){
				if(temp[i].numero==1){
					temp[i].incidenti = result["1"];
					temp[i].totale = result["totale"];


				}
				if(temp[i].numero==2){
					temp[i].incidenti = result["2"];
					temp[i].totale = result["totale"];

				}
				if(temp[i].numero==3){
					temp[i].incidenti = result["3"];
					temp[i].totale = result["totale"];

				}
				if(temp[i].numero==4){
					temp[i].incidenti = result["4"];
					temp[i].totale = result["totale"];

				}
				if(temp[i].numero==5){
					temp[i].incidenti = result["5"];
					temp[i].totale = result["totale"];

				}
				if(temp[i].numero==6){
					temp[i].incidenti = result["6"];
					temp[i].totale = result["totale"];

				}
				if(temp[i].numero==7){
					temp[i].incidenti = result["7"];
					temp[i].totale = result["totale"];

				}
				if(temp[i].numero==8){
					temp[i].incidenti = result["8"];
					temp[i].totale = result["totale"];

				}
				if(temp[i].numero==9){
					temp[i].incidenti = result["9"];
					temp[i].totale = result["totale"];

				}
				if(temp[i].numero==10){
					temp[i].incidenti = result["10"];
					temp[i].totale = result["totale"];

				}
				if(temp[i].numero==11){
					temp[i].incidenti = result["11"];
					temp[i].totale = result["totale"];

				}
				if(temp[i].numero==12){
					temp[i].incidenti = result["12"];
					temp[i].totale = result["totale"];

				}
				if(temp[i].numero==13){
					temp[i].incidenti = result["13"];
					temp[i].totale = result["totale"];

				}
				if(temp[i].numero==14){
					temp[i].incidenti = result["14"];
					temp[i].totale = result["totale"];

				}
				if(temp[i].numero==15){
					temp[i].incidenti = result["15"];
					temp[i].totale = result["totale"];

				}
				if(temp[i].numero==16){
					temp[i].incidenti = result["16"];
					temp[i].totale = result["totale"];

				}
				if(temp[i].numero==17){
					temp[i].incidenti = result["17"];
					temp[i].totale = result["totale"];

				}
				if(temp[i].numero==18){
					temp[i].incidenti = result["18"];
					temp[i].totale = result["totale"];	
				}	

				if(temp[i].numero==19){
					temp[i].incidenti = result["19"];
					temp[i].totale = result["totale"];		
				}

				if(temp[i].numero==20){
					temp[i].incidenti = result["20"];
					temp[i].totale = result["totale"];		
				}
			}

			clearMap2();

			for(var i=0; i<temp.length;i++){
				disegnaPoligono2(temp[i]);
			}

		},
		complete: function () {}
	});






}

function reloadMappa3(){

	var anno = $("#anno3").val();
	var mese = $("#mese3").val();
	var giorno = $("#giorno3").val();


	$.ajax({
		type : 'POST',
		url: "Incidenti?anno="+anno+"&mese="+mese+"&giorno="+giorno,
		success: function(result){

			var temp = municipi;

			for(var i=0; i<temp.length;i++){
				if(temp[i].numero==1){
					temp[i].incidenti = result["1"];
					temp[i].totale = result["totale"];


				}
				if(temp[i].numero==2){
					temp[i].incidenti = result["2"];
					temp[i].totale = result["totale"];

				}
				if(temp[i].numero==3){
					temp[i].incidenti = result["3"];
					temp[i].totale = result["totale"];

				}
				if(temp[i].numero==4){
					temp[i].incidenti = result["4"];
					temp[i].totale = result["totale"];

				}
				if(temp[i].numero==5){
					temp[i].incidenti = result["5"];
					temp[i].totale = result["totale"];

				}
				if(temp[i].numero==6){
					temp[i].incidenti = result["6"];
					temp[i].totale = result["totale"];

				}
				if(temp[i].numero==7){
					temp[i].incidenti = result["7"];
					temp[i].totale = result["totale"];

				}
				if(temp[i].numero==8){
					temp[i].incidenti = result["8"];
					temp[i].totale = result["totale"];

				}
				if(temp[i].numero==9){
					temp[i].incidenti = result["9"];
					temp[i].totale = result["totale"];

				}
				if(temp[i].numero==10){
					temp[i].incidenti = result["10"];
					temp[i].totale = result["totale"];

				}
				if(temp[i].numero==11){
					temp[i].incidenti = result["11"];
					temp[i].totale = result["totale"];

				}
				if(temp[i].numero==12){
					temp[i].incidenti = result["12"];
					temp[i].totale = result["totale"];

				}
				if(temp[i].numero==13){
					temp[i].incidenti = result["13"];
					temp[i].totale = result["totale"];

				}
				if(temp[i].numero==14){
					temp[i].incidenti = result["14"];
					temp[i].totale = result["totale"];

				}
				if(temp[i].numero==15){
					temp[i].incidenti = result["15"];
					temp[i].totale = result["totale"];

				}
				if(temp[i].numero==16){
					temp[i].incidenti = result["16"];
					temp[i].totale = result["totale"];

				}
				if(temp[i].numero==17){
					temp[i].incidenti = result["17"];
					temp[i].totale = result["totale"];

				}
				if(temp[i].numero==18){
					temp[i].incidenti = result["18"];
					temp[i].totale = result["totale"];	
				}	

				if(temp[i].numero==19){
					temp[i].incidenti = result["19"];
					temp[i].totale = result["totale"];		
				}

				if(temp[i].numero==20){
					temp[i].incidenti = result["20"];
					temp[i].totale = result["totale"];		
				}
			}

			clearMap3();

			for(var i=0; i<temp.length;i++){
				disegnaPoligono3(temp[i]);
			}

		},
		complete: function () {}
	});






}



/**
 * @param municipio
 */
function disegnaPoligono1(municipio, cont){
 
	vertici = [];	 
	var zone = municipio.coord.split("-");

	for(var i = 0; i<zone.length;i++){
		if(zone[i]!=null && zone[i].length>0){

			var cordinate = zone[i].trim().split(",");

			var poi = new google.maps.LatLng(cordinate[1], cordinate[0]);
			vertici.push(poi);
			bound1.extend(poi);

		}
	}

	  
 

	poligono1 = new google.maps.Polygon({
		paths: vertici,
		strokeColor: fillColors[8],
		strokeOpacity:.3,
		strokeWeight: 2,
		fillColor: fillColors[8],
		fillOpacity: 0.3
	});



	poligono1.setMap(map1);


	poligonoArray1.push(poligono1);


	var d = "";
	if(municipio.description!=undefined)
		d = municipio.description;
	tooltip = '<div id="tooltip" style="width:100px">'+
	'<strong>\t'+municipio.name+'</strong>'+
	'<p>'+d+'</p>'+	
	'</div>'; 
	
	createClickablePoly(poligono1, tooltip, map1);

	map1.fitBounds(bound1);


}



function disegnaPoligono2(municipio){

	vertici = [];	 
	var zone = municipio.coord.split("-");

	for(var i = 0; i<zone.length;i++){
		if(zone[i]!=null && zone[i].length>0){

			var cordinate = zone[i].trim().split(",");

			var poi = new google.maps.LatLng(cordinate[1], cordinate[0]);
			vertici.push(poi);
			bound2.extend(poi);

		}
	}

	var inc = Number(municipio.incidenti)/Number(municipio.totale)

	var op=inc;
	var n= municipio.incidenti;
	var tot = municipio.totale;
	var color = fillColors[8];

	poligono2 = new google.maps.Polygon({
		paths: vertici,
		strokeColor: color,
		strokeOpacity: op*10,
		strokeWeight: 2,
		fillColor: color,
		fillOpacity: op*10
	});



	poligono2.setMap(map2);


	poligonoArray2.push(poligono2);


	var d = "";
	if(municipio.description!=undefined)
		d = municipio.description;
	tooltip = '<div id="tooltip" style="width:100px">'+
	'<strong>\t'+municipio.name+'</strong>'+
	'<p>'+d+'</p>'+	
	'<p>numero incidenti: '+n+' su '+tot+'</p>'+	
	'</div>'; 
	createClickablePoly(poligono2, tooltip, map2);

	map2.fitBounds(bound2);


}


function disegnaPoligono3(municipio){

	vertici = [];	 
	var zone = municipio.coord.split("-");

	for(var i = 0; i<zone.length;i++){
		if(zone[i]!=null && zone[i].length>0){

			var cordinate = zone[i].trim().split(",");

			var poi = new google.maps.LatLng(cordinate[1], cordinate[0]);
			vertici.push(poi);
			bound3.extend(poi);

		}
	}

	var inc = Number(municipio.incidenti)/Number(municipio.totale)

	var op=inc;
	var n= municipio.incidenti;
	var tot = municipio.totale;
	var color = fillColors[8];

	poligono3 = new google.maps.Polygon({
		paths: vertici,
		strokeColor: color,
		strokeOpacity: op*10,
		strokeWeight: 2,
		fillColor: color,
		fillOpacity: op*10
	});



	poligono3.setMap(map3);


	poligonoArray3.push(poligono3);


	var d = "";
	if(municipio.description!=undefined)
		d = municipio.description;
	tooltip = '<div id="tooltip" style="width:100px">'+
	'<strong>\t'+municipio.name+'</strong>'+
	'<p>'+d+'</p>'+	
	'<p>numero incidenti: '+n+' su '+tot+'</p>'+	
	'</div>'; 
	createClickablePoly(poligono3, tooltip, map3);

	map3.fitBounds(bound3);


}


function createClickablePoly(poly, html, map) {
	var infowindow = new google.maps.InfoWindow();
	var contentString = html;
	google.maps.event.addListener(poly,'click', function(event) {
		infowindow.setContent(contentString);
		if (event) {
			point = event.latLng;
		}
		infowindow.setPosition(point);
		infowindow.open(map);
		infoWindow.push(infowindow);
	});
}


