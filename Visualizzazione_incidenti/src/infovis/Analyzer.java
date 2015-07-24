package infovis;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.bson.Document;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.JSONValue;

import com.mongodb.Block;
import com.mongodb.DB;
import com.mongodb.DBCollection;
import com.mongodb.DBCursor;
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
	public String getCount(String collectionName, String field) {

		final List<Document> result = new ArrayList<Document>();
		MongoClient client = new MongoClient();
		MongoDatabase db = client.getDatabase(this.dbName);
		MongoCollection<Document> collection = db.getCollection(collectionName);
		AggregateIterable<Document> iterable;

		List<Document> list = Arrays.asList(
				new Document("$group", new Document("_id", "$" + field).append("count", new Document("$sum", 1))));

		if (field.equalsIgnoreCase("strada") || field.equalsIgnoreCase("brand") || field.equalsIgnoreCase("model")) {
			list.add(new Document("$sort", new Document("count", -1)));
			list.add(new Document("$limit", 20)); // TODO: e' piuttosto brutto
													// qui dentro questo check
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
	 * Conta il totale dei documenti presenti in una collezione.
	 * 
	 * @param collectionName
	 *            la collezione da contare
	 * @return oggetto JSON con due campi: collezione e totale
	 */

	public String getTotal(String collectionName) {
		Map<String, String> risultato = new HashMap<String, String>();
		MongoClient client = new MongoClient();
		MongoDatabase db = client.getDatabase(this.dbName);
		MongoCollection<Document> collection = db.getCollection(collectionName);
		long totale = collection.count(null);
		risultato.put("collezione", collectionName);
		risultato.put("totale", Long.toString(totale));
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
				JSONObject obj = new JSONObject();
				obj.put("coord", d.get("coord"));
				obj.put("name", d.get("coord"));
				obj.put("description", d.get("coord"));
				result.add(obj);
			}
		});
		client.close();
		/********************************************************************/
	/*	MongoClient client2 = new MongoClient();
		DB db2 = client2.getDB("bigdata");
		DBCollection collection2 = db2.getCollection("municipi");
		DBCursor cursor = collection2.find();
		JSONArray array = new JSONArray();
		while (cursor.hasNext()) {
			//JSONObject obj = (JSONObject) JSONValue.parse(cursor.next().toString());
			//System.out.println("prima: "+JSONValue.parse(cursor.next().toString()));
			//array.add(obj);
		}
		client2.close();
*/
		return JSONArray.toJSONString(result);
	}
}