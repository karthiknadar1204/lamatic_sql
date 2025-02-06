'use client'

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const LineChart = ({ data, width = 600, height = 400, margin = { top: 20, right: 30, bottom: 30, left: 40 } }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data || !data.length) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Calculate inner dimensions
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Process data to flatten it for scales
    const allPoints = data.flatMap(series => series.data);

    // Parse dates and handle different formats
    const parseDate = (dateStr) => {
      if (!dateStr) return null;
      // Handle month names
      if (['January', 'February', 'March', 'April', 'May', 'June', 'July', 
           'August', 'September', 'October', 'November', 'December'].includes(dateStr)) {
        return new Date(2024, ['January', 'February', 'March', 'April', 'May', 'June', 'July', 
                              'August', 'September', 'October', 'November', 'December'].indexOf(dateStr));
      }
      // Try parsing as ISO date
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? null : date;
    };

    // Create scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(allPoints, d => parseDate(d.x)))
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(allPoints, d => d.y)])
      .range([innerHeight, 0]);

    // Create container group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .attr('class', 'x-axis');

    g.append('g')
      .call(d3.axisLeft(yScale))
      .attr('class', 'y-axis');

    // Create line generator
    const line = d3.line()
      .x(d => xScale(parseDate(d.x)))
      .y(d => yScale(d.y))
      .defined(d => parseDate(d.x) !== null && !isNaN(d.y))
      .curve(d3.curveMonotoneX);

    // Add lines and points for each series
    data.forEach((series, i) => {
      const validData = series.data.filter(d => parseDate(d.x) !== null && !isNaN(d.y));
      
      // Add the line path if there are multiple points
      if (validData.length > 1) {
        g.append('path')
          .datum(validData)
          .attr('fill', 'none')
          .attr('stroke', series.borderColor || `var(--chart-${i + 1})`)
          .attr('stroke-width', 2)
          .attr('d', line);
      }

      // Always add dots for data points
      g.selectAll(`.dot-series-${i}`)
        .data(validData)
        .enter()
        .append('circle')
        .attr('class', `dot dot-series-${i}`)
        .attr('cx', d => xScale(parseDate(d.x)))
        .attr('cy', d => yScale(d.y))
        .attr('r', 6) // Made dots slightly larger for better visibility
        .attr('fill', series.borderColor || `var(--chart-${i + 1})`)
        .attr('stroke', '#fff')
        .attr('stroke-width', 1.5);
    });

    // Add legend
    const legend = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${width - margin.right - 100}, ${margin.top})`);

    data.forEach((series, i) => {
      const legendItem = legend.append('g')
        .attr('transform', `translate(0, ${i * 20})`);

      legendItem.append('rect')
        .attr('width', 10)
        .attr('height', 10)
        .attr('fill', series.borderColor || `var(--chart-${i + 1})`);

      legendItem.append('text')
        .attr('x', 15)
        .attr('y', 9)
        .text(series.label)
        .style('font-size', '12px');
    });

    // Add tooltip first
    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);

    // Add hover effects for dots
    g.selectAll('.dot')
      .on('mouseover', function(event, d) {
        const date = parseDate(d.x);
        const formattedDate = date ? date.toLocaleDateString() : d.x;
        
        d3.select(this)
          .attr('r', 6)
          .attr('opacity', 1);

        tooltip.transition()
          .duration(200)
          .style('opacity', .9);
        
        tooltip.html(`
          <strong>${formattedDate}</strong><br/>
          Value: ${d.y}
        `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('r', 4)
          .attr('opacity', 0.7);
        
        tooltip.transition()
          .duration(500)
          .style('opacity', 0);
      });

    // Add hover effects for lines
    const mouseG = g.append('g')
      .attr('class', 'mouse-over-effects');

    mouseG.append('path')
      .attr('class', 'mouse-line')
      .style('stroke', 'var(--muted-foreground)')
      .style('stroke-width', '1px')
      .style('opacity', '0');

    const mousePerLine = mouseG.selectAll('.mouse-per-line')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'mouse-per-line');

    mousePerLine.append('circle')
      .attr('r', 4)
      .style('stroke', (d, i) => d.borderColor || `var(--chart-${i + 1})`)
      .style('fill', 'none')
      .style('stroke-width', '2px')
      .style('opacity', '0');

    mouseG.append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('mouseout', () => {
        d3.select('.mouse-line').style('opacity', '0');
        d3.selectAll('.mouse-per-line circle').style('opacity', '0');
        tooltip.transition().duration(500).style('opacity', 0);
      })
      .on('mouseover', () => {
        d3.select('.mouse-line').style('opacity', '1');
        d3.selectAll('.mouse-per-line circle').style('opacity', '1');
      })
      .on('mousemove', function(event) {
        const mouse = d3.pointer(event);
        d3.select('.mouse-line')
          .attr('d', `M${mouse[0]},${innerHeight} ${mouse[0]},0`);

        const x0 = xScale.invert(mouse[0]);
        const bisect = d3.bisector(d => parseDate(d.x)).left;

        const lines = d3.selectAll('.mouse-per-line');
        lines.attr('transform', function(d, i) {
          const xDate = x0;
          const idx = bisect(d.data, xDate);
          const d0 = d.data[idx - 1];
          const d1 = d.data[idx];
          
          if (!d0 || !d1) return '';
          
          const point = xDate - parseDate(d0.x) > parseDate(d1.x) - xDate ? d1 : d0;
          const x = xScale(parseDate(point.x));
          const y = yScale(point.y);
          
          tooltip.transition()
            .duration(200)
            .style('opacity', .9);
          
          tooltip.html(`
            <strong>${d.label}</strong><br/>
            Date: ${new Date(point.x).toLocaleDateString()}<br/>
            Value: ${point.y}
          `)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 28) + 'px');

          return `translate(${x},${y})`;
        });
      });

  }, [data, width, height, margin]);

  return (
    <div className="relative">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default LineChart; 