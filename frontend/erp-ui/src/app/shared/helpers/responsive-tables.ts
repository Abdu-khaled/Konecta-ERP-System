// Injects field-name labels into mobile tables and keeps desktop untouched.
// Labels are taken from each table's <thead><th> text so language stays the same.
export function initResponsiveTables(): void {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;

  const isMobile = () => window.matchMedia && window.matchMedia('(max-width: 767px)').matches;

  const apply = () => {
    if (!isMobile()) return;
    const tables = Array.from(document.querySelectorAll('table.k-table')) as HTMLTableElement[];
    for (const table of tables) {
      const thead = table.querySelector('thead');
      const headers = thead ? Array.from(thead.querySelectorAll('th')).map(th => (th.textContent || '').trim()) : [];
      const rows = Array.from(table.querySelectorAll('tbody tr')) as HTMLTableRowElement[];
      for (const tr of rows) {
        const cells = Array.from(tr.querySelectorAll('td')) as HTMLTableCellElement[];
        for (let i = 0; i < cells.length; i++) {
          const td = cells[i];
          const colspan = Number(td.getAttribute('colspan') || '1');
          if (colspan > 1) continue;
          // Only add one label, and only if not already present
          let label = td.querySelector(':scope > .k-label') as HTMLSpanElement | null;
          if (!label) {
            label = document.createElement('span');
            label.className = 'k-label';
            td.prepend(label);
          }
          // Keep label text in sync with header text
          label.textContent = headers[i] || '';
        }
      }
    }
  };

  // Initial run
  try { requestAnimationFrame(apply); } catch { /* no-op */ }
  // Re-apply on DOM changes (e.g., data loads, pagination)
  try {
    const mo = new MutationObserver(() => requestAnimationFrame(apply));
    mo.observe(document.body, { childList: true, subtree: true });
  } catch { /* no-op */ }
  // Re-apply on viewport changes
  try { window.addEventListener('resize', () => apply()); } catch { /* no-op */ }
}

