'use client';

import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { TrendingUp, DollarSign, Calendar, AlertTriangle } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DataVisualizationProps {
  budgetData: any[];
}

export default function DataVisualization({ budgetData }: DataVisualizationProps) {
  const insights = useMemo(() => {
    if (budgetData.length === 0) return null;

    const yearlyData = budgetData.reduce((acc: any, item: any) => {
      const year = item.Year || item.year || new Date().getFullYear();
      const budget = parseFloat(item.Budget || item.budget || 0);
      const actual = parseFloat(item.Actual || item.actual || 0);
      
      if (!acc[year]) {
        acc[year] = { budget: 0, actual: 0, count: 0 };
      }
      
      acc[year].budget += budget;
      acc[year].actual += actual;
      acc[year].count += 1;
      
      return acc;
    }, {});

    const years = Object.keys(yearlyData).sort();
    const budgetValues = years.map(year => yearlyData[year].budget);
    const actualValues = years.map(year => yearlyData[year].actual);

    const variance = years.map(year => {
      const budget = yearlyData[year].budget;
      const actual = yearlyData[year].actual;
      return budget > 0 ? ((actual - budget) / budget) * 100 : 0;
    });

    return {
      years,
      budgetValues,
      actualValues,
      variance,
      totalRecords: budgetData.length,
      averageVariance: variance.reduce((a, b) => a + b, 0) / variance.length,
    };
  }, [budgetData]);

  if (!insights || budgetData.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <TrendingUp className="mx-auto mb-4 h-12 w-12" />
        <p>Upload budget data to see visualizations and insights.</p>
      </div>
    );
  }

  const trendChartData = {
    labels: insights.years,
    datasets: [
      {
        label: 'Budget',
        data: insights.budgetValues,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1,
      },
      {
        label: 'Actual',
        data: insights.actualValues,
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.1,
      },
    ],
  };

  const varianceChartData = {
    labels: insights.years,
    datasets: [
      {
        label: 'Budget Variance (%)',
        data: insights.variance,
        backgroundColor: insights.variance.map(v => 
          v > 0 ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.8)'
        ),
        borderColor: insights.variance.map(v => 
          v > 0 ? 'rgb(16, 185, 129)' : 'rgb(239, 68, 68)'
        ),
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Data Points</p>
              <p className="text-2xl font-semibold text-gray-900">{insights.totalRecords}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Years Covered</p>
              <p className="text-2xl font-semibold text-gray-900">{insights.years.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-yellow-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Avg Variance</p>
              <p className="text-2xl font-semibold text-gray-900">
                {insights.averageVariance.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Status</p>
              <p className="text-2xl font-semibold text-gray-900">
                {Math.abs(insights.averageVariance) > 10 ? 'Review' : 'Good'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Budget vs Actual Trend</h3>
          <Line data={trendChartData} options={chartOptions} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Budget Variance by Year</h3>
          <Bar data={varianceChartData} options={chartOptions} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Data Preview</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {Object.keys(budgetData[0] || {}).slice(0, 5).map((key) => (
                  <th
                    key={key}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {budgetData.slice(0, 5).map((row, index) => (
                <tr key={index}>
                  {Object.values(row).slice(0, 5).map((value, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    >
                      {String(value)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {budgetData.length > 5 && (
          <p className="text-sm text-gray-500 mt-2">
            Showing 5 of {budgetData.length} records
          </p>
        )}
      </div>
    </div>
  );
}