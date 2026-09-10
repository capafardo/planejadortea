import { ipcMain } from 'electron';
import { db, mediaDir } from '../database/index';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { EdgeTTS } from 'node-edge-tts';

export function registerHandlers() {
  const handlers = [
    'get-routines',
    'get-routine',
    'save-full-routine',
    'delete-routine',
    'print-routine',
    'save-media',
    'get-media-url',
    'get-pictograms',
    'add-pictogram',
    'generate-speech',
    'get-agenda-events',
    'create-agenda-event',
    'delete-agenda-event'
  ];
  handlers.forEach(h => ipcMain.removeHandler(h));

  ipcMain.handle('get-routines', () => {
    const stmt = db.prepare('SELECT * FROM routines ORDER BY created_at DESC');
    return stmt.all();
  });

  ipcMain.handle('get-routine', (_, id: string) => {
    const routine = db.prepare('SELECT * FROM routines WHERE id = ?').get(id);
    if (!routine) return null;
    const steps = db.prepare('SELECT * FROM steps WHERE routine_id = ? ORDER BY step_order ASC').all(id);
    return { ...routine, steps };
  });

  ipcMain.handle('save-full-routine', (_, routineData, stepsData) => {
    const insertRoutine = db.prepare('INSERT INTO routines (id, title, direction_type, total_duration_minutes) VALUES (?, ?, ?, ?)');
    const insertStep = db.prepare('INSERT INTO steps (id, routine_id, step_order, title, media_path, duration_minutes) VALUES (?, ?, ?, ?, ?, ?)');

    const transaction = db.transaction(() => {
      const routineId = routineData.id || crypto.randomUUID();
      
      if (routineData.id) {
        db.prepare('DELETE FROM steps WHERE routine_id = ?').run(routineData.id);
        db.prepare('UPDATE routines SET title = ?, direction_type = ?, total_duration_minutes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
          .run(routineData.title, routineData.direction_type, routineData.total_duration_minutes, routineData.id);
      } else {
        insertRoutine.run(routineId, routineData.title, routineData.direction_type, routineData.total_duration_minutes);
      }

      for (const step of stepsData) {
        insertStep.run(crypto.randomUUID(), routineId, step.step_order, step.title, step.media_path, step.duration_minutes);
      }
      return routineId;
    });
    
    return transaction();
  });

  ipcMain.handle('delete-routine', (_, id: string) => {
    db.prepare('PRAGMA foreign_keys = ON;').run();
    const stmt = db.prepare('DELETE FROM routines WHERE id = ?');
    stmt.run(id);
    return true;
  });

  ipcMain.handle('print-routine', async (event) => {
    try {
      const win = require('electron').BrowserWindow.fromWebContents(event.sender);
      if (!win) return false;
      
      const { dialog } = require('electron');
      const { filePath } = await dialog.showSaveDialog(win, {
        title: 'Salvar Rotina em PDF',
        defaultPath: 'RotinaTEA.pdf',
        filters: [{ name: 'Arquivos PDF', extensions: ['pdf'] }]
      });

      if (filePath) {
        const pdf = await win.webContents.printToPDF({
          printBackground: true,
          pageSize: 'A4',
          preferCSSPageSize: true
        });
        fs.writeFileSync(filePath, pdf);
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  });

  ipcMain.handle('save-media', (_, sourcePath: string) => {
    try {
      const ext = path.extname(sourcePath);
      const fileName = `${crypto.randomUUID()}${ext}`;
      const destPath = path.join(mediaDir, fileName);
      fs.copyFileSync(sourcePath, destPath);
      return fileName;
    } catch (error) {
      console.error('Failed to save media:', error);
      return null;
    }
  });

  ipcMain.handle('get-media-url', (_, fileName: string) => {
    return `file://${path.join(mediaDir, fileName)}`;
  });

  ipcMain.handle('get-pictograms', () => {
    const stmt = db.prepare('SELECT * FROM pictograms ORDER BY name ASC');
    return stmt.all();
  });

  ipcMain.handle('add-pictogram', (_, name: string, category: string, mediaPath: string) => {
    const id = crypto.randomUUID();
    const stmt = db.prepare('INSERT INTO pictograms (id, name, category, media_path) VALUES (?, ?, ?, ?)');
    stmt.run(id, name, category, mediaPath);
    return { id, name, category, media_path: mediaPath };
  });

  ipcMain.handle('generate-speech', async (_, text: string) => {
    try {
      const tts = new EdgeTTS({
        voice: 'pt-BR-FranciscaNeural',
        lang: 'pt-BR',
        outputFormat: 'audio-24khz-96kbitrate-mono-mp3'
      });
      
      const hash = crypto.createHash('md5').update(text).digest('hex');
      const fileName = `tts_${hash}.mp3`;
      const destPath = path.join(mediaDir, fileName);
      
      if (!fs.existsSync(destPath)) {
        await tts.ttsPromise(text, destPath);
      }
      
      return `file://${destPath}`;
    } catch (error) {
      console.error('TTS Error:', error);
      return null;
    }
  });

  ipcMain.handle('get-agenda-events', (_, startDate: string, endDate: string) => {
    const stmt = db.prepare(`
      SELECT a.*, r.title as routine_title, r.total_duration_minutes, r.direction_type 
      FROM agenda_events a
      JOIN routines r ON a.routine_id = r.id
      WHERE a.scheduled_date >= ? AND a.scheduled_date <= ?
      ORDER BY a.scheduled_date ASC, a.scheduled_time ASC
    `);
    return stmt.all(startDate, endDate);
  });

  ipcMain.handle('create-agenda-event', (_, data) => {
    const id = crypto.randomUUID();
    const stmt = db.prepare('INSERT INTO agenda_events (id, routine_id, scheduled_date, scheduled_time) VALUES (?, ?, ?, ?)');
    stmt.run(id, data.routine_id, data.scheduled_date, data.scheduled_time);
    return id;
  });

  ipcMain.handle('delete-agenda-event', (_, id: string) => {
    const stmt = db.prepare('DELETE FROM agenda_events WHERE id = ?');
    stmt.run(id);
    return true;
  });
}
