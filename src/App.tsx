import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { CalendarDays, Settings, PlaySquare, Moon, Sun, X, Play } from 'lucide-react';
import RoutinesPage from './pages/Routines';
import AgendaPage from './pages/Agenda';
import ExecutionPage from './pages/Execution';
import type { Routine } from './types';

function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('theme') === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  }, []);

  const toggle = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    setIsDark(!isDark);
  };

  return (
    <button onClick={toggle} className="fixed top-6 right-6 p-3 bg-white dark:bg-slate-800 rounded-full shadow-md text-slate-600 dark:text-slate-300 hover:scale-110 transition z-50 no-print">
      {isDark ? <Sun size={24} /> : <Moon size={24} />}
    </button>
  );
}

function Dashboard() {
  const [showPlayModal, setShowPlayModal] = useState(false);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const navigate = useNavigate();

  const handleOpenPlay = async () => {
    const data = await window.api.getRoutines();
    setRoutines(data);
    setShowPlayModal(true);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-slate-800 dark:text-slate-100">RotinaTEA - Planejador de rotinas</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/agenda" className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition flex flex-col items-center justify-center gap-4 text-slate-700 dark:text-slate-200">
          <CalendarDays size={48} className="text-blue-500" />
          <span className="text-lg font-semibold">Agenda Diária</span>
        </Link>
        <Link to="/routines" className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition flex flex-col items-center justify-center gap-4 text-slate-700 dark:text-slate-200">
          <Settings size={48} className="text-emerald-500" />
          <span className="text-lg font-semibold">Criar Rotinas</span>
        </Link>
        <button onClick={handleOpenPlay} className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition flex flex-col items-center justify-center gap-4 text-slate-700 dark:text-slate-200">
          <PlaySquare size={48} className="text-amber-500" />
          <span className="text-lg font-semibold">Iniciar Rotina</span>
        </button>
      </div>

      {showPlayModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Executar Rotina Agora</h2>
              <button onClick={() => setShowPlayModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2"><X size={24}/></button>
            </div>
            
            {routines.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400 text-center py-4">Nenhuma rotina criada ainda. Vá em "Criar Rotinas" primeiro.</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {routines.map(r => (
                  <button 
                    key={r.id} 
                    onClick={() => navigate(`/execution/${r.id}`)}
                    className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-900/30 border border-slate-200 dark:border-slate-600 hover:border-amber-300 dark:hover:border-amber-500 transition group"
                  >
                    <div className="text-left">
                      <h3 className="font-bold text-slate-800 dark:text-slate-100">{r.title}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{r.total_duration_minutes} min</p>
                    </div>
                    <Play className="text-slate-300 dark:text-slate-500 group-hover:text-amber-500" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen transition-colors duration-300">
        <ThemeToggle />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/agenda" element={<AgendaPage />} />
          <Route path="/routines" element={<RoutinesPage />} />
          <Route path="/execution/:id" element={<ExecutionPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
