interface CSVData {
  headers: string[];
  data: Record<string, string>[];
}

export function parseCSV(csvText: string): CSVData {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',').map(header => header.trim());
  
  const data = lines.slice(1)
    .filter(line => line.trim() !== '')
    .map(line => {
      const values = line.split(',').map(value => value.trim());
      return headers.reduce((obj, header, index) => {
        obj[header] = values[index] || '';
        return obj;
      }, {} as Record<string, string>);
    });

  return { headers, data };
}

export function convertToCSV(data: CSVData, selectedColumns: string[]): string {
  const headers = selectedColumns.join(',');
  const rows = data.data.map(row =>
    selectedColumns.map(col => row[col] || '').join(',')
  );
  return [headers, ...rows].join('\n');
}