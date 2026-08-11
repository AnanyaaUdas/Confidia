import React,{ use, useState} from 'react'
import { useNavigate } from "react-router-dom";
import useAppStore from '../store/useAppStore';


const Admin = () => {
    const navigate = useNavigate();

    const setAdminLoggedIn = useAppStore((state) => state.setAdminLoggedIn);

    const [username, setUsername] = useState("");
    const [password,setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");

        //Demo admin credentials
        const ADMIN_USERNAME= "admin";
        const ADMIN_PASSWORD = "kindness123";

        if(
            username === ADMIN_USERNAME &&
            password === ADMIN_PASSWORD
        ){
            setAdminLoggedIn(true);
            navigate("/admin/dashboard");
        }else {
            setError("Invalid username or password");
        }
    };
  return (
    <>
        <main className="admin-login-page">
            <div className="admin-login-card">
                <div className="admin-title">
                    <span>👑</span>
                    <h1>Admin sign in</h1>
                </div>
                <p className="admin-description">
                    Restricted area - moderators only.
                </p>
                <form onSubmit={handleSubmit}>
                    <div className="admin-form-group">
                        <label>Username</label>

                        <input
                            type="text"
                            value={username}
                            onChange={(e)=>
                                setUsername(e.target.value)
                            }
                            placeholder='Enter username'
                            required
                            />
                    </div>
                    <div className="admin-form-group">
                        <label>Password</label>

                        <input
                            type="password"
                            value={password}
                            onChange={(e)=>
                                setPassword(e.target.value)
                            }
                            placeholder='Enter password'
                            required
                            />
                    </div>
                    {error && (
                        <p className="admin-error">
                            {error}
                        </p>
                    )}
                    <button
                        type='submit'
                        className='admin-login-button'
                    >Sign in</button>
                </form>
            </div>
        </main>
    </>
  )
}

export default Admin