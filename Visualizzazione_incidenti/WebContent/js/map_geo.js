var dataset = null;
var map;
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
		infoWindows[i]= null;
	}
	infoWindows = [];
}

function getGeocodedAccidents() {
	over = '<div id="overlay"><h1>LOADING</h></div>';
	$(over).appendTo('#container');

	$.ajax({
		type : 'POST',
		url : "GetGeocodedAccidents",
		dataType : 'json',
		success : function(result) {
			dataset = result;
			myCircle = google.maps.SymbolPath.CIRCLE;
			for (i = 0; i < 100/*dataset.length*/; i++) {
				
				var marker = new google.maps.Marker({
					position : {
						lat : +dataset[i].lat,
						lng : +dataset[i].lon
					},
					map : map,
					title : "Incidente n."+dataset[i].protocollo,
					icon: {
					      path: myCircle,
					      scale: 1
					    }
				});
				console.log(marker.title);
				marco = marker;
				marker.addListener('click', function() {
					//console.log(this);
					closeAllInfoWindows();
					infowindow = new google.maps.InfoWindow();
					contentString = "<div><b>"+this.title+"</b>"
					+"<br>Orario: xx"
					+"</div>";
					infowindow.setContent(contentString);
					infowindow.open(map, this);
					infoWindows.push(infowindow);
				});
				markers.push(marker);
			}
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