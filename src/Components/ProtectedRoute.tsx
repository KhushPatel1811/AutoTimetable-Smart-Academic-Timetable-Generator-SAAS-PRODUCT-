import { useNavigate } from "react-router";

function ProtectedRoute({children}) {
    const navigate = useNavigate()

    const token = localStorage.getItem('token')
    
    return token ? children : navigate('/auth/login');
}

export default ProtectedRoute;