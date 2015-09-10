(function(app) {

	app.fillColors = [ "#ff0000", "#ff579D", "#ffCCA9", "#ffA37A", "#CCA95B", "#AA0000", "#ff9235", "#AA00C3",
			"#ff4A1B", "#BB4A1B", "#33FF5F", "#11FF98", "#9F3644", "#BB969C", "#0037EB" ];
	app.poligonoArray1 = [];
	app.municipi;
	app.infoWindow = [];
	app.scaleAnno = d3.scale.linear().domain([ 0, 1 ]).range([ .1, .9 ]);
	app.scaleMese = d3.scale.linear().domain([ 0, 1 ]).range([ .1, .7 ]);
	app.scaleGiorno = d3.scale.linear().domain([ 0, 1 ]).range([ .1, .5 ]);

	/**
	 * chiude tutte le infowindows aperte
	 */
	app.closeAllInfoWindows = function() {
		for (i = 0; i < app.infoWindow.length; i++) {
			app.infoWindow[i].close(); // chiude le infowindow
		}
	}
	/**
	 * pulisce la mappa dai poligoni
	 */
	app.clearMap = function() {
		app.closeAllInfoWindows();
		for (var i = 0; i < app.poligonoArray1.length; i++) {
			app.poligonoArray1[i].setMap(null);
		}
		app.poligonoArray1 = [];

	}
	/**
	 * resetta i conteggi degli incidenti
	 */
	app.resetValues = function() {
		for (i = 0; i < app.municipi.length; i++) {
			app.municipi[i].incidenti = 0;
			app.municipi[i].totale = 0;
		}
	}

	/**
	 * crea le infowindow
	 */
	app.createClickablePoly = function(poly, html, map) {
		var infowindow = new google.maps.InfoWindow();

		var contentString = html;
		google.maps.event.addListener(poly, 'click', function(event) {
			infowindow.setContent(contentString);
			if (event) {
				point = event.latLng;
			}
			infowindow.setPosition(point);
			infowindow.open(map);
			app.infoWindow.push(infowindow);
		});
	}
	/**
	 * carica la mappa
	 */
	app.loadMap = function() {
		var roma;

		var mapOptions = {
			zoom : 10,
			center : roma
		};

		map1 = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

		var geocoder = new google.maps.Geocoder();

		geocoder.geocode({
			'address' : "roma"
		}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				roma = results[0].geometry.location;
				map1.setCenter(roma);
			} else {
				alert('Geocode was not successful for the following reason: ' + status);
			}
		});

	};

	app.loadMunicipi = function() {

		$.ajax({
			type : 'POST',
			url : "Municipi",
			dataType : 'json',
			success : function(result) {
				result.sort(function(a, b) {
					return (a.numero - b.numero);
				});
				app.municipi = result;
				app.loadIncidenti(); // mostra gli incidenti subito
			},
			error : function(result) {
				console.log("Error retrieving municipi");
				console.log(result);
			},
			complete : function() {
			}
		});
	};

	/**
	 * carica lo script
	 */
	app.loadScript = function() {

		if (document.getElementById("google") != null || document.getElementById("google") != undefined) {
			// se google gia' esiste...
			app.loadMap(); // carica mappa
			app.loadMunicipi(); // carica municipi
		} else { // altrimenti crea lo script
			// alert("script non trovato, lo creo");
			var script = document.createElement('script'); // TODO: e'
															// possibile creare
															// lo script nel
															// container?
			script.id = "google";
			script.type = 'text/javascript';
			script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&' + 'callback=app.loadMap';
			document.body.appendChild(script);
			app.loadMunicipi();
		}

	};

	/**
	 * disegna i municipi cliccabili
	 * 
	 * @param municipio
	 */
	app.drawPoli = function(municipio, cont, tipo) {

		vertici = [];
		bound1 = new google.maps.LatLngBounds();

		var zone = municipio.coord.split("-");

		for (var i = 0; i < zone.length; i++) {
			if (zone[i] != null && zone[i].length > 0) {

				var cordinate = zone[i].trim().split(",");

				var poi = new google.maps.LatLng(cordinate[1], cordinate[0]);
				vertici.push(poi);
				bound1.extend(poi);

			}
		}

		var inc = Number(municipio.incidenti) / Number(municipio.totale)

		var op;

		if (tipo == 1)
			op = app.scaleAnno(inc * 10).toFixed(1);
		else if (tipo == 2)
			op = app.scaleMese(inc * 10).toFixed(1);
		else if (tipo == 3)
			op = app.scaleGiorno(inc * 10).toFixed(1);

		var n = municipio.incidenti;
		var tot = municipio.totale;
		var color = app.fillColors[8];

		poligono1 = new google.maps.Polygon({
			paths : vertici,
			strokeColor : color,
			strokeOpacity : op,
			strokeWeight : 2,
			fillColor : color,
			fillOpacity : op
		});

		poligono1.setMap(map1);
		app.poligonoArray1.push(poligono1);

		var d = "";
		if (municipio.description != undefined)
			d = municipio.description;
		tooltip = '<div id="tooltip" style="width:100px">' + '<strong>\t' + municipio.name + '</strong>' + '<p>' + d
				+ '</p>' + '<p>numero incidenti: ' + n + ' su ' + tot + '</p>' + '</div>';

		app.createClickablePoly(poligono1, tooltip, map1);
		// map1.fitBounds(bound1);
	};

	/**
	 * Carica e mostra gli incidenti
	 */
	app.loadIncidenti = function() {

		app.clearMap();
		var anno = $("#anno").val();
		var mese = $("#mese").val();
		var giorno = $("#giorno").val();
		var ora = $("#ora").val();
		var tipo = 1;

		if (anno.length > 0) {
			if (mese.length > 0 && giorno.length == 0)
				tipo = 2;
			else if (mese.length > 0 && giorno.length > 0)
				tipo = 3;
		} else if (anno.length == 0) {
			if (mese.length > 0 && giorno.length > 0)
				tipo = 2;
		}

		$.ajax({
			type : 'POST',
			url : "GetIncidentiMunicipi?anno=" + anno + "&mese=" + mese + "&giorno=" + giorno + "&ora=" + ora,
			success : function(result) {
				// console.log("result");
				// console.log(result);
				result.sort(function(a, b) {
					return (a.municipio - b.municipio);
				});
				if (result.length == 0) {
					alert("Nessun incidente nel periodo selezionato!");
					app.clearMap();
					app.resetValues();
					return;
				}
				app.resetValues();
				var zonaMappa = app.municipi;

				for (var j = 0; j < result.length; j++) { // per ogni mun
					// riportato
					for (var i = 0; i < zonaMappa.length; i++) {
						// cicli su tutte le zone
						//console.log("i:"+i);
						numeroMunicipio = result[j].municipio;
						// console.log("numero municipio: "+numeroMunicipio);
						if (numeroMunicipio == zonaMappa[i].numero) { // quando
							// trovi una zona afferente a lui
							zonaMappa[i].incidenti = result[j]["incidenti"]; // copi
							zonaMappa[i].totale = result[j]["totale"];
						}
					}
				}

				app.clearMap();

				for (var i = 0; i < zonaMappa.length; i++) {
					if (zonaMappa[i].incidenti != 0) {
						app.drawPoli(zonaMappa[i], i, tipo);
					}
				}
				// google.maps.event.trigger(map1, 'resize');
			},
			complete : function() {
			}
		});
	};
}(window.app = window.app || {}));