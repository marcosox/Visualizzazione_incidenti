package infovis.servlet;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import infovis.persistence.MongoDAO;

/**
 * Servlet implementation class GetAccidentDetails
 */
@WebServlet("/GetAccidentDetails")
public class GetAccidentDetails extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
	 
    public GetAccidentDetails() {
    	super();
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		System.out.println("Ricevuta una richiesta GET per getAccidentDetails inattesa, uso una POST");
		doPost(request,response);
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

		String id = request.getParameter("id");
		
		int n=-1;
		if(id!=null && !id.isEmpty()){
			try{
				n = Integer.parseInt(id);
			}catch(NumberFormatException e){
				System.out.println("Error: Number Format Exception for ID parameter,");
			}
		}
		response.setContentType("application/json");
		if(n!=-1){			
			response.getWriter().print(new MongoDAO().getAccidentDetails(n));
		}else{
			response.getWriter().print("{}");
		}
		response.getWriter().flush();
	}
}