import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { pdf } from '@react-pdf/renderer';
import CalendarPDF from './CalendarPDF';


const CalendarView = () => {
  const [ setCalendarData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfBlob, setPdfBlob] = useState(null);

  // Fonction pour générer le PDF
  const generatePdf = async (data) => {
    try {
      const blob = await pdf(<CalendarPDF calendarData={data} />).toBlob();
      setPdfBlob(blob);
    } catch (err) {
      console.error('Erreur génération PDF:', err);
      setError('Échec de la génération du PDF');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(process.env.PUBLIC_URL + '/resources/Ghomala_Calendar_2025-1.csv');
        if (!response.ok) throw new Error('Erreur de chargement du CSV');
        
        const csvText = await response.text();
        
        Papa.parse(csvText, {
          header: true,
          complete: (results) => {
            setCalendarData(results.data);
            generatePdf(results.data); // Pré-génère le PDF
            setLoading(false);
          }
        });
      } catch (err) {
        console.error(err);
        setError(err.message);
        generatePdf(demoData); // Utilise les données demo en cas d'erreur
        setLoading(false);
      }
    };

    fetchData();
  }, [setCalendarData]);

  // Méthode de téléchargement manuelle
  const handleDownload = () => {
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'calendrier_ghomala_2025.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Calendrier Ghomala 2025</h1>
      
      <button 
        onClick={handleDownload}
        disabled={!pdfBlob}
        style={{
          padding: '10px 15px',
          backgroundColor: pdfBlob ? '#4CAF50' : '#cccccc',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: pdfBlob ? 'pointer' : 'not-allowed'
        }}
      >
        {pdfBlob ? 'Télécharger le PDF' : 'Préparation du PDF...'}
      </button>

      {error && (
        <div style={{ color: 'red', marginTop: '10px' }}>
          {error} - Utilisation des données de démonstration
        </div>
      )}
    </div>
  );
};

// Données de démonstration
const demoData = [
  { Date: "Ŋkə̂mmghě 1 2025", "Day(Eng)": "Wednesday", "Day(Ghomala)": "Ntâmgǒ" },
  { Date: "Ŋkə̂mmghě 2 2025", "Day(Eng)": "Thursday", "Day(Ghomala)": "Tyə́'pfô" }
];

export default CalendarView;