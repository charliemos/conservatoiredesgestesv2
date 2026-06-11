
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { CatalogueData, FilterState } from './types';
import { normalizeRecord } from './services/dataService';
import CataloguePage from './components/CataloguePage';
import AboutPage from './components/AboutPage';
import "./src/titleAnimation.sass";


// Helper component to handle member filter navigation
const AppContent: React.FC = () => {
  const [catalogue, setCatalogue] = useState<CatalogueData | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: '',
    discipline: '',
    expertise: '',
    audience: '',
    rightsHolder: ''
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);


  // fetch catalogue data on mount 

useEffect(() => {
  fetch('/data/catalogue.json')
    .then(res => res.json())
    .then(data => {
      const normalizedCollections = data.collections.map((colRaw: any) => {
        const col = normalizeRecord(colRaw);
        if (Array.isArray(colRaw.data)) {
          col.data = colRaw.data.map((d: any) => normalizeRecord(d));
        }
        return col;
      });
      setCatalogue({ collections: normalizedCollections });
      setLoading(false);
    })
    .catch(err => {
      console.error('Error loading catalogue:', err);
      setLoading(false);
    });
}, []);

useEffect(() => {
  setMobileMenuOpen(false);
}, [location.pathname]);



  const handleMemberDataView = (rightsHolder: string) => {
    setFilters(prev => ({ ...prev, rightsHolder }));
    window.location.hash = '#/';
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfcf6]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-amber-800 font-bold tracking-widest uppercase text-xs">Chargement du catalogue...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fdfcf6] flex flex-col">
      {/* Mobile Navbar */}
  <nav className="md:hidden bg-white border-b border-gray-100 px-4 py-6 sticky top-0 z-50">
    <div className="flex justify-between items-center">
      <Link to="/" className="flex items-center gap-3">
        <img src="/Logos/ReSource.png" alt="Logo" className="w-6 h-8" />
        <span className="text-s font-black text-amber-900 leading-none">
          Conservatoire des gestes<br></br>
          et du savoir faire des métiers d'art
        </span>
        
      </Link>

      {/* Burger button */}
      <button
        type="button"
        aria-label="Ouvrir le menu"
        aria-expanded={mobileMenuOpen}
        onClick={() => setMobileMenuOpen(v => !v)}
        className="text-gray-600 focus:outline-none"
      >
        {mobileMenuOpen ? (
          // X icon
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          // Burger icon
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        )}
      </button>
    </div>

    {/* Dropdown panel */}
    {mobileMenuOpen && (
      <div className="mt-3 pb-2">
        <div className="flex flex-col gap-2">
          <Link
            to="/"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
              location.pathname === "/"
                ? "bg-amber-100 text-amber-900 shadow-sm shadow-amber-200"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Rechercher
          </Link>

          <Link
            to="/about"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
              location.pathname === "/about"
                ? "bg-amber-100 text-amber-900 shadow-sm shadow-amber-200"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            À propos
          </Link>
        </div>
      </div>
    )}
  </nav>


      {/* Hero Desktop */}
      <section className="hidden md:block bg-amber-100 py-12 px-10 relative shadow-sm shadow-amber-200">
        <div className="title-container">
          <div className="first-container share">
            <h1 aria-label="Conservatoire des gestes">
              {"Conservatoire des gestes".split("").map((ch, i) => (
                <span key={i}>{ch === " " ? "\u00A0" : ch}</span>
              ))}
            </h1>
          </div>

          <div className="second-container share">
            <h1 aria-label="et du savoir faire des métiers d'art">
              {"et du savoir faire des métiers d'art".split("").map((ch, i) => (
                <span key={i}>{ch === " " ? "\u00A0" : ch}</span>
              ))}
            </h1>
          </div>

        </div>
      </section>


      <div className="grow flex max-w-6xl w-full mx-auto p-4 md:p-8 gap-8">
        {/* Sidebar Desktop */}
        <aside className="hidden md:flex flex-col w-64 shrink-0 space-y-10 sticky top-8 h-fit">
          <Link to="/">
            <img src="/Logos/ReSource.png" alt="Conservatoire Logo" className="w-full rounded-2xl shadow-sm border border-gray-100" />
          </Link>
          
          <nav className="space-y-2">
            <Link 
              to="/" 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${location.pathname === '/' ? 'bg-amber-100 text-amber-900 shadow-sm shadow-amber-200' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              Rechercher
            </Link>
            <Link 
              to="/about" 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${location.pathname === '/about' ? 'bg-amber-100 text-amber-900 shadow-sm shadow-amber-200' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              À propos
            </Link>
          </nav>
          
        </aside>

        {/* Main Area */}
        <main className="grow min-w-0">
          <Routes>
            <Route path="/" element={<CataloguePage catalogue={catalogue} filters={filters} setFilters={setFilters} />} />
            <Route path="/about" element={<AboutPage catalogue={catalogue} onViewMemberData={handleMemberDataView} />} />
          </Routes>
        </main>
      </div>

      <footer className="bg-gray-900 text-gray-500 py-12 px-8 mt-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start">
            <span className="text-white font-black uppercase tracking-tighter text-lg italic">Re•Source</span>
            <span className="text-xs">Projet France 2030</span>
          </div>
          {/*logo france 2030*/} 
          <a 
              href="https://www.economie.gouv.fr/france-2030" 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-auto inline-block"
            >
              <img 
                src="/Logos/France 2030.png" 
                alt="France 2030 Logo" 
                className="w-20 h-auto opacity-60 hover:opacity-100 transition-opacity"
              />
            </a>
          <p className="text-xs text-center md:text-right max-w-sm">
            Favoriser la transmission des compétences et la préservation du patrimoine immatériel des métiers d'art.
          </p>
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
