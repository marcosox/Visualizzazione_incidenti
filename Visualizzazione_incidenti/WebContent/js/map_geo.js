var dataset = null;
var map;
var currentMarker = null; // marker cliccato
var infoWindows = []; // in realta' ce ne dovrebbe essere una sola alla volta
// qui dentro
var markers = [];

function initMap() {
	map = new google.maps.Map(document.getElementById('mapgeo-canvas'), {
		zoom : 11,
		center : {
			lat : 41.893,
			lng : 12.482
		}
	});
	getGeocodedAccidents();
}

function closeAllInfoWindows() {
	for (i = 0; i < infoWindows.length; i++) {
		infoWindows[i].close(); // chiude le infowindow
		infoWindows[i] = null;
	}
	infoWindows = [];
}

function getGeocodedAccidents() {
	over = '<div id="overlay"><img src="loading_spinner.gif" class="ajax-loader"></div>';
	$(over).appendTo('#container');

	$.ajax({
		type : 'POST',
		url : "GetGeocodedAccidents",
		dataType : 'json',
		success : function(result) {
			dataset = result;
			myCircle = google.maps.SymbolPath.CIRCLE;
			filtraIncidenti();
		},
		error : function(result) {
			console.log("Error retrieving geocoded accidents");
			console.log(result);
		},
		complete : function() {
			$('#overlay').remove();
		}
	});
};

function getItemDetails(accidentId) {
	$.ajax({
		type : 'POST',
		url : "GetAccidentDetails?id=" + accidentId,
		dataType : 'json',
		async : false,
		success : function(result) {
			currentMarker = result;
		},
		error : function(result) {
			console.log("Error retrieving accident details");
			console.log(result);
		},
		complete : function() {
		}
	});
};

function clearMap() {
	for (var i = 0; i < markers.length; i++) {
		markers[i].setMap(null);
	}
}

function filtraIncidenti() {

	var anno = document.getElementById("anno").value;
	var municipio = document.getElementById("municipio").value;
	var daytime = document.getElementById("daytime").value;
	over = '<div id="overlay"><img src="loading_spinner.gif" class="ajax-loader"></div>';
	$(over).appendTo('#container');
	clearMap();

	for (i = 0; i < dataset.length; i++) {

		if ((municipio == "all" || municipio == dataset[i].numero_gruppo) && (anno == "all" || anno == dataset[i].anno)
				&& (daytime == "all" || daytime == dataset[i].ora)) {

			var marker = new google.maps.Marker({
				position : {
					lat : +dataset[i].lat,
					lng : +dataset[i].lon
				},
				map : map,
				title : "Incidente n." + dataset[i].protocollo,
				icon : {
					path : myCircle,
					scale : 1
				}
			});
			// console.log(marker.title);
			marco = marker;
			marker.addListener('click', function() {
				getItemDetails(this.title.substr(12));
				// console.log(currentMarker);
				closeAllInfoWindows();
				if (currentMarker != null) {
					c = currentMarker;
					infowindow = new google.maps.InfoWindow();
					contentString = "<div><b>" + c.incidente + "</b>" + "<br>Data: " + c.giorno + "-" + c.mese + "-"
							+ c.anno + "<br>Orario: " + c.ora + ":" + c.minuti + "<br>Municipio: " + c.numero_gruppo
							+ "<br>Localizzazione: " + c.strada + "<br>Coordinate: " + this.position.lat() + ", "
							+ this.position.lng() + "<br>Dinamica: " + c.dinamica + "<br>Persone (" + c.persone.length
							+ "):";
					if (c.persone.length > 0) {

						contentString += "<ul>";
						for (i = 0; i < c.persone.length; i++) {
							contentString += "<li>" + c.persone[i].sesso + " - " + c.persone[i].anno;
						}
						contentString += "</ul>";
					}
					contentString += "Veicoli (" + c.veicoli.length + "):";
					if (c.veicoli.length > 0) {

						contentString += "<ul>";
						for (i = 0; i < c.veicoli.length; i++) {
							contentString += "<li>" + c.veicoli[i].brand + " " + c.veicoli[i].model;
						}
						contentString += "</ul>";
					}
					contentString += "</div>";
					infowindow.setContent(contentString);
					infowindow.open(map, this);
					infoWindows.push(infowindow);
				}
			});
			markers.push(marker);
		}
	}
	$('#overlay').remove();
}