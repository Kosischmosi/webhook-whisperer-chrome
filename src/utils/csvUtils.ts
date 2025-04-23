
/**
 * Sicheres Umwandeln von Webhook-Daten in CSV-Format
 */
export function webhooksToCSV(webhooks: { name: string; url: string; secret: string }[]): string {
  try {
    if (!Array.isArray(webhooks) || webhooks.length === 0) {
      return "name,url,secret\n"; // Mindestens Header zurückgeben
    }
    
    // Header + Datenzeilen
    const rows = [
      ['name', 'url', 'secret'],
      ...webhooks.map(w => [
        (w.name || '').toString(),
        (w.url || '').toString(),
        (w.secret || '').toString()
      ]),
    ];
    
    // CSV mit doppelten Anführungszeichen escapen
    return rows.map(row => 
      row.map(field => `"${(field || '').replace(/"/g, '""')}"`).join(',')
    ).join('\n');
  } catch (error) {
    console.error("Fehler beim Erstellen der CSV:", error);
    throw new Error("Webhooks konnten nicht in CSV umgewandelt werden");
  }
}

/**
 * Robustes Parsen von CSV-Daten zu Webhook-Objekten
 */
export function csvToWebhooks(csvString: string): { name: string; url: string; secret: string }[] {
  console.log("CSV parsing started");
  
  if (!csvString || typeof csvString !== 'string') {
    console.error("Invalid CSV input:", csvString);
    return [];
  }
  
  try {
    // BOM-Zeichen entfernen und Leerräume trimmen
    const cleanCsv = csvString.replace(/^\uFEFF/, '').trim();
    
    if (!cleanCsv) {
      console.error("CSV string is empty after cleaning");
      return [];
    }
    
    // Splitten nach Zeilen - unterstützt verschiedene Zeilenumbrüche
    const rows = cleanCsv.split(/\r?\n/).filter(row => row.trim() !== '');
    console.log("Parsed rows count:", rows.length);
    
    if (!rows.length) {
      console.error("No rows found in CSV");
      return [];
    }
    
    // Header-Zeile erkennen und überspringen
    let dataStartIndex = 0;
    const firstRowLower = rows[0].toLowerCase();
    if (firstRowLower.includes('name') && firstRowLower.includes('url')) {
      dataStartIndex = 1;
      console.log("Skipping header row");
    }
    
    // Optimierter CSV-Parser mit besserer Fehlerbehandlung
    const results = [];
    for (let i = dataStartIndex; i < rows.length; i++) {
      const row = rows[i].trim();
      if (!row) continue;
      
      // Spalten parsen mit Berücksichtigung von Anführungszeichen
      const values = parseCSVRow(row);
      
      // Sicherstellen, dass mindestens Name und URL vorhanden sind
      if (values.length >= 2) {
        results.push({
          name: values[0] || '',
          url: values[1] || '',
          secret: values[2] || ''
        });
      } else {
        console.warn(`Row ${i + 1} has insufficient columns:`, row);
      }
    }
    
    console.log("Successfully parsed webhooks:", results.length);
    return results;
  } catch (error) {
    console.error("Error parsing CSV:", error);
    return [];
  }
}

/**
 * Parst eine einzelne CSV-Zeile mit Berücksichtigung von Anführungszeichen
 */
function parseCSVRow(row: string): string[] {
  const result: string[] = [];
  let inQuotes = false;
  let currentValue = '';
  
  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    const nextChar = i < row.length - 1 ? row[i + 1] : '';
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Doppelte Anführungszeichen innerhalb von Anführungszeichen -> ein Anführungszeichen
        currentValue += '"';
        i++; // Überspringe das nächste Anführungszeichen
      } else {
        // Ein- oder Ausschalten des Quote-Modus
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Komma außerhalb von Anführungszeichen -> neuer Wert
      result.push(currentValue);
      currentValue = '';
    } else {
      // Normales Zeichen
      currentValue += char;
    }
  }
  
  // Den letzten Wert hinzufügen
  result.push(currentValue);
  
  return result;
}
