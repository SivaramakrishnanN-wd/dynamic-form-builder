import { FC } from 'react';
import './Topbar.css';

const Topbar: FC = () => {
  return (
    <div className="topbar">
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
