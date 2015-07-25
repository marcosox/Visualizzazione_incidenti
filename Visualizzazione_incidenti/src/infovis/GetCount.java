package infovis;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Servlet implementation class GetCount
 */
@WebServlet("/GetCount")
public class GetCount extends HttpServlet {
	private static final long serialVersionUID = 1L;

    /**
     * Default constructor. 
     */
    public GetCount() {
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		System.out.println("Ricevuta una richiesta GET per getCount inattesa, uso una POST");
		doPost(request,response);
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		
		String collectionName = request.getParameter("collection");
		String fieldName = request.getParameter("field");
		String limit = request.getParameter("limit");
		
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
		response.getWriter().print(new Analyzer().getCount(collectionName, fieldName,n));
		response.getWriter().flush();
	}

}
