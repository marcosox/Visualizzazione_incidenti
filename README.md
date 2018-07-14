Visualizzazione incidenti
=========================

**NOTE: this project was written a long ago and has been since refactored in two components:**

- [car-accidents-map-fe](https://github.com/marcosox/car-accidents-map-fe) (Javascript frontend using [D3.js](https://d3js.org/))
- [car-accidents-map-be](https://github.com/marcosox/car-accidents-map-be) (Java backend, ported from the [Tomcat](http://tomcat.apache.org/) web application to a [Vert.x](https://vertx.io/) verticle)

### About this tool:

This tool has been realized as an assignment for the [InfoVis course](http://www.dia.uniroma3.it/~infovis) held by Maurizio Patrignani at Roma Tre University and uses the following technologies:

* [**D3.JS**](https://d3js.org/) as graphic library
* [**Bootstrap**](https://getbootstrap.com/) theme for html layout
* [**MongoDB**](https://www.mongodb.com) for data persistence
* [**Jquery**](https://jquery.com/) for responsive interaction
* [**Google Maps APIs**](https://developers.google.com/maps/) for geographic visualization 

It is basically an example of some common data visualization techniques that can be easily implemented in a webapp using D3JS.  
The data visualizes informations about road accidents collected from another tool realized as part of the [Big Data course](http://torlone.dia.uniroma3.it/bigdata/) held by Riccardo Torlone (the original dataset was for the Rome municipality, but the tool can be used with any dataset with minor changes).

There are 2 maps showing the accidents both individually and grouped by district, numerical statistics, a couple of time graphs and an interactive bar graph that can be sorted and has a feature used to show correlations between data (e.g. accident location vs time of the day)  
The data is collected from a MongoDB database where it is stored in a custom format. Look inside the `example_data` folder to see the database format.

For the records, the data was originally obtained from the [Rome municipality open data website](http://dati.comune.roma.it/cms/it/incidenti_stradali.page) in CSV format, then converted to RDF with [Google Refine](http://openrefine.org/) and manipulated in different ways to learn about semantic web technologies (which included generating an ontology to describe road accidents and using [SPARQL](https://en.wikipedia.org/wiki/SPARQL) to query the data).

### Installation:

  1. Import the example dataset inside MongoDB:  
`mongoimport --db bigdata --collection incidenti --file /path/to/incidenti_geolocalizzati.json`  
`mongoimport --db bigdata --collection incidenti --file /path/to/municipi.json`  
Where `bigdata` and `incidenti` are respectively the db and the collection used inside the java class MongoDAO.java  
  2. Ensure your MongoDB installation is up and running
  3. Generate a suitable format for your servlet container, e.g. generate a WAR file from the source code (this could include [importing the project into eclipse](http://help.eclipse.org/kepler/index.jsp?topic=%2Forg.eclipse.platform.doc.user%2Ftasks%2Ftasks-importproject.htm) and then [exporting it into a war file](http://help.eclipse.org/kepler/index.jsp?topic=%2Forg.eclipse.wst.webtools.doc.user%2Ftopics%2Ftwcrewar.html))
  4. Deploy the web application inside the servlet container (e.g. Tomcat: move the .war file inside the `webapp` folder of the tomcat installation)
  5. Ensure Tomcat is up and running
  6. Visit http://localhost:8080/Visualizzazione_incidenti/ to access the web app. If you are running Tomcat on a different port than 8080 adjust it in the URL.
