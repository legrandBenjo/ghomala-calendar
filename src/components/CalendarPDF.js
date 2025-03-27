import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// Configuration des polices
Font.register({
  family: 'NotoSans',
  fonts: [
    { src: '/fonts/Noto_Sans/static/NotoSans-Regular.ttf' },
    { src: '/fonts/Noto_Sans/static/NotoSans-Bold.ttf', fontWeight: 'bold' }
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: 'NotoSans',
    padding: 20,
    fontSize: 9,
  },
  title: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  monthContainer: {
    marginBottom: 20,
    border: '1pt solid #ddd',
    padding: 10,
  },
  monthHeader: {
    backgroundColor: '#3498db',
    color: 'white',
    padding: 5,
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  gridContainer: {
    flexDirection: 'column',
    width: '100%',
  },
  dayHeaderRow: {
    flexDirection: 'row',
    borderBottom: '1pt solid #ddd',
    marginBottom: 2,
  },
  dayHeader: {
    width: '12.5%',
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 3,
    backgroundColor: '#f8f9fa',
  },
  weekRow: {
    flexDirection: 'row',
    minHeight: 20,
  },
  dayCell: {
    width: '12.5%',
    textAlign: 'center',
    padding: 2,
    border: '0.5pt solid #f0f0f0',
  },
});

const DAYS_GHOMALA = [
  'Ntâmgǒ',    // Mercredi
  'Tyə́\'pfô',   // Jeudi
  'Shyə̂ŋkǔ\'', // Vendredi
  'Dzə̂dzə',    // Samedi
  'Ntâmdzə',   // Dimanche
  'Sɛ̂sǔ',      // Lundi
  'Gɔ̂sʉɔ̌',     // Mardi
  'Dzə̂mtɔ̌'     // Mercredi (cycle suivant)
];

const MONTHS = [
  { name: 'Ŋkə̂mmghě', en: 'Janvier / January' },
  { name: 'Sɔ̂gwǐŋ', en: 'Février / February' },
  { name: 'Dzə̂tsə́', en: 'Mars / March' },
  { name: 'Dzə̂biyɛ́', en: 'Avril / April' },
  { name: 'Sûnè\'', en: 'Mai / May' },
  { name: 'Dzʉ̂ʼbvʉ̀', en: 'Juin / June' },
  { name: 'Fə̀fə̀', en: 'Juillet / July' },
  { name: 'Shwâgə̀fə̀', en: 'Août / August' },
  { name: 'Ŋkə̂mbiyɛ́', en: 'Septembre / September' },
  { name: 'Dzʉ̂ʼmkǒ', en: 'Octobre / October' },
  { name: 'Fə̂nàm', en: 'Novembre / November' },
  { name: 'Fʉ̂ʼbvʉ̀', en: 'Décembre / December' }
];

const CalendarPDF = ({ calendarData = [] }) => {
  const processMonthData = (monthName) => {
    const monthDays = calendarData
      .filter(item => item.Date.startsWith(monthName))
      .map(item => ({
        day: parseInt(item.Date.split(' ')[1]),
        dayName: item['Day(Ghomala)']
      }));

    // Trouver le nombre de semaines nécessaires (4-6 selon le mois)
    const maxDay = Math.max(...monthDays.map(d => d.day));
    const weeksNeeded = Math.ceil(maxDay / 7);

    // Créer une grille dynamique (jours x semaines)
    const grid = Array(DAYS_GHOMALA.length).fill()
      .map(() => Array(weeksNeeded).fill(''));

    monthDays.forEach(({ day, dayName }) => {
      const dayIndex = DAYS_GHOMALA.indexOf(dayName);
      const weekIndex = Math.floor((day - 1) / 7);
      
      if (dayIndex !== -1 && weekIndex < weeksNeeded) {
        grid[dayIndex][weekIndex] = day;
      }
    });

    return { grid, weeksNeeded };
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Calendrier Ghomala 2025</Text>
        
        {MONTHS.map((month) => {
          const { grid, weeksNeeded } = processMonthData(month.name);
          
          return (
            <View key={month.name} style={styles.monthContainer} wrap={false}>
              <View style={styles.monthHeader}>
                <Text>{month.name}</Text>
                <Text>{month.en}</Text>
              </View>
              
              <View style={styles.gridContainer}>
                {/* En-têtes des jours */}
                <View style={styles.dayHeaderRow}>
                  {DAYS_GHOMALA.map(day => (
                    <Text key={day} style={styles.dayHeader}>{day}</Text>
                  ))}
                </View>
                
                {/* Lignes des semaines */}
                {[...Array(weeksNeeded)].map((_, weekIndex) => (
                  <View key={weekIndex} style={styles.weekRow}>
                    {DAYS_GHOMALA.map((_, dayIndex) => (
                      <Text key={dayIndex} style={styles.dayCell}>
                        {grid[dayIndex][weekIndex] || ''}
                      </Text>
                    ))}
                  </View>
                ))}
              </View>
            </View>
          );
        })}
      </Page>
    </Document>
  );
};

export default CalendarPDF;