import React, { useState, useRef } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import CalendarPDF from './components/CalendarPDF';

const CalendarExporter = () => {
  const [calendarData, setCalendarData] = useState([]);
  const [fileName, setFileName] = useState('calendrier_ghomala_2025');
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name.replace('.csv', ''));

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const validData = results.data.filter(item => 
          item && item.Date && item['Day(Ghomala)']
        );
        setCalendarData(validData);
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        alert('Erreur lors de la lecture du fichier CSV');
      }
    });
  };

  const exportToFormattedExcel = () => {
    if (calendarData.length === 0) {
      alert('Veuillez d\'abord charger un fichier CSV valide');
      return;
    }

    try {
      const wb = XLSX.utils.book_new();
      const monthsData = processDataForExcel(calendarData);
      
      createQuarterSheet(wb, monthsData.slice(0, 3), 'Trimestre 1');
      createQuarterSheet(wb, monthsData.slice(3, 6), 'Trimestre 2');
      createQuarterSheet(wb, monthsData.slice(6, 9), 'Trimestre 3');
      createQuarterSheet(wb, monthsData.slice(9), 'Trimestre 4');
      
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(data, `${fileName}.xlsx`);
    } catch (error) {
      console.error('Erreur lors de la génération Excel:', error);
      alert('Une erreur est survenue lors de la génération du fichier Excel');
    }
  };

  const processDataForExcel = (data) => {
    const months = [
      'Ŋkə̂mmghě', 'Sɔ̂gwǐŋ',  'Dzə̂tsə́',
      'Dzə̂biyɛ́',  'Sûnè\'',  'Dzʉ̂ʼbvʉ̀',
      'Fə̀fə̀',    'Shwâgə̀fə̀', 'Ŋkə̂mbiyɛ́',
      'Dzʉ̂ʼmkǒ', 'Fə̂nàm',    'Fʉ̂ʼbvʉ̀'
    ];

    const days = [
      'Ntâmgǒ', 'Tyə́\'pfô', 'Shyə̂ŋkǔ\'',
      'Dzə̂dzə', 'Ntâmdzə',  'Sɛ̂sǔ',
      'Gɔ̂sʉɔ̌',  'Dzə̂mtɔ̌'
    ];

    return months.map(month => {
      const monthData = { name: month, days: {} };
      days.forEach(day => {
        monthData.days[day] = data
          .filter(item => {
            // Vérification robuste des propriétés
            if (!item || !item.Date || !item['Day(Ghomala)']) return false;
            return item.Date.startsWith(month) && item['Day(Ghomala)'] === day;
          })
          .map(item => {
            const dateParts = item.Date.split(' ');
            return dateParts.length > 1 ? parseInt(dateParts[1]) : null;
          })
          .filter(dayNum => dayNum !== null)
          .sort((a, b) => a - b);
      });
      return monthData;
    });
  };

  const createQuarterSheet = (wb, monthsData, sheetName) => {
    const wsData = [];
    
    // En-tête
    wsData.push([sheetName, '', '', '']);
    wsData.push([]);
    
    monthsData.forEach(month => {
      if (!month) return;
      
      // Titre du mois
      wsData.push([month.name, '', '', '']);
      
      // En-têtes des colonnes
      wsData.push(['Jour', 'Dates', '', '']);
      
      // Données des jours
      Object.entries(month.days || {}).forEach(([day, dates]) => {
        wsData.push([day, ...dates.map(String), '', '']);
      });
      
      // Ligne vide entre les mois
      wsData.push([]);
    });
    
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Appliquer le style
    ws['!cols'] = [
      {wch: 15}, // Colonne Jour
      {wch: 8},  // Date 1
      {wch: 8},  // Date 2
      {wch: 8}   // Date 3
    ];
    
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  };

  // Fonction pour vérifier si les données sont valides pour le PDF
  const isDataValidForPDF = (data) => {
    return data.length > 0 && data.every(item => 
      item.Date && item['Day(Ghomala)']
    );
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#2c3e50' }}>Export du Calendrier Ghomala 2025</h1>
      
      <div style={{ margin: '20px 0', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          ref={fileInputRef}
          style={{ display: 'none' }}
        />
        <button
          onClick={() => fileInputRef.current.click()}
          style={{
            padding: '10px 15px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            flex: '1 0 auto'
          }}
        >
          Choisir un fichier CSV
        </button>
        
        {calendarData.length > 0  && isDataValidForPDF(calendarData) && (
          <>
            <PDFDownloadLink
              document={<CalendarPDF calendarData={calendarData} />}
              fileName={`${fileName}.pdf`}
              style={{
                padding: '10px 15px',
                backgroundColor: '#2196F3',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px',
                flex: '1 0 auto'
              }}
            >
              {({ loading }) => (
                loading ? 'Préparation du PDF...' : 'Exporter en PDF'
              )}
            </PDFDownloadLink>
            
            <button
              onClick={exportToFormattedExcel}
              style={{
                padding: '10px 15px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                flex: '1 0 auto'
              }}
            >
              Exporter en Excel Formaté
            </button>
          </>
        )}
      </div>
      
      {calendarData.length > 0 && (
        <div style={{ 
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#f8f9fa',
          borderRadius: '4px'
        }}>
          <p><strong>Fichier chargé:</strong> {fileInputRef.current?.files[0]?.name}</p>
          <p><strong>Nombre d'entrées valides:</strong> {calendarData.length}</p>

          {!isDataValidForPDF(calendarData) && (
            <p style={{ color: '#e74c3c' }}>
              Les données chargées ne sont pas valides pour la génération du PDF
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CalendarExporter;