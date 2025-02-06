'use client'

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const BarChart = ({ data, width = 600, height = 400, margin = { top: 20, right: 30, bottom: 60, left: 60 } }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data || !data.length) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Dynamically get the first data point's keys
    const keys = Object.keys(data[0]);
    // First key is typically the category/label, last key is typically the value
    const categoryKey = keys[0];
    const valueKey = keys[1];

    // Format data for visualization
    const formattedData = data.map(d => ({
      label: d[categoryKey],
      value: Number(d[valueKey]) || 0
    }));

    // Create scales
    const xScale = d3.scaleBand()
      .domain(formattedData.map(d => d.label))
      .range([0, innerWidth])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(formattedData, d => d.value) * 1.1])
      .range([innerHeight, 0]);

    // Create container group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add bars
    g.selectAll('.bar')
      .data(formattedData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.label))
      .attr('y', d => yScale(d.value))
      .attr('width', xScale.bandwidth())
      .attr('height', d => innerHeight - yScale(d.value))
      .attr('fill', 'var(--chart-1, #ef4444)');

    // Add tooltips
    const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('background-color', 'white')
      .style('padding', '8px')
      .style('border-radius', '4px')
      .style('box-shadow', '0 2px 4px rgba(0,0,0,0.1)')
      .style('opacity', 0);

    g.selectAll('.bar')
      .on('mouseover', function(event, d) {
        d3.select(this).attr('opacity', 0.8);
        tooltip.transition()
          .duration(200)
          .style('opacity', 0.9);
        tooltip.html(`
          <strong>${d.label}</strong><br/>
          ${valueKey}: ${d.value}
        `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this).attr('opacity', 1);
        tooltip.transition()
          .duration(500)
          .style('opacity', 0);
      });

    // Add axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .attr('dx', '-0.8em')
      .attr('dy', '0.15em');

    g.append('g')
      .call(d3.axisLeft(yScale));

    // Add axis labels
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + margin.bottom - 5)
      .attr('text-anchor', 'middle')
      .text(data.xAxis || categoryKey);

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left + 15)
      .attr('x', -innerHeight / 2)
      .attr('text-anchor', 'middle')
      .text(data.yAxis || valueKey);

  }, [data, width, height, margin]);

  return (
    <div className="relative">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default BarChart; 