var dataset = null;
var map;
var infoWindows = []; // in realta' ce ne dovrebbe essere una sola alla volta qui dentro
function initMap() {
  map = new google.maps.Map(document.getElementById('mapgeo-canvas'), {
    zoom: 11,
    center: {lat: 41.893, lng: 12.482}
  });
  getGeocodedAccidents();
}

function closeAllInfoWindows() {
	for (i = 0; i < infoWindows.length; i++) {
		infoWindows[i].close(); // chiude le infowindow
	}
}

function getGeocodedAccidents(){
	over = '<div id="overlay"><h1>LOADING</h></div>';
	$(over).appendTo('#container');
	
	$.ajax({
		type : 'POST',
		url : "GetGeocodedAccidents",
		dataType : 'json',
		success : function(result) {
			dataset = result;
			// 2 marker d'esempio
			marker = new google.maps.Marker({
			    position: {lat: +dataset[0].lat, lng: +dataset[0].lon},
			    map: map,
			    title: dataset[0].protocollo,
			    //icon: 'default.png' oppure
			    /*var image = {
    				url: 'images/beachflag.png',
    				// This marker is 20 pixels wide by 32 pixels high.
    				size: new google.maps.Size(20, 32),
    				// The origin for this image is (0, 0).
    				origin: new google.maps.Point(0, 0),
    				// The anchor for this image is the base of the flagpole at (0, 32).
    				anchor: new google.maps.Point(0, 32)
  };

			       var shape = {
			    coords: [1, 1, 1, 20, 18, 20, 18, 1],
			    type: 'poly'
			  };
			     
			    icon: image,
			      shape: shape, // oggetto shape
			      zIndex: 3 //int
*/
			  });
			
			marker.addListener('click', function() {
				closeAllInfoWindows();
				infowindow = new google.maps.InfoWindow();
				contentString = marker.title;
				infowindow.setContent(contentString);
			    infowindow.open(map, marker);
			    infoWindows.push(infowindow);
			});
			marker2 = new google.maps.Marker({
			    position: {lat: +dataset[1].lat, lng: +dataset[1].lon},
			    map: map,
			    title: dataset[1].protocollo			    
			  });
			
			marker2.addListener('click', function() {
				closeAllInfoWindows();
				infowindow = new google.maps.InfoWindow();
				contentString = marker2.title;
				infowindow.setContent(contentString);
			    infowindow.open(map, marker2);
			    infoWindows.push(infowindow);
			});
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