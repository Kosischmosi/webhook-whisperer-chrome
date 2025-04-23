
export function webhooksToCSV(webhooks: { name: string; url: string; secret: string }[]): string {
  const rows = [
    ['name', 'url', 'secret'],
    ...webhooks.map(w => [w.name, w.url, w.secret]),
  ];
  return rows.map(row => 
    row.map(field => `"${(field || '').replace(/"/g, '""')}"`).join(',')
  ).join('\n');
}

export function csvToWebhooks(csvString: string): { name: string; url: string; secret: string }[] {
  // Debug Output
  console.log("CSV Input:", csvString.slice(0, 100) + "...");
  
  // Handle potential BOM character in CSV file
  const cleanCsv = csvString.replace(/^\uFEFF/, '');
  
  // Überprüfe, ob die CSV eine leere Zeichenkette ist
  if (!cleanCsv || cleanCsv.trim() === '') {
    console.error("CSV string is empty");
    return [];
  }
  
  try {
    // Very simple CSV parser (works for our fields)
    const rows = cleanCsv.trim().split(/\r?\n/);
    console.log("Parsed rows:", rows.length);
    if (!rows.length) return [];
    
    const [header, ...dataRows] = rows;
    console.log("Header:", header);
    console.log("Data rows:", dataRows.length);
    if (!header || !dataRows.length) return [];
    
    return dataRows.map(row => {
      if (!row || row.trim() === '') {
        console.log("Skipping empty row");
        return null;
      }
      
      console.log("Parsing row:", row);
      // Handle quoted fields with potential commas inside them
      const match = row.match(/^"((?:[^"]|"")*)","((?:[^"]|"")*)","((?:[^"]|"")*)"$/);
      if (match) {
        console.log("Match found with regex");
        return {
          name: match[1].replace(/""/g, '"'),
          url: match[2].replace(/""/g, '"'),
          secret: match[3].replace(/""/g, '"'),
        };
      }
      
      // Versuche eine alternative Regex für unvollständig formatierte CSV
      const alternativeMatch = row.match(/(?:"([^"]*)"(?:,|$)|([^,]*),)(?:"([^"]*)"(?:,|$)|([^,]*),)(?:"([^"]*)"(?:,|$)|([^,]*),?)/);
      if (alternativeMatch) {
        console.log("Alternative match found");
        return {
          name: (alternativeMatch[1] || alternativeMatch[2] || '').replace(/""/g, '"'),
          url: (alternativeMatch[3] || alternativeMatch[4] || '').replace(/""/g, '"'),
          secret: (alternativeMatch[5] || alternativeMatch[6] || '').replace(/""/g, '"'),
        };
      }
      
      // fallback: naive split (for minimal/edge case CSVs)
      console.log("Using fallback CSV parsing");
      const cells = row.split(',').map(cell => cell.replace(/^"|"$/g, '').replace(/""/g, '"'));
      return { name: cells[0] || '', url: cells[1] || '', secret: cells[2] || '' };
    }).filter(Boolean) as { name: string; url: string; secret: string }[];
  } catch (e) {
    console.error("Error parsing CSV:", e);
    return [];
  }
}
