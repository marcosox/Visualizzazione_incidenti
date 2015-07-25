package infovis;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Servlet implementation class GetIncidentiMunicipi
 */
@WebServlet("/GetIncidentiMunicipi")
public class GetIncidentiMunicipi extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public GetIncidentiMunicipi() {
        super();
        // TODO Auto-generated constructor stub
    }

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
		// se non presenti restituiscono null che e' esattamente quello che ci serve
		String anno = request.getParameter("anno");
		String mese = request.getParameter("mese");
		String giorno = request.getParameter("giorno");
		response.setContentType("application/json");
		response.getWriter().print(new Analyzer().getIncidentiMunicipi(anno, mese, giorno));
		response.getWriter().flush();
	}

}
