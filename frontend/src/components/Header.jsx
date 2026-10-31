import '../styles/Header.css';
import VLogo from '../assets/VLogo.png';

const Header = ({ onAuthClick, onHomeClick, onDashboardClick, isDashboard, onGuideDashboardClick, isGuideDashboard, onPermissionClick, isPermission, currentUser, onLogout, authMessage }) => {
  return (
    <header className="app-header">
      <div className="header-shell">
        <div className="brand-group">
          <a className="brand-block" href="#home" onClick={(event) => { event.preventDefault(); onHomeClick(); }} aria-label="VentureVista home">
            <img src={VLogo} alt="VentureVista" className="header-logo" />
          </a>

          <nav className="main-nav" aria-label="Main navigation">
            <a href="#home" className="nav-link" onClick={(event) => { event.preventDefault(); onHomeClick(); }}>Home</a>
            <button
              type="button"
              className={`nav-link nav-dashboard-link${isPermission ? ' active' : ''}`}
              onClick={onPermissionClick}
            >
              Permission
            </button>
            <button
              type="button"
              className={`nav-link nav-dashboard-link${isDashboard ? ' active' : ''}`}
              onClick={onDashboardClick}
            >
              My trips
            </button>
            <button
              type="button"
              className={`nav-link nav-dashboard-link${isGuideDashboard ? ' active' : ''}`}
              onClick={onGuideDashboardClick}
            >
              For guides
            </button>
          </nav>
        </div>

        <div className="header-actions">
          {currentUser ? (
            <>
              <span className="header-user-name" title={currentUser.email}>{currentUser.fullName}</span>
              <button type="button" className="logout-btn" onClick={onLogout}>
                <span aria-hidden="true">↪</span> Log out
              </button>
            </>
          ) : (
            <>
              <button type="button" className="login-btn" onClick={onAuthClick}>Log in</button>
              <button type="button" className="signup-btn" onClick={onAuthClick}>Sign up</button>
            </>
          )}
        </div>
      </div>
      {authMessage && <p className="header-auth-message" role="alert">{authMessage}</p>}
    </header>
  );
};

export default Header;
