document.addEventListener('DOMContentLoaded', () => {
  const dropdown = document.getElementById('dropdown');
  const details = document.getElementById('details');
  const toggleSection = document.querySelector('.toggle-section');
  const sheetToggles = document.getElementsByName('sheet-toggle');
  const sourceLinkDiv = document.getElementById('dynamic-source-link');

  // Sheet 1 (main)
  const SHEET1_CSV_URL = 'https://docs.google.com/spreadsheets/d/1fUZKqMpARGJ1XEvsmGlOtN2_NVPOqLehPNiLH-YyYSI/export?format=csv';
  const SHEET1_VIEW_URL = 'https://docs.google.com/spreadsheets/d/1fUZKqMpARGJ1XEvsmGlOtN2_NVPOqLehPNiLH-YyYSI/edit?gid=1370671685#gid=1370671685';
  // Sheet 2 (second)
  const SHEET2_CSV_URL = 'https://docs.google.com/spreadsheets/d/17e8fkiIzDIimDnH8B4JAiC9gTK6qzmFzg7yrqwczYG0/export?format=csv';
  const SHEET2_VIEW_URL = 'https://docs.google.com/spreadsheets/d/17e8fkiIzDIimDnH8B4JAiC9gTK6qzmFzg7yrqwczYG0/edit?usp=sharing';
  const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

  // Track name normalization map
  const TRACK_EQUIVALENTS = {
    "Japan": "Suzuka",
    "Suzuka": "Suzuka",
    "Saudi Arabia": "Jeddah",
    "Jeddah": "Jeddah",
    "Great Britain": "Silverstone",
    "Silverstone": "Silverstone",
    "Azerbaijan": "Baku",
    "Baku": "Baku"
  };

  function normalizeTrack(name) {
    return TRACK_EQUIVALENTS[name?.trim()] || name?.trim();
  }

  // Data storage
  let sheet1Data = [];
  let sheet2Data = [];
  let allTracks = [];
  let currentSheet = 'sheet1';

  function fetchSheet(url, rowStart, rowEnd, headerRow, callback) {
    Papa.parse(CORS_PROXY + encodeURIComponent(url), {
      download: true,
      header: false,
      complete: function(results) {
        const allRows = results.data;
        if (!allRows || allRows.length <= headerRow) {
          callback([]);
          return;
        }
        const headers = allRows[headerRow];
        const dataRows = allRows.slice(rowStart, rowEnd);
        const data = dataRows
          .filter(row => row && row.length && row[0] && row[0].trim() !== '')
          .map(row => {
            const obj = {};
            headers.forEach((header, i) => {
              obj[header] = row[i] || '';
            });
            // Add normalizedTrack property for matching
            obj._normalizedTrack = normalizeTrack(Object.values(obj)[0]);
            return obj;
          });
        callback(data);
      },
      error: function(err) {
        callback([]);
        console.error('PapaParse error:', err);
      }
    });
  }

  function getAllUniqueTracks() {
    const tracks1 = sheet1Data.map(row => row._normalizedTrack);
    const tracks2 = sheet2Data.map(row => row._normalizedTrack);
    // Use a Set to get unique normalized names
    const all = Array.from(new Set([...tracks1, ...tracks2])).filter(Boolean);
    return all;
  }

  function getDisplayName(normalizedTrack) {
    // Prefer the "prettiest" name for display
    // Use the first found in the mapping values, or fallback to the normalized name
    for (const [key, value] of Object.entries(TRACK_EQUIVALENTS)) {
      if (value === normalizedTrack && key !== normalizedTrack) {
        return value;
      }
    }
    return normalizedTrack;
  }

  function renderDropdown(tracks) {
    dropdown.innerHTML = '';
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select Track...';
    dropdown.appendChild(defaultOption);

    tracks.forEach(track => {
      if (track && track.trim() !== '') {
        const option = document.createElement('option');
        option.value = track;
        option.textContent = getDisplayName(track);
        dropdown.appendChild(option);
      }
    });
  }

  function renderSourceLink() {
    let url, label;
    if (currentSheet === 'sheet1') {
      url = SHEET1_VIEW_URL;
      label = 'Setup 1 Source';
    } else {
      url = SHEET2_VIEW_URL;
      label = 'Setup 2 Source';
    }
    sourceLinkDiv.innerHTML = `<div class="source-link" style="margin-top:1.2rem;">
      <a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>
    </div>`;
  }

  function renderDetails(track) {
    let data, sheetLabel;
    if (!track) {
      details.innerHTML = 'Select an item from the dropdown to view details.';
      renderSourceLink();
      return;
    }
    if (currentSheet === 'sheet1') {
      data = sheet1Data.find(row => row._normalizedTrack === track);
      sheetLabel = 'Setup 1';
    } else {
      data = sheet2Data.find(row => row._normalizedTrack === track);
      sheetLabel = 'Setup 2';
    }
    if (!data) {
      details.innerHTML = `<div class="no-data">No data for "${getDisplayName(track)}" in ${sheetLabel}.</div>`;
      renderSourceLink();
      return;
    }
    let html = '<table>';
    Object.entries(data).forEach(([key, value]) => {
      if (key.startsWith('_')) return; // skip internal fields
      if (key && value && value.trim() !== '') {
        html += `<tr><td><strong>${key}</strong></td><td>${value}</td></tr>`;
      }
    });
    html += '</table>';
    details.innerHTML = html;
    renderSourceLink();
  }

  dropdown.addEventListener('change', (e) => {
    renderDetails(dropdown.value);
  });

  toggleSection.addEventListener('change', (e) => {
    if (e.target.name === 'sheet-toggle') {
      currentSheet = e.target.value;
      renderDetails(dropdown.value);
    }
  });

  details.innerHTML = 'Loading data...';

  // Fetch both sheets, then render
  fetchSheet(SHEET1_CSV_URL, 2, 29, 1, (data1) => {
    sheet1Data = data1;
    fetchSheet(SHEET2_CSV_URL, 1, 26, 0, (data2) => {
      sheet2Data = data2;
      allTracks = getAllUniqueTracks();
      renderDropdown(allTracks);
      renderDetails(null);
    });
  });
});