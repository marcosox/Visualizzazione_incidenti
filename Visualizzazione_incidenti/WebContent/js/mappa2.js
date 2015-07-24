(function(app) {

	app.loadMap = function() {
		// alert("loadMap chiamata");
		var roma;

		var mapOptions = {
			zoom : 11,
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
		alert("loadMunicipi chiamata");
		$.ajax({
			type : 'POST',
			url : "Municipi",
			dataType : 'json',
			success : function(result) {
				municipi = result;

				for (var i = 0; i < municipi.length; i++) {

					app.drawPoli(municipi[i], i);
				}
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

		if (document.getElementById("google") != null || document.getElementById("google") != undefined) { // se google gia' esiste...
			alert("trovato script");
			app.loadMap(); // carica mappa
			app.loadMunicipi(); // carica municipi
		} else { // altrimenti crea lo script
			// alert("script non trovato, lo creo");
			var script = document./* getElementById("container"). */createElement('script'); // TODO: crea lo script nel container!
			script.id = "google";
			script.type = 'text/javascript';
			script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&' + 'callback=app.loadMap';
			document.body.appendChild(script);
			app.loadMunicipi();
		}

	};

	/**
	 * @param municipio
	 */
	app.drawPoli = function(municipio, cont) {
		// alert("drawPoli");
		vertici = [];
		bound1 = new google.maps.LatLngBounds();
		poligonoArray1 = [];
		var zone = municipio.coord.split("-");

		for (var i = 0; i < zone.length; i++) {
			if (zone[i] != null && zone[i].length > 0) {

				var cordinate = zone[i].trim().split(",");

				var poi = new google.maps.LatLng(cordinate[1], cordinate[0]);
				vertici.push(poi);
				bound1.extend(poi);

			}
		}

		poligono1 = new google.maps.Polygon({
			paths : vertici,
			strokeColor : "#ffA37A",
			strokeOpacity : .3,
			strokeWeight : 2,
			fillColor : "#ffA37A",
			fillOpacity : 0.3
		});

		poligono1.setMap(map1);
		poligonoArray1.push(poligono1);
		var d = "";
		if (municipio.description != undefined)
			d = municipio.description;
		tooltip = '<div id="tooltip" style="width:100px">' + '<strong>\t' + municipio.name + '</strong>' + '<p>' + d
				+ '</p>' + '</div>';

		createClickablePoly(poligono1, tooltip, map1);

		map1.fitBounds(bound1);

	};

}(window.app = window.app || {}));
