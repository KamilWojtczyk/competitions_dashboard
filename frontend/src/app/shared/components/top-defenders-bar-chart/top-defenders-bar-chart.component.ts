import {
  Component,
  OnChanges,
  ElementRef,
  ViewChild,
  input,
} from '@angular/core';
import * as d3 from 'd3';
import { PlayerDefensiveStats } from '../../../features/competitions/models/player.model';

@Component({
  selector: 'app-top-defenders-bar-chart',
  standalone: true,
  template: `<div #barChartContainer class="bar-chart-container"></div>`,
  styleUrls: ['./top-defenders-bar-chart.component.scss'],
})
export class TopDefendersBarChartComponent implements OnChanges {
  topDefenders = input.required<PlayerDefensiveStats[]>();

  @ViewChild('barChartContainer', { static: true })
  containerRef!: ElementRef;

  width = 700;
  height = 400;

  constructor() {}

  ngOnChanges(): void {
    if (this.topDefenders().length > 0) {
      this.createBarChart();
    }
  }

  createBarChart(): void {
    const data = this.topDefenders();

    // Clear existing chart
    d3.select(this.containerRef.nativeElement).selectAll('*').remove();

    const margin = { top: 40, right: 20, bottom: 70, left: 150 }; // Increased left margin
    const chartWidth = this.width - margin.left - margin.right;
    const chartHeight = this.height - margin.top - margin.bottom;

    const xScale = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(
          data,
          (d) =>
            d.tackles +
            d.interceptions +
            d.fouls +
            d.ballRecoveries +
            d.clearances
        )!,
      ])
      .nice()
      .range([0, chartWidth]);

    const yScale = d3
      .scaleBand()
      .domain(data.map((d) => d.playerName))
      .range([0, chartHeight])
      .padding(0.2);

    const svg = d3
      .select(this.containerRef.nativeElement)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height);

    const chart = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Stacked bar data
    const stack = d3
      .stack<PlayerDefensiveStats>()
      .keys([
        'tackles',
        'interceptions',
        'fouls',
        'ballRecoveries',
        'clearances',
      ]);

    const stackedData = stack(data);

    const colorScale = d3
      .scaleOrdinal<string>()
      .domain([
        'tackles',
        'interceptions',
        'fouls',
        'ballRecoveries',
        'clearances',
      ])
      .range(['#1b9e77', '#d95f02', '#7570b3', '#e7298a', '#66a61e']); // Adjust colors as needed

    // Tooltip
    const tooltip = d3
      .select(this.containerRef.nativeElement)
      .append('div')
      .attr('class', 'tooltip');

    // Add Y axis
    chart.append('g').call(d3.axisLeft(yScale));

    // Add X axis
    chart
      .append('g')
      .attr('transform', `translate(0, ${chartHeight})`)
      .call(d3.axisBottom(xScale));

    // Add bars
    chart
      .selectAll('.serie')
      .data(stackedData)
      .enter()
      .append('g')
      .attr('class', 'serie')
      .attr('fill', (d) => colorScale(d.key))
      .selectAll('rect')
      .data((d) => d)
      .enter()
      .append('rect')
      .attr('y', (d) => yScale(d.data.playerName)!)
      .attr('x', (d) => xScale(d[0]))
      .attr('width', (d) => xScale(d[1]) - xScale(d[0]))
      .attr('height', yScale.bandwidth())
      .on('mouseover', function (event: MouseEvent, d: any) {
        const layerData = stackedData.find((layer) => layer.includes(d));
        const actionType = layerData?.key ?? '';
        const value = d[1] - d[0];

        tooltip.transition().duration(200).style('opacity', 1);
        tooltip.html(`
            <strong>Player:</strong> ${d.data.playerName}<br/>
            <strong>Action:</strong> ${actionType}<br/>
            <strong>Count:</strong> ${value}
          `);

        tooltip
          .style('left', event.pageX + 10 + 'px')
          .style('top', event.pageY - 28 + 'px');
      })
      .on('mouseout', () => {
        tooltip.transition().duration(500).style('opacity', 0);
      });

    // Adjust Y-axis labels to prevent cutting off
    chart.selectAll('.tick text').call(wrapText, margin.left - 10);

    function wrapText(textSelection: any, width: number) {
      textSelection.each(function () {
        const text = d3.select(this);
        const words = text.text().split(/\s+/).reverse();
        let word;
        let line: string[] = [];
        let lineNumber = 0;
        const lineHeight = 1.1; // ems
        const y = text.attr('y');
        const dy = parseFloat(text.attr('dy'));

        let tspan = text
          .text(null)
          .append('tspan')
          .attr('x', -10)
          .attr('y', y)
          .attr('dy', dy + 'em');

        while ((word = words.pop())) {
          line.push(word);
          tspan.text(line.join(' '));
          if (
            (tspan.node() as SVGTextContentElement).getComputedTextLength() >
            width
          ) {
            line.pop();
            tspan.text(line.join(' '));
            line = [word];
            tspan = text
              .append('tspan')
              .attr('x', -10)
              .attr('y', y)
              .attr('dy', ++lineNumber * lineHeight + dy + 'em')
              .text(word);
          }
        }
      });
    }

    // Add legend
    const legend = svg
      .selectAll('.legend')
      .data([
        'Tackles',
        'Interceptions',
        'Fouls',
        'Ball Recoveries',
        'Clearances',
      ])
      .enter()
      .append('g')
      .attr('class', 'legend')
      .attr(
        'transform',
        (_, i) =>
          `translate(${this.width - 150}, ${
            this.height - margin.bottom - i * 20 - 20
          })`
      );

    legend
      .append('rect')
      .attr('x', 0)
      .attr('width', 18)
      .attr('height', 18)
      .attr('fill', (d) => colorScale(d.replace(' ', '')));

    legend
      .append('text')
      .attr('x', 25)
      .attr('y', 9)
      .attr('dy', '.35em')
      .style('fill', 'white')
      .style('font-weight', 'bold')
      .text((d) => d);
  }
}
