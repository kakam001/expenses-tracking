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
    card.innerHTML = `
      <h3>${config.name}</h3>
      <div class="amount">${amount.toFixed(2).replace('.', ',')} €</div>
      <div class="percentage">(${percentage}%)</div>
    `;
    summaryGrid.appendChild(card);
  });

  // Add any additional categories found in data
  const foundCategories = [...new Set(filteredData.map(e => getCategoryKey(e.kategorie)))];
  foundCategories.forEach(key => {
    if (!categoryConfig[key] && sums[key] > 0) {
      const amount = sums[key];
      const percentage = total > 0 ? (amount / total * 100).toFixed(1) : 0;

      const card = document.createElement('div');
      card.className = 'summary-card';
      card.innerHTML = `
        <h3>📦 ${key.charAt(0).toUpperCase() + key.slice(1)}</h3>
        <div class="amount">${amount.toFixed(2).replace('.', ',')} €</div>
        <div class="percentage">(${percentage}%)</div>
      `;
      summaryGrid.appendChild(card);
    }
  });

  document.getElementById('totalSum').textContent = total.toFixed(2).replace('.', ',') + ' €';
}

function createShopChart() {
  const ctx = document.getElementById('shopChart').getContext('2d');

  // Group expenses by shop
  const shopSums = {};
  filteredData.forEach(expense => {
    if (!shopSums[expense.shop]) {
      shopSums[expense.shop] = 0;
    }
    shopSums[expense.shop] += expense.preis;
  });

  // Sort shops by total amount (descending)
  const sortedShops = Object.entries(shopSums)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10); // Limit to top 10 shops

  const total = Object.values(shopSums).reduce((sum, val) => sum + val, 0);

  // Generate colors for each shop
  const colors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
    '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
  ];

  const chartData = {
    labels: sortedShops.map(([shop, amount]) => {
      const percentage = total > 0 ? ((amount / total) * 100).toFixed(1) : 0;
      return `${shop}\n${amount.toFixed(2).replace('.', ',')}€ (${percentage}%)`;
    }),
    datasets: [{
      data: sortedShops.map(([shop, amount]) => amount),
      backgroundColor: colors.slice(0, sortedShops.length),
      borderColor: '#fff',
      borderWidth: 2
    }]
  };

  // Destroy existing chart if it exists
  if (shopChart) {
    shopChart.destroy();
  }

  shopChart = new Chart(ctx, {
    type: 'pie',
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true,
            font: {
              size: 12
            },
            generateLabels: function (chart) {
              const data = chart.data;
              if (data.labels.length && data.datasets.length) {
                return data.labels.map((label, i) => {
                  const shop = label.split('\n')[0];
                  const amount = label.split('\n')[1];
                  return {
                    text: `${shop} - ${amount}`,
                    fillStyle: data.datasets[0].backgroundColor[i],
                    strokeStyle: data.datasets[0].borderColor,
                    lineWidth: data.datasets[0].borderWidth,
                    pointStyle: 'circle'
                  };
                });
              }
              return [];
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const shop = context.label.split('\n')[0];
              const amount = context.parsed.toFixed(2).replace('.', ',');
              const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
              return `${shop}: ${amount}€ (${percentage}%)`;
            }
          }
        }
      }
    }
  });
}

function updateDateRange() {
  if (filteredData.length === 0) {
    document.getElementById('dateRange').textContent = 'Keine Daten für diesen Zeitraum';
    return;
  }

  const dates = filteredData.map(e => e.datum).sort();
  const startDate = dates[0];
  const endDate = dates[dates.length - 1];

  let dateRangeText;
  if (currentMonth === 'all') {
    dateRangeText = startDate === endDate
      ? `Datum: ${startDate}`
      : `Zeitraum: ${startDate} - ${endDate}`;
  } else {
    const monthNames = {
      '01': 'Januar', '02': 'Februar', '03': 'März', '04': 'April',
      '05': 'Mai', '06': 'Juni', '07': 'Juli', '08': 'August',
      '09': 'September', '10': 'Oktober', '11': 'November', '12': 'Dezember'
    };
    dateRangeText = `${monthNames[currentMonth]} 2025 (${filteredData.length} Einträge)`;
  }

  document.getElementById('dateRange').textContent = dateRangeText;
}

function showError(message) {
  const errorDiv = document.getElementById('errorMessage');
  errorDiv.innerHTML = `<div class="error-message">${message}</div>`;
}

function clearError() {
  document.getElementById('errorMessage').innerHTML = '';
}

// Demo CSV laden (für GitHub Pages Demo)
function loadDemoData() {
  const demoCSV = `Datum,Artikel,Kategorie,Preis,Shop
23.08.2025,Bio Bananen (0.378 kg),Lebensmittel,0.75,Penny
23.08.2025,Vollkorn Sandwich,Lebensmittel,1.09,Penny
23.08.2025,Heidelbeere 300g,Lebensmittel,2.99,Penny
30.08.2025,Kamillentee,Getränke,0.89,Lidl
30.08.2025,Colgate Sens White A,Hygiene,4.89,Lidl`;

  Papa.parse(demoCSV, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
    complete: function (results) {
      processExpenseData(results.data);
    }
  });
}

// Prüfen ob es eine demo.csv oder expenses.csv im gleichen Verzeichnis gibt
window.addEventListener('load', function () {
  const possibleFiles = ['expenses.csv', 'demo.csv', 'ausgaben.csv'];

  async function tryLoadFile(filename) {
    try {
      const response = await fetch(filename);
      if (response.ok) {
        const csvText = await response.text();
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: false,
          delimitersToGuess: [',', ';', '\t'],
          complete: function (results) {
            if (results.data.length > 0) {
              processExpenseData(results.data);
            }
          }
        });
        return true;
      }
    } catch (error) {
      // Datei existiert nicht oder kann nicht geladen werden
    }
    return false;
  }

  (async () => {
    for (const filename of possibleFiles) {
      const loaded = await tryLoadFile(filename);
      if (loaded) break;
    }
  })();
});
