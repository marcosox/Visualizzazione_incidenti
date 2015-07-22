package infovis;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

public interface MongoDao {
	
	public JSONObject getCount(String collection, String field);
	
	public JSONObject getTotaleIncidentiMunicipi();
	
	public JSONObject getIncidentiMese(String mese);
	public JSONObject getIncidentiAnno(String anno);	
	public JSONObject getIncidentiOra(int ora);
	
	public JSONObject getMediaEtaTotale();
	public JSONObject getMediaEtaIncidenti();
	
	public JSONArray getDinamicaIncidenti();
	 
	public JSONArray getTop10Strade();
	public JSONArray getTipoVeicoli();
	public int getNumeroIncedentiVeicoli(String v, String v2);
	
	
	public int getTotaleIncidentiGiorno(String anno, String mese,String giorno);
	public int getTotaleIncidentiMese(String anno, String mese);
	public int getTotaleIncidentiAnno(String anno);
	
	public JSONObject getIncidentiAnnoMese(String anno, String mese);
	public JSONObject getIncidentiAnnoMeseGiorno(String anno, String mese, String giorno);

	public JSONArray getStradeIncidentate();


	public int getTotale();
	


}
