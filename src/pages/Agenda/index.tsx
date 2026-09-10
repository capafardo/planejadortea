import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { AgendaEventWithRoutine, Routine } from '../../types';
import { Plus, ArrowLeft, Calendar as CalendarIcon, Clock, Trash2, Play } from 'lucide-react';

const getDays = (numDays: number = 7) => {
  const days = [];
  for (let i = 0; i < numDays; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const isoString = d.toISOString().split('T')[0];
    const label = new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' }).format(d);
    days.push({ date: isoString, label: label.charAt(0).toUpperCase() + label.slice(1) });
  }
  return days;
};

export default function AgendaPage() {
  const [events, setEvents] = useState<AgendaEventWithRoutine[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [showModal, setShowModal] = useState(false);
  const days = getDays(7);

  const [selectedDate, setSelectedDate] = useState<string>(days[0].date);
  const [selectedTime, setSelectedTime] = useState<string>('08:00');
  const [selectedRoutine, setSelectedRoutine] = useState<string>('');

  useEffect(() => {
    loadEvents();
    loadRoutines();
  }, []);

  const loadEvents = async () => {
    const startDate = days[0].date;
    const endDate = days[days.length - 1].date;
    const data = await window.api.getAgendaEvents(startDate, endDate);
    setEvents(data);
  };

  const loadRoutines = async () => {
    const data = await window.api.getRoutines();
    setRoutines(data);
    if (data.length > 0) setSelectedRoutine(data[0].id);
  };

  const handleCreate = async () => {
    if (!selectedRoutine) return alert('Selecione uma rotina');
    await window.api.createAgendaEvent({
      routine_id: selectedRoutine,
      scheduled_date: selectedDate,
      scheduled_time: selectedTime,
    });
    setShowModal(false);
    loadEvents();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Remover este agendamento?')) {
      await window.api.deleteAgendaEvent(id);
      loadEvents();
    }
  };

  const openAddModal = (dateStr: string) => {
    setSelectedDate(dateStr);
    setShowModal(true);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto dark:text-slate-200">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"><ArrowLeft size={24} /></Link>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Agenda de Rotinas</h1>
        </div>
        <button onClick={() => openAddModal(days[0].date)} className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">
          <Plus className="mr-2" size={20} /> Agendar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {days.map(dayObj => {
          const dayEvents = events.filter(e => e.scheduled_date === dayObj.date);
          
          return (
            <div key={dayObj.date} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col">
              <div className="bg-slate-100 dark:bg-slate-900 p-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center">
                  <CalendarIcon size={16} className="mr-2" /> {dayObj.label}
                </span>
                <button onClick={() => openAddModal(dayObj.date)} className="text-blue-500 hover:bg-blue-50 dark:hover:bg-slate-800 p-1 rounded">
                  <Plus size={20} />
                </button>
              </div>
              
              <div className="p-4 flex-1 flex flex-col gap-3 min-h-[150px]">
                {dayEvents.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center mt-4">Nenhuma rotina agendada.</p>
                ) : (
                  dayEvents.map(ev => (
                    <div key={ev.id} className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 p-3 rounded-lg flex flex-col relative group">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm leading-tight">{ev.routine_title}</span>
                        <button onClick={() => handleDelete(ev.id)} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"><Trash2 size={16}/></button>
                      </div>
                      <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 gap-3 mt-1">
                        <span className="flex items-center"><Clock size={12} className="mr-1"/> {ev.scheduled_time}</span>
                        <span>{ev.total_duration_minutes} min</span>
                      </div>
                      <Link to={`/execution/${ev.routine_id}`} className="mt-3 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold py-1.5 rounded-md flex items-center justify-center hover:bg-emerald-200 dark:hover:bg-emerald-800 transition">
                        <Play size={14} className="mr-1" /> Iniciar Agora
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100">Agendar Rotina</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 text-sm mb-1">Data</label>
                <select value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full bg-transparent border-slate-300 dark:border-slate-600 rounded-lg p-2 border text-slate-800 dark:text-slate-200 [&>option]:bg-white dark:[&>option]:bg-slate-800">
                  {days.map(d => <option key={d.date} value={d.date}>{d.label} ({d.date})</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-slate-600 dark:text-slate-400 text-sm mb-1">Horário</label>
                <input type="time" value={selectedTime} onChange={e => setSelectedTime(e.target.value)} className="w-full bg-transparent border-slate-300 dark:border-slate-600 rounded-lg p-2 border text-slate-800 dark:text-slate-200" />
              </div>
              
              <div>
                <label className="block text-slate-600 dark:text-slate-400 text-sm mb-1">Selecione a Rotina</label>
                <select value={selectedRoutine} onChange={e => setSelectedRoutine(e.target.value)} className="w-full bg-transparent border-slate-300 dark:border-slate-600 rounded-lg p-2 border text-slate-800 dark:text-slate-200 [&>option]:bg-white dark:[&>option]:bg-slate-800">
                  <option value="" disabled>Escolha...</option>
                  {routines.map(r => <option key={r.id} value={r.id}>{r.title} ({r.total_duration_minutes} min)</option>)}
                </select>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition">Cancelar</button>
              <button onClick={handleCreate} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">Agendar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
