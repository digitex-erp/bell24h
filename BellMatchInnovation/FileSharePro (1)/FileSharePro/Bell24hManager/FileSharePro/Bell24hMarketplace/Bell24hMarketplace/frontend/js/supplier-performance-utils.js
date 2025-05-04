/**
 * Supplier Performance Visualization Utilities
 * 
 * This module provides helper functions for transforming supplier performance data
 * into formats suitable for visualization with various charting libraries.
 */

/**
 * Transform supplier performance data into a format suitable for a heatmap
 * 
 * @param {Object} data - The raw supplier performance data from the API
 * @param {string} sortBy - The metric to sort suppliers by
 * @param {boolean} descending - Whether to sort in descending order
 * @returns {Object} Transformed data ready for heatmap visualization
 */
function transformHeatmapData(data, sortBy = null, descending = true) {
    if (!data || !data.suppliers || !data.metrics) {
        console.error('Invalid data format for heatmap transformation');
        return null;
    }
    
    const { suppliers, metrics, industry_averages } = data;
    
    // Sort suppliers if requested
    let sortedSuppliers = [...suppliers];
    if (sortBy && metrics.includes(sortBy)) {
        sortedSuppliers.sort((a, b) => {
            const valueA = a.metrics[sortBy] || 0;
            const valueB = b.metrics[sortBy] || 0;
            return descending ? valueB - valueA : valueA - valueB;
        });
    }
    
    // Build the heatmap data structure
    const rows = sortedSuppliers.map(supplier => {
        const row = {
            name: supplier.name,
            id: supplier.id,
            industry: supplier.industry,
            region: supplier.region
        };
        
        // Add metrics as columns
        metrics.forEach(metric => {
            row[metric] = supplier.metrics[metric] || 0;
        });
        
        return row;
    });
    
    // Add industry average as a special row
    if (industry_averages) {
        const avgRow = {
            name: 'Industry Average',
            id: 'avg',
            industry: data.metadata.industry,
            region: data.metadata.region,
            isAverage: true
        };
        
        // Add metrics
        metrics.forEach(metric => {
            avgRow[metric] = industry_averages[metric] || 0;
        });
        
        rows.push(avgRow);
    }
    
    return {
        rows,
        metrics,
        metadata: data.metadata
    };
}

/**
 * Transform time series data for a line chart
 * 
 * @param {Object} data - The raw time series data from the API
 * @returns {Object} Transformed data ready for line chart visualization
 */
function transformTimeSeriesData(data) {
    if (!data || !data.time_points || !data.values) {
        console.error('Invalid data format for time series transformation');
        return null;
    }
    
    const { time_points, values, metric, supplier_id } = data;
    
    // Create a series format suitable for most charting libraries
    const series = time_points.map((label, index) => ({
        x: label,
        y: values[index]
    }));
    
    return {
        series,
        metric,
        supplier_id,
        labels: time_points
    };
}

/**
 * Transform supplier comparison data for a radar chart
 * 
 * @param {Object} data - The raw comparison data from the API
 * @returns {Object} Transformed data ready for radar chart visualization
 */
function transformComparisonData(data) {
    if (!data || !data.suppliers || !data.metrics) {
        console.error('Invalid data format for comparison transformation');
        return null;
    }
    
    const { suppliers, metrics, averages } = data;
    
    // Create series data for each supplier
    const series = suppliers.map(supplier => ({
        name: supplier.name,
        id: supplier.id,
        data: metrics.map(metric => supplier.metrics[metric] || 0)
    }));
    
    // Add average as a series if available
    if (averages) {
        series.push({
            name: 'Average',
            id: 'avg',
            data: metrics.map(metric => averages[metric] || 0)
        });
    }
    
    return {
        series,
        categories: metrics,
        suppliers: suppliers.map(s => ({ id: s.id, name: s.name }))
    };
}

/**
 * Generate a color scale based on score values
 * 
 * @param {number} score - The score value (0-100)
 * @param {Object} options - Options for customizing the color scale
 * @returns {string} CSS color value
 */
function getScoreColor(score, options = {}) {
    const {
        lowColor = '#e74c3c',   // Red for low scores
        midColor = '#f39c12',   // Orange for mid scores
        highColor = '#2ecc71',  // Green for high scores
        lowThreshold = 40,      // Below this is low
        highThreshold = 70      // Above this is high
    } = options;
    
    // Ensure score is in 0-100 range
    const normalizedScore = Math.max(0, Math.min(100, score));
    
    if (normalizedScore < lowThreshold) {
        // Low score: interpolate between lowColor and midColor
        const factor = normalizedScore / lowThreshold;
        return interpolateColor(lowColor, midColor, factor);
    } else if (normalizedScore < highThreshold) {
        // Mid score: interpolate between midColor and highColor
        const factor = (normalizedScore - lowThreshold) / (highThreshold - lowThreshold);
        return interpolateColor(midColor, highColor, factor);
    } else {
        // High score
        return highColor;
    }
}

/**
 * Interpolate between two colors
 * 
 * @param {string} color1 - Starting color in hex format (#RRGGBB)
 * @param {string} color2 - Ending color in hex format (#RRGGBB)
 * @param {number} factor - Interpolation factor (0-1)
 * @returns {string} Interpolated color
 */
function interpolateColor(color1, color2, factor) {
    if (factor <= 0) return color1;
    if (factor >= 1) return color2;
    
    // Parse the hex colors to rgb
    const r1 = parseInt(color1.substring(1, 3), 16);
    const g1 = parseInt(color1.substring(3, 5), 16);
    const b1 = parseInt(color1.substring(5, 7), 16);
    
    const r2 = parseInt(color2.substring(1, 3), 16);
    const g2 = parseInt(color2.substring(3, 5), 16);
    const b2 = parseInt(color2.substring(5, 7), 16);
    
    // Interpolate
    const r = Math.round(r1 + factor * (r2 - r1));
    const g = Math.round(g1 + factor * (g2 - g1));
    const b = Math.round(b1 + factor * (b2 - b1));
    
    // Convert back to hex
    const rHex = r.toString(16).padStart(2, '0');
    const gHex = g.toString(16).padStart(2, '0');
    const bHex = b.toString(16).padStart(2, '0');
    
    return `#${rHex}${gHex}${bHex}`;
}

/**
 * Format a score value for display
 * 
 * @param {number} score - The score value
 * @param {string} metric - The metric name
 * @returns {string} Formatted score
 */
function formatScore(score, metric) {
    // Different formatting based on metric type
    switch (metric) {
        case 'price_competitiveness':
        case 'quality_score':
        case 'customer_satisfaction':
        case 'technical_specification_adherence':
            return `${score}/100`;
            
        case 'delivery_time':
            return `${score}%`;
            
        case 'return_rate':
            return `${score}%`;
            
        case 'gst_compliance':
            return score >= 90 ? 'Compliant' : (score >= 70 ? 'Partial' : 'Non-compliant');
            
        default:
            return `${score}`;
    }
}

/**
 * Get a descriptive label for a metric
 * 
 * @param {string} metric - The metric identifier
 * @returns {string} Human-readable label
 */
function getMetricLabel(metric) {
    const labels = {
        delivery_time: 'Delivery Time',
        quality_score: 'Quality Score',
        price_competitiveness: 'Price Competitiveness',
        communication_responsiveness: 'Communication',
        order_accuracy: 'Order Accuracy',
        return_rate: 'Return Rate',
        customer_satisfaction: 'Customer Satisfaction',
        payment_terms_flexibility: 'Payment Terms',
        technical_specification_adherence: 'Technical Specs',
        warranty_policy: 'Warranty Policy',
        gst_compliance: 'GST Compliance'
    };
    
    return labels[metric] || metric;
}

/**
 * Get a description for a metric
 * 
 * @param {string} metric - The metric identifier
 * @returns {string} Description of the metric
 */
function getMetricDescription(metric) {
    const descriptions = {
        delivery_time: 'Percentage of on-time deliveries within agreed timeframe',
        quality_score: 'Quality score based on product inspections and customer feedback',
        price_competitiveness: 'How competitive the supplier\'s pricing is compared to market rates',
        communication_responsiveness: 'Response time and effectiveness of communication',
        order_accuracy: 'Percentage of orders fulfilled according to exact specifications',
        return_rate: 'Percentage of products returned due to defects or issues',
        customer_satisfaction: 'Average customer satisfaction score for this supplier',
        payment_terms_flexibility: 'Flexibility in payment terms and conditions',
        technical_specification_adherence: 'Adherence to technical specifications and standards',
        warranty_policy: 'Comprehensiveness and reliability of warranty policies',
        gst_compliance: 'Compliance with GST requirements and documentation'
    };
    
    return descriptions[metric] || 'No description available';
}

// Export utilities
export {
    transformHeatmapData,
    transformTimeSeriesData,
    transformComparisonData,
    getScoreColor,
    formatScore,
    getMetricLabel,
    getMetricDescription
};

// For non-module environments
if (typeof window !== 'undefined') {
    window.SupplierPerformanceUtils = {
        transformHeatmapData,
        transformTimeSeriesData,
        transformComparisonData,
        getScoreColor,
        formatScore,
        getMetricLabel,
        getMetricDescription
    };
}