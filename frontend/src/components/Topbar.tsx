import { FC } from 'react';
import './Topbar.css';

interface TopbarProps {
  onToggleSidebar: () => void;
}

const Topbar: FC<TopbarProps> = ({ onToggleSidebar }) => {
  return (
    <div className="topbar">
      <button type="button" className="mobile-nav-toggle" onClick={onToggleSidebar} aria-label="Toggle navigation">
        ☰
      </button>
      <div className="breadcrumb">
        <span>FormEngine</span>
        <span className="sep">/</span>
        <span className="current">Dashboard</span>
      </div>
      <div className="topbar-right">
        <div className="search-box">
          <span className="search-ico">⌕</span>
          <input placeholder="Search schemas, fields…" />
        </div>
      </div>
    </div>
  );
};

export default Topbar;
