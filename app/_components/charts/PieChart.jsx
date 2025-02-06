'use client'

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const PieChart = ({ data, width = 600, height = 400 }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data || !data.length) return;

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const radius = Math.min(width, height) / 2;
    const g = svg.append('g')
      .attr('transform', `translate(${width/2},${height/2})`);

    const keys = Object.keys(data[0]);
    const labelKey = keys[0];
    const valueKey = keys[1];

    const formattedData = data.map(d => ({
      label: d[labelKey],
      value: Number(d[valueKey]) || 0
    }));

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const pie = d3.pie()
      .sort(null)
      .value(d => d.value);

    const path = d3.arc()
      .outerRadius(radius - 10)
      .innerRadius(0);

    const label = d3.arc()
      .outerRadius(radius - 40)
      .innerRadius(radius - 40);

    const arcs = g.selectAll('.arc')
      .data(pie(formattedData))
      .enter()
      .append('g')
      .attr('class', 'arc');

    arcs.append('path')
      .attr('d', path)
      .attr('fill', d => color(d.data.label))
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('opacity', 0.7);

        const tooltip = d3.select('body').append('div')
          .attr('class', 'tooltip')
          .style('position', 'absolute')
          .style('background-color', 'white')
          .style('padding', '8px')
          .style('border-radius', '4px')
          .style('box-shadow', '0 2px 4px rgba(0,0,0,0.1)')
          .style('opacity', 0);

        tooltip.transition()
          .duration(200)
          .style('opacity', .9);
        
        const percentage = ((d.endAngle - d.startAngle) / (2 * Math.PI) * 100).toFixed(1);
        tooltip.html(`
          <strong>${d.data.label}</strong><br/>
          ${valueKey}: ${d.data.value}<br/>
          Percentage: ${percentage}%
        `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('opacity', 1);
        
        d3.selectAll('.tooltip').remove();
      });

    arcs.append('text')
      .attr('transform', d => `translate(${label.centroid(d)})`)
      .attr('dy', '0.35em')
      .text(d => `${d.data.label}: ${d.data.value}`)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#333');

    const legend = svg.append('g')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 10)
      .attr('text-anchor', 'start')
      .selectAll('g')
      .data(formattedData)
      .enter().append('g')
      .attr('transform', (d, i) => `translate(${width - 120},${i * 20 + 20})`);

    legend.append('rect')
      .attr('x', 0)
      .attr('width', 15)
      .attr('height', 15)
      .attr('fill', (d) => color(d.label));

    legend.append('text')
      .attr('x', 20)
      .attr('y', 9.5)
      .attr('dy', '0.32em')
      .text(d => {
        const value = d.value.toLocaleString();
        return `${d.label}: ${value}`;
      });

  }, [data, width, height]);

  return (
    <div className="relative">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default PieChart; 