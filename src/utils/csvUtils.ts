
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
  // Handle potential BOM character in CSV file
  const cleanCsv = csvString.replace(/^\uFEFF/, '');
  
  // Very simple CSV parser (works for our fields)
  const rows = cleanCsv.trim().split(/\r?\n/);
  if (!rows.length) return [];
  
  const [header, ...dataRows] = rows;
  if (!header || !dataRows.length) return [];
  
  return dataRows.map(row => {
    // Handle quoted fields with potential commas inside them
    const match = row.match(/^"((?:[^"]|"")*)","((?:[^"]|"")*)","((?:[^"]|"")*)"$/);
    if (match) {
      return {
        name: match[1].replace(/""/g, '"'),
        url: match[2].replace(/""/g, '"'),
        secret: match[3].replace(/""/g, '"'),
      };
    }
    
    // fallback: naive split (for minimal/edge case CSVs)
    const cells = row.split(',').map(cell => cell.replace(/^"|"$/g, '').replace(/""/g, '"'));
    return { name: cells[0] || '', url: cells[1] || '', secret: cells[2] || '' };
  });
}
