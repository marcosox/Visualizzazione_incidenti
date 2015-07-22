package infovis;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.bson.Document;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

import com.mongodb.Block;
import com.mongodb.MongoClient;
import com.mongodb.client.AggregateIterable;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;


public class Analyzer{
	private String dbName = "bigdata";
	
	
	/**
	 * Effettua il conto dei documenti in una collezione raggruppati in base ad un campo passato come parametro.
	 * @param collectionName nome della collezione
	 * @param field campo su cui fare l'aggregazione
	 * @return un oggetto JSON contenente un array di oggetti ognuno con campi _id e count
	 */
	public String getCount(String collectionName, String field){
		
		final List<Document> result = new ArrayList<Document>();
		MongoClient client = new MongoClient();
		MongoDatabase db = client.getDatabase(this.dbName);
		MongoCollection<Document> collection = db.getCollection(collectionName);
		AggregateIterable<Document> iterable = collection.aggregate(Arrays.asList(new Document("$group", new Document("_id", "$"+field).append("count", new Document("$sum", 1)))));
	
		iterable.forEach(new Block<Document>(){
			@Override
			public void apply(Document d) {
				result.add(d);
			}
		});
		client.close();
		return JSONArray.toJSONString(result);
	}
	public JSONObject getTotal(String collectionName){
		JSONObject risultato = new JSONObject();
		MongoClient client = new MongoClient();
		MongoDatabase db = client.getDatabase(this.dbName);
		MongoCollection<Document> collection = db.getCollection(collectionName);
		long totale = collection.count(null);
		risultato.put("collezione",collectionName);
		risultato.put("totale", totale);
		client.close();
		return risultato;
	}
}