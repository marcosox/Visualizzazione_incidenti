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
		// proietto i campi che mi servono cosi' estraggo l'ora
	/*	Document projection = new Document("$project",new Document("ora",new Document("$hour","$ora")).append("anno", 1)
				.append("mese", 1).append("giorno", 1).append("numero_gruppo", 1).append("_id", 0));*/
		//aggregationPipeline.add(projection);
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
		
		// non hai bisogno di queste system.out, puoi stamparti i risultati
		// direttamente mettendo il nome della servlet nell'url
		// (e' anche piu' comodo da leggere)
		//System.out.println(JSONArray.toJSONString(result));
		return JSONArray.toJSONString(result);
	}
}