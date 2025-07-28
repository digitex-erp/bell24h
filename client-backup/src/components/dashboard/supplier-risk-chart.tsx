import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Chart from "chart.js/auto";

interface SupplierRiskData {
  name: string;
  riskScore: number;
  onTimeDelivery: number;
}

interface SupplierRiskChartProps {
  title?: string;
  description?: string;
  data: SupplierRiskData[];
}

export function SupplierRiskChart({ 
  title = "Supplier Risk Analysis", 
  description = "Track supplier performance and risk scores across your vendor network.",
  data 
}: SupplierRiskChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    
    // Destroy previous chart instance if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Create new chart instance
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(item => item.name),
        datasets: [
          {
            label: 'Risk Score (Lower is Better)',
            data: data.map(item => item.riskScore),
            backgroundColor: [
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 99, 132, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(255, 159, 64, 0.2)',
              'rgba(153, 102, 255, 0.2)'
            ],
            borderColor: [
              'rgba(54, 162, 235, 1)',
              'rgba(255, 99, 132, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(255, 159, 64, 1)',
              'rgba(153, 102, 255, 1)'
            ],
            borderWidth: 1
          },
          {
            label: 'On-Time Delivery Rate (%)',
            data: data.map(item => item.onTimeDelivery),
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            type: 'line',
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Risk Score'
            },
            max: 40
          },
          y1: {
            beginAtZero: true,
            position: 'right',
            title: {
              display: true,
              text: 'On-Time Delivery Rate (%)'
            },
            min: 50,
            max: 100,
            grid: {
              drawOnChartArea: false
            }
          }
        }
      }
    });

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  return (
    <Card className="bg-white shadow rounded-lg">
      <CardHeader className="p-6">
        <CardTitle className="text-lg font-medium text-gray-900">{title}</CardTitle>
        <p className="mt-2 text-sm text-gray-500">{description}</p>
      </CardHeader>
      
      <CardContent className="p-6">
        <div style={{ height: '300px' }}>
          <canvas ref={chartRef}></canvas>
        </div>
      </CardContent>
    </Card>
  );
}
