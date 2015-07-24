(function(app) {
	
	app.loadMap = function() {
		
		var roma;
		
		var mapOptions = {
				zoom: 12,
				center:roma
		};

		map1 = new google.maps.Map(document.getElementById('map-canvas'),
				mapOptions);

		
		var geocoder = new google.maps.Geocoder();
		
		geocoder.geocode( { 'address': "roma"}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				roma = results[0].geometry.location;		
				map1.setCenter(roma);
			} else {
				alert('Geocode was not successful for the following reason: ' + status);
			}
		});
		 

	
	};

	app.loadScript = function () {
		
		if(document.getElementById("google") !=null 
				|| document.getElementById("google") != undefined){
			app.loadMap();
	
		}else{
			var script = document.createElement('script');
			script.id = "google";
			script.type = 'text/javascript';
			script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&' +
			'callback=app.loadMap';
			document.body.appendChild(script);
		}

		
		
	};

}(window.app = window.app || {}));
