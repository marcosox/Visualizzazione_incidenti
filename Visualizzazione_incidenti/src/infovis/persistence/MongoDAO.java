package infovis.persistence;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

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
	private String collectionName = "incidenti_finale";

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
	public String getCount(String field, int limit) {

		final List<Document> result = new ArrayList<Document>();
		MongoClient client = new MongoClient();
		MongoDatabase db = client.getDatabase(this.dbName);
		MongoCollection<Document> collection = db.getCollection(collectionName);
		AggregateIterable<Document> iterable;

		List<Document> list = new ArrayList<Document>();
		list.add(new Document("$project",new Document("field","$"+field)));
		if(field.contains(".")){
			list.add(new Document("$unwind","$field"));
		}
		list.add(new Document("$group", new Document("_id", "$field").append("count", new Document("$sum", 1))));	
		
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
		MongoCollection<Document> incidenti = db.getCollection(collectionName);
		Map<String, String> risultato = new HashMap<String,String>();
		risultato.put("incidenti",Long.toString(incidenti.count(null)));
		
		// itera direttamente su queste collezioni e per ognuna conta il totale
		String[] collectionsList = {"veicoli","persone"};
		
		for(String s : collectionsList){
			List<Document> pipeline = new ArrayList<Document>();
			pipeline.add(new Document("$unwind","$"+s));
			pipeline.add(new Document("$group",new Document("_id","null").append("count", new Document("$sum",1))));
			AggregateIterable<Document> result = incidenti.aggregate(pipeline);
			risultato.put(s,result.first().getInteger("count").toString());
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
	 * Recupera tutti gli incidenti e li ritorna in una lista per visualizzarli sulla mappa
	 * @return una lista di oggetti {lat,lon,protocollo}
	 */
	public String getIncidenti(){
		final List<JSONObject> result = new ArrayList<JSONObject>();
		MongoClient client = new MongoClient();
		MongoDatabase db = client.getDatabase(this.dbName);
		MongoCollection<Document> collection = db.getCollection(collectionName);
		FindIterable<Document> iterable = collection.find();
		iterable.forEach(new Block<Document>() {
			@Override
			public void apply(Document d) {
				
				Map<String,String> mappa = new HashMap<String,String>();
				if(d.getString("lat")!=null){
					mappa.put("lat", d.getString("lat"));
					mappa.put("lon", d.getString("lon"));
					mappa.put("protocollo", d.getString("incidente").replace("incidente", ""));
					result.add(new JSONObject(mappa));
				}
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
		MongoCollection<Document> collection = db.getCollection(collectionName);
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
		MongoCollection<Document> collection = db.getCollection(collectionName);
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
	 * Effettua il conto dei documenti raggruppati in base ad
	 * un campo passato come parametro. Per ogni valore riporta il totale relativo di un
	 * altro campo passato come parametro.
	 * es: riporta il conto di ogni veicolo nel database, e per ogni veicolo riporta
	 * quanti incidenti in una certa via
	 * 
	 * @param field
	 *            campo su cui fare l'aggregazione
	 * @param n
	 *            limite di risultati restituiti
	 * @param hField
	 *            campo del sottovalore da riportare
	 * @param hValue
	 *            valore su cui filtrare il sottovalore
	 * @return un oggetto JSON contenente un array di documenti ognuno con campi
	 *         _id, count, highlight
	 */
	
	public String getCountWithHighlight( String field, int limit, String hField, String hValue) {

		final List<Document> result = new ArrayList<Document>();
		MongoClient client = new MongoClient();
		MongoDatabase db = client.getDatabase(this.dbName);
		MongoCollection<Document> collection = db.getCollection(collectionName);

		List<Document> list = new ArrayList<Document>();
		List<Document> listWithMatch = new ArrayList<Document>();
		listWithMatch.add(new Document("$match",new Document(hField,hValue)));
		list.add(new Document("$project",new Document("field","$"+field)));
		listWithMatch.add(new Document("$project",new Document("field","$"+field)));
		if(field.contains(".")){
			list.add(new Document("$unwind","$field"));
			listWithMatch.add(new Document("$unwind","$field"));
		}
		list.add(new Document("$group", new Document("_id", "$field").append("count", new Document("$sum", 1))));
		listWithMatch.add(new Document("$group", new Document("_id", "$field").append("count", new Document("$sum", 1))));
		
		if(limit>0 && limit <500){
			list.add(new Document("$sort", new Document("count", -1)));
			listWithMatch.add(new Document("$sort", new Document("count", -1)));
			list.add(new Document("$limit", limit));
			//listWithMatch.add(new Document("$limit", limit));
		}else{
			// non dovrebbe accadere a meno che non si cambia a mano nella request http
			System.out.println("MongoDAO: Invalid LIMIT value, limit unset on query");
		}
		
		AggregateIterable<Document> iterable1 = collection.aggregate(list);
		AggregateIterable<Document> iterable2 = collection.aggregate(listWithMatch);
		
		final Map<String,Document> map = new HashMap<String,Document>();
		iterable1.forEach(new Block<Document>() {
			@Override
			public void apply(Document d) {
				System.out.println("iterable1: "+d.toJson());
				map.put(d.get("_id").toString(),d);
			}
		});
		
		iterable2.forEach(new Block<Document>() {
			@Override
			public void apply(Document d) {
			//	System.out.println("iterable2: "+d.toJson());
			//	System.out.println("_id: "+d.get("_id").toString());
			//	System.out.println("mappa:"+map.keySet().toString());
				Document entry = map.get(d.get("_id").toString());
				if(entry!=null){
			//		System.out.println("from map: "+entry.toJson());
					entry.append("highlight",d.get("count"));			
				}
			}
		});
		for(Entry<String,Document> e : map.entrySet()){
			if(!e.getValue().containsKey("highlight")){
				System.out.println("aggiungo un highlight=0 a "+e.getKey());
				e.getValue().append("highlight", 0);
			}
			result.add(e.getValue());
		}
		client.close();
		
		return JSONArray.toJSONString(result);
	}
}