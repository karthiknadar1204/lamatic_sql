'use client'

import PieChart from '../charts/PieChart';
import LineChart from '../charts/LineChart';
import BarChart from '../charts/BarChart';
import ScatterPlot from '../charts/ScatterPlot';

export const VisualizationMessage = ({ response }) => {
  const content = response.data?.data?.content || response.data?.content || response.content;
  const visualizations = response.data?.data?.visualization || response.data?.visualization || response.visualization;

  if (!content || !visualizations) {
    return null;
  }

  const renderChart = (visualization) => {
    if (!visualization?.chartType) return null;

    switch (visualization.chartType.toLowerCase()) {
      case 'bar':
        return <BarChart data={visualization.data} />;
      case 'pie':
        return <PieChart data={visualization.data} />;
      case 'line':
        return <LineChart data={visualization.data} />;
      case 'scatter':
        return <ScatterPlot data={visualization.data} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="prose dark:prose-invert">
        <h3>{content.summary}</h3>
        <ul>
          {content.details.map((detail, i) => (
            <li key={i}>{detail}</li>
          ))}
        </ul>
      </div>
      {Array.isArray(visualizations) ? (
        visualizations.map((viz, index) => (
          <div key={index} className="mt-4 bg-white p-4 rounded-lg shadow-sm">
            {renderChart(viz)}
          </div>
        ))
      ) : (
        <div className="mt-4 bg-white p-4 rounded-lg shadow-sm">
          {renderChart(visualizations)}
        </div>
      )}
    </div>
  );
};

export default VisualizationMessage; 