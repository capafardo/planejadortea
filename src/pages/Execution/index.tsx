import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { RoutineWithSteps } from '../../types';
import { Play, CheckCircle, ArrowRight, Image as ImageIcon, X, Volume2, RotateCcw } from 'lucide-react';

export default function ExecutionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [routine, setRoutine] = useState<RoutineWithSteps | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [finished, setFinished] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentMediaUrl, setCurrentMediaUrl] = useState<string>('');

  useEffect(() => {
    window.api.setFullscreen(true);
    
    if (id && id !== 'demo') {
      window.api.getRoutine(id).then(data => {
        setRoutine(data);
        if (data && data.steps.length > 0) {
          setCurrentStepIndex(0);
        } else {
          setFinished(true);
        }
      }).catch(e => {
        console.error(e);
        setFinished(true);
      });
    } else {
      setFinished(true);
    }

    return () => {
      window.api.setFullscreen(false);
      if (audioRef.current) audioRef.current.pause();
    };
  }, [id]);

  useEffect(() => {
    if (currentStepIndex >= 0 && routine && routine.steps[currentStepIndex]) {
      const step = routine.steps[currentStepIndex];
      playTTS(step.title);
      
      if (step.media_path) {
        if (step.media_path.startsWith('file://')) {
          setCurrentMediaUrl(step.media_path);
        } else {
          window.api.getMediaUrl(step.media_path).then(setCurrentMediaUrl);
        }
      } else {
        setCurrentMediaUrl('');
      }
    }
  }, [currentStepIndex, routine]);

  const playTTS = async (text: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(true);
    try {
      const audioUrl = await window.api.generateSpeech(text);
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        audio.onended = () => setIsPlaying(false);
        await audio.play();
      } else {
        setIsPlaying(false);
      }
    } catch (e) {
      console.error(e);
      setIsPlaying(false);
    }
  };

  const handleNext = () => {
    if (!routine) return;
    if (currentStepIndex + 1 < routine.steps.length) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      setFinished(true);
    }
  };
  
  const handleRestart = () => {
    if (routine && routine.steps.length > 0) {
      setFinished(false);
      setCurrentStepIndex(0);
    }
  };

  const exitRoutine = () => {
    window.api.setFullscreen(false);
    if (audioRef.current) audioRef.current.pause();
    navigate('/');
  };

  if (!routine || currentStepIndex === -1) {
    if (finished) return null; // Será interceptado abaixo
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <h1 className="text-3xl text-slate-400 dark:text-slate-600">Carregando rotina...</h1>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="min-h-screen bg-emerald-50 dark:bg-emerald-950 flex flex-col items-center justify-center p-8 relative">
        <button onClick={exitRoutine} className="absolute top-6 left-6 text-emerald-300 hover:text-emerald-500 p-4">
          <X size={32} />
        </button>

        <CheckCircle size={120} className="text-emerald-500 mb-8" />
        <h1 className="text-6xl font-bold text-emerald-800 dark:text-emerald-200 text-center mb-12">
          Muito bem!<br/>Você terminou.
        </h1>
        
        <div className="flex gap-6">
          <button 
            title="Reiniciar rotina"
            onClick={handleRestart}
            className="flex items-center justify-center w-20 h-20 bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 rounded-full shadow-lg hover:bg-emerald-200 dark:hover:bg-emerald-800 hover:scale-105 active:scale-95 transition-all"
          >
            <RotateCcw size={40} />
          </button>

          <button 
            onClick={exitRoutine}
            className="px-12 py-6 bg-emerald-500 text-white text-3xl font-bold rounded-[3rem] shadow-lg hover:bg-emerald-600 hover:scale-105 active:scale-95 transition-all"
          >
            Sair
          </button>
        </div>
      </div>
    );
  }

  const currentStep = routine.steps[currentStepIndex];
  const progressPercent = Math.round(((currentStepIndex) / routine.steps.length) * 100);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col relative select-none">
      <button onClick={exitRoutine} className="absolute top-4 left-4 text-slate-300 dark:text-slate-700 hover:text-slate-500 p-4 z-50">
        <X size={24} />
      </button>

      <div className="w-full h-4 bg-slate-200 dark:bg-slate-800">
        <div 
          className="h-full bg-blue-400 dark:bg-blue-500 transition-all duration-500 ease-out" 
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8">
        
        <div className="w-96 h-96 bg-white dark:bg-slate-800 rounded-3xl shadow-md border-4 border-slate-100 dark:border-slate-700 flex items-center justify-center mb-12 overflow-hidden relative">
          {currentMediaUrl ? (
             <img src={currentMediaUrl} alt="Pictograma" className="w-full h-full object-cover" />
          ) : (
            <ImageIcon size={120} className="text-slate-200 dark:text-slate-600" />
          )}
          
          <button 
            onClick={() => playTTS(currentStep.title)}
            className={`absolute bottom-4 right-4 p-4 rounded-full shadow-lg transition-colors ${isPlaying ? 'bg-amber-400 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-blue-100'}`}
          >
            <Volume2 size={32} />
          </button>
        </div>

        <h1 className="text-6xl font-bold text-slate-800 dark:text-slate-100 text-center mb-16 tracking-tight">
          {currentStep.title}
        </h1>

        <button 
          onClick={handleNext}
          className="flex items-center gap-4 px-16 py-8 bg-blue-500 text-white text-4xl font-bold rounded-[3rem] shadow-xl hover:bg-blue-600 hover:scale-105 active:scale-95 transition-all"
        >
          Próximo
          <ArrowRight size={48} />
        </button>

      </div>

      <div className="absolute bottom-8 w-full text-center text-slate-400 dark:text-slate-600 text-2xl font-medium tracking-widest">
        Passo {currentStepIndex + 1} de {routine.steps.length}
      </div>
    </div>
  );
}
