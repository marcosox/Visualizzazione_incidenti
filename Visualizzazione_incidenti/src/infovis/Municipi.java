package infovis;

import java.io.IOException;
import java.io.PrintWriter; 

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.JSONValue;

import com.mongodb.DB;
import com.mongodb.DBCollection;
import com.mongodb.DBCursor;
import com.mongodb.MongoClient;


/**
 * Servlet implementation class Municipi
 */
@WebServlet("/Municipi")
public class Municipi extends HttpServlet {
	private static final long serialVersionUID = 1L;

	/**
	 * Default constructor. 
	 */
	public Municipi() {
		// TODO Auto-generated constructor stub
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doPost(request, response);
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

		MongoClient client = new MongoClient("localhost",27017); //with default server and port adress
		DB db = client.getDB( "bigdata" );
		DBCollection collection = db.getCollection("municipi");

		DBCursor cursor = collection.find();
		JSONArray array = new JSONArray();

		while(cursor.hasNext()) {				
			JSONObject obj = (JSONObject) JSONValue.parse(cursor.next().toString());
			array.add(obj);							
		}	
		

		client.close();
		
		response.setContentType("application/json");
		// Get the printwriter object from response to write the required json object to the output stream      
		PrintWriter out = response.getWriter();
		// Assuming your json object is **jsonObject**, perform the following, it will return your json object 
		out.print(array.toJSONString());
		out.flush();

	}

}
