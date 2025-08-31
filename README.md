# 🛒 Expense Tracker

A modern, web-based expense tracking application that allows you to visualize and analyze your spending habits through CSV data upload.

## ✨ Features

- **CSV Data Import**: Upload CSV files or load from URLs
- **Monthly Filtering**: View expenses by specific months or all data at once
- **Category Analysis**: Automatic categorization with visual summaries
- **Responsive Design**: Works on desktop and mobile devices
- **Interactive Interface**: Collapsible sections for better user experience
- **Real-time Calculations**: Automatic sum and percentage calculations
- **GitHub Pages Ready**: Deploy directly to GitHub Pages

## 🚀 Quick Start

### Option 1: GitHub Pages Deployment
1. Fork or download this repository
2. Upload your `expenses.csv` file to the same directory
3. Enable GitHub Pages in repository settings
4. Access your expense tracker at `https://yourusername.github.io/repository-name`

### Option 2: Local Usage
1. Download the `index.html` file
2. Open it in any modern web browser
3. Upload your CSV file through the interface

## 📁 CSV File Format

Your CSV file must contain the following columns (header required):

```csv
Datum,Artikel,Kategorie,Preis,Shop
23.08.2025,Organic Bananas,Lebensmittel,0.75,Penny
30.08.2025,Chamomile Tea,Getränke,0.89,Lidl
```

### Required Columns:
- **Datum**: Date (DD.MM.YYYY format)
- **Artikel**: Item/Product name
- **Kategorie**: Category (e.g., Lebensmittel, Getränke, Hygiene, etc.)
- **Preis**: Price (decimal number, supports both . and , as decimal separator)
- **Shop**: Store/Shop name

## 🏷️ Supported Categories

The application automatically recognizes and color-codes the following categories:
- **🥗 Lebensmittel** (Food/Groceries) - Green
- **🥤 Getränke** (Beverages) - Blue  
- **🧴 Hygiene** (Personal Care) - Red
- **🍿 Snacks/Süßes** (Snacks/Sweets) - Purple
- **🧽 Haushalt** (Household) - Orange

Additional categories found in your data will be automatically added.

## 🎯 How to Use

1. **Upload Data**: Click on the upload section and select your CSV file
2. **Select Month**: Use the month buttons to filter by specific months in 2025
3. **View Summary**: Check the automatically calculated category breakdowns
4. **Toggle Details**: Use the "Details anzeigen" button to show/hide the detailed transaction table
5. **Analyze**: Review percentages and totals for better spending insights

## 🔧 Technical Features

- **Client-side Processing**: All data processing happens in your browser
- **No Backend Required**: Perfect for static hosting (GitHub Pages, Netlify, etc.)
- **CSV Parser**: Robust CSV parsing with support for different delimiters
- **Error Handling**: Clear error messages for invalid data
- **Auto-detection**: Automatically tries to load `expenses.csv`, `demo.csv`, or `ausgaben.csv`

## 📊 Interface Components

### Upload Section
- File upload with drag & drop support  
- URL loading for remote CSV files
- Automatic collapse after successful data load
- Re-expandable for loading different files

### Monthly Filter
- Quick month selection for 2025
- "All" option to view entire dataset
- Active month highlighting

### Summary Cards
- Visual category breakdown with colors
- Percentage and absolute values
- Total expenses calculation
- Date range display

### Details Table
- Sortable transaction list
- Color-coded categories
- Collapsible/expandable view
- Responsive layout

## 🌐 Browser Compatibility

Works with all modern browsers:
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 16+

## 📝 File Structure

```
expense-tracker/
├── index.html          # Main application file
├── expenses.csv        # Your expense data (optional)
└── README.md          # This file
```

## 🤝 Contributing

Feel free to submit issues, feature requests, or pull requests to improve this expense tracker.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 💡 Tips

- Keep your CSV file updated regularly for best results
- Use consistent category names for better analysis  
- The application works entirely offline once loaded
- Export your data regularly as backup
- Check the browser console for any error messages if data doesn't load

---

**Made for personal expense tracking and financial awareness** 💰
