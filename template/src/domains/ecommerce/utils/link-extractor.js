import xlsx from 'xlsx';

const URL_REGEX = /https?:\/\/[^\s"'<>]+/g;

export const extractUrlsFromExcel = (buffer) => {
  const workbook = xlsx.read(buffer, { type: 'buffer' });
  const urls = new Set();

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    for (const row of rows) {
      for (const cell of row) {
        if (typeof cell === 'string') {
          const matches = cell.match(URL_REGEX);
          if (matches) matches.forEach((m) => urls.add(m));
        }
      }
    }
  }

  return Array.from(urls);
};

export const extractUrlsFromPdf = async (buffer) => {
  const pdfParse = (await import('pdf-parse')).default;
  const data = await pdfParse(buffer);
  const matches = data.text.match(URL_REGEX);
  return matches ? Array.from(new Set(matches)) : [];
};

export const extractUrlsFromFile = async (file) => {
  const mimetype = file.mimetype;

  if (mimetype === 'application/pdf') {
    return await extractUrlsFromPdf(file.buffer);
  }

  if (
    mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    mimetype === 'application/vnd.ms-excel'
  ) {
    return extractUrlsFromExcel(file.buffer);
  }

  const error = new Error('Formato de archivo no soportado. Usa PDF o Excel (.xlsx/.xls)');
  error.statusCode = 400;
  throw error;
};
