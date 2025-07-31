import { useState, useEffect } from "react";

export default function MeasurementForm({ onMeasurementsChange, initialMeasurements = {} }) {
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    loadMeasurements();
  }, []);

  useEffect(() => {
    // Инициализируем formData с начальными значениями
    if (measurements.length > 0 && Object.keys(initialMeasurements).length === 0) {
      const initialData = {};
      measurements.forEach(measurement => {
        initialData[measurement.id] = measurement.minValue;
      });
      setFormData(initialData);
    } else if (Object.keys(initialMeasurements).length > 0) {
      setFormData(initialMeasurements);
    }
  }, [measurements, initialMeasurements]);

  const loadMeasurements = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/measurements/active");
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setMeasurements(data.measurements);
      }
    } catch (err) {
      setError("Ошибка загрузки мерок");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (measurementId, value) => {
    const newFormData = {
      ...formData,
      [measurementId]: parseInt(value) || 0
    };
    setFormData(newFormData);
    
    // Вызываем callback для передачи данных родительскому компоненту
    if (onMeasurementsChange) {
      onMeasurementsChange(newFormData);
    }
  };

  const validateMeasurement = (measurement, value) => {
    if (value < measurement.minValue || value > measurement.maxValue) {
      return `Значение должно быть от ${measurement.minValue} до ${measurement.maxValue} ${measurement.unit}`;
    }
    return null;
  };

  if (loading) {
    return <div className="measurement-form-loading">Загрузка мерок...</div>;
  }

  if (error) {
    return <div className="measurement-form-error">Ошибка: {error}</div>;
  }

  if (measurements.length === 0) {
    return <div className="measurement-form-empty">Мерки не настроены</div>;
  }

  return (
    <div className="measurement-form">
      <h3>Ваши мерки</h3>
      <div className="measurement-form-fields">
        {measurements.map((measurement) => {
          const value = formData[measurement.id] || measurement.minValue;
          const validationError = validateMeasurement(measurement, value);
          
          return (
            <div key={measurement.id} className="measurement-field">
              <label htmlFor={`measurement-${measurement.id}`}>
                {measurement.name}
                {measurement.required && <span className="required">*</span>}
              </label>
              
              {measurement.description && (
                <p className="measurement-description">{measurement.description}</p>
              )}
              
              <div className="measurement-input-group">
                <input
                  id={`measurement-${measurement.id}`}
                  type="number"
                  min={measurement.minValue}
                  max={measurement.maxValue}
                  step={measurement.step}
                  value={value}
                  onChange={(e) => handleInputChange(measurement.id, e.target.value)}
                  className={validationError ? "error" : ""}
                  required={measurement.required}
                />
                <span className="measurement-unit">{measurement.unit}</span>
              </div>
              
              {validationError && (
                <p className="measurement-error">{validationError}</p>
              )}
              
              <p className="measurement-range">
                Диапазон: {measurement.minValue} - {measurement.maxValue} {measurement.unit}
              </p>
            </div>
          );
        })}
      </div>
      
      <style jsx>{`
        .measurement-form {
          margin: 20px 0;
          padding: 20px;
          border: 1px solid #e1e1e1;
          border-radius: 8px;
          background: #f9f9f9;
        }
        
        .measurement-form h3 {
          margin: 0 0 20px 0;
          color: #333;
          font-size: 18px;
        }
        
        .measurement-form-fields {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .measurement-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .measurement-field label {
          font-weight: 600;
          color: #333;
          font-size: 14px;
        }
        
        .required {
          color: #d82c0d;
          margin-left: 4px;
        }
        
        .measurement-description {
          font-size: 12px;
          color: #666;
          margin: 0;
        }
        
        .measurement-input-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .measurement-input-group input {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 14px;
        }
        
        .measurement-input-group input:focus {
          outline: none;
          border-color: #007cba;
          box-shadow: 0 0 0 2px rgba(0, 124, 186, 0.2);
        }
        
        .measurement-input-group input.error {
          border-color: #d82c0d;
        }
        
        .measurement-unit {
          font-size: 14px;
          color: #666;
          min-width: 30px;
        }
        
        .measurement-error {
          color: #d82c0d;
          font-size: 12px;
          margin: 4px 0 0 0;
        }
        
        .measurement-range {
          font-size: 12px;
          color: #666;
          margin: 4px 0 0 0;
        }
        
        .measurement-form-loading,
        .measurement-form-error,
        .measurement-form-empty {
          text-align: center;
          padding: 20px;
          color: #666;
        }
        
        .measurement-form-error {
          color: #d82c0d;
        }
      `}</style>
    </div>
  );
}