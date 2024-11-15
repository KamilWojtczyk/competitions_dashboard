import {
  Component,
  OnChanges,
  SimpleChanges,
  ElementRef,
  ViewChild,
  AfterViewInit,
  input,
} from '@angular/core';
import * as d3 from 'd3';
import { Events } from '../../../features/competitions/models/events.model';

interface PassData {
  angleBucket: number;
  lengthBucket: string;
  count: number;
}

@Component({
  selector: 'app-pass-direction-length-distribution',
  template: `<div #chartContainer class="chart-container"></div>`,
  styleUrls: ['./pass-direction-length-distribution.component.scss'],
  standalone: true,
})
export class PassDirectionLengthDistributionComponent
  implements AfterViewInit, OnChanges
{
  events = input.required<Events[]>();
  teamName = input.required<string>();

  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;

  private margin = { top: 20, right: 20, bottom: 100, left: 50 };
  private width = 600 - this.margin.left - this.margin.right;
  private height = 400 - this.margin.top - this.margin.bottom;

  private angleBuckets = 12;
  private lengthCategories = [
    { name: '<5m', min: 0, max: 5 },
    { name: '5-15m', min: 5, max: 15 },
    { name: '15-30m', min: 15, max: 30 },
    { name: '>30m', min: 30, max: Infinity },
  ];

  constructor() {}

  ngAfterViewInit(): void {
    if (this.events().length > 0) {
      this.createChart();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['events'] && !changes['events'].firstChange) {
      this.createChart();
    }
  }

  private createChart(): void {
    d3.select(this.chartContainer.nativeElement).selectAll('svg').remove();
    d3.select(this.chartContainer.nativeElement).selectAll('.tooltip').remove();

    const passData = this.prepareData();

    if (!passData.length) {
      return;
    }

    // Initialize SVG
    const svg = d3
      .select(this.chartContainer.nativeElement)
      .append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .style('background-color', '#232b2b')
      .append('g')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

    const tooltip = d3
      .select(this.chartContainer.nativeElement)
      .append('div')
      .attr('class', 'tooltip');

    const angleLabels = Array.from({ length: this.angleBuckets }, (_, i) => {
      const angleStart = (360 / this.angleBuckets) * i;
      const angleEnd = angleStart + 360 / this.angleBuckets;
      return `${angleStart}° - ${angleEnd}°`;
    });

    const aggregatedData: Record<string, any> = {};
    passData.forEach((pd) => {
      const key = `${pd.angleBucket}`;
      if (!aggregatedData[key]) {
        aggregatedData[key] = { angleBucket: pd.angleBucket };
      }
      aggregatedData[key][pd.lengthBucket] = pd.count;
    });

    const dataForStack: any[] = Object.values(aggregatedData).map((d: any) => {
      this.lengthCategories.forEach((lc) => {
        if (!d[lc.name]) {
          d[lc.name] = 0;
        }
      });
      return d;
    });

    const keys = this.lengthCategories.map((lc) => lc.name);

    const stackGenerator = d3.stack().keys(keys);
    const stackedData = stackGenerator(dataForStack);

    const xScale = d3
      .scaleBand()
      .domain(dataForStack.map((d: any) => angleLabels[d.angleBucket]))
      .range([0, this.width])
      .padding(0.1);

    const maxStackValue = d3.max(stackedData, (layer) =>
      d3.max(layer, (sequence) => sequence[1])
    ) as number;

    const yScale = d3
      .scaleLinear()
      .domain([0, maxStackValue])
      .range([this.height, 0])
      .nice();

    const colorScale = d3
      .scaleOrdinal<string>()
      .domain(keys)
      .range([
        d3.interpolateOranges(0.9),
        d3.interpolateOranges(0.7),
        d3.interpolateOranges(0.5),
        d3.interpolateOranges(0.3),
      ]);

    svg
      .selectAll('.layer')
      .data(stackedData)
      .enter()
      .append('g')
      .attr('class', 'layer')
      .attr('fill', (d: any) => {
        const lengthCategoryIndex = keys.indexOf(d.key);
        return colorScale(d.key) as string;
      })
      .selectAll('rect')
      .data((d) => d)
      .enter()
      .append('rect')
      .attr('x', (d: any) => xScale(angleLabels[d.data.angleBucket])!)
      .attr('y', (d: any) => yScale(d[1])!)
      .attr('height', (d: any) => yScale(d[0])! - yScale(d[1])!)
      .attr('width', xScale.bandwidth())
      .on('mouseover', function (event: MouseEvent, d: any) {
        const layerData = stackedData.find((layer) => layer.includes(d));
        const lengthCategory = layerData?.key ?? '';
        const value = d[1] - d[0];

        tooltip.transition().duration(200).style('opacity', 1);
        tooltip.html(`
            <strong>Direction:</strong> ${angleLabels[d.data.angleBucket]}<br/>
            <strong>Length:</strong> ${lengthCategory}<br/>
            <strong>Count:</strong> ${value}
          `);

        tooltip
          .style('left', event.pageX + 10 + 'px')
          .style('top', event.pageY - 28 + 'px');
      })
      .on('mouseout', () => {
        tooltip.transition().duration(500).style('opacity', 0);
      });

    const xAxis = svg
      .append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${this.height})`)
      .call(d3.axisBottom(xScale).tickSizeOuter(0));

    xAxis
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dy', '0.35em')
      .attr('dx', '-0.5em')
      .attr('transform', 'rotate(-45)');
    svg.append('g').attr('class', 'y-axis').call(d3.axisLeft(yScale));

    svg
      .append('text')
      .attr(
        'transform',
        `translate(${this.width / 2}, ${this.height + this.margin.bottom - 10})`
      )
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .attr('fill', 'white')
      .text('Pass Direction (Angle Ranges)');

    svg
      .append('text')
      .attr(
        'transform',
        `translate(${-this.margin.left + 20}, ${this.height / 2})rotate(-90)`
      )
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .attr('fill', 'white')
      .text('Count of Passes');

    svg.selectAll('.x-axis text').attr('dy', '1em');

    const legend = svg
      .selectAll('.legend')
      .data(this.lengthCategories)
      .enter()
      .append('g')
      .attr('class', 'legend')
      .attr(
        'transform',
        (_, i) => `translate(${this.width - 70}, ${this.margin.top + i * 20})`
      );

    legend
      .append('rect')
      .attr('x', 10)
      .attr('y', -40)
      .attr('width', 15)
      .attr('height', 15)
      .attr('fill', (d) => colorScale(d.name) as string)
      .attr('stroke', '#000');

    legend
      .append('text')
      .attr('x', 30)
      .attr('y', -28)
      .text((d) => d.name)
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .attr('fill', 'white');
  }

  private prepareData(): PassData[] {
    const passes = this.events().filter(
      (event) =>
        event.type === 'Pass' &&
        event.team.trim().toLowerCase() ===
          this.teamName().trim().toLowerCase() &&
        !event.pass_outcome
    );

    const passData: PassData[] = [];

    passes.forEach((pass) => {
      const angleInDegrees = (pass.pass_angle * 180) / Math.PI;
      let normalizedAngle = angleInDegrees % 360;
      if (normalizedAngle < 0) normalizedAngle += 360;
      const angleBucket = Math.floor(
        (normalizedAngle / 360) * this.angleBuckets
      );

      const length = pass.pass_length;

      const lengthCategory = this.lengthCategories.find(
        (category) => length >= category.min && length < category.max
      );

      if (lengthCategory) {
        const existing = passData.find(
          (d) =>
            d.angleBucket === angleBucket &&
            d.lengthBucket === lengthCategory.name
        );

        if (existing) {
          existing.count++;
        } else {
          passData.push({
            angleBucket,
            lengthBucket: lengthCategory.name,
            count: 1,
          });
        }
      }
    });

    return passData;
  }
}
