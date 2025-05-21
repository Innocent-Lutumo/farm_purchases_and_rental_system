import { Navigate } from 'react-router-dom';


const AdminProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('access');
  
    if (!token) {
      return <Navigate to="/AdminLogin" replace />;
    }
  
    return children;
  };

  export default AdminProtectedRoute;