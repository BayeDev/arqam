'use client';

import { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import ChatInterface from '@/components/ChatInterface';
import DataVisualization from '@/components/DataVisualization';
import { BudgetAnalyzer } from '@/lib/budgetAnalyzer';
import { BarChart3, MessageSquare, Upload } from 'lucide-react';

export default function Home() {
  const [budgetData, setBudgetData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'upload' | 'chat' | 'visualize'>('upload');

  const handleDataLoad = (data: any[]) => {
    setBudgetData(data);
    setActiveTab('chat');
  };

  const handleSendMessage = async (message: string): Promise<string> => {
    if (budgetData.length === 0) {
      return "Please upload your budget data first to analyze it.";
    }

    try {
      const analyzer = new BudgetAnalyzer(budgetData);
      const result = analyzer.analyzeQuery(message);
      return result.insight;
    } catch (error) {
      console.error('Analysis error:', error);
      return "I encountered an error while analyzing your data. Please try rephrasing your question.";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Arqam Budget Insights</h1>
            </div>
            <p className="text-sm text-gray-600">AI-Powered Budget Analysis Chatbot</p>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('upload')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'upload'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Upload className="inline h-4 w-4 mr-2" />
              Upload Data
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'chat'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <MessageSquare className="inline h-4 w-4 mr-2" />
              Chat Analysis
            </button>
            <button
              onClick={() => setActiveTab('visualize')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'visualize'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BarChart3 className="inline h-4 w-4 mr-2" />
              Visualizations
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'upload' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900">Upload Your Budget Data</h2>
              <p className="mt-2 text-lg text-gray-600">
                Upload an Excel file containing your budget data for the last five years to get started.
              </p>
            </div>
            <FileUpload onDataLoad={handleDataLoad} />
            {budgetData.length > 0 && (
              <div className="text-center">
                <p className="text-green-600 font-medium">
                  ✅ Successfully loaded {budgetData.length} records!
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Navigate to the Chat Analysis tab to start asking questions about your data.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900">Budget Analysis Chat</h2>
              <p className="mt-2 text-lg text-gray-600">
                Ask questions about your budget data and get AI-powered insights.
              </p>
            </div>
            <div className="max-w-4xl mx-auto">
              <ChatInterface budgetData={budgetData} onSendMessage={handleSendMessage} />
            </div>
            {budgetData.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-4xl mx-auto">
                <h3 className="font-semibold text-blue-900 mb-2">💡 Try asking questions like:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• "What was the trend for our yearly budget submissions?"</li>
                  <li>• "How many years did we miss the budget plan?"</li>
                  <li>• "Do you see any discrepancies in GL entries?"</li>
                  <li>• "Show me the worst performing budget categories"</li>
                  <li>• "What's our average budget variance?"</li>
                </ul>
              </div>
            )}
          </div>
        )}

        {activeTab === 'visualize' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900">Data Visualizations</h2>
              <p className="mt-2 text-lg text-gray-600">
                Visual insights and charts from your budget data.
              </p>
            </div>
            <DataVisualization budgetData={budgetData} />
          </div>
        )}
      </main>

      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            Arqam Budget Insights - AI-Powered Budget Analysis Tool
          </p>
        </div>
      </footer>
    </div>
  );
}
