package infovis.persistence;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.bson.Document;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import com.mongodb.Block; 
import com.mongodb.MongoClient;
import com.mongodb.client.AggregateIterable;
import com.mongodb.client.FindIterable;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;

public class MongoDAO {
	private String dbName = "bigdata";

	/**
	 * Effettua il conto dei documenti in una collezione raggruppati in base ad
	 * un campo passato come parametro.
	 * 
	 * @param collectionName
	 *            nome della collezione
	 * @param field
	 *            campo su cui fare l'aggregazione
	 * @return un oggetto JSON contenente un array di oggetti ognuno con campi
	 *         _id e count
	 */
	public String getCount(String collectionName, String field, int limit) {

		final List<Document> result = new ArrayList<Document>();
		MongoClient client = new MongoClient();
		MongoDatabase db = client.getDatabase(this.dbName);
		MongoCollection<Document> collection = db.getCollection(collectionName);
		AggregateIterable<Document> iterable;

		List<Document> list = new ArrayList<Document>();
		list.add(new Document("$group", new Document("_id", "$" + field).append("count", new Document("$sum", 1))));	
		if(limit>0 && limit <500){
			list.add(new Document("$sort", new Document("count", -1)));
			list.add(new Document("$limit", limit));
		}else{
			// non dovrebbe accadere a meno che non si cambia a mano nella request http
			System.out.println("MongoDAO: Invalid LIMIT value, limit unset on query");
		}
		iterable = collection.aggregate(list);

		iterable.forEach(new Block<Document>() {
			@Override
			public void apply(Document d) {
				result.add(d);
			}
		});
		client.close();
		return JSONArray.toJSONString(result);
	}

	/**
	 * Conta i totali dei documenti presenti nelle collezioni veicoli, incidenti, persone.
	 * 
	 * @return un array di oggetti JSON con due campi: collezione e totale, per ogni collezione.
	 */

	public String getTotals() {

		MongoClient client = new MongoClient();
		MongoDatabase db = client.getDatabase(this.dbName);
		// itera direttamente su queste collezioni e per ognuna conta il totale
		String[] collectionsList = {"veicoli","incidenti","persone"};
		Map<String, String> risultato = new HashMap<String,String>();
		for(String s : collectionsList){
			MongoCollection<Document> collection = db.getCollection(s);
			risultato.put(s, Long.toString(collection.count(null)));	// <nome collezione, totale>
		}
		
		client.close();
		return JSONObject.toJSONString(risultato);
	}

	/**
	 * Recupera la collezione con le coordinate dei municipi
	 * 
	 * @return Oggetto JSON con l'intera collezione di mongo
	 */
	public String getMunicipi() {
		final List<JSONObject> result = new ArrayList<JSONObject>();
		MongoClient client = new MongoClient();
		MongoDatabase db = client.getDatabase(this.dbName);
		MongoCollection<Document> collection = db.getCollection("municipi");
		FindIterable<Document> iterable = collection.find();
		iterable.forEach(new Block<Document>() {
			@Override
			public void apply(Document d) {
				
				Map<String,String> mappa = new HashMap<String,String>();
				mappa.put("coord", d.getString("coord"));
				mappa.put("name", d.getString("name"));
				mappa.put("numero", String.valueOf(d.getInteger("numero")));
				mappa.put("description", d.getString("description"));
				result.add(new JSONObject(mappa));
			}
		});
		client.close();
		return JSONArray.toJSONString(result);
	}
	/**
	 * Funzione di utilita' per la visualizzazione sulla mappa degli incidenti
	 * @param anno anno da filtrare, se null e' ignorato
	 * @param mese mese da filtrare, se null e' ignorato
	 * @param giorno giorno da filtrare, se null e' ignorato
	 * @param ora ora da filtrare, se null e' ignorata
	 * @return array di JSON con 3 campi: numero municipio, numero incidenti nel municipio, totale incidenti.
	 */
	public String getIncidentiMunicipi(String anno,String mese, String giorno, String ora){
		
		MongoClient client = new MongoClient();
		MongoDatabase db = client.getDatabase(this.dbName);
		MongoCollection<Document> collection = db.getCollection("incidenti");
		Document matchFilter = new Document();	// filtro per mese anno, giorno e ora
		List<Document> aggregationPipeline = new ArrayList<Document>();
		
		if(anno!=null && !anno.isEmpty()){
			matchFilter.append("anno", anno);
		}
		if(mese!=null && !mese.isEmpty()){
			matchFilter.append("mese", mese);
		}
		if(giorno!=null && !giorno.isEmpty()){
			matchFilter.append("giorno", giorno);
		}
		if(ora!=null && !ora.isEmpty()){
			matchFilter.append("ora", Integer.valueOf(ora));	// ora e' un intero, mese giorno e anno sono stringhe
		}
		
		final long incidenti = collection.count(matchFilter);	// conta gli incidenti con filtro
		Document match = new Document("$match",matchFilter);	// includi il filtro in uno stage match della pipeline
		aggregationPipeline.add(match);
		aggregationPipeline.add(new Document("$group", new Document("_id", "$numero_gruppo").append("count", new Document("$sum", 1))));
		AggregateIterable<Document> iterable = collection.aggregate(aggregationPipeline);
		
		final List<Document> result = new ArrayList<Document>();
		iterable.forEach(new Block<Document>() {
			@Override
			public void apply(Document d) {
				Document dc = new Document();
				dc.append("municipio", d.getInteger("_id"));
				dc.append("incidenti", d.getInteger("count"));
				dc.append("totale", incidenti);
				result.add(dc);
			}
		});
		client.close();
		
		return JSONArray.toJSONString(result);
	}

	/**
	 * Calcola il totale giornaliero degli incidenti per la visualizzazione sul calendario
	 * @return un array json con oggetti di tipo <data,totale>
	 */
	public String getDailyAccidents() {
		MongoClient client = new MongoClient();
		MongoDatabase db = client.getDatabase(this.dbName);
		MongoCollection<Document> collection = db.getCollection("incidenti");
		List<Document> aggregationPipeline = new ArrayList<Document>();
		aggregationPipeline.add(
				new Document("$group",
						new Document("_id",
								new Document("anno","$anno").append("mese","$mese").append("giorno","$giorno"))
						.append("totale",new Document("$sum",1))));
		aggregationPipeline.add(
				new Document("$group",new Document("tot",new Document("$push",new Document("total","$totale"))).append("_id", "$_id")));
		
		AggregateIterable<Document> iterable = collection.aggregate(aggregationPipeline);
		final List<Document> result = new ArrayList<Document>();
		iterable.forEach(new Block<Document>() {
			@Override
			public void apply(Document d) {
				Document dc = new Document();
				String anno = d.get("_id", Document.class).getString("anno");
				String mese = d.get("_id", Document.class).getString("mese");
				String giorno = d.get("_id", Document.class).getString("giorno");
				@SuppressWarnings("unchecked")
				ArrayList<Document> lista = d.get("tot",ArrayList.class);	// necessario cast unchecked
				int count = lista.get(0).getInteger("total");
				String data = anno+"-"+mese+"-"+giorno;
				dc.append("data", data);
				dc.append("count", count);
				result.add(dc);
			}
		});
		
		client.close();
		return JSONArray.toJSONString(result);
	}

	/**
	 * Effettua il conto dei documenti in una collezione raggruppati in base ad
	 * un campo passato come parametro. Per ogni valore riporta il totale relativo di un
	 * altro campo passato come parametro.
	 * es: riporta il conto di ogni veicolo nel database, e per ogni veicolo riporta
	 * quanti incidenti in una certa via
	 * 
	 * @param collectionName
	 *            nome della collezione
	 * @param field
	 *            campo su cui fare l'aggregazione
	 * @param n
	 *            limite di risultati restituiti
	 * @param hField
	 *            campo del sottovalore da riportare
	 * @param hCollection
	 *            collezione del sottovalore
	 * @param hValue
	 *            valore su cui filtrare il sottovalore
	 * @return un oggetto JSON contenente un array di oggetti ognuno con campi
	 *         _id, count, hCount
	 */
	
	//TODO: per ottenere i subtotali bisogna fare il join perche' magari i valori che cerchi sono in collezioni diverse!
	// quindi va fatto prima il join e poi l'aggregazione doppia
	public String getCountWithHighlight(String collectionName, String field, int limit, String hCollection,
			String hField, String hValue) {
		final List<Document> result = new ArrayList<Document>();
		MongoClient client = new MongoClient();
		MongoDatabase db = client.getDatabase(this.dbName);
		MongoCollection<Document> collection = db.getCollection(collectionName);
		AggregateIterable<Document> iterable;

		List<Document> list = new ArrayList<Document>();
		list.add(new Document("$group", new Document("_id", "$" + field).append("count", new Document("$sum", 1))));	
		if(limit>0 && limit <500){
			list.add(new Document("$sort", new Document("count", -1)));
			list.add(new Document("$limit", limit));
		}else{
			// non dovrebbe accadere a meno che non si cambia a mano nella request http
			System.out.println("MongoDAO: Invalid LIMIT value, limit not set on query");
		}
		iterable = collection.aggregate(list);

		iterable.forEach(new Block<Document>() {
			@Override
			public void apply(Document d) {
				// TODO: o sottrai qui l'highlight al totale (ne fa gia' parte) oppure lo fai nel js
				d.append("highlight", (Math.round(Math.random()*10000))); // TODO: per adesso genera valori fittizi
				result.add(d);
			}
		});
		client.close();
		return JSONArray.toJSONString(result);
	}
}