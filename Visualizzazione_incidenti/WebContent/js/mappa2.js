(function(app) {

	app.fillColors = ["#ff0000","#ff579D","#ffCCA9","#ffA37A","#CCA95B","#AA0000","#ff9235","#AA00C3","#ff4A1B","#BB4A1B","#33FF5F","#11FF98","#9F3644","#BB969C","#0037EB"] ;


	app.poligonoArray1 = [];
	app.municipi;
	
	app.clearMap = function(){
		for(var i=0; i<app.poligonoArray1.length;i++){
			app.poligonoArray1[i].setMap(null);
		}
	}


	app.createClickablePoly = function(poly, html, map) {
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

	app.loadMap = function() {
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

		$.ajax({
			type : 'POST',
			url : "Municipi",
			dataType : 'json',
			success : function(result) {
				app.municipi = result;
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
		
		
		
		vertici = [];
		bound1 = new google.maps.LatLngBounds();
		
		var zone = municipio.coord.split("-");

		for(var i = 0; i<zone.length;i++){
			if(zone[i]!=null && zone[i].length>0){

				var cordinate = zone[i].trim().split(",");

				var poi = new google.maps.LatLng(cordinate[1], cordinate[0]);
				vertici.push(poi);
				bound1.extend(poi);

			}
		}

		var inc = Number(municipio.incidenti.incidenti)/Number(municipio.incidenti.totale)

		var op=inc;
		var n = municipio.incidenti.incidenti;
		var tot = municipio.incidenti.totale;
		var color = app.fillColors[8];
		
	

		poligono1 = new google.maps.Polygon({
			paths: vertici,
			strokeColor: color,
			strokeOpacity: op*10,
			strokeWeight: 2,
			fillColor: color,
			fillOpacity: op*10
		});


		poligono1.setMap(map1);
		app.poligonoArray1.push(poligono1);


		var d = "";
		if(municipio.description!=undefined)
			d = municipio.description;
		tooltip = '<div id="tooltip" style="width:100px">'+
		'<strong>\t'+municipio.name+'</strong>'+
		'<p>'+d+'</p>'+	
		'<p>numero incidenti: '+n+' su '+tot+'</p>'+	
		'</div>'; 

		app.createClickablePoly(poligono1, tooltip, map1);

		map1.fitBounds(bound1);


	};


	app.loadIncidenti = function(){

		var anno = $("#anno").val();
		var mese = $("#mese").val();
		var giorno = $("#giorno").val();


		$.ajax({
			type : 'POST',
			url: "GetIncidentiMunicipi?anno="+anno+"&mese="+mese+"&giorno="+giorno,
			success: function(result){
				
				var temp = app.municipi;
				
				
				
	
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

				app.clearMap();
				
				

				for(var i=0; i<temp.length;i++){
					app.drawPoli(temp[i], i);
				}
				
				google.maps.event.trigger(map1, 'resize');

			},
			complete: function () {
			}
		});






	};

}(window.app = window.app || {}));
