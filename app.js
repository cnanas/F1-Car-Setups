document.addEventListener('DOMContentLoaded', () => {
  const dropdown = document.getElementById('dropdown');
  const details = document.getElementById('details');
  // Use a CORS proxy to fetch the Google Sheet CSV
  const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1CHRGmoweIWLhE2FkeiiGm0U2ECnL6zzb4D3-3RGlr2k/export?format=csv';
  const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
  const FETCH_URL = CORS_PROXY + encodeURIComponent(SHEET_CSV_URL);

  let sheetData = [];

  function renderDropdown(data) {
    dropdown.innerHTML = '';
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select...';
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
      details.innerHTML = 'Select an item from the dropdown to view details.';
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
    header: true,
    complete: function(results) {
      if (!results.data || results.data.length === 0) {
        details.innerHTML = 'No data found in the sheet.';
        return;
      }
      // Filter out empty rows
      sheetData = results.data.filter(row => Object.values(row)[0] && Object.values(row)[0].trim() !== '');
      renderDropdown(sheetData);
      renderDetails(null);
    },
    error: function(err) {
      details.innerHTML = 'Error loading sheet data.';
      console.error('PapaParse error:', err);
    }
  });
});