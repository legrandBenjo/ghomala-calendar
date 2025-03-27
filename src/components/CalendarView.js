import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { pdf } from '@react-pdf/renderer';
import CalendarPDFDocument from './CalendarPDF'; 

const CalendarView = () => {
  const [calendarData, setCalendarData] = useState([]); // Correction: état complet
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfBlob, setPdfBlob] = useState(null);

  // Données de démonstration
  const demoData = [
    { Date: "Ŋkə̂mmghě 1 2025", "Day(Eng)": "Wednesday", "Day(Ghomala)": "Ntâmgǒ" },
    { Date: "Ŋkə̂mmghě 2 2025", "Day(Eng)": "Thursday", "Day(Ghomala)": "Tyə́'pfô" }
  ];

  // Fonction pour générer le PDF
  const generatePdf = async (data) => {
    try {
      const blob = await pdf(<CalendarPDFDocument calendarData={data} />).toBlob();
      setPdfBlob(blob);
      return blob;
    } catch (err) {
      console.error("Erreur lors de la génération du PDF:", err);
      setError("Erreur lors de la génération du PDF");
      return null;
    }
  };

  // Téléchargement du PDF
  const handleDownload = async () => {
    if (!pdfBlob) {
      const blob = await generatePdf(calendarData);
      if (!blob) return;
    }

    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'calendrier_ghomala_2025.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(process.env.PUBLIC_URL + '/resources/Ghomala_Calendar_2025-1.csv');
        if (!response.ok) throw new Error('Erreur de chargement du CSV');
        
        const csvText = await response.text();
        
        Papa.parse(csvText, {
          header: true,
          complete: async (results) => {
            setCalendarData(results.data);
            await generatePdf(results.data);
            setLoading(false);
          },
          error: (err) => {
            throw new Error(`Erreur d'analyse CSV: ${err.message}`);
          }
        });
      } catch (err) {
        console.error(err);
        setError(err.message);
        setCalendarData(demoData);
        await generatePdf(demoData);
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Retiré setCalendarData des dépendances

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Chargement du calendrier...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#2c3e50', textAlign: 'center' }}>Calendrier Ghomala 2025</h1>
      
      <div style={{ textAlign: 'center', margin: '20px 0' }}>
        <button 
          onClick={handleDownload}
          disabled={!pdfBlob && !error}
          style={{
            padding: '12px 24px',
            backgroundColor: pdfBlob || error ? '#3498db' : '#cccccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: pdfBlob || error ? 'pointer' : 'not-allowed',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          {pdfBlob ? 'Télécharger le PDF' : error ? 'Réessayer le téléchargement' : 'Préparation du PDF...'}
        </button>
      </div>

      {error && (
        <div style={{ 
          color: '#e74c3c', 
          backgroundColor: '#fadbd8', 
          padding: '10px', 
          borderRadius: '4px',
          margin: '20px 0',
          textAlign: 'center'
        }}>
          <p>{error} - Utilisation des données de démonstration</p>
        </div>
      )}

      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <p style={{ color: '#7f8c8d' }}>
          Le calendrier Ghomala suit le cycle traditionnel de 8 jours
        </p>
      </div>
    </div>
  );
};

export default CalendarView;