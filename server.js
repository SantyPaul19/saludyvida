const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Conectar a SQLite
const db = new sqlite3.Database('./evaluaciones.db');

// Crear tabla si no existe
db.run(`
  CREATE TABLE IF NOT EXISTS evaluaciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    age INTEGER,
    bmi REAL,
    glucose INTEGER,
    bp INTEGER,
    hdl INTEGER,
    ldl INTEGER,
    smoking BOOLEAN,
    activity_level TEXT,
    family_history BOOLEAN,
    fecha TEXT
  )
`);

// Endpoint para guardar evaluación
app.post('/api/evaluacion', (req, res) => {
  const {
    age, bmi, glucose, bp, hdl, ldl,
    smoking, activity_level, family_history
  } = req.body;

  const fecha = new Date().toISOString();

  const sql = `
    INSERT INTO evaluaciones 
    (age, bmi, glucose, bp, hdl, ldl, smoking, activity_level, family_history, fecha)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(sql, [
    age, bmi, glucose, bp, hdl, ldl,
    smoking ? 1 : 0,
    activity_level,
    family_history ? 1 : 0,
    fecha
  ], function(err) {
    if (err) {
      console.error(err);
      res.status(500).json({ mensaje: 'Error al guardar en la base de datos' });
    } else {
      res.status(201).json({ mensaje: 'Datos guardados correctamente', id: this.lastID });
    }
  });
});

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
