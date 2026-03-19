import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // npm install jwt-decode

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem('token'); // Hoặc lấy từ redux/context

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    console.log(decoded)
    const userRole = decoded.role; // Tùy vào cấu trúc token của bạn

    if (allowedRoles.includes(userRole)) {
      return <Outlet />; // Cho phép truy cập vào các route con
    } else {
      return <Navigate to="/auth" replace />; // Role không hợp lệ
    }
  } catch (error) {
    return <Navigate to="/auth" replace />;
  }
};

export default ProtectedRoute;