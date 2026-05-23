import { FC, ReactNode } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import './Layout.css';

interface LayoutProps {
  children: ReactNode;
}

const Layout: FC<LayoutProps> = ({ children }) => {
  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <Topbar />
        <div className="content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
