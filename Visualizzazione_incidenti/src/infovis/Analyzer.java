package infovis;

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

public class Analyzer {
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
	 * @return array di JSON con 3 campi: numero municipio, numero incidenti nel municipio, totale incidenti.
	 */
	public String getIncidentiMunicipi(String anno,String mese, String giorno){
		
		MongoClient client = new MongoClient();
		MongoDatabase db = client.getDatabase(this.dbName);
		MongoCollection<Document> collection = db.getCollection("incidenti");
		Document matchFilter = new Document();	// filtro per mese anno e giorno
		List<Document> aggregationPipeline = new ArrayList<Document>();
		if(anno!=null){
			matchFilter.append("anno", anno);
		}
		if(mese!=null){
			matchFilter.append("mese", mese);
		}
		if(giorno!=null){
			matchFilter.append("giorno", giorno);
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
				dc.append("numero", d.getInteger("_id"));
				dc.append("incidenti", d.getInteger("count"));
				dc.append("totale", incidenti);
				result.add(dc);
			}
		});
		client.close();
		return JSONArray.toJSONString(result);
	}
}