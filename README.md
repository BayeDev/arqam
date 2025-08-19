# Arqam Budget Insights

An AI-powered budget analysis chatbot that helps you interact with and gain insights from your budget data over the last five years.

## Features

- 📊 **Excel File Upload**: Upload and parse Excel files (.xlsx, .xls) containing budget data
- 🤖 **AI Chatbot**: Interactive chat interface for asking questions about your budget data
- 📈 **Data Visualization**: Charts, graphs, and tables showing budget trends and insights
- 💡 **Smart Analysis**: Get insights about:
  - Yearly budget submission trends
  - Budget plan performance and missed targets
  - GL entry discrepancies and variances
  - Budget performance by category
  - Average spending patterns

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/BayeDev/arqam.git
cd arqam
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### 1. Upload Budget Data
- Navigate to the "Upload Data" tab
- Drag and drop or select an Excel file containing your budget data
- The application expects columns like: Year, Budget, Actual, Category, etc.

### 2. Chat Analysis
- Once data is uploaded, navigate to "Chat Analysis"
- Ask questions in natural language about your budget data
- Example questions:
  - "What was the trend for our yearly budget submissions?"
  - "How many years did we miss the budget plan?"
  - "Do you see any discrepancies in GL entries?"
  - "Show me the worst performing budget categories"
  - "What's our average budget variance?"

### 3. Visualizations
- View automatic charts and graphs of your budget data
- See key metrics like total records, average variance, and performance indicators
- Browse data tables with your uploaded information

## Expected Data Format

Your Excel file should include columns such as:
- **Year**: The budget year (e.g., 2020, 2021, etc.)
- **Budget**: Planned budget amount
- **Actual**: Actual spending amount
- **Category**: Budget category or description
- **GL_Account** (optional): General Ledger account codes

## Technologies Used

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Chart.js & React-Chartjs-2**: Data visualization
- **XLSX**: Excel file parsing
- **Lucide React**: Modern icon library

## Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue on the [GitHub repository](https://github.com/BayeDev/arqam/issues).
