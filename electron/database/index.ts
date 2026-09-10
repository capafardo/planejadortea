import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { app } from 'electron';
import crypto from 'crypto';

const userDataPath = app.getPath('userData');
const dbDir = path.join(userDataPath, 'database');
export const mediaDir = path.join(userDataPath, 'media');

if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
if (!fs.existsSync(mediaDir)) fs.mkdirSync(mediaDir, { recursive: true });

const dbPath = path.join(dbDir, 'app.db');
export const db = new Database(dbPath);

export function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS routines (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      direction_type TEXT,
      total_duration_minutes INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS steps (
      id TEXT PRIMARY KEY,
      routine_id TEXT NOT NULL,
      step_order INTEGER NOT NULL,
      title TEXT NOT NULL,
      media_path TEXT,
      duration_minutes INTEGER DEFAULT 0,
      FOREIGN KEY (routine_id) REFERENCES routines(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS agenda_events (
      id TEXT PRIMARY KEY,
      routine_id TEXT NOT NULL,
      scheduled_date TEXT NOT NULL,
      scheduled_time TEXT NOT NULL,
      FOREIGN KEY (routine_id) REFERENCES routines(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS pictograms (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      media_path TEXT NOT NULL
    );
  `);

  // Popular a biblioteca inicial caso esteja vazia
  const countStmt = db.prepare('SELECT COUNT(*) as count FROM pictograms');
  const countResult = countStmt.get() as { count: number };
  
  if (countResult.count === 0) {
    seedPictograms();
  }
}

function seedPictograms() {
  const isPackaged = app.isPackaged;
  // __dirname is dist-electron
  const distPath = path.join(__dirname, '../dist');
  const publicPath = isPackaged ? distPath : path.join(__dirname, '../public');
  const bundledDir = path.join(publicPath, 'bundled-pictograms');
  const manifestPath = path.join(bundledDir, 'manifest.json');

  if (fs.existsSync(manifestPath)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      const insertPic = db.prepare('INSERT INTO pictograms (id, name, category, media_path) VALUES (?, ?, ?, ?)');
      
      const transaction = db.transaction(() => {
        for (const item of manifest) {
          const sourceFile = path.join(bundledDir, item.filename);
          if (fs.existsSync(sourceFile)) {
            const ext = path.extname(item.filename) || '.png';
            const destFilename = crypto.randomUUID() + ext;
            const destPath = path.join(mediaDir, destFilename);
            fs.copyFileSync(sourceFile, destPath);
            insertPic.run(crypto.randomUUID(), item.name, item.category, destFilename);
          }
        }
      });
      
      transaction();
      console.log('Biblioteca de pictogramas preenchida com sucesso.');
    } catch (e) {
      console.error('Erro ao fazer seeding da biblioteca de pictogramas:', e);
    }
  }
}
