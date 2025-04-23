
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
    
    // Skip header row if present
    let dataRows = rows;
    if (rows[0].toLowerCase().includes('name') && rows[0].toLowerCase().includes('url')) {
      dataRows = rows.slice(1);
      console.log("Skipping header row, data rows count:", dataRows.length);
    }
    
    // Process each data row
    const result = dataRows
      .filter(row => row && row.trim() !== '') // Skip empty rows
      .map((row, index) => {
        console.log(`Processing row ${index + 1}:`, row.substring(0, 50) + (row.length > 50 ? "..." : ""));
        
        // Simplify CSV parsing logic - try most common formats
        
        // 1. Try simple comma split with quote handling
        let parts: string[] = [];
        
        // Check if we have quotes - if so, use a more careful parsing approach
        if (row.includes('"')) {
          // Regex to match CSV fields that may contain quotes
          const csvRegex = /"([^"]*(?:"[^"]*"[^"]*)*)"|([^,]*),/g;
          parts = [];
          let match;
          let remainder = row + ','; // Add trailing comma to match last field
          
          while (match = csvRegex.exec(remainder)) {
            parts.push((match[1] !== undefined ? match[1] : match[2]) || '');
          }
          
          // Check if we got enough parts
          if (parts.length < 3) {
            console.log("Quote parsing didn't produce enough fields, falling back to simple split");
            parts = row.split(',').map(p => p.replace(/^"|"$/g, ''));
          }
        } else {
          // No quotes, simple split is fine
          parts = row.split(',');
        }
        
        // Make sure we have at least 3 parts
        while (parts.length < 3) parts.push('');
        
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
