package infovis;

import java.util.Arrays;
import org.bson.Document;
import org.json.simple.JSONObject;

import com.mongodb.Block;
import com.mongodb.MongoClient;
import com.mongodb.client.AggregateIterable;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;


public class Analyzer{
	
	public Analyzer(){

	}
	
	public JSONObject getCount(String collectionName, String field){
		final JSONObject risultato = new JSONObject();
		
		MongoClient client = new MongoClient();
		MongoDatabase db = client.getDatabase("bigdata");
		MongoCollection<Document> collection = db.getCollection(collectionName);
		AggregateIterable<Document> iterable = collection.aggregate(Arrays.asList(new Document("$group", new Document("_id", "$"+field).append("count", new Document("$sum", 1)))));
		
		iterable.forEach(new Block<Document>(){
			@Override
			public void apply(Document d) {
				risultato.put(d.get("_id"), d.get("count"));		// questo warning non mi piace
			}
		});
		
		client.close();
		return risultato;
	}
	public JSONObject getTotal(String collectionName){
		final JSONObject risultato = new JSONObject();
		
		MongoClient client = new MongoClient();
		MongoDatabase db = client.getDatabase("bigdata");
		MongoCollection<Document> collection = db.getCollection(collectionName);
		long totale = collection.count(null);
		risultato.put("totale", totale);
		client.close();
		return risultato;
	}
}