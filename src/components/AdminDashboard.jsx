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
                                        <span>🚩</span>
                                        <div>
                                            <h2>3</h2>
                                            <p>Reports</p>
                                        </div>
                                    </div>
                                    <div className="admin-stat-card">
                                        <span>😊</span>
                                        <div>
                                            <h2>739</h2>
                                            <p>Smiles Created</p>
                                        </div>
                                    </div>
                                    
                                </div>
                                <section className="admin-section">
                                    <div className="section-heading">
                                        <div>
                                            <h2>Recent Compliments</h2>
                                            <p>
                                                Review and mange submitted compliments
                                            </p>
                                        </div>
                                        <button className="view-all-btn">
                                            View all →
                                        </button>
                                    </div>
                                    <div className="admin-table">
                                        <div className="table-header">
                                            <span>Compliment</span>
                                            <span>Recipient</span>
                                            <span>Status</span>
                                            <span>Action</span>
                                        </div>
                                        <div className="table-row">
                                            <div>
                                                <strong>"Thank you for helping me..."</strong>
                                                <small>
                                                    Anonymous. 2h ago
                                                </small>
                                            </div>
                                            <span>
                                                Computer Department
                                            </span>
                                            <span className="status approved">
                                                Aprroved
                                            </span>
                                            <div className="table-action"> </div>
                                        </div>
                                    </div>
                                </section>
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