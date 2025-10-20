import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { CustomerContext } from '../components/CustomerContext';

export default function ProtectedRoute({ children }) {
    const { customer } = useContext(CustomerContext);
    return customer ? children : <Navigate to="/login" />;
}
