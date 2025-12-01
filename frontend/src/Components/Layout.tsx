import { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { GiHamburgerMenu, GiAirplaneDeparture } from 'react-icons/gi';
import { IoMdClose } from 'react-icons/io';
import { FaUserCircle } from 'react-icons/fa';
import '../Styles/Aero.css'; 

function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false); 
  const navigate = useNavigate();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userMenuRef]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    setIsUserMenuOpen(false);
    navigate('/');
  };

  return (
    <div className={`layout ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      
      <aside className="sidebar">
        <div className="logo-sidebar">
          <div className="logo-brand">
            <GiAirplaneDeparture className="logo-icon" />
            <h1 className="titulo-sidebar">AEROCODE GUI</h1>
          </div>
          <IoMdClose className="icon-close" onClick={toggleSidebar} />
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li><Link to="/admin/dashboard">Visão Geral</Link></li>
            <li><Link to="/admin/aeronaves">Aeronaves</Link></li>
            <li><Link to="/admin/etapas">Etapas</Link></li>
            <li><Link to="/admin/pecas">Peças</Link></li>
            <li><Link to="/admin/testes">Testes</Link></li>
            <li><Link to="/admin/funcionarios">Funcionários</Link></li>
            <li><Link to="/admin/relatorios">Relatórios</Link></li>
          </ul>
        </nav>
        <div className="sidebar-footer-empty"></div>
      </aside>

      <div className="main-content-wrapper">
        <header className="app-header">
          <div className="header-left-section">
            <GiHamburgerMenu className="icon-open" onClick={toggleSidebar} />
          </div>
          <div className="header-right-section">
            <div className="header-user-profile" ref={userMenuRef}>
              <div className="user-profile-toggle" onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}>
                <FaUserCircle className="user-icon" />
                <span className="user-name">Admin User</span>
              </div>
              {isUserMenuOpen && (
                <div className="user-dropdown-menu">
                  <button className="sair-button-dropdown" onClick={handleLogout}>
                    Sair
                  </button>
                </div>
              )}
            </div>
          </div>

        </header>
        
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;