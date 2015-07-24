package infovis;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
		AggregateIterable<Document> iterable;
		
		if(field.equalsIgnoreCase("strada")){
			
			Document group = new Document("$group", new Document("_id", "$"+field).append("count", new Document("$sum", 1)));
			
			iterable = collection.aggregate(Arrays.asList(group, new Document("$sort",new Document("count", -1)), new Document("$limit",20)));
		
		}else{
			
			iterable = collection.aggregate(
							Arrays.asList(
									new Document("$group", new Document("_id", "$"+field).append("count", new Document("$sum", 1)))));
		
		}
		
		
		iterable.forEach(new Block<Document>(){
			@Override
			public void apply(Document d) {
				result.add(d);
			}
		});
		client.close();
		
		System.out.println(result.size());
		
		return JSONArray.toJSONString(result);
	}
	
	public String getTotal(String collectionName){
		Map<String,String> risultato = new HashMap<String,String>();//JSONObject();
		MongoClient client = new MongoClient();
		MongoDatabase db = client.getDatabase(this.dbName);
		MongoCollection<Document> collection = db.getCollection(collectionName);
		long totale = collection.count(null);
		risultato.put("collezione",collectionName);
		risultato.put("totale", Long.toString(totale));
		client.close();
		return JSONObject.toJSONString(risultato);
	}
}