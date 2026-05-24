import { FC } from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const Sidebar: FC<SidebarProps> = ({ open, onClose }) => {
  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="logo">
        <div className="logo-icon">F</div>
        <div className="logo-text">
          <div className="logo-name">FormEngine</div>
          <div className="logo-tag">Meta-Driven</div>
        </div>
      </div>
      <nav className="nav">
        <div className="nav-section">Workspace</div>
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
          <span className="nav-icon">⊞</span> Dashboard
          <span className="nav-badge">4</span>
        </NavLink>
        <NavLink to="/builder" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
          <span className="nav-icon">◈</span> Form Builder
        </NavLink>
      </nav>
      <div className="sidebar-footer" />
    </aside>
  );
};

export default Sidebar;
