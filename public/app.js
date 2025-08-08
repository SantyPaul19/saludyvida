const { useState, useEffect } = React;

function App() {
  const [formData, setFormData] = useState({
    age: '',
    bmi: '',
    glucose: '',
    bp: '',
    hdl: '',
    ldl: '',
    smoking: false,
    activity_level: 'medium',
    family_history: false
  });

  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/prediction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error al conectarse al backend:", error);
      alert("No se pudo conectar al servidor.");
    }
  };

  useEffect(() => {
    if (result && window.Chart) {
      const ctx = document.getElementById('riskChart').getContext('2d');
      if (window.myChart) window.myChart.destroy();
      window.myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Riesgo', 'Saludable'],
          datasets: [{
            data: [result.risk_score, 1 - result.risk_score],
            backgroundColor: ['#e74c3c', '#2ecc71'],
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'bottom' },
            title: { display: true, text: 'Nivel de Riesgo' }
          }
        }
      });
    }
  }, [result]);

  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h1 className="display-5 fw-bold text-primary">Evaluación del Riesgo Cardiometabólico</h1>
        <p className="lead">Completa el formulario para conocer tu nivel de riesgo y obtener recomendaciones.</p>
      </div>
      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-4">Datos del paciente</h5>
              <form onSubmit={handleSubmit}>
                {[
                  { label: 'Edad', name: 'age' },
                  { label: 'IMC', name: 'bmi' },
                  { label: 'Glucosa', name: 'glucose' },
                  { label: 'Presión Arterial', name: 'bp' },
                  { label: 'HDL', name: 'hdl' },
                  { label: 'LDL', name: 'ldl' },
                ].map((field, idx) => (
                  <div className="mb-3" key={idx}>
                    <label className="form-label">{field.label}</label>
                    <input type="number" className="form-control" name={field.name} value={formData[field.name]} onChange={handleChange} required />
                  </div>
                ))}
                <div className="form-check form-switch mb-3">
                  <input className="form-check-input" type="checkbox" name="smoking" checked={formData.smoking} onChange={handleChange} />
                  <label className="form-check-label">¿Fuma?</label>
                </div>
                <div className="mb-3">
                  <label className="form-label">Nivel de actividad</label>
                  <select className="form-select" name="activity_level" value={formData.activity_level} onChange={handleChange}>
                    <option value="low">Bajo</option>
                    <option value="medium">Medio</option>
                    <option value="high">Alto</option>
                  </select>
                </div>
                <div className="form-check form-switch mb-4">
                  <input className="form-check-input" type="checkbox" name="family_history" checked={formData.family_history} onChange={handleChange} />
                  <label className="form-check-label">Antecedentes familiares</label>
                </div>
                <button type="submit" className="btn btn-primary w-100">Calcular Riesgo</button>
              </form>
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          {result && (
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title text-success mb-4">Resultado</h5>
                <p><strong>Riesgo:</strong> {result.level}</p>
                <p><strong>Score:</strong> {(result.risk_score * 100).toFixed(2)}%</p>
                <canvas id="riskChart" width="300" height="300"></canvas>
                <div className="mt-4">
                  <h6>Recomendaciones</h6>
                  <ul className="list-group list-group-flush">
                    {result.recommendations.map((rec, i) => (
                      <li className="list-group-item" key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
