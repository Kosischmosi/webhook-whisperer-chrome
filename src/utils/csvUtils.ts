
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
  console.log("CSV Input (first 100 chars):", csvString.slice(0, 100) + "...");
  
  try {
    // Handle potential BOM character in CSV file
    const cleanCsv = csvString.replace(/^\uFEFF/, '');
    
    // Check for empty CSV
    if (!cleanCsv || cleanCsv.trim() === '') {
      console.error("CSV string is empty");
      return [];
    }
    
    // Split into rows - handle both \r\n and \n line endings
    const rows = cleanCsv.trim().split(/\r?\n/);
    console.log("Parsed rows count:", rows.length);
    
    if (!rows.length) {
      console.error("No rows found in CSV");
      return [];
    }
    
    const [header, ...dataRows] = rows;
    console.log("Header row:", header);
    console.log("Data rows count:", dataRows.length);
    
    if (!header || !dataRows.length) {
      console.error("Missing header or data rows");
      return [];
    }
    
    // Process each data row
    const result = dataRows
      .filter(row => row && row.trim() !== '') // Skip empty rows
      .map((row, index) => {
        console.log(`Processing row ${index + 1}:`, row.substring(0, 50) + (row.length > 50 ? "..." : ""));
        
        // Try different parsing strategies
        
        // 1. Standard CSV format with quotes
        const standardMatch = row.match(/^"((?:[^"]|"")*)","((?:[^"]|"")*)","((?:[^"]|"")*)"$/);
        if (standardMatch) {
          console.log(`Row ${index + 1}: Standard CSV format match`);
          return {
            name: standardMatch[1].replace(/""/g, '"'),
            url: standardMatch[2].replace(/""/g, '"'),
            secret: standardMatch[3].replace(/""/g, '"')
          };
        }
        
        // 2. Alternative format with flexible quotes
        const altMatch = row.match(/(?:"([^"]*)"(?:,|$)|([^,]*),)(?:"([^"]*)"(?:,|$)|([^,]*),)(?:"([^"]*)"(?:,|$)|([^,]*),?)/);
        if (altMatch) {
          console.log(`Row ${index + 1}: Alternative format match`);
          return {
            name: (altMatch[1] || altMatch[2] || '').replace(/""/g, '"'),
            url: (altMatch[3] || altMatch[4] || '').replace(/""/g, '"'),
            secret: (altMatch[5] || altMatch[6] || '').replace(/""/g, '"')
          };
        }
        
        // 3. Simple comma split fallback
        console.log(`Row ${index + 1}: Using simple comma split fallback`);
        const parts = row.split(',');
        return {
          name: parts[0]?.replace(/^"|"$/g, '').replace(/""/g, '"') || '',
          url: parts[1]?.replace(/^"|"$/g, '').replace(/""/g, '"') || '',
          secret: parts[2]?.replace(/^"|"$/g, '').replace(/""/g, '"') || ''
        };
      });
    
    console.log("Successfully parsed webhooks count:", result.length);
    return result;
  } catch (e) {
    console.error("Error parsing CSV:", e);
    return [];
  }
}
