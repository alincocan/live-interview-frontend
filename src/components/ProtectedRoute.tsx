import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';
import { AuthenticationService } from '../service/authenticationService';

interface Props {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: Props) => {

  const authService = AuthenticationService.getInstance();

  return authService.isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;