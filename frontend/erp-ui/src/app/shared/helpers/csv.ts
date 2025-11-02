export type CsvColumn<T> = { key: keyof T | string; header: string; transform?: (v: any, row: T) => any };

export function downloadCsv<T = any>(filename: string, columns: CsvColumn<T>[], rows: T[]) {
  const header = columns.map(c => c.header);
  const data = rows.map(r => columns.map(c => safeCsv(String(c.transform ? c.transform((r as any)[c.key as any], r) : (r as any)[c.key as any] ?? ''))));
  const csv = [header, ...data].map(line => line.join(',')).join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
}

function safeCsv(value: string) {
  const needsQuotes = /[",\n]/.test(value);
  const v = value.replace(/"/g, '""');
  return needsQuotes ? `"${v}"` : v;
}

