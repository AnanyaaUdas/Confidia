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
                <div className="admin-logo">
                     <img src={logo} alt="Confidia Logo" />
                     <nav>
                        <button className="admin-nav active">
                            📊 Dashboard
                        </button>
                        <div className="admin-nav">
                            💌 Compliments
                        </div>
                        <button className="admin-nav">
                            ⭐ Featured
                        </button>
                        <button className="admin-nav">
                            🚩 Reports
                        </button>
                        <button className="admin-layout" onClick={handleLogout}>
                            Logout
                        </button>
                        <main className="admin-main">
                            <div className="admin-header">
                                <div>
                                    <h1>Admin Dashboard</h1>
                                    <p>Manage kindness shared on Confidia.</p>
                                </div>
                                <div className="admin-profile">
                                    👤 Admin
                                </div>
                                <div className="admin-stats">
                                    <div className="admin-stat-card">
                                         <div>
                                            <span>💌</span>
                                            <h2>52</h2>
                                            <p>Total Compliments</p>
                                         </div>
                                    </div>
                                    <div className="admin-stat-card">
                                        <span>⭐</span>
                                        <div>
                                            <h2>8</h2>
                                            <p>Featured</p>
                                        </div>
                                    </div>
                                    <div className="admin-stat-card">
                                        <span>⭐</span>
                                        <div>
                                            <h2>8</h2>
                                            <p>Featured</p>
                                        </div>
                                    </div>
                                    <div className="admin-stat-card">
                                        <span>⭐</span>
                                        <div>
                                            <h2>8</h2>
                                            <p>Featured</p>
                                        </div>
                                    </div>
                                    
                                </div>
                            </div>
                        </main>
                     </nav>
                </div>
            </div>
        </div>
    </>
  )
}

export default AdminDashboard