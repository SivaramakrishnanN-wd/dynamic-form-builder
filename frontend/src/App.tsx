import { FC } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Builder from './pages/Builder';
import Renderer from './pages/Renderer';
import Responses from './pages/Responses';

const App: FC = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/builder" element={<Builder />} />
        <Route path="/builder/:formId" element={<Builder />} />
        <Route path="/renderer/:formId" element={<Renderer />} />
        <Route path="/responses/:formId" element={<Responses />} />
      </Routes>
    </Layout>
  );
};

export default App;
