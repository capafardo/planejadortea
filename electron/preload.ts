import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  printRoutine: () => ipcRenderer.invoke('print-routine'),
  setFullscreen: (flag: boolean) => ipcRenderer.invoke('set-fullscreen', flag),
  
  // Rotinas e DB
  getRoutines: () => ipcRenderer.invoke('get-routines'),
  getRoutine: (id: string) => ipcRenderer.invoke('get-routine', id),
  saveFullRoutine: (routineData: any, stepsData: any[]) => ipcRenderer.invoke('save-full-routine', routineData, stepsData),
  deleteRoutine: (id: string) => ipcRenderer.invoke('delete-routine', id),

  // Pictograms Library
  getPictograms: () => ipcRenderer.invoke('get-pictograms'),
  addPictogram: (name: string, category: string, mediaPath: string) => ipcRenderer.invoke('add-pictogram', name, category, mediaPath),

  // Mídias
  saveMedia: (sourcePath: string) => ipcRenderer.invoke('save-media', sourcePath),
  getMediaUrl: (fileName: string) => ipcRenderer.invoke('get-media-url', fileName),
  generateSpeech: (text: string) => ipcRenderer.invoke('generate-speech', text),

  // Agenda
  getAgendaEvents: (startDate: string, endDate: string) => ipcRenderer.invoke('get-agenda-events', startDate, endDate),
  createAgendaEvent: (data: any) => ipcRenderer.invoke('create-agenda-event', data),
  deleteAgendaEvent: (id: string) => ipcRenderer.invoke('delete-agenda-event', id),
});
