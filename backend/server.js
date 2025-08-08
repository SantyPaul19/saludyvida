require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// Configurar conexión a PostgreSQL desde variables .env
const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT
});

// Crear tabla si no existe
const crearTabla = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS evaluaciones (
      id SERIAL PRIMARY KEY,
      age INTEGER,
      bmi REAL,
      glucose INTEGER,
      bp INTEGER,
      hdl INTEGER,
      ldl INTEGER,
      smoking BOOLEAN,
      activity_level TEXT,
      family_history BOOLEAN,
      risk_score REAL,
      level TEXT,
      fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
};
crearTabla();

// Lógica simulada de predicción
function simularPrediccion(data) {
  const { age, bmi, glucose, bp, hdl, ldl, smoking, activity_level, family_history } = data;

  let score = 0;
  if (age > 50) score += 0.1;
  if (bmi > 30) score += 0.1;
  if (glucose > 120) score += 0.15;
  if (bp > 140) score += 0.1;
  if (hdl < 40) score += 0.1;
  if (ldl > 160) score += 0.1;
  if (smoking) score += 0.1;
  if (activity_level === 'low') score += 0.1;
  if (family_history) score += 0.15;

  score = Math.min(1, Math.max(0, score));

  let level = 'Bajo';
  if (score >= 0.7) level = 'Alto';
  else if (score >= 0.4) level = 'Moderado';

  const recommendations = [
    'Hacer ejercicio regularmente',
    'Mantener una dieta saludable',
    'Realizar chequeos médicos frecuentes'
  ];
  if (score >= 0.7) recommendations.push('Consultar a un cardiólogo');
  if (smoking) recommendations.push('Dejar de fumar');

  return { risk_score: score, level, recommendations };
}

// POST /api/prediction
app.post('/api/prediction', async (req, res) => {
  const data = req.body;
  const resultado = simularPrediccion(data);

  try {
    await pool.query(`
      INSERT INTO evaluaciones (
        age, bmi, glucose, bp, hdl, ldl, smoking,
        activity_level, family_history, risk_score, level
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    `, [
      data.age, data.bmi, data.glucose, data.bp, data.hdl, data.ldl,
      data.smoking,
      data.activity_level,
      data.family_history,
      resultado.risk_score,
      resultado.level
    ]);

    res.json(resultado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al guardar los datos' });
  }
});

// GET /api/evaluaciones
app.get('/api/evaluaciones', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM evaluaciones ORDER BY fecha DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener datos' });
  }
});

// DELETE /api/evaluaciones
app.delete('/api/evaluaciones', async (req, res) => {
  try {
    await pool.query('DELETE FROM evaluaciones');
    res.json({ mensaje: 'Datos eliminados correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al borrar los datos' });
  }
});

// Ruta raíz
app.get('/', (req, res) => {
  res.send('✅ API de predicción cardiometabólica activa (PostgreSQL)');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
});
