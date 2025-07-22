document.addEventListener('DOMContentLoaded', () => {
  const dropdown = document.getElementById('dropdown');
  const details = document.getElementById('details');
  // Use a CORS proxy to fetch the new Google Sheet CSV
  const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1fUZKqMpARGJ1XEvsmGlOtN2_NVPOqLehPNiLH-YyYSI/export?format=csv';
  const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
  const FETCH_URL = CORS_PROXY + encodeURIComponent(SHEET_CSV_URL);

  let sheetData = [];

  function renderDropdown(data) {
    dropdown.innerHTML = '';
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select Track...';
    dropdown.appendChild(defaultOption);

    data.forEach((row, idx) => {
      const firstCol = Object.values(row)[0];
      if (firstCol && firstCol.trim() !== '') {
        const option = document.createElement('option');
        option.value = idx;
        option.textContent = firstCol;
        dropdown.appendChild(option);
      }
    });
  }

  function renderDetails(row) {
    if (!row) {
      details.innerHTML = 'Select an item from the dropdown to view track details.';
      return;
    }
    let html = '<table>';
    Object.entries(row).forEach(([key, value]) => {
      if (key && value && value.trim() !== '') {
        html += `<tr><td><strong>${key}</strong></td><td>${value}</td></tr>`;
      }
    });
    html += '</table>';
    details.innerHTML = html;
  }

  dropdown.addEventListener('change', (e) => {
    const idx = dropdown.value;
    if (idx === '') {
      renderDetails(null);
    } else {
      renderDetails(sheetData[idx]);
    }
  });

  details.innerHTML = 'Loading data...';

  Papa.parse(FETCH_URL, {
    download: true,
    header: false,
    complete: function(results) {
      const allRows = results.data;
      // Only process if enough rows
      if (!allRows || allRows.length < 3) {
        details.innerHTML = 'No data found in the sheet.';
        return;
      }
      // Row 0: skip, Row 1: headers, Row 2-28: data (ignore row 30 and beyond)
      const headers = allRows[1];
      const dataRows = allRows.slice(2, 29); // up to but not including row 29 (1-based row 30)
      // Map each data row to an object using headers
      sheetData = dataRows
        .filter(row => row && row.length && row[0] && row[0].trim() !== '')
        .map(row => {
          const obj = {};
          headers.forEach((header, i) => {
            obj[header] = row[i] || '';
          });
          return obj;
        });
      renderDropdown(sheetData);
      renderDetails(null);
    },
    error: function(err) {
      details.innerHTML = 'Error loading sheet data.';
      console.error('PapaParse error:', err);
    }
  });
});