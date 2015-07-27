package infovis.servlet;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import infovis.persistence.MongoDAO;

/**
 * Servlet implementation class GetIncidentiMunicipi
 */
@WebServlet("/GetIncidentiMunicipi")
public class GetIncidentiMunicipi extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public GetIncidentiMunicipi() {super();}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		System.out.println("Ricevuta una richiesta GET per getIncidentiMunicipi inattesa, uso una POST");
		doPost(request,response);
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		
		String anno = request.getParameter("anno");
		String mese = request.getParameter("mese");
		String giorno = request.getParameter("giorno");
		String ora = request.getParameter("ora");
		
		System.out.println(anno+"\tMese: "+mese+"\tGiorno: "+giorno+"\tOra: "+ora);
		
	/*	if(mese.length()==1){
			mese = "0"+mese;	// questa cosa non accade mai, e in piu' mese e giorno possono essere NULL dando exception
		}
		if(giorno.length()==1){
			giorno = "0"+giorno;
		}
		*/
		response.setContentType("application/json");
		response.getWriter().print(new MongoDAO().getIncidentiMunicipi(anno, mese, giorno, ora));
		response.getWriter().flush();
	}
}