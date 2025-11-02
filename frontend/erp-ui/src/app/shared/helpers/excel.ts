import * as XLSX from 'xlsx';

export type ExcelColumn<T> = { key: keyof T | string; header: string; transform?: (v: any, row: T) => any };

export function downloadExcel<T = any>(filename: string, columns: ExcelColumn<T>[], rows: T[]) {
  const data = (rows || []).map((r: any) => {
    const obj: any = {};
    for (const c of columns) {
      const raw = r?.[c.key as any];
      obj[c.header] = c.transform ? c.transform(raw, r) : (raw ?? '');
    }
    return obj;
  });
  const ws = XLSX.utils.json_to_sheet(data, { header: columns.map(c => c.header) });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data');
  const finalName = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  XLSX.writeFileXLSX(wb, finalName);
}

