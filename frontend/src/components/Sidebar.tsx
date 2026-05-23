import { FC } from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar: FC = () => {
  return (
    // metaadmin123
    <aside className="sidebar">
      <div className="logo">
        <div className="logo-icon">F</div>
        <div className="logo-text">
          <div className="logo-name">FormEngine</div>
          <div className="logo-tag">Meta-Driven</div>
        </div>
      </div>
      <nav className="nav">
        <div className="nav-section">Workspace</div>
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">⊞</span> Dashboard
          <span className="nav-badge">4</span>
        </NavLink>
        <NavLink to="/builder" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">◈</span> Form Builder
        </NavLink>
      </nav>
      <div className="sidebar-footer">
       
      </div>
    </aside>
  );
};

export default Sidebar;
