package infovis.servlet;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import infovis.persistence.MongoDAO;

/**
 * Servlet implementation class GetCountWithHighlight
 */
@WebServlet(description = "Gets aggregate count of a field with fraction of another field", urlPatterns = { "/GetCountWithHighlight" })
public class GetCountWithHighlight extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public GetCountWithHighlight() {
        super();
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		System.out.println("Ricevuta una richiesta GET per getCountWithHighlight inattesa, uso una POST");
		doPost(request,response);
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		//String collectionName = request.getParameter("collection");
		String fieldName = request.getParameter("field");
		String limit = request.getParameter("limit");
		//String hCollection = request.getParameter("highlight-collection");
		String hField = request.getParameter("highlight-field");
		String hValue = request.getParameter("highlight-value");
		
		int n=-1;
		
		if(limit!=null && !limit.isEmpty()){
			try{
				n = Integer.parseInt(limit);
			}catch(NumberFormatException e){
				System.out.println("Error: Number Format Exception for LIMIT parameter, ignoring");
				n=20;
			}
		}
		response.setContentType("application/json");
		response.getWriter().print(new MongoDAO().getCountWithHighlight(fieldName, n, hField, hValue));
		response.getWriter().flush();
	
	}

}
