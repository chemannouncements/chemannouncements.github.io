const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSkOj0xJHVZalCcttJrOebjVufrOb6-eEOfFqLTZzzAgTHgSFppfWhiR_ihdCSnIGBYCVnoGecdQ2q_/pub?output=csv';
//created by Alexander Shinkeyev

function parseCSV(csv) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;
  
  for (let i = 0; i < csv.length; i++) {
    const c = csv[i];
    if (inQuotes) {
      if (c === '"' && csv[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') { inQuotes = false; }
      else { cell += c; }
    } else {
      if (c === '"') { inQuotes = true; }
      else if (c === ',') { row.push(cell); cell = ''; }
      else if (c === '\n' || (c === '\r' && csv[i + 1] === '\n')) {
        if (c === '\r') i++;
        row.push(cell); cell = '';
        if (row.length > 1 || row[0]) rows.push(row);
        row = [];
      }
      else { cell += c; }
    }
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

function loadAnnouncements(targetId = 'announcements') {
  fetch(SHEET_URL)
    .then(r => r.text())
    .then(csv => {
      const rows = parseCSV(csv).slice(1);
      const html = rows.map(([date, title, body, link]) => {
        const attachment = link ? `<div><a href="${link}" target="_blank">Attachment</a></div>` : '';
        return `<div class="announcement">
          <div class="date">${date || ''}</div>
          <div class="title">${title || ''}</div>
          <div>${(body || '').replace(/\n/g, '<br>')}</div>
          ${attachment}
        </div>`;
      }).join('');
      document.getElementById(targetId).innerHTML = html || 'No announcements yet.';
    });
}

document.addEventListener('DOMContentLoaded', () => loadAnnouncements());
