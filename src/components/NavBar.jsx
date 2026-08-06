<div className="header">
  <div className="headerList">

    <ul>
      <li><Link to="/">Home</Link></li>
      <li><Link to="/wall">Wall</Link></li>
      <li><Link to="/write">Write</Link></li>
      <li><Link to="/badges">Badges</Link></li>
    </ul>

    <div className="loginDropDown">
      <button
        className="login-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        Login ▼
      </button>

      {isOpen && (
        <div className="dropdownMenu">
          <Link to="/user-login">User Login</Link>
          <Link to="/admin-login">Admin Login</Link>
        </div>
      )}
    </div>

  </div>
</div>