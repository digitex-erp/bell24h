import Chart from 'chart.js/auto';

interface ChartOptions {
  rfqSuccessChartRef: HTMLCanvasElement;
  supplierRiskChartRef: HTMLCanvasElement;
  marketTrendsChartRef: HTMLCanvasElement;
  marketTrendsData: {
    electronics: {
      dates: string[];
      values: number[];
    } | null;
    industrial: {
      dates: string[];
      values: number[];
    } | null;
  };
}

let rfqSuccessChart: Chart;
let supplierRiskChart: Chart;
let marketTrendsChart: Chart;
let supplyChainChart: Chart;
let rfqPredictionChart: Chart;
let volatilityChart: Chart;

export function createCharts(options: ChartOptions) {
  const { 
    rfqSuccessChartRef, 
    supplierRiskChartRef, 
    marketTrendsChartRef,
    marketTrendsData
  } = options;

  // Destroy existing charts to prevent duplicates
  if (rfqSuccessChart) rfqSuccessChart.destroy();
  if (supplierRiskChart) supplierRiskChart.destroy();
  if (marketTrendsChart) marketTrendsChart.destroy();

  // RFQ Success Prediction Chart
  rfqSuccessChart = new Chart(rfqSuccessChartRef, {
    type: 'bar',
    data: {
      labels: ['Electronics', 'Machinery', 'Chemicals', 'Textiles', 'Auto Parts'],
      datasets: [{
        label: 'Success Rate (%)',
        data: [87, 72, 65, 81, 76],
        backgroundColor: [
          'rgba(30, 64, 175, 0.7)',
          'rgba(30, 64, 175, 0.7)',
          'rgba(30, 64, 175, 0.7)',
          'rgba(30, 64, 175, 0.7)',
          'rgba(30, 64, 175, 0.7)',
        ],
        borderColor: [
          'rgba(30, 64, 175, 1)',
          'rgba(30, 64, 175, 1)',
          'rgba(30, 64, 175, 1)',
          'rgba(30, 64, 175, 1)',
          'rgba(30, 64, 175, 1)',
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 100
        }
      },
      plugins: {
        legend: {
          display: false
        }
      }
    }
  });

  // Supplier Risk Distribution Chart
  supplierRiskChart = new Chart(supplierRiskChartRef, {
    type: 'doughnut',
    data: {
      labels: ['Low Risk', 'Medium Risk', 'High Risk'],
      datasets: [{
        label: 'Supplier Distribution',
        data: [65, 25, 10],
        backgroundColor: [
          'rgba(16, 185, 129, 0.7)',
          'rgba(245, 158, 11, 0.7)',
          'rgba(239, 68, 68, 0.7)',
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            padding: 15
          }
        }
      }
    }
  });

  // Market Trends Chart
  const dates = marketTrendsData.electronics?.dates?.slice(-10) || 
                ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
  const electronicsValues = marketTrendsData.electronics?.values?.slice(-10) || 
                           [65, 67, 70, 68, 72, 75, 78, 82, 85, 87];
  const industrialValues = marketTrendsData.industrial?.values?.slice(-10) || 
                          [45, 48, 47, 49, 51, 54, 52, 56, 58, 62];

  marketTrendsChart = new Chart(marketTrendsChartRef, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: 'Electronics',
        data: electronicsValues,
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      }, {
        label: marketTrendsData.industrial ? 'Industrial' : 'Selected Industry',
        data: industrialValues,
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: false,
          title: {
            display: true,
            text: 'Price Index'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Date'
          }
        }
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            padding: 15
          }
        },
        tooltip: {
          callbacks: {
            label: function(tooltipItem) {
              return `${tooltipItem.dataset.label}: ${tooltipItem.formattedValue}`;
            }
          }
        }
      }
    }
  });
}

// Create Supply Chain Chart
export function createSupplyChainChart(chartRef: HTMLCanvasElement, data: any) {
  // Destroy existing chart if it exists
  if (supplyChainChart) supplyChainChart.destroy();

  // Prepare data
  const forecast = data?.priceForecasts?.map((item: any) => item.price) || 
                  [105, 108, 112, 115];
  
  // Get labels - weeks or specific dates
  const labels = data?.priceForecasts?.map((item: any, index: number) => `Week ${index + 1}`) || 
                ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
  
  // Get historical data if available
  const historical = data?.stockData?.slice(0, 5).map((item: any) => 
    item.data?.prices ? item.data.prices[item.data.prices.length - 1] : null
  ) || [95, 98, 100, 102, 104];
  
  // Combine datasets with a gap between historical and forecast
  const historicalLabels = data?.stockData?.slice(0, 5).map((item: any, index: number) => 
    `Past ${5 - index}`
  ) || ['Past 5', 'Past 4', 'Past 3', 'Past 2', 'Past 1'];
  
  // Create chart
  supplyChainChart = new Chart(chartRef, {
    type: 'line',
    data: {
      labels: [...historicalLabels, 'Current', ...labels],
      datasets: [
        {
          label: 'Historical',
          data: [...historical, 105, ...Array(forecast.length).fill(null)],
          borderColor: 'rgba(107, 114, 128, 1)',
          backgroundColor: 'rgba(107, 114, 128, 0.1)',
          tension: 0.4,
          fill: true,
          pointStyle: 'circle',
        },
        {
          label: 'Forecast',
          data: [...Array(historical.length + 1).fill(null), ...forecast],
          borderColor: 'rgba(59, 130, 246, 1)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderDash: [5, 5],
          tension: 0.4,
          fill: true,
          pointStyle: 'triangle',
        },
        {
          label: 'Upper Bound',
          data: [...Array(historical.length + 1).fill(null), ...forecast.map((val: number) => val * 1.05)],
          borderColor: 'rgba(209, 213, 219, 1)',
          backgroundColor: 'transparent',
          borderDash: [2, 2],
          tension: 0.4,
          pointStyle: false,
          borderWidth: 1,
        },
        {
          label: 'Lower Bound',
          data: [...Array(historical.length + 1).fill(null), ...forecast.map((val: number) => val * 0.95)],
          borderColor: 'rgba(209, 213, 219, 1)',
          backgroundColor: 'transparent',
          borderDash: [2, 2],
          tension: 0.4,
          pointStyle: false,
          borderWidth: 1,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          title: {
            display: true,
            text: 'Price'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Time Period'
          }
        }
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            padding: 15,
            filter: function(item) {
              // Hide upper and lower bound from legend
              return !['Upper Bound', 'Lower Bound'].includes(item.text);
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(tooltipItem) {
              const label = tooltipItem.dataset.label || '';
              if (label === 'Upper Bound') return 'Upper Confidence: ' + tooltipItem.formattedValue;
              if (label === 'Lower Bound') return 'Lower Confidence: ' + tooltipItem.formattedValue;
              return `${label}: ${tooltipItem.formattedValue}`;
            }
          }
        }
      }
    }
  });
}

// Create RFQ Success Prediction Chart
export function createRfqSuccessPredictionChart(chartRef: HTMLCanvasElement, data: any) {
  // Destroy existing chart if it exists
  if (rfqPredictionChart) rfqPredictionChart.destroy();

  // Extract industries and success scores
  const industries = Object.keys(data?.industries || {}).slice(0, 8);
  const successScores = industries.map(industry => 
    data?.industries[industry]?.successScore || Math.floor(Math.random() * 30) + 50
  );
  const competitionLevels = industries.map(industry => 
    data?.industries[industry]?.competitionLevel || Math.floor(Math.random() * 100)
  );

  // Create chart
  rfqPredictionChart = new Chart(chartRef, {
    type: 'bar',
    data: {
      labels: industries,
      datasets: [
        {
          label: 'Success Rate (%)',
          data: successScores,
          backgroundColor: successScores.map(score => 
            score > 80 ? 'rgba(16, 185, 129, 0.7)' : 
            score > 60 ? 'rgba(59, 130, 246, 0.7)' : 
            score > 40 ? 'rgba(245, 158, 11, 0.7)' : 
            'rgba(239, 68, 68, 0.7)'
          ),
          borderColor: successScores.map(score => 
            score > 80 ? 'rgba(16, 185, 129, 1)' : 
            score > 60 ? 'rgba(59, 130, 246, 1)' : 
            score > 40 ? 'rgba(245, 158, 11, 1)' : 
            'rgba(239, 68, 68, 1)'
          ),
          borderWidth: 1,
          order: 1
        },
        {
          label: 'Competition Level',
          data: competitionLevels,
          type: 'line',
          borderColor: 'rgba(156, 163, 175, 1)',
          backgroundColor: 'rgba(156, 163, 175, 0.1)',
          borderDash: [5, 5],
          borderWidth: 2,
          pointStyle: 'rectRot',
          pointRadius: 6,
          pointHoverRadius: 8,
          fill: false,
          tension: 0.4,
          yAxisID: 'y1',
          order: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y', // Horizontal bar chart
      scales: {
        x: {
          beginAtZero: true,
          max: 100,
          title: {
            display: true,
            text: 'Success Rate (%)'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Industry'
          }
        },
        y1: {
          position: 'right',
          beginAtZero: true,
          max: 100,
          title: {
            display: true,
            text: 'Competition Level'
          },
          grid: {
            drawOnChartArea: false
          }
        }
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            padding: 15
          }
        },
        tooltip: {
          callbacks: {
            label: function(tooltipItem) {
              const datasetLabel = tooltipItem.dataset.label || '';
              if (datasetLabel === 'Success Rate (%)') {
                return `Success Rate: ${tooltipItem.formattedValue}%`;
              } else if (datasetLabel === 'Competition Level') {
                return `Competition: ${tooltipItem.formattedValue}/100`;
              }
              return `${datasetLabel}: ${tooltipItem.formattedValue}`;
            }
          }
        }
      }
    }
  });
}

// Create Market Volatility Chart
export function createVolatilityChart(chartRef: HTMLCanvasElement, data: any) {
  // Destroy existing chart if it exists
  if (volatilityChart) volatilityChart.destroy();

  // Extract industries and volatility scores
  const industries = Object.keys(data?.industries || {}).slice(0, 10);
  const volatilityScores = industries.map(industry => 
    data?.industries[industry]?.volatilityScore || Math.floor(Math.random() * 40) + 10
  );

  // Get global index
  const globalIndex = data?.globalIndex?.score || 24.3;

  // Create radar chart for volatility
  volatilityChart = new Chart(chartRef, {
    type: 'radar',
    data: {
      labels: industries,
      datasets: [
        {
          label: 'Industry Volatility',
          data: volatilityScores,
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(59, 130, 246, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(59, 130, 246, 1)',
          pointRadius: 4,
        },
        {
          label: 'Global Average',
          data: Array(industries.length).fill(globalIndex),
          backgroundColor: 'rgba(156, 163, 175, 0.2)',
          borderColor: 'rgba(156, 163, 175, 1)',
          borderWidth: 2,
          borderDash: [5, 5],
          pointRadius: 0,
          pointHoverRadius: 0,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          angleLines: {
            display: true
          },
          suggestedMin: 0,
          suggestedMax: 100,
          ticks: {
            stepSize: 20
          }
        }
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            padding: 15
          }
        },
        tooltip: {
          callbacks: {
            label: function(tooltipItem) {
              const value = tooltipItem.formattedValue;
              const label = tooltipItem.dataset.label || '';
              
              let interpretation = '';
              const numValue = parseFloat(value);
              if (numValue < 20) interpretation = ' (Low Volatility)';
              else if (numValue < 40) interpretation = ' (Moderate Volatility)';
              else if (numValue < 60) interpretation = ' (High Volatility)';
              else interpretation = ' (Extreme Volatility)';
              
              return `${label}: ${value}${interpretation}`;
            }
          }
        }
      }
    }
  });
}
