import { useState } from 'react';
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { AuthCtx } from './auth.js';
import { Navbar } from './components/Navbar.jsx';

import { Landing } from './pages/Landing.jsx';
import { Cases } from './pages/Cases.jsx';
import { CaseDetail } from './pages/CaseDetail.jsx';
import { JoinRoom } from './pages/JoinRoom.jsx';
import { Auth } from './pages/Auth.jsx';
import { InvestigationWorkspace } from './pages/InvestigationWorkspace.jsx';

export default function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('cz_user') || 'null'));

  const login = (data) => {
    localStorage.setItem('cz_token', data.token);
    localStorage.setItem('cz_user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('cz_token');
    localStorage.removeItem('cz_user');
    setUser(null);
  };

  const location = useLocation();
  const inCase = location.pathname.startsWith('/investigation');
  const onLanding = location.pathname === '/';

  const requireAuth = (element) => {
    if (!user) {
      return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
    }
    return element;
  };

  return (
    <AuthCtx.Provider value={{ user, login, logout }}>
      <div className="min-h-screen bg-[#08090B] text-[#E8E3D9] flex flex-col font-sans">
        {!inCase && !onLanding && <Navbar />}

        <div key={location.pathname} className="flex-1 cz-page-in">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/cases" element={<Cases />} />
            <Route path="/cases/:id" element={<CaseDetail />} />
            <Route path="/join" element={<JoinRoom />} />
            <Route path="/login" element={<Auth mode="login" />} />
            <Route path="/register" element={<Auth mode="register" />} />
            <Route path="/investigation/:id" element={requireAuth(<InvestigationWorkspace />)} />
            <Route 
              path="*" 
              element={
                <main className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
                  <div className="p-8 max-w-md bg-[#171513] border border-[#ede5d8]/15 rounded-lg shadow-2xl">
                    <div className="stamp stamp-red text-xs px-2 py-0.5 mb-3">
                      FILE NOT FOUND
                    </div>
                    <h2 className="text-2xl font-serif font-bold text-[#ede5d8] mb-2">
                      404 — Dossier Unlisted
                    </h2>
                    <p className="text-xs text-[#ede5d8]/60 mb-6">
                      No case exhibits or investigative records exist at this coordinate.
                    </p>
                    <Link 
                      to="/cases" 
                      className="px-5 py-2.5 rounded bg-[#c89b4e] text-[#12100e] text-xs font-mono font-bold tracking-wider uppercase hover:bg-[#dfb368] transition-colors inline-block"
                    >
                      Return to Case Archives
                    </Link>
                  </div>
                </main>
              } 
            />
          </Routes>
        </div>
      </div>
    </AuthCtx.Provider>
  );
}
