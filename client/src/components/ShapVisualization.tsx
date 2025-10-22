'use client';

import React, { useEffect, useRef, useState } from 'react';
import { BarChart3, Info, TrendingUp, TrendingDown, Target, Zap } from 'lucide-react';

interface ShapData {
  feature: string;
  value: number;
  shap_value: number;
  importance: number;
  category: string;
}

interface ShapVisualizationProps {
  data: ShapData[];
  title?: string;
  type?: 'bar' | 'waterfall' | 'force';
  width?: number;
  height?: number;
  onFeatureClick?: (feature: string) => void;
}

export const ShapVisualization: React.FC<ShapVisualizationProps> = ({
  data,
  title = "SHAP Feature Importance",
  type = 'bar',
  width = 600,
  height = 400,
  onFeatureClick
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);

  // Sort data by absolute SHAP value for better visualization
  const sortedData = [...data].sort((a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value));

  const maxShapValue = Math.max(...sortedData.map(d => Math.abs(d.shap_value)));
  const colors = {
    positive: '#10B981', // green-500
    negative: '#EF4444', // red-500
    neutral: '#6B7280'   // gray-500
  };

  const getFeatureColor = (shapValue: number) => {
    if (shapValue > 0) return colors.positive;
    if (shapValue < 0) return colors.negative;
    return colors.neutral;
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'financial': return <Target className="w-4 h-4" />;
      case 'compliance': return <Zap className="w-4 h-4" />;
      case 'performance': return <TrendingUp className="w-4 h-4" />;
      case 'reliability': return <BarChart3 className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const renderBarChart = () => {
    if (!svgRef.current) return;

    const svg = svgRef.current;
    const margin = { top: 20, right: 100, bottom: 40, left: 120 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Clear previous content
    svg.innerHTML = '';

    // Create SVG group for the chart
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', `translate(${margin.left},${margin.top})`);

    // Add title
    const titleElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    titleElement.setAttribute('x', chartWidth / 2);
    titleElement.setAttribute('y', -5);
    titleElement.setAttribute('text-anchor', 'middle');
    titleElement.setAttribute('font-size', '16');
    titleElement.setAttribute('font-weight', 'bold');
    titleElement.setAttribute('fill', '#374151');
    titleElement.textContent = title;
    g.appendChild(titleElement);

    // Create bars
    sortedData.forEach((item, index) => {
      const barHeight = chartHeight / sortedData.length * 0.8;
      const barY = index * (chartHeight / sortedData.length) + (chartHeight / sortedData.length - barHeight) / 2;
      const barWidth = (Math.abs(item.shap_value) / maxShapValue) * chartWidth;
      const barX = item.shap_value >= 0 ? 0 : chartWidth - barWidth;

      // Create bar group
      const barGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      barGroup.setAttribute('class', 'bar-group');
      barGroup.style.cursor = 'pointer';

      // Create bar rectangle
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', barX.toString());
      rect.setAttribute('y', barY.toString());
      rect.setAttribute('width', barWidth.toString());
      rect.setAttribute('height', barHeight.toString());
      rect.setAttribute('fill', getFeatureColor(item.shap_value));
      rect.setAttribute('opacity', selectedFeature === item.feature ? '1' : '0.8');
      rect.setAttribute('stroke', selectedFeature === item.feature ? '#1F2937' : 'none');
      rect.setAttribute('stroke-width', selectedFeature === item.feature ? '2' : '0');
      rect.setAttribute('rx', '4');
      rect.setAttribute('ry', '4');

      // Add hover effect
      rect.addEventListener('mouseenter', () => {
        setHoveredFeature(item.feature);
        rect.setAttribute('opacity', '1');
      });
      rect.addEventListener('mouseleave', () => {
        setHoveredFeature(null);
        rect.setAttribute('opacity', selectedFeature === item.feature ? '1' : '0.8');
      });
      rect.addEventListener('click', () => {
        setSelectedFeature(selectedFeature === item.feature ? null : item.feature);
        onFeatureClick?.(item.feature);
      });

      barGroup.appendChild(rect);

      // Add feature name
      const featureText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      featureText.setAttribute('x', '-10');
      featureText.setAttribute('y', (barY + barHeight / 2).toString());
      featureText.setAttribute('text-anchor', 'end');
      featureText.setAttribute('font-size', '12');
      featureText.setAttribute('fill', '#374151');
      featureText.setAttribute('dominant-baseline', 'middle');
      featureText.textContent = item.feature;
      barGroup.appendChild(featureText);

      // Add SHAP value
      const valueText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      valueText.setAttribute('x', (item.shap_value >= 0 ? barWidth + 5 : -5).toString());
      valueText.setAttribute('y', (barY + barHeight / 2).toString());
      valueText.setAttribute('text-anchor', item.shap_value >= 0 ? 'start' : 'end');
      valueText.setAttribute('font-size', '11');
      valueText.setAttribute('fill', '#6B7280');
      valueText.setAttribute('dominant-baseline', 'middle');
      valueText.textContent = item.shap_value.toFixed(3);
      barGroup.appendChild(valueText);

      g.appendChild(barGroup);
    });

    // Add axis
    const axisLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    axisLine.setAttribute('x1', '0');
    axisLine.setAttribute('y1', '0');
    axisLine.setAttribute('x2', '0');
    axisLine.setAttribute('y2', chartHeight.toString());
    axisLine.setAttribute('stroke', '#D1D5DB');
    axisLine.setAttribute('stroke-width', '1');
    g.appendChild(axisLine);

    svg.appendChild(g);
  };

  useEffect(() => {
    renderBarChart();
  }, [data, selectedFeature, hoveredFeature]);

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6" data-testid="shap-visualization">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded mr-1"></div>
            <span>Positive Impact</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded mr-1"></div>
            <span>Negative Impact</span>
          </div>
        </div>
      </div>

      <div className="flex space-x-4 mb-4">
        <button
          onClick={() => setType('bar')}
          className={`px-3 py-1 rounded text-sm ${
            type === 'bar' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Bar Chart
        </button>
        <button
          onClick={() => setType('waterfall')}
          className={`px-3 py-1 rounded text-sm ${
            type === 'waterfall' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Waterfall
        </button>
      </div>

      <div className="overflow-x-auto">
        <svg
          ref={svgRef}
          width={width}
          height={height}
          className="w-full"
          data-testid="shap-chart"
        />
      </div>

      {hoveredFeature && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg" data-testid="feature-details">
          <h4 className="font-medium text-gray-900 mb-2">Feature Details</h4>
          {(() => {
            const feature = sortedData.find(d => d.feature === hoveredFeature);
            if (!feature) return null;
            return (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Feature:</span>
                  <p className="font-medium">{feature.feature}</p>
                </div>
                <div>
                  <span className="text-gray-600">Category:</span>
                  <p className="font-medium flex items-center">
                    {getCategoryIcon(feature.category)}
                    <span className="ml-1">{feature.category}</span>
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">SHAP Value:</span>
                  <p className="font-medium">{feature.shap_value.toFixed(4)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Importance:</span>
                  <p className="font-medium">{(feature.importance * 100).toFixed(1)}%</p>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        <p>Click on bars to select features. SHAP values show how each feature contributes to the supplier score.</p>
      </div>
    </div>
  );
};

export default ShapVisualization;
