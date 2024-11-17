import {
  Component,
  OnChanges,
  ElementRef,
  ViewChild,
  input,
} from '@angular/core';
import * as d3 from 'd3';
import { PlayerPassStats } from '../../../features/competitions/models/player.model';

@Component({
  selector: 'app-top-passers-bar-chart',
  standalone: true,
  template: `<div #barChartContainer class="bar-chart-container"></div>`,
  styleUrls: ['./top-passers-bar-chart.component.scss'],
})
export class TopPassersBarChartComponent implements OnChanges {
  topPassers = input.required<PlayerPassStats[]>();

  @ViewChild('barChartContainer', { static: true })
  containerRef!: ElementRef;

  width = 700;
  height = 400;

  constructor() {}

  ngOnChanges(): void {
    if (this.topPassers().length > 0) {
      this.createBarChart();
    }
  }

  createBarChart(): void {
    const data = this.topPassers();

    d3.select(this.containerRef.nativeElement).selectAll('*').remove();

    const margin = { top: 40, right: 20, bottom: 70, left: 150 };
    const chartWidth = this.width - margin.left - margin.right;
    const chartHeight = this.height - margin.top - margin.bottom;

    const xScale = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(
          data,
          (d) => d.keyPasses + d.progressivePasses + d.successfulPasses
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

    const stack = d3
      .stack<PlayerPassStats>()
      .keys(['successfulPasses', 'progressivePasses', 'keyPasses']);

    const stackedData = stack(data);

    const colorScale = d3
      .scaleOrdinal<string>()
      .domain(['successfulPasses', 'progressivePasses', 'keyPasses'])
      .range([
        d3.interpolateOranges(0.5),
        d3.interpolateOranges(0.7),
        d3.interpolateOranges(0.9),
      ]);

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
        const passType = layerData?.key ?? '';
        const value = d[1] - d[0];

        tooltip.transition().duration(200).style('opacity', 1);
        tooltip.html(`
            <strong>Player:</strong> ${d.data.playerName}<br/>
            <strong>Type:</strong> ${passType}<br/>
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
        const lineHeight = 1.1;
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
      .data(['Successful Passes', 'Progressive Passes', 'Key Passes'])
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
      .attr('fill', (d) => colorScale(d.replace(' ', '').replace(' ', '')));

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
