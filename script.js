let expenseData = [];
let filteredData = [];
let currentMonth = 'all';
let shopChart = null;

// Neue Reihenfolge: Lebensmittel, Getränke, Haushalt, Hygiene, Snacks/Süßes
const categoryConfig = {
  'lebensmittel': { name: '🥗 Lebensmittel', color: '#27ae60' },
  'getränke': { name: '🥤 Getränke', color: '#3498db' },
  'haushalt': { name: '🧽 Haushalt', color: '#f39c12' },
  'hygiene': { name: '🧴 Hygiene', color: '#e74c3c' },
  'snacks': { name: '🍿 Snacks/Süßes', color: '#9b59b6' }
};

// File input event listener
document.getElementById('csvFile').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (file) {
    loadCsvFile(file);
  }
});

function loadCsvFile(file) {
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
    delimitersToGuess: [',', ';', '\t'],
    complete: function (results) {
      if (results.errors.length > 0) {
        showError('Fehler beim Parsen der CSV-Datei: ' + results.errors[0].message);
        return;
      }
      processExpenseData(results.data);
    },
    error: function (error) {
      showError('Fehler beim Laden der Datei: ' + error.message);
    }
  });
}

function loadFromUrl() {
  const url = document.getElementById('csvUrl').value.trim();
  if (!url) {
    showError('Bitte geben Sie eine gültige URL ein.');
    return;
  }

  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('HTTP ' + response.status + ': ' + response.statusText);
      }
      return response.text();
    })
    .then(csvText => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false,
        delimitersToGuess: [',', ';', '\t'],
        complete: function (results) {
          if (results.errors.length > 0) {
            showError('Fehler beim Parsen der CSV-Datei: ' + results.errors[0].message);
            return;
          }
          processExpenseData(results.data);
        }
      });
    })
    .catch(error => {
      showError('Fehler beim Laden der URL: ' + error.message);
    });
}

function processExpenseData(data) {
  clearError();

  // Validate and clean data
  expenseData = data.filter(row => {
    return row.Datum && row.Artikel && row.Kategorie && row.Preis && row.Shop;
  }).map(row => {
    // Clean headers by removing whitespace
    const cleanRow = {};
    Object.keys(row).forEach(key => {
      cleanRow[key.trim()] = row[key];
    });

    return {
      datum: cleanRow.Datum?.trim() || '',
      artikel: cleanRow.Artikel?.trim() || '',
      kategorie: cleanRow.Kategorie?.trim() || '',
      preis: parseFloat((cleanRow.Preis || '0').toString().replace(',', '.')),
      shop: cleanRow.Shop?.trim() || ''
    };
  });

  if (expenseData.length === 0) {
    showError('Keine gültigen Daten in der CSV-Datei gefunden. Stellen Sie sicher, dass die Spalten "Datum", "Artikel", "Kategorie", "Preis" und "Shop" vorhanden sind.');
    return;
  }

  // Initialize with all data
  currentMonth = 'all';
  filteredData = expenseData;

  displayInterface();
  updateMonthButtons();
}

function displayInterface() {
  displayTable();
  calculateAndDisplaySummary();
  createShopChart();

  document.getElementById('noData').style.display = 'none';
  document.getElementById('summarySection').style.display = 'block';
  document.getElementById('chartSection').style.display = 'block';
  document.getElementById('monthSelector').style.display = 'block';
  document.getElementById('tableToggle').style.display = 'block';

  // Tabelle standardmäßig ausblenden
  document.getElementById('tableContainer').classList.remove('show');

  // Upload-Bereich nach erfolgreichem Laden einklappen
  collapseUpload();
}

function collapseUpload() {
  const uploadSection = document.getElementById('uploadSection');
  uploadSection.classList.add('collapsed');
}

function expandUpload() {
  const uploadSection = document.getElementById('uploadSection');
  if (uploadSection.classList.contains('collapsed')) {
    uploadSection.classList.remove('collapsed');
  }
}

function toggleTable() {
  const tableContainer = document.getElementById('tableContainer');
  const toggleBtn = document.querySelector('.toggle-btn');

  if (tableContainer.classList.contains('show')) {
    tableContainer.classList.remove('show');
    toggleBtn.textContent = '📋 Details anzeigen';
  } else {
    tableContainer.classList.add('show');
    toggleBtn.textContent = '📋 Details ausblenden';
  }
}

function filterByMonth(month) {
  currentMonth = month;

  if (month === 'all') {
    filteredData = expenseData;
  } else {
    filteredData = expenseData.filter(expense => {
      const dateParts = expense.datum.split('.');
      if (dateParts.length >= 3) {
        const monthStr = dateParts[1].padStart(2, '0');
        const year = dateParts[2];
        return monthStr === month && year === '2025';
      }
      return false;
    });
  }

  updateMonthButtons();
  displayInterface();
}

function updateMonthButtons() {
  const buttons = document.querySelectorAll('.month-btn');
  buttons.forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-month') === currentMonth) {
      btn.classList.add('active');
    }
  });
}

function displayTable() {
  const tableBody = document.getElementById('tableBody');
  tableBody.innerHTML = '';

  filteredData.forEach(expense => {
    const row = document.createElement('tr');
    const categoryClass = getCategoryClass(expense.kategorie);

    row.innerHTML = `
      <td class="date">${expense.datum}</td>
      <td>${expense.artikel}</td>
      <td class="${categoryClass}">${expense.kategorie}</td>
      <td class="price">${expense.preis.toFixed(2).replace('.', ',')}</td>
      <td class="shop">${expense.shop}</td>
    `;
    tableBody.appendChild(row);
  });
}

function getCategoryClass(kategorie) {
  const kat = kategorie.toLowerCase();
  if (kat.includes('lebensmittel')) return 'category-lebensmittel';
  if (kat.includes('getränke')) return 'category-getränke';
  if (kat.includes('hygiene')) return 'category-hygiene';
  if (kat.includes('snacks') || kat.includes('süß')) return 'category-snacks';
  if (kat.includes('haushalt')) return 'category-haushalt';
  return '';
}

function calculateAndDisplaySummary() {
  const sums = {};
  let total = 0;

  // Initialize all categories
  Object.keys(categoryConfig).forEach(key => {
    sums[key] = 0;
  });

  // Group expenses by category
  const groupedExpenses = {};
  filteredData.forEach(expense => {
    const categoryKey = getCategoryKey(expense.kategorie);
    if (!groupedExpenses[categoryKey]) {
      groupedExpenses[categoryKey] = 0;
    }
    groupedExpenses[categoryKey] += expense.preis;
    total += expense.preis;
  });

  // Update sums
  Object.keys(groupedExpenses).forEach(key => {
    if (sums.hasOwnProperty(key)) {
      sums[key] = groupedExpenses[key];
    }
  });

  displaySummaryCards(sums, total);
  updateDateRange();
}

function getCategoryKey(kategorie) {
  const kat = kategorie.toLowerCase();
  if (kat.includes('lebensmittel')) return 'lebensmittel';
  if (kat.includes('getränke')) return 'getränke';
  if (kat.includes('hygiene')) return 'hygiene';
  if (kat.includes('snacks') || kat.includes('süß')) return 'snacks';
  if (kat.includes('haushalt')) return 'haushalt';
  return 'sonstiges';
}

function displaySummaryCards(sums, total) {
  const summaryGrid = document.getElementById('summaryGrid');
  summaryGrid.innerHTML = '';

  // Add configured categories in the new order
  Object.keys(categoryConfig).forEach(key => {
    const config = categoryConfig[key];
    const amount = sums[key] || 0;
    const percentage = total > 0 ? (amount / total * 100).toFixed(1) : 0;

    const card = document.createElement('div');
    card.className = `summary-card ${key}`;
