#!/usr/bin/env python
"""
Model Explanation Visualization Generator

This script generates visualizations for model explanations, including:
- Feature importance bar charts
- SHAP force plots
- LIME explanation plots
- Waterfall charts for price impact

These visualizations help users understand model predictions in a visual format.
"""

import argparse
import json
import sys
import os
import numpy as np
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
from matplotlib.colors import LinearSegmentedColormap
import base64
from io import BytesIO

def generate_feature_importance_chart(data, output_path, model_type, format='svg'):
    """
    Generate a horizontal bar chart showing feature importance.
    
    Args:
        data: Dictionary with feature importances
        output_path: Path to save the visualization
        model_type: Type of model (supplier_risk, rfq_matching, price_prediction)
        format: Output format (svg or png)
    """
    # Extract feature importances
    features = []
    importances = []
    
    for item in data['feature_importances']:
        features.append(item['feature'])
        importances.append(item['importance'])
    
    # Convert to numpy arrays
    features = np.array(features)
    importances = np.array(importances)
    
    # Sort by absolute importance
    indices = np.argsort(np.abs(importances))[::-1]  # Descending order
    features = features[indices]
    importances = importances[indices]
    
    # Create a figure
    plt.figure(figsize=(10, 8))
    
    # Plot horizontal bar chart with color based on direction
    bars = plt.barh(
        range(len(features)), 
        importances,
        color=['#ff6b6b' if imp < 0 else '#4ecdc4' for imp in importances]
    )
    
    # Add feature names as y-axis labels
    plt.yticks(range(len(features)), features)
    
    # Add title and labels based on model type
    if model_type == 'supplier_risk':
        plt.title('Factors Influencing Supplier Risk Assessment', fontsize=16)
        plt.xlabel('Impact on Risk Score', fontsize=12)
    elif model_type == 'rfq_matching':
        plt.title('Factors Influencing RFQ-Supplier Match Score', fontsize=16)
        plt.xlabel('Impact on Match Score', fontsize=12)
    elif model_type == 'price_prediction':
        plt.title('Factors Influencing Price Prediction', fontsize=16)
        plt.xlabel('Impact on Price', fontsize=12)
    
    # Add a vertical line at x=0
    plt.axvline(x=0, color='k', linestyle='-', alpha=0.3)
    
    # Add annotations for each bar
    for i, (feature, importance) in enumerate(zip(features, importances)):
        direction = 'increases' if importance > 0 else 'decreases'
        target = 'risk' if model_type == 'supplier_risk' else 'match score' if model_type == 'rfq_matching' else 'price'
        annotation = f"{direction} {target}"
        
        # Position the text at the end of the bar (with some padding)
        x_pos = importance + (0.01 * np.max(np.abs(importances)) * (1 if importance >= 0 else -1))
        plt.text(x_pos, i, annotation, va='center', ha='left' if importance >= 0 else 'right', fontsize=9)
    
    # Add a legend/explanation
    if model_type == 'supplier_risk':
        plt.figtext(0.5, 0.01, 
                   "Red bars indicate factors that increase risk, while teal bars indicate factors that decrease risk.",
                   ha="center", fontsize=10, bbox={"facecolor":"orange", "alpha":0.1, "pad":5})
    elif model_type == 'rfq_matching':
        plt.figtext(0.5, 0.01, 
                   "Teal bars indicate factors that improve the match, while red bars indicate factors that worsen the match.",
                   ha="center", fontsize=10, bbox={"facecolor":"orange", "alpha":0.1, "pad":5})
    elif model_type == 'price_prediction':
        plt.figtext(0.5, 0.01, 
                   "Teal bars indicate factors that increase the price, while red bars indicate factors that decrease the price.",
                   ha="center", fontsize=10, bbox={"facecolor":"orange", "alpha":0.1, "pad":5})
    
    plt.tight_layout(rect=[0, 0.05, 1, 0.95])
    
    # Save the figure
    plt.savefig(output_path, format=format, dpi=300 if format == 'png' else None, bbox_inches='tight')
    plt.close()
    
    return output_path

def generate_price_waterfall_chart(data, output_path, format='svg'):
    """
    Generate a waterfall chart showing how different factors affect the final price.
    
    Args:
        data: Dictionary with feature importances and base price
        output_path: Path to save the visualization
        format: Output format (svg or png)
    """
    # Extract base price and feature impacts
    base_price = data.get('base_price', 100)
    features = []
    impacts = []
    
    for item in data['feature_importances']:
        # Skip the base price feature itself
        if item['feature'].lower() == 'base price':
            continue
        
        features.append(item['feature'])
        impacts.append(item['importance'])
    
    # Convert to numpy arrays
    features = np.array(features)
    impacts = np.array(impacts)
    
    # Sort by absolute impact
    indices = np.argsort(np.abs(impacts))[::-1]  # Descending order
    features = features[indices]
    impacts = impacts[indices]
    
    # Calculate cumulative sum for waterfall chart
    cumulative = np.zeros(len(impacts) + 2)
    cumulative[0] = base_price
    cumulative[1:-1] = impacts
    cumulative[-1] = 0  # Final price (placeholder)
    
    # Calculate positions for the bars
    positions = np.zeros(len(cumulative))
    for i in range(1, len(cumulative)):
        positions[i] = positions[i-1] + cumulative[i-1]
    
    # Calculate the final price
    final_price = base_price + np.sum(impacts)
    
    # Create labels for the chart
    labels = ['Base Price'] + list(features) + ['Final Price']
    
    # Create a figure
    plt.figure(figsize=(12, 8))
    
    # Plot the bars
    # Base price bar
    plt.bar(0, cumulative[0], bottom=0, color='#3498db', width=0.5, alpha=0.7, label='Base Price')
    
    # Feature impact bars
    for i in range(1, len(cumulative) - 1):
        plt.bar(i, cumulative[i], bottom=positions[i], 
                color='#2ecc71' if cumulative[i] > 0 else '#e74c3c', 
                width=0.5, alpha=0.7,
                label='Increase' if i == 1 and cumulative[i] > 0 else 'Decrease' if i == 1 and cumulative[i] < 0 else '')
    
    # Final price bar
    plt.bar(len(cumulative) - 1, final_price, bottom=0, color='#f39c12', width=0.5, alpha=0.7, label='Final Price')
    
    # Add connecting lines
    for i in range(len(positions) - 1):
        if i == len(positions) - 2:  # Connect to final price
            plt.plot([i, i+1], [positions[i] + cumulative[i], 0], 'k--', alpha=0.3)
            plt.plot([i+1, i+1], [0, final_price], 'k--', alpha=0.3)
        else:
            plt.plot([i, i+1], [positions[i] + cumulative[i], positions[i+1]], 'k--', alpha=0.3)
    
    # Add price annotations
    plt.text(0, positions[0] + cumulative[0] / 2, f"${base_price:.2f}", ha='center', va='center', fontweight='bold')
    plt.text(len(cumulative) - 1, final_price / 2, f"${final_price:.2f}", ha='center', va='center', fontweight='bold')
    
    for i in range(1, len(cumulative) - 1):
        sign = '+' if cumulative[i] > 0 else ''
        plt.text(i, positions[i] + cumulative[i] / 2, f"{sign}${cumulative[i]:.2f}", ha='center', va='center')
    
    # Set x-axis ticks and labels
    plt.xticks(range(len(labels)), labels, rotation=45, ha='right')
    
    # Add title and labels
    plt.title('Price Breakdown: From Base Price to Final Price', fontsize=16)
    plt.ylabel('Price ($)', fontsize=12)
    
    # Add a legend
    plt.legend(loc='upper left')
    
    # Add a summary text
    summary_text = f"Starting with a base price of ${base_price:.2f}, various factors adjust the price "
    if np.sum(impacts) > 0:
        summary_text += f"upward by ${np.sum(impacts):.2f} "
    else:
        summary_text += f"downward by ${abs(np.sum(impacts)):.2f} "
    summary_text += f"to reach a final price of ${final_price:.2f}."
    
    plt.figtext(0.5, 0.01, summary_text, ha="center", fontsize=10, 
               bbox={"facecolor":"orange", "alpha":0.1, "pad":5})
    
    plt.tight_layout(rect=[0, 0.05, 1, 0.95])
    
    # Save the figure
    plt.savefig(output_path, format=format, dpi=300 if format == 'png' else None, bbox_inches='tight')
    plt.close()
    
    return output_path

def generate_risk_heatmap(data, output_path, format='svg'):
    """
    Generate a heatmap visualization for supplier risk factors.
    
    Args:
        data: Dictionary with feature importances and risk scores
        output_path: Path to save the visualization
        format: Output format (svg or png)
    """
    # Extract risk score and feature values
    risk_score = data.get('risk_score', 50)
    risk_category = data.get('risk_category', 'Medium')
    
    # Sort features by importance
    feature_data = sorted(data['feature_importances'], key=lambda x: abs(x['importance']), reverse=True)
    
    # Take top 8 features for cleaner visualization
    feature_data = feature_data[:8]
    
    # Extract feature names and values
    features = [item['feature'] for item in feature_data]
    importances = [item['importance'] for item in feature_data]
    
    # Create a figure
    plt.figure(figsize=(12, 8))
    
    # Plot the heatmap
    # Normalize importances to 0-1 range for color mapping
    norm_importances = np.array(importances)
    max_abs = max(abs(min(norm_importances)), abs(max(norm_importances)))
    norm_importances = norm_importances / max_abs / 2 + 0.5  # Shift to 0-1 range
    
    # Create a colormap (red for high risk, green for low risk)
    cmap = LinearSegmentedColormap.from_list("risk_cmap", ["#2ecc71", "#f1c40f", "#e74c3c"])
    
    # Plot horizontal color bars for each feature
    for i, (feature, importance, norm_imp) in enumerate(zip(features, importances, norm_importances)):
        plt.barh(i, 1, color=cmap(norm_imp), height=0.7, alpha=0.7)
        
        # Add feature name and impact
        direction = "increases" if importance > 0 else "decreases"
        plt.text(0.5, i, f"{feature} ({direction} risk)", ha='center', va='center', fontweight='bold')
    
    # Remove axes ticks and spines
    plt.xticks([])
    plt.yticks([])
    for spine in plt.gca().spines.values():
        spine.set_visible(False)
    
    # Add title and risk indicator
    plt.title('Supplier Risk Assessment', fontsize=18)
    
    # Add risk gauge at the bottom
    gauge_ax = plt.axes([0.1, 0.1, 0.8, 0.1], frameon=False)
    gauge_ax.set_xlim(0, 100)
    gauge_ax.set_ylim(0, 1)
    gauge_ax.add_patch(plt.Rectangle((0, 0), 33, 1, color='#2ecc71', alpha=0.7))
    gauge_ax.add_patch(plt.Rectangle((33, 0), 33, 1, color='#f1c40f', alpha=0.7))
    gauge_ax.add_patch(plt.Rectangle((66, 0), 34, 1, color='#e74c3c', alpha=0.7))
    
    # Add risk score marker
    gauge_ax.add_patch(plt.Rectangle((risk_score, 0), 2, 1, color='black'))
    gauge_ax.text(risk_score, 1.1, f"Risk Score: {risk_score}", ha='center', va='bottom', fontweight='bold')
    
    # Add category labels
    gauge_ax.text(16.5, 0.5, "Low Risk", ha='center', va='center', fontweight='bold')
    gauge_ax.text(49.5, 0.5, "Medium Risk", ha='center', va='center', fontweight='bold')
    gauge_ax.text(83, 0.5, "High Risk", ha='center', va='center', fontweight='bold')
    
    gauge_ax.set_xticks([])
    gauge_ax.set_yticks([])
    
    # Add risk category text
    plt.figtext(0.5, 0.01, f"Overall Risk Assessment: {risk_category} Risk", ha="center", fontsize=14, 
               fontweight='bold', bbox={"facecolor":"#f8f9fa", "boxstyle":"round,pad=0.5"})
    
    plt.tight_layout(rect=[0, 0.05, 1, 0.95])
    
    # Save the figure
    plt.savefig(output_path, format=format, dpi=300 if format == 'png' else None, bbox_inches='tight')
    plt.close()
    
    return output_path

def generate_matching_radar_chart(data, output_path, format='svg'):
    """
    Generate a radar chart showing RFQ-supplier matching factors.
    
    Args:
        data: Dictionary with feature importances and match score
        output_path: Path to save the visualization
        format: Output format (svg or png)
    """
    # Extract match score and feature values
    match_score = data.get('match_score', 70)
    match_quality = data.get('match_quality', 'Good')
    
    # Sort features by importance
    feature_data = sorted(data['feature_importances'], key=lambda x: abs(x['importance']), reverse=True)
    
    # Take top features for radar chart (even number works best)
    feature_data = feature_data[:8]  # Use 8 features for balanced radar
    
    # Extract feature names and normalize values to 0-1 for radar chart
    features = [item['feature'] for item in feature_data]
    importances = np.array([item['importance'] for item in feature_data])
    
    # Normalize to 0-1 range
    max_abs = max(abs(min(importances)), abs(max(importances)))
    norm_values = importances / max_abs
    
    # We need to make all values positive for radar chart and scale them to 0.2-1
    # Values > 0 (positive impact) will be in 0.6-1 range
    # Values < 0 (negative impact) will be in 0.2-0.6 range
    radar_values = np.clip(norm_values * 0.4 + 0.6, 0.2, 1.0)
    
    # Create a figure
    plt.figure(figsize=(10, 10), facecolor='white')
    
    # Create radar chart
    # Number of features
    N = len(features)
    
    # Angle of each axis
    angles = np.linspace(0, 2*np.pi, N, endpoint=False).tolist()
    
    # Close the polygon
    radar_values = np.append(radar_values, radar_values[0])
    angles.append(angles[0])
    features.append(features[0])
    
    # Plot radar
    ax = plt.subplot(111, polar=True)
    ax.plot(angles, radar_values, linewidth=2, linestyle='solid', color='#3498db')
    ax.fill(angles, radar_values, color='#3498db', alpha=0.25)
    
    # Add feature labels
    ax.set_xticks(angles[:-1])
    ax.set_xticklabels(features[:-1], fontsize=10)
    
    # Set y-axis limits
    ax.set_ylim(0, 1)
    ax.set_yticks([])  # Hide y-axis labels
    
    # Add concentric circles for reference
    for r in [0.2, 0.4, 0.6, 0.8, 1.0]:
        ax.plot(np.linspace(0, 2*np.pi, 100), [r] * 100, color='gray', alpha=0.3)
    
    # Add labels to indicate positive/negative regions
    plt.figtext(0.1, 0.02, "Factors in outer region (0.6-1.0) have positive impact", fontsize=10, 
               color='#2ecc71', bbox={"facecolor":"white", "boxstyle":"round,pad=0.3"})
    plt.figtext(0.1, 0.06, "Factors in inner region (0.2-0.6) have negative impact", fontsize=10, 
               color='#e74c3c', bbox={"facecolor":"white", "boxstyle":"round,pad=0.3"})
    
    # Add title and match score
    title = f"RFQ-Supplier Match Analysis: {match_quality} Match ({match_score:.1f}%)"
    plt.title(title, fontsize=16, pad=20)
    
    # Add match gauge
    gauge_ax = plt.axes([0.25, 0.02, 0.5, 0.05], frameon=False)
    gauge_ax.set_xlim(0, 100)
    gauge_ax.set_ylim(0, 1)
    
    # Create gradient background for gauge
    for i in range(100):
        # Color gradient from red to yellow to green
        if i < 40:
            r, g, b = 231/255, 76/255, 60/255  # Red
        elif i < 70:
            r = 231/255 - (i-40) * (231-241)/(70-40)/255
            g = 76/255 + (i-40) * (196-76)/(70-40)/255
            b = 60/255 - (i-40) * (60-15)/(70-40)/255  # Yellow
        else:
            r = 241/255 - (i-70) * (241-46)/(100-70)/255
            g = 196/255 + (i-70) * (204-196)/(100-70)/255
            b = 15/255 + (i-70) * (128-15)/(100-70)/255  # Green
        
        gauge_ax.add_patch(plt.Rectangle((i, 0), 1, 1, color=(r, g, b), alpha=0.7))
    
    # Add match score marker
    gauge_ax.add_patch(plt.Rectangle((match_score, 0), 2, 1, color='black'))
    gauge_ax.text(match_score, 1.2, f"{match_score:.1f}%", ha='center', va='bottom', fontweight='bold')
    
    # Add category labels
    gauge_ax.text(20, 0.5, "Poor", ha='center', va='center', fontsize=8, color='white', fontweight='bold')
    gauge_ax.text(55, 0.5, "Average", ha='center', va='center', fontsize=8, color='black', fontweight='bold')
    gauge_ax.text(85, 0.5, "Excellent", ha='center', va='center', fontsize=8, color='white', fontweight='bold')
    
    gauge_ax.set_xticks([])
    gauge_ax.set_yticks([])
    
    plt.tight_layout(rect=[0, 0.08, 1, 0.95])
    
    # Save the figure
    plt.savefig(output_path, format=format, dpi=300 if format == 'png' else None, bbox_inches='tight')
    plt.close()
    
    return output_path

def parse_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description='Model Explanation Visualization Generator')
    parser.add_argument('--model', required=True, help='Model type: supplier_risk, rfq_matching, or price_prediction')
    parser.add_argument('--data', required=True, help='JSON data for visualization')
    parser.add_argument('--output', required=True, help='Output file path')
    parser.add_argument('--format', default='svg', help='Output format: svg or png')
    return parser.parse_args()

def main():
    """Main function to generate visualizations."""
    args = parse_args()
    
    try:
        # Parse input data
        data = json.loads(args.data)
        
        # Ensure output directory exists
        os.makedirs(os.path.dirname(args.output), exist_ok=True)
        
        # Generate the appropriate visualization based on model type
        if args.model == 'supplier_risk':
            if 'risk_score' in data:
                output_path = generate_risk_heatmap(data, args.output, args.format)
            else:
                output_path = generate_feature_importance_chart(data, args.output, args.model, args.format)
        elif args.model == 'rfq_matching':
            if 'match_score' in data:
                output_path = generate_matching_radar_chart(data, args.output, args.format)
            else:
                output_path = generate_feature_importance_chart(data, args.output, args.model, args.format)
        elif args.model == 'price_prediction':
            if 'base_price' in data:
                output_path = generate_price_waterfall_chart(data, args.output, args.format)
            else:
                output_path = generate_feature_importance_chart(data, args.output, args.model, args.format)
        else:
            print(f"Unsupported model type: {args.model}", file=sys.stderr)
            return 1
        
        print(f"Visualization saved to {output_path}")
        return 0
    except Exception as e:
        print(f"Error generating visualization: {e}", file=sys.stderr)
        return 1

if __name__ == "__main__":
    sys.exit(main())