import { FC, ReactNode, useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import './Layout.css';

interface LayoutProps {
  children: ReactNode;
}

const Layout: FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={`app ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main">
        <Topbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        <div className="content" onClick={() => sidebarOpen && setSidebarOpen(false)}>
          {children}
        </div>
      </div>
      <div className={`sidebar-backdrop ${sidebarOpen ? 'active' : ''}`} onClick={() => setSidebarOpen(false)} />
    </div>
  );
};

export default Layout;
