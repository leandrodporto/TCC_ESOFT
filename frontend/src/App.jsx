import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Places from './pages/Places';
import Points from './pages/Points';
import Routers from './pages/Routers';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/places" element={<Places />} />
        <Route path="/points" element={<Points />} />
        <Route path="/routers" element={<Routers />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;