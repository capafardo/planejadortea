import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Routine, RoutineWithSteps, Step, Pictogram } from '../../types';
import { Plus, Save, ArrowLeft, Image as ImageIcon, Trash2, X, Upload, Play, Edit3 } from 'lucide-react';

export default function RoutinesPage() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Builder state
  const [title, setTitle] = useState('');
  const [direction, setDirection] = useState<'IDA' | 'VOLTA' | 'UNICA'>('UNICA');
  const [steps, setSteps] = useState<Partial<Step>[]>([]);

  // Pictogram Modal state
  const [showPicModal, setShowPicModal] = useState<number | null>(null);
  const [pictograms, setPictograms] = useState<Pictogram[]>([]);
  const [picCategory, setPicCategory] = useState<string>('Higiene');
  
  const [newPicName, setNewPicName] = useState('');
  const [newPicCategory, setNewPicCategory] = useState('Higiene');
  const [isAddingPic, setIsAddingPic] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const CATEGORIES = ['Higiene', 'Alimentação', 'Vestuário', 'Saúde', 'Escola', 'Transportes', 'Lazer', 'Sono', 'Externos', 'Emoções', 'Outros'];

  useEffect(() => {
    loadRoutines();
    loadPictograms();
  }, []);

  const loadRoutines = async () => {
    const data = await window.api.getRoutines();
    setRoutines(data);
  };

  const loadPictograms = async () => {
    const data = await window.api.getPictograms();
    setPictograms(data);
  };

  const loadRoutine = async (id: string) => {
    const data = await window.api.getRoutine(id);
    if (data) {
      setTitle(data.title);
      setDirection(data.direction_type);
      setSteps(data.steps);
      setEditingId(data.id);
    }
  };

  const handleCreateNew = () => {
    setEditingId('new');
    setTitle('');
    setDirection('UNICA');
    setSteps([]);
  };

  const handleAddStep = () => {
    setSteps([...steps, { title: '', media_path: null, duration_minutes: 5, step_order: steps.length + 1 }]);
  };

  const handleStepChange = (index: number, field: keyof Step, value: any) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
  };

  const handleRemoveStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index);
    newSteps.forEach((s, i) => s.step_order = i + 1);
    setSteps(newSteps);
  };

  const handleSave = async () => {
    if (!title.trim()) return alert('O título é obrigatório.');
    const totalMinutes = steps.reduce((acc, step) => acc + (Number(step.duration_minutes) || 0), 0);
    
    await window.api.saveFullRoutine(
      { id: editingId === 'new' ? undefined : editingId, title, direction_type: direction, total_duration_minutes: totalMinutes },
      steps
    );
    
    setEditingId(null);
    loadRoutines();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Excluir esta rotina?')) {
      await window.api.deleteRoutine(id);
      loadRoutines();
    }
  };


  const handleSelectPictogram = async (pic: Pictogram) => {
    if (showPicModal === null) return;
    const newSteps = [...steps];
    newSteps[showPicModal] = {
      ...newSteps[showPicModal],
      media_path: pic.media_path,
      title: pic.name
    };
    setSteps(newSteps);
    setShowPicModal(null);
  };

  const handleUploadNewPictogram = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    if (!newPicName.trim()) {
      alert('Digite um nome para o pictograma antes de enviar a imagem.');
      return;
    }
    
    const file = e.target.files[0];
    const path = (file as any).path;

    if (path) {
      const savedFileName = await window.api.saveMedia(path);
      if (savedFileName) {
        const newPic = await window.api.addPictogram(newPicName, newPicCategory, savedFileName);
        setPictograms([...pictograms, newPic]);
        setIsAddingPic(false);
        setNewPicName('');
        handleSelectPictogram(newPic);
      } else {
        alert('Erro ao salvar mídia.');
      }
    }
  };

  const totalTime = steps.reduce((acc, step) => acc + (Number(step.duration_minutes) || 0), 0);

  const renderPictogramModal = () => {
    if (showPicModal === null) return null;
    
    const filteredPics = pictograms.filter(p => p.category === picCategory);

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Biblioteca de Pictogramas</h2>
            <button onClick={() => setShowPicModal(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2"><X size={24}/></button>
          </div>
          
          <div className="flex flex-1 overflow-hidden">
            <div className="w-48 bg-slate-100 dark:bg-slate-800/50 border-r border-slate-200 dark:border-slate-700 p-4 flex flex-col gap-2 overflow-y-auto">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setPicCategory(cat)}
                  className={`text-left px-4 py-2 rounded-lg font-medium transition ${picCategory === cat ? 'bg-blue-500 text-white shadow-md' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex-1 p-6 overflow-y-auto bg-slate-50 dark:bg-slate-900">
              {isAddingPic ? (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm max-w-md mx-auto">
                  <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-slate-100">Adicionar Novo Pictograma</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Nome do Pictograma (Ex: Lavar as Mãos)</label>
                      <input value={newPicName} onChange={e => setNewPicName(e.target.value)} className="w-full bg-transparent border-slate-300 dark:border-slate-600 rounded-lg p-2 border text-slate-800 dark:text-slate-200" placeholder="Nome para a etapa..." />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Categoria</label>
                      <select value={newPicCategory} onChange={e => setNewPicCategory(e.target.value)} className="w-full bg-transparent border-slate-300 dark:border-slate-600 rounded-lg p-2 border text-slate-800 dark:text-slate-200 [&>option]:bg-white dark:[&>option]:bg-slate-800">
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full mt-4 flex items-center justify-center gap-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 p-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition border border-slate-300 dark:border-slate-600"
                    >
                      <Upload size={20} /> Escolher Imagem
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleUploadNewPictogram} />
                    
                    <button onClick={() => setIsAddingPic(false)} className="w-full text-center mt-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Categoria: {picCategory}</h3>
                    <button onClick={() => setIsAddingPic(true)} className="flex items-center text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 px-3 py-1.5 rounded-lg transition font-medium">
                      <Plus size={18} className="mr-1" /> Adicionar Pictograma
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filteredPics.map(pic => (
                      <button 
                        key={pic.id} 
                        onClick={() => handleSelectPictogram(pic)}
                        className="group flex flex-col items-center p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:shadow-lg hover:border-blue-400 dark:hover:border-blue-500 transition"
                      >
                        <div className="w-24 h-24 mb-3 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                          <PictogramImage mediaPath={pic.media_path} />
                        </div>
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 text-center leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          {pic.name}
                        </span>
                      </button>
                    ))}

                    {filteredPics.length === 0 && (
                      <div className="col-span-full py-12 text-center text-slate-400 dark:text-slate-500">
                        <ImageIcon size={48} className="mx-auto mb-4 opacity-50" />
                        <p>Nenhum pictograma nesta categoria.</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printItemsPerPage, setPrintItemsPerPage] = useState<4 | 6 | 8>(4);
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = async () => {
    setIsPrinting(true);
    // Aguarda um ciclo de render para o DOM se preparar para print-only
    setTimeout(async () => {
      const success = await window.api.printRoutine();
      if (success) {
        alert('PDF gerado e salvo com sucesso!');
      }
      setIsPrinting(false);
      setShowPrintModal(false);
    }, 500);
  };

  const renderPrintModal = () => {
    if (!showPrintModal) return null;
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 no-print">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Exportar PDF</h2>
            <button onClick={() => setShowPrintModal(false)} className="text-slate-400 hover:text-slate-600 p-2"><X size={20}/></button>
          </div>
          <div className="space-y-4">
            <label className="block text-sm text-slate-600 dark:text-slate-400">Pictogramas por folha A4:</label>
            <div className="grid grid-cols-3 gap-2">
              {[4, 6, 8].map(num => (
                <button
                  key={num}
                  onClick={() => setPrintItemsPerPage(num as any)}
                  className={`py-3 rounded-lg font-bold border transition ${printItemsPerPage === num ? 'bg-blue-500 text-white border-blue-500' : 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600'}`}
                >
                  {num}
                </button>
              ))}
            </div>
            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className="w-full mt-6 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition flex justify-center items-center"
            >
              {isPrinting ? 'Gerando PDF...' : 'Salvar como PDF'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderPrintView = () => {
    // Dividir os steps em páginas baseadas no itemsPerPage
    const pages = [];
    for (let i = 0; i < steps.length; i += printItemsPerPage) {
      pages.push(steps.slice(i, i + printItemsPerPage));
    }
    
    // Calcular as classes de grid apropriadas dependendo do número por página
    const gridCols = printItemsPerPage === 4 ? 'grid-cols-2' : (printItemsPerPage === 6 ? 'grid-cols-2' : 'grid-cols-2');
    const gapClass = printItemsPerPage === 8 ? 'gap-4' : 'gap-8';
    
    return (
      <div className="print-only bg-white text-black font-sans">
        {pages.map((pageSteps, pageIdx) => (
          <div key={pageIdx} className="print-page py-8">
            <div className="text-center mb-8 border-b-2 border-black pb-4 w-full px-8">
              <h1 className="text-4xl font-extrabold uppercase">{title}</h1>
              <p className="text-lg mt-2 text-gray-700">Página {pageIdx + 1} de {pages.length} - Direção: {direction}</p>
            </div>
            
            <div className={`grid ${gridCols} ${gapClass} w-full px-8 flex-1 content-start`}>
              {pageSteps.map((step, idx) => (
                <div key={idx} className="flex flex-col items-center border-4 border-black rounded-3xl p-6 bg-white break-inside-avoid shadow-sm h-full">
                  <div className="w-full aspect-square flex items-center justify-center rounded-2xl overflow-hidden mb-6 border-2 border-gray-200">
                    {step.media_path ? (
                      <PictogramImage mediaPath={step.media_path} />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                        <ImageIcon size={64} className="text-gray-300" />
                      </div>
                    )}
                  </div>
                  <h2 className="text-3xl font-bold text-center leading-tight uppercase tracking-tight flex-1 flex items-center">
                    {step.title || 'Sem Título'}
                  </h2>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (editingId) {
    return (
      <div className="dark:text-slate-200">
        <div className="p-8 max-w-4xl mx-auto no-print">
          <div className="flex justify-between items-center mb-6">
            <button onClick={() => setEditingId(null)} className="flex items-center text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200">
              <ArrowLeft className="mr-2" /> Voltar
            </button>
            <div className="flex gap-4">
              <button onClick={() => setShowPrintModal(true)} className="bg-slate-200 dark:bg-slate-700 px-4 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition font-medium border border-slate-300 dark:border-slate-600 shadow-sm">
                Gerar PDF
              </button>
              <button onClick={handleSave} className="flex items-center bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition shadow-sm font-medium">
                <Save className="mr-2" size={20} /> Salvar Rotina
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 mb-6">
            <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100">Configuração da Rotina</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 text-sm mb-1">Título</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-transparent border-slate-300 dark:border-slate-600 rounded-lg p-2 border" placeholder="Ex: Ida à Escola" />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 text-sm mb-1">Tipo / Direção</label>
                <select value={direction} onChange={(e) => setDirection(e.target.value as any)} className="w-full bg-transparent border-slate-300 dark:border-slate-600 rounded-lg p-2 border [&>option]:bg-white dark:[&>option]:bg-slate-800 text-slate-800 dark:text-slate-200">
                  <option value="UNICA">Atividade Única</option>
                  <option value="IDA">Ida (Saída)</option>
                  <option value="VOLTA">Volta (Retorno)</option>
                </select>
              </div>
            </div>
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-lg font-semibold text-lg flex justify-between">
              <span>Tempo Total Estimado:</span>
              <span>{totalTime} minutos</span>
            </div>
          </div>

          <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-100">Passos (Pictogramas)</h3>
          
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-4">
                <div className="text-2xl font-bold text-slate-300 dark:text-slate-600 w-8">{index + 1}</div>
                
                <button 
                  onClick={() => setShowPicModal(index)}
                  className="w-24 h-24 bg-slate-100 dark:bg-slate-700 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-400 dark:text-slate-500 shrink-0 hover:bg-slate-200 dark:hover:bg-slate-600 transition overflow-hidden p-1 relative group"
                >
                  {step.media_path ? (
                    <PictogramImage mediaPath={step.media_path} />
                  ) : (
                    <ImageIcon size={32} />
                  )}
                  <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center text-white text-xs font-bold rounded-md">
                    Trocar
                  </div>
                </button>

                <div className="flex-1 space-y-2">
                  <input 
                    value={step.title} 
                    onChange={(e) => handleStepChange(index, 'title', e.target.value)}
                    placeholder="Instrução / Título do Passo (Preenchimento Automático)"
                    className="w-full bg-transparent border-slate-300 dark:border-slate-600 rounded-lg p-2 border text-lg"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Tempo (min):</span>
                    <input 
                      type="number" 
                      value={step.duration_minutes} 
                      onChange={(e) => handleStepChange(index, 'duration_minutes', parseInt(e.target.value) || 0)}
                      className="w-24 bg-transparent border-slate-300 dark:border-slate-600 rounded-lg p-1 border text-center"
                      min="1"
                    />
                  </div>
                </div>
                <button onClick={() => handleRemoveStep(index)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg no-print">
                  <Trash2 size={24} />
                </button>
              </div>
            ))}
            
            <button onClick={handleAddStep} className="w-full py-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center justify-center no-print">
              <Plus className="mr-2" /> Adicionar Passo
            </button>
          </div>
          
          {renderPictogramModal()}
          {renderPrintModal()}
        </div>
        
        {renderPrintView()}
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto dark:text-slate-200">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"><ArrowLeft size={24} /></Link>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Biblioteca de Rotinas</h1>
        </div>
        <button onClick={handleCreateNew} className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">
          <Plus className="mr-2" size={20} /> Nova Rotina
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {routines.map(r => (
          <div key={r.id} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 group hover:shadow-md transition">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{r.title}</h3>
              <span className={`px-2 py-1 text-xs rounded-full font-semibold ${r.direction_type === 'IDA' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' : r.direction_type === 'VOLTA' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'}`}>
                {r.direction_type}
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-6 font-medium">Duração total: {r.total_duration_minutes} min</p>
            
            <div className="flex gap-2 justify-end">
              <button 
                title="Executar Agora"
                onClick={() => navigate(`/execution/${r.id}`)} 
                className="flex items-center justify-center w-10 h-10 bg-amber-100 dark:bg-amber-900/40 hover:bg-amber-200 dark:hover:bg-amber-800/80 text-amber-700 dark:text-amber-400 rounded-lg transition shadow-sm"
              >
                <Play size={20} className="ml-1" />
              </button>
              
              <button 
                title="Editar"
                onClick={() => loadRoutine(r.id)} 
                className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900/40 hover:bg-blue-200 dark:hover:bg-blue-800/80 text-blue-700 dark:text-blue-400 rounded-lg transition shadow-sm"
              >
                <Edit3 size={20} />
              </button>
              
              <button 
                title="Excluir"
                onClick={() => handleDelete(r.id)} 
                className="flex items-center justify-center w-10 h-10 bg-red-100 dark:bg-red-900/40 hover:bg-red-200 dark:hover:bg-red-800/80 text-red-600 dark:text-red-400 rounded-lg transition shadow-sm"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
        
        {routines.length === 0 && (
          <div className="col-span-full p-8 text-center text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
            Nenhuma rotina cadastrada. Clique em "Nova Rotina" para começar.
          </div>
        )}
      </div>
    </div>
  );
}

function PictogramImage({ mediaPath }: { mediaPath: string }) {
  const [url, setUrl] = useState<string>('');
  
  useEffect(() => {
    if (mediaPath.startsWith('file://')) {
      setUrl(mediaPath);
    } else {
      window.api.getMediaUrl(mediaPath).then(setUrl);
    }
  }, [mediaPath]);

  if (!url) return <div className="w-full h-full animate-pulse bg-slate-200 dark:bg-slate-600"></div>;
  
  return <img src={url} alt="Pictogram" className="w-full h-full object-cover" />;
}
