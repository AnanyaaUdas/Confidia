import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../store/useAppStore';

const AdminDashboard = () => {
    const navigate = useNaavigate();
    const setAdminLoggedIn = useAppStore((state)=> state.setAdminLoggedIn);

    const handleLogout = () => {
        setAdminLoggedIn(false);
        navigate("/admin");
    }
  return (
    <>
        <div className="admin-dashboard">
            <div className="admin-sidebar">
                <div className="admin-logo"></div>
            </div>
        </div>
    </>
  )
}

export default AdminDashboard