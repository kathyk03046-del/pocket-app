import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import Capture from './components/Capture';
import Buffer from './components/Buffer';
import Archive from './components/Archive';
import { useEntries } from './hooks/useEntries';

function Nav() {
  const { pendingEntries } = useEntries();
  const count = pendingEntries.length;
  const location = useLocation();

  return (
    <nav style={{
      position: 'fixed',
      bottom: 26,
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      padding: '5px 6px',
      background: 'rgba(20,20,20,0.82)',
      backdropFilter: 'blur(40px)',
      WebkitBackdropFilter: 'blur(40px)',
      border: '0.5px solid rgba(255,255,255,0.08)',
      borderRadius: 100,
      zIndex: 100,
    }}>
      {[
        { to: '/', label: 'Capture' },
        { to: '/buffer', label: 'Buffer', count },
        { to: '/archive', label: 'Archive' },
      ].map(({ to, label, count: c }) => {
        const isActive = to === '/'
          ? location.pathname === '/'
          : location.pathname.startsWith(to);
        return (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '6px 14px',
              borderRadius: 100,
              textDecoration: 'none',
              fontSize: 13,
              letterSpacing: '-0.01em',
              fontWeight: isActive ? 500 : 400,
              color: isActive ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.2)',
              background: isActive ? 'rgba(255,255,255,0.10)' : 'transparent',
              transition: 'all 0.18s ease',
            }}
          >
            {label}
            {c != null && c > 0 && (
              <span style={{
                fontSize: 11,
                color: isActive ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.18)',
              }}>
                {c}
              </span>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100svh', background: '#060606' }}>
        <Routes>
          <Route path="/" element={<Capture />} />
          <Route path="/buffer" element={<Buffer />} />
          <Route path="/archive" element={<Archive />} />
        </Routes>
        <Nav />
      </div>
    </BrowserRouter>
  );
}
