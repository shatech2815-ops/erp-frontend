/**
 * Reusable report export utility for PDF and Excel/CSV formats.
 * Works reliably in all modern browsers without external dependencies.
 */

const escapePdf = (str) => String(str ?? '').replace(/[()\\\\]/g, '\\$&');

/**
 * Exports report data to a downloadable CSV file (compatible with Excel, Google Sheets, Numbers).
 *
 * @param {string} filename - Base name of the file (without extension)
 * @param {Object} options
 * @param {string} options.title - Report title
 * @param {string[]} [options.meta] - Array of metadata strings (e.g. "Financial Year: 2025-26")
 * @param {string[]} options.headers - Column header labels
 * @param {Array<string[] | { cols: string[], bold?: boolean }>} options.rows - Row data
 */
export function exportReportToCsv(filename, { title, meta = [], headers = [], rows = [] }) {
  const csvLines = [];

  if (title) {
    csvLines.push(`"${title.replace(/"/g, '""')}"`);
  }

  for (const m of meta) {
    csvLines.push(`"${String(m).replace(/"/g, '""')}"`);
  }

  if (title || meta.length > 0) {
    csvLines.push('');
  }

  if (headers.length > 0) {
    csvLines.push(headers.map(h => `"${String(h ?? '').replace(/"/g, '""')}"`).join(','));
  }

  if (rows.length === 0) {
    csvLines.push(`"No report data available for the selected criteria.",${headers.slice(1).map(() => '""').join(',')}`);
  } else {
    for (const r of rows) {
      const cols = Array.isArray(r) ? r : (r.cols || []);
      csvLines.push(cols.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','));
    }
  }

  const csvContent = '\uFEFF' + csvLines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${filename}.csv`);
}

/**
 * Exports report data as a genuine binary PDF 1.4 document.
 *
 * @param {string} filename - Base name of the file (without extension)
 * @param {Object} options
 * @param {string} options.title - Report title
 * @param {string[]} [options.meta] - Metadata lines
 * @param {string[]} options.headers - Column headers
 * @param {Array<string[] | { cols: string[], bold?: boolean, isHeader?: boolean }>} options.rows - Rows
 * @param {number[]} [options.colWidths] - Relative column widths (e.g. [5, 3, 3])
 */
export function exportReportToPdf(filename, { title, meta = [], headers = [], rows = [], colWidths = [] }) {
  const PAGE_WIDTH = 595;
  const PAGE_HEIGHT = 842;
  const MARGIN_LEFT = 40;
  const MARGIN_RIGHT = 40;
  const USABLE_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;

  // Compute column X coordinates
  const totalWeight = (colWidths && colWidths.length === headers.length)
    ? colWidths.reduce((a, b) => a + b, 0)
    : headers.length;

  const colX = [];
  let curX = MARGIN_LEFT;
  for (let i = 0; i < headers.length; i++) {
    colX.push(curX);
    const w = (colWidths && colWidths[i])
      ? (colWidths[i] / totalWeight) * USABLE_WIDTH
      : (USABLE_WIDTH / (headers.length || 1));
    curX += w;
  }

  // Paginate
  const ROWS_PER_PAGE_1 = Math.max(12, 26 - meta.length);
  const ROWS_PER_PAGE_SUBSEQUENT = 30;
  const pagesData = [];
  let rIdx = 0;

  if (!rows || rows.length === 0) {
    pagesData.push([]);
  } else {
    while (rIdx < rows.length) {
      const isFirst = pagesData.length === 0;
      const limit = isFirst ? ROWS_PER_PAGE_1 : ROWS_PER_PAGE_SUBSEQUENT;
      pagesData.push(rows.slice(rIdx, rIdx + limit));
      rIdx += limit;
    }
  }

  const pageCount = pagesData.length;
  const pageStreams = [];

  for (let p = 0; p < pageCount; p++) {
    const pRows = pagesData[p];
    const ops = [];
    let curY = PAGE_HEIGHT - 45;

    // Header on first page
    if (p === 0) {
      ops.push(`BT /F1 15 Tf ${MARGIN_LEFT} ${curY} Td (${escapePdf(title)}) Tj ET`);
      curY -= 18;
      for (const m of meta) {
        ops.push(`BT /F2 8.5 Tf ${MARGIN_LEFT} ${curY} Td (${escapePdf(m)}) Tj ET`);
        curY -= 13;
      }
      curY -= 4;
      ops.push(`0.5 w ${MARGIN_LEFT} ${curY} m ${PAGE_WIDTH - MARGIN_RIGHT} ${curY} l S`);
      curY -= 16;
    } else {
      ops.push(`BT /F1 10 Tf ${MARGIN_LEFT} ${curY} Td (${escapePdf(title)} - Continued) Tj ET`);
      curY -= 20;
    }

    // Table Header
    if (headers.length > 0) {
      ops.push('0.3 w');
      ops.push(`${MARGIN_LEFT} ${curY + 12} m ${PAGE_WIDTH - MARGIN_RIGHT} ${curY + 12} l S`);
      for (let c = 0; c < headers.length; c++) {
        ops.push(`BT /F1 9 Tf ${colX[c]} ${curY} Td (${escapePdf(headers[c])}) Tj ET`);
      }
      curY -= 6;
      ops.push(`${MARGIN_LEFT} ${curY} m ${PAGE_WIDTH - MARGIN_RIGHT} ${curY} l S`);
      curY -= 15;
    }

    // Table Rows
    if (pRows.length === 0) {
      ops.push(`BT /F2 9 Tf ${MARGIN_LEFT + 10} ${curY} Td (No report data recorded for the selected criteria.) Tj ET`);
      curY -= 18;
    } else {
      for (const r of pRows) {
        const isBold = Boolean(r.bold || r.isHeader);
        const font = isBold ? '/F1' : '/F2';
        const size = isBold ? '9' : '8.5';
        const cols = Array.isArray(r) ? r : (r.cols || []);

        for (let c = 0; c < headers.length; c++) {
          const val = cols[c] ?? '';
          ops.push(`BT ${font} ${size} Tf ${colX[c]} ${curY} Td (${escapePdf(val)}) Tj ET`);
        }
        curY -= 4;
        ops.push(`0.15 w ${MARGIN_LEFT} ${curY} m ${PAGE_WIDTH - MARGIN_RIGHT} ${curY} l S`);
        curY -= 14;
      }
    }

    // Footer
    const footerDate = new Date().toLocaleDateString('en-IN');
    ops.push(`BT /F2 8 Tf ${MARGIN_LEFT} 30 Td (Generated on ${footerDate} | ERP Report - Page ${p + 1} of ${pageCount}) Tj ET`);

    pageStreams.push(ops.join('\n'));
  }

  // PDF Assembly
  let out = '%PDF-1.4\n';
  const offsets = [];
  const addObj = (str) => {
    offsets.push(new Blob([out]).size);
    out += str + '\n';
  };

  addObj('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj');

  const pageObjStart = 3;
  const fontObjBold = pageObjStart + pageCount;
  const fontObjNorm = fontObjBold + 1;
  const streamObjStart = fontObjNorm + 1;

  const kids = [];
  for (let i = 0; i < pageCount; i++) {
    kids.push(`${pageObjStart + i} 0 R`);
  }
  addObj(`2 0 obj\n<< /Type /Pages /Kids [${kids.join(' ')}] /Count ${pageCount} >>\nendobj`);

  for (let i = 0; i < pageCount; i++) {
    const curPageObj = pageObjStart + i;
    const curStreamObj = streamObjStart + i;
    addObj(`${curPageObj} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 ${fontObjBold} 0 R /F2 ${fontObjNorm} 0 R >> >> /Contents ${curStreamObj} 0 R >>\nendobj`);
  }

  addObj(`${fontObjBold} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj`);
  addObj(`${fontObjNorm} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj`);

  for (let i = 0; i < pageCount; i++) {
    const curStreamObj = streamObjStart + i;
    const st = pageStreams[i];
    const len = new Blob([st]).size;
    addObj(`${curStreamObj} 0 obj\n<< /Length ${len} >>\nstream\n${st}\nendstream\nendobj`);
  }

  const totalObjs = streamObjStart + pageCount - 1;
  const startXref = new Blob([out]).size;
  out += `xref\n0 ${totalObjs + 1}\n0000000000 65535 f \n`;
  for (let i = 0; i < totalObjs; i++) {
    out += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
  }
  out += `trailer\n<< /Size ${totalObjs + 1} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF`;

  const blob = new Blob([out], { type: 'application/pdf' });
  downloadBlob(blob, `${filename}.pdf`);
}

function downloadBlob(blob, fullName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fullName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
