(function(app) {

	app.fillColors = ["#ff0000","#ff579D","#ffCCA9","#ffA37A","#CCA95B","#AA0000","#ff9235","#AA00C3","#ff4A1B","#BB4A1B","#33FF5F","#11FF98","#9F3644","#BB969C","#0037EB"] ;


	app.poligonoArray1 = [];
	app.municipi;
	app.infoWindow = [];
	
	app.scaleAnno = d3.scale.linear()  
    .domain([0,1])
    .range([.1, .9]);
	
	app.scaleMese = d3.scale.linear()  
    .domain([0,1])
    .range([.1, .7]);
	
	app.scaleGiorno = d3.scale.linear()  
    .domain([0,1])
    .range([.1, .5]);
	
	app.clearMap = function(){
		for(var i=0; i<app.poligonoArray1.length;i++){
			app.poligonoArray1[i].setMap(null);
		}
		app.poligonoArray1 = [];
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
			app.infoWindow.push(infowindow);
		});
	}

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
	app.drawPoli = function(municipio, cont, tipo) {
	
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

		var inc = Number(municipio.incidenti)/Number(municipio.totale)

		var op;
		
		if(tipo==1)
			op = app.scaleAnno(inc*10).toFixed(1);
		else if(tipo==2)
			op = app.scaleMese(inc*10).toFixed(1);
		else if(tipo==3)
			op = app.scaleGiorno(inc*10).toFixed(1);

		
		var n = municipio.incidenti;
		var tot = municipio.totale;
		var color = app.fillColors[8];
		
	 

		poligono1 = new google.maps.Polygon({
			paths: vertici,
			strokeColor: color,
			strokeOpacity: op,
			strokeWeight: 2,
			fillColor: color,
			fillOpacity: op
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

//		map1.fitBounds(bound1);


	};


	app.loadIncidenti = function(){

		var anno = $("#anno").val();
		var mese = $("#mese").val();
		var giorno = $("#giorno").val();

		var tipo = 1;
		
		if(anno.length > 0){
			
			if(mese.length>0 && giorno.length==0)
				tipo=2;
			else if(mese.length>0&&giorno.length>0)
				tipo=3;
			
		}else if(anno.length==0){
			
			if(mese.length>0&&giorno.length>0)
				tipo=2;
			
		}
		

		$.ajax({
			type : 'POST',
			url: "GetIncidentiMunicipi?anno="+anno+"&mese="+mese+"&giorno="+giorno,
			success: function(result){
				
				var temp = app.municipi;
				
				for(var i=0; i<temp.length;i++){
					
					for(var j=0; j<result.length;j++){
						
						if(temp[i].numero==1 && result[j].municipio==1){
							temp[i].incidenti = result[j]["incidenti"];
							temp[i].totale = result[j]["totale"];
						}
						else if(temp[i].numero==2 && result[j].municipio==2){
							temp[i].incidenti = result[j]["incidenti"];
							temp[i].totale = result[j]["totale"];

						}
						else if(temp[i].numero==3 && result[j].municipio==3){
							temp[i].incidenti = result[j]["incidenti"];
							temp[i].totale = result[j]["totale"];

						}
						else if(temp[i].numero==4 && result[j].municipio==4){
							temp[i].incidenti = result[j]["incidenti"];
							temp[i].totale = result[j]["totale"];

						}
						else if(temp[i].numero==5 && result[j].municipio==5){
							temp[i].incidenti = result[j]["incidenti"];
							temp[i].totale = result[j]["totale"];

						}
						else if(temp[i].numero==6 && result[j].municipio==6){
							temp[i].incidenti = result[j]["incidenti"];
							temp[i].totale = result[j]["totale"];

						}
						else if(temp[i].numero==7 && result[j].municipio==7){
							temp[i].incidenti = result[j]["incidenti"];
							temp[i].totale = result[j]["totale"];

						}
						else if(temp[i].numero==8 && result[j].municipio==8){
							temp[i].incidenti = result[j]["incidenti"];
							temp[i].totale = result[j]["totale"];

						}
						else if(temp[i].numero==9 && result[j].municipio==9){
							temp[i].incidenti = result[j]["incidenti"];
							temp[i].totale = result[j]["totale"];

						}
						else if(temp[i].numero==10 && result[j].municipio==10){
							temp[i].incidenti = result[j]["incidenti"];
							temp[i].totale = result[j]["totale"];

						}
						else if(temp[i].numero==11 && result[j].municipio==11){
							temp[i].incidenti = result[j]["incidenti"];
							temp[i].totale = result[j]["totale"];

						}
						else if(temp[i].numero==12 && result[j].municipio==12){
							temp[i].incidenti = result[j]["incidenti"];
							temp[i].totale = result[j]["totale"];

						}
						else if(temp[i].numero==13 && result[j].municipio==13){
							temp[i].incidenti = result[j]["incidenti"];
							temp[i].totale = result[j]["totale"];

						}
						else if(temp[i].numero==14 && result[j].municipio==14){
							temp[i].incidenti = result[j]["incidenti"];
							temp[i].totale = result[j]["totale"];

						}
						else if(temp[i].numero==15 && result[j].municipio==15){
							temp[i].incidenti = result[j]["incidenti"];
							temp[i].totale = result[j]["totale"];

						}
						else if(temp[i].numero==23 && result[j].municipio==23){
							temp[i].incidenti = result[j]["incidenti"];
							temp[i].totale = result[j]["totale"];

						}
						else if(temp[i].numero==26 && result[j].municipio==26){
							temp[i].incidenti = result[j]["incidenti"];
							temp[i].totale = result[j]["totale"];
						
						}
						
						
					}
	
				}

				app.clearMap();

				for(var i=0; i<temp.length;i++){
					app.drawPoli(temp[i], i,tipo);
				}
				
//				google.maps.event.trigger(map1, 'resize');

			},
			complete: function () {
			}
		});






	};

}(window.app = window.app || {}));
