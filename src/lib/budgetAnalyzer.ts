export interface BudgetAnalysisResult {
  insight: string;
  data?: any;
  chartType?: 'line' | 'bar' | 'table';
}

export class BudgetAnalyzer {
  private data: any[];

  constructor(data: any[]) {
    this.data = data;
  }

  analyzeQuery(query: string): BudgetAnalysisResult {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('trend') || lowerQuery.includes('yearly')) {
      return this.analyzeTrends();
    }

    if (lowerQuery.includes('missed') || lowerQuery.includes('miss') || lowerQuery.includes('over budget')) {
      return this.analyzeMissedBudgets();
    }

    if (lowerQuery.includes('discrepan') || lowerQuery.includes('variance') || lowerQuery.includes('difference')) {
      return this.analyzeDiscrepancies();
    }

    if (lowerQuery.includes('total') || lowerQuery.includes('sum')) {
      return this.analyzeTotals();
    }

    if (lowerQuery.includes('average') || lowerQuery.includes('mean')) {
      return this.analyzeAverages();
    }

    if (lowerQuery.includes('best') || lowerQuery.includes('worst') || lowerQuery.includes('performance')) {
      return this.analyzePerformance();
    }

    if (lowerQuery.includes('gl') || lowerQuery.includes('general ledger')) {
      return this.analyzeGLEntries();
    }

    return this.provideGeneralInsight();
  }

  private analyzeTrends(): BudgetAnalysisResult {
    const yearlyData = this.groupByYear();
    const years = Object.keys(yearlyData).sort();
    
    if (years.length < 2) {
      return {
        insight: "I need at least 2 years of data to analyze trends. Your current data covers only one year or less.",
      };
    }

    const trendAnalysis = years.map(year => {
      const data = yearlyData[year];
      const variance = data.budget > 0 ? ((data.actual - data.budget) / data.budget) * 100 : 0;
      return { year, variance, budget: data.budget, actual: data.actual };
    });

    const improvingYears = trendAnalysis.filter((_, i) => 
      i > 0 && Math.abs(trendAnalysis[i].variance) < Math.abs(trendAnalysis[i-1].variance)
    ).length;

    const totalYears = years.length - 1;
    const isImproving = improvingYears > totalYears / 2;

    let insight = `**Budget Trend Analysis (${years[0]} - ${years[years.length - 1]})**\n\n`;
    
    if (isImproving) {
      insight += "📈 **Positive Trend**: Your budget accuracy has generally improved over time.\n\n";
    } else {
      insight += "📉 **Declining Trend**: Budget accuracy has declined in recent years.\n\n";
    }

    insight += "**Year-by-Year Performance:**\n";
    trendAnalysis.forEach(year => {
      const status = Math.abs(year.variance) < 5 ? "✅" : Math.abs(year.variance) < 15 ? "⚠️" : "❌";
      insight += `• ${year.year}: ${year.variance > 0 ? '+' : ''}${year.variance.toFixed(1)}% variance ${status}\n`;
    });

    return {
      insight,
      data: trendAnalysis,
      chartType: 'line'
    };
  }

  private analyzeMissedBudgets(): BudgetAnalysisResult {
    const missedBudgets = this.data.filter(item => {
      const budget = parseFloat(item.Budget || item.budget || 0);
      const actual = parseFloat(item.Actual || item.actual || 0);
      return actual > budget * 1.05; // More than 5% over budget
    });

    const totalItems = this.data.length;
    const missedCount = missedBudgets.length;
    const missedPercentage = (missedCount / totalItems) * 100;

    let insight = `**Budget Performance Analysis**\n\n`;
    
    if (missedCount === 0) {
      insight += "🎯 **Excellent!** You haven't significantly exceeded your budget in any recorded entries.\n\n";
    } else {
      insight += `📊 **Budget Overruns**: ${missedCount} out of ${totalItems} entries (${missedPercentage.toFixed(1)}%) exceeded budget by more than 5%.\n\n`;
      
      if (missedPercentage > 30) {
        insight += "⚠️ **High Risk**: More than 30% of your budget entries are over budget. Consider reviewing your budgeting process.\n\n";
      } else if (missedPercentage > 15) {
        insight += "🔍 **Moderate Concern**: Some budget categories consistently go over. Review these areas for better planning.\n\n";
      }

      const yearlyMisses = this.groupMissesByYear(missedBudgets);
      insight += "**Missed Budgets by Year:**\n";
      Object.entries(yearlyMisses).forEach(([year, count]) => {
        insight += `• ${year}: ${count} budget overruns\n`;
      });
    }

    return {
      insight,
      data: missedBudgets,
      chartType: 'bar'
    };
  }

  private analyzeDiscrepancies(): BudgetAnalysisResult {
    const discrepancies = this.data.map(item => {
      const budget = parseFloat(item.Budget || item.budget || 0);
      const actual = parseFloat(item.Actual || item.actual || 0);
      const variance = budget > 0 ? ((actual - budget) / budget) * 100 : 0;
      
      return {
        ...item,
        variance,
        discrepancy: actual - budget
      };
    }).filter(item => Math.abs(item.variance) > 5); // More than 5% variance

    const totalDiscrepancy = discrepancies.reduce((sum, item) => sum + Math.abs(item.discrepancy), 0);
    const avgVariance = discrepancies.length > 0 
      ? discrepancies.reduce((sum, item) => sum + Math.abs(item.variance), 0) / discrepancies.length 
      : 0;

    let insight = `**Budget Variance Analysis**\n\n`;
    
    if (discrepancies.length === 0) {
      insight += "✅ **Excellent Accuracy**: All budget entries are within 5% of planned amounts.\n\n";
    } else {
      insight += `📈 **Variance Summary**: ${discrepancies.length} entries with significant variances (>5%)\n`;
      insight += `💰 **Total Discrepancy**: $${totalDiscrepancy.toLocaleString()}\n`;
      insight += `📊 **Average Variance**: ${avgVariance.toFixed(1)}%\n\n`;

      const largestDiscrepancies = discrepancies
        .sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance))
        .slice(0, 5);

      insight += "**Top 5 Largest Variances:**\n";
      largestDiscrepancies.forEach((item, index) => {
        const category = item.Category || item.category || item.Description || item.description || 'Unknown';
        insight += `${index + 1}. ${category}: ${item.variance > 0 ? '+' : ''}${item.variance.toFixed(1)}%\n`;
      });
    }

    return {
      insight,
      data: discrepancies,
      chartType: 'table'
    };
  }

  private analyzeTotals(): BudgetAnalysisResult {
    const totals = this.data.reduce((acc, item) => {
      const budget = parseFloat(item.Budget || item.budget || 0);
      const actual = parseFloat(item.Actual || item.actual || 0);
      
      acc.totalBudget += budget;
      acc.totalActual += actual;
      return acc;
    }, { totalBudget: 0, totalActual: 0 });

    const totalVariance = totals.totalBudget > 0 
      ? ((totals.totalActual - totals.totalBudget) / totals.totalBudget) * 100 
      : 0;

    let insight = `**Total Budget Analysis**\n\n`;
    insight += `💰 **Total Budgeted**: $${totals.totalBudget.toLocaleString()}\n`;
    insight += `💸 **Total Actual**: $${totals.totalActual.toLocaleString()}\n`;
    insight += `📊 **Overall Variance**: ${totalVariance > 0 ? '+' : ''}${totalVariance.toFixed(1)}%\n\n`;

    if (Math.abs(totalVariance) < 5) {
      insight += "🎯 **Excellent Control**: Your overall budget variance is within acceptable limits.\n";
    } else if (totalVariance > 0) {
      insight += "⚠️ **Over Budget**: You've exceeded your total budget. Consider reviewing spending controls.\n";
    } else {
      insight += "💡 **Under Budget**: You've spent less than planned. This could indicate conservative budgeting or missed opportunities.\n";
    }

    return {
      insight,
      data: { totals, variance: totalVariance },
    };
  }

  private analyzeAverages(): BudgetAnalysisResult {
    const avgBudget = this.data.reduce((sum, item) => sum + parseFloat(item.Budget || item.budget || 0), 0) / this.data.length;
    const avgActual = this.data.reduce((sum, item) => sum + parseFloat(item.Actual || item.actual || 0), 0) / this.data.length;
    const avgVariance = ((avgActual - avgBudget) / avgBudget) * 100;

    let insight = `**Average Budget Analysis**\n\n`;
    insight += `📊 **Average Budget**: $${avgBudget.toLocaleString()}\n`;
    insight += `📈 **Average Actual**: $${avgActual.toLocaleString()}\n`;
    insight += `🎯 **Average Variance**: ${avgVariance > 0 ? '+' : ''}${avgVariance.toFixed(1)}%\n\n`;

    if (Math.abs(avgVariance) < 10) {
      insight += "✅ **Good Consistency**: Your average spending aligns well with budget planning.\n";
    } else {
      insight += "⚠️ **Review Needed**: Significant variance in average spending suggests budgeting improvements needed.\n";
    }

    return {
      insight,
      data: { avgBudget, avgActual, avgVariance },
    };
  }

  private analyzePerformance(): BudgetAnalysisResult {
    const performance = this.data.map(item => {
      const budget = parseFloat(item.Budget || item.budget || 0);
      const actual = parseFloat(item.Actual || item.actual || 0);
      const variance = budget > 0 ? Math.abs((actual - budget) / budget) * 100 : 0;
      
      return {
        ...item,
        variance,
        score: variance < 5 ? 'Excellent' : variance < 15 ? 'Good' : variance < 25 ? 'Fair' : 'Poor'
      };
    });

    const bestPerformers = performance
      .filter(item => item.score === 'Excellent')
      .slice(0, 3);

    const worstPerformers = performance
      .filter(item => item.score === 'Poor')
      .slice(0, 3);

    let insight = `**Performance Analysis**\n\n`;
    
    const scores = performance.reduce((acc, item) => {
      acc[item.score] = (acc[item.score] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    insight += "📊 **Performance Distribution:**\n";
    Object.entries(scores).forEach(([score, count]) => {
      const emoji = score === 'Excellent' ? '🌟' : score === 'Good' ? '✅' : score === 'Fair' ? '⚠️' : '❌';
      insight += `• ${emoji} ${score}: ${count} entries\n`;
    });

    insight += "\n🏆 **Best Performers:**\n";
    bestPerformers.forEach((item, index) => {
      const category = item.Category || item.category || item.Description || item.description || 'Unknown';
      insight += `${index + 1}. ${category} (${item.variance.toFixed(1)}% variance)\n`;
    });

    if (worstPerformers.length > 0) {
      insight += "\n🔍 **Areas for Improvement:**\n";
      worstPerformers.forEach((item, index) => {
        const category = item.Category || item.category || item.Description || item.description || 'Unknown';
        insight += `${index + 1}. ${category} (${item.variance.toFixed(1)}% variance)\n`;
      });
    }

    return {
      insight,
      data: performance,
      chartType: 'bar'
    };
  }

  private analyzeGLEntries(): BudgetAnalysisResult {
    const glFields = Object.keys(this.data[0] || {}).filter(key => 
      key.toLowerCase().includes('gl') || 
      key.toLowerCase().includes('account') || 
      key.toLowerCase().includes('code')
    );

    let insight = `**General Ledger Analysis**\n\n`;

    if (glFields.length === 0) {
      insight += "❌ **No GL Fields Found**: Your data doesn't appear to contain General Ledger account codes or similar fields.\n\n";
      insight += "Common GL field names to look for: 'GL_Account', 'Account_Code', 'GL_Code', etc.\n";
    } else {
      insight += `📋 **GL Fields Identified**: ${glFields.join(', ')}\n\n`;

      const glSummary = this.data.reduce((acc, item) => {
        glFields.forEach(field => {
          const glValue = item[field];
          if (glValue) {
            if (!acc[glValue]) {
              acc[glValue] = { count: 0, totalBudget: 0, totalActual: 0 };
            }
            acc[glValue].count += 1;
            acc[glValue].totalBudget += parseFloat(item.Budget || item.budget || 0);
            acc[glValue].totalActual += parseFloat(item.Actual || item.actual || 0);
          }
        });
        return acc;
      }, {} as Record<string, any>);

      const glEntries = Object.entries(glSummary).map(([gl, data]) => ({
        gl,
        ...data,
        variance: data.totalBudget > 0 ? ((data.totalActual - data.totalBudget) / data.totalBudget) * 100 : 0
      })).sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance));

      insight += `🔢 **Total GL Accounts**: ${glEntries.length}\n\n`;

      if (glEntries.length > 0) {
        insight += "**Top GL Accounts by Variance:**\n";
        glEntries.slice(0, 5).forEach((entry, index) => {
          const status = Math.abs(entry.variance) < 5 ? '✅' : Math.abs(entry.variance) < 15 ? '⚠️' : '❌';
          insight += `${index + 1}. ${entry.gl}: ${entry.variance > 0 ? '+' : ''}${entry.variance.toFixed(1)}% ${status}\n`;
        });

        const problematicGLs = glEntries.filter(entry => Math.abs(entry.variance) > 15);
        if (problematicGLs.length > 0) {
          insight += `\n🚨 **GL Accounts Needing Review**: ${problematicGLs.length} accounts with >15% variance\n`;
        }
      }
    }

    return {
      insight,
      data: glFields.length > 0 ? Object.values(glSummary) : null,
      chartType: 'table'
    };
  }

  private provideGeneralInsight(): BudgetAnalysisResult {
    const sampleInsights = [
      "I can help you analyze your budget data! Try asking questions like:\n\n• 'What was the trend for our yearly budget submissions?'\n• 'How many years did we miss the budget plan?'\n• 'Show me budget variances by category'\n• 'What are the largest discrepancies in our data?'\n• 'Analyze our GL account performance'",
      
      `**Quick Data Overview:**\n\n📊 **Total Records**: ${this.data.length}\n🗓️ **Data Fields**: ${Object.keys(this.data[0] || {}).join(', ')}\n\n💡 **Tip**: Ask specific questions about trends, variances, or performance to get detailed insights!`
    ];

    return {
      insight: sampleInsights[Math.floor(Math.random() * sampleInsights.length)]
    };
  }

  private groupByYear(): Record<string, { budget: number; actual: number }> {
    return this.data.reduce((acc, item) => {
      const year = item.Year || item.year || new Date().getFullYear();
      const budget = parseFloat(item.Budget || item.budget || 0);
      const actual = parseFloat(item.Actual || item.actual || 0);
      
      if (!acc[year]) {
        acc[year] = { budget: 0, actual: 0 };
      }
      
      acc[year].budget += budget;
      acc[year].actual += actual;
      
      return acc;
    }, {} as Record<string, { budget: number; actual: number }>);
  }

  private groupMissesByYear(missedBudgets: any[]): Record<string, number> {
    return missedBudgets.reduce((acc, item) => {
      const year = item.Year || item.year || new Date().getFullYear();
      acc[year] = (acc[year] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
}