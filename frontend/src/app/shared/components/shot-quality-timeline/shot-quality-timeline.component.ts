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

@Component({
  selector: 'app-shot-quality-timeline',
  template: ` <div #xgTimelineContainer class="xg-timeline-container"></div> `,
  styleUrls: ['./shot-quality-timeline.component.scss'],
  standalone: true,
})
export class ShotQualityTimelineComponent implements OnChanges, AfterViewInit {
  events = input.required<Events[]>();
  homeTeamName = input.required<string>();
  awayTeamName = input.required<string>();

  @ViewChild('xgTimelineContainer', { static: true })
  containerRef!: ElementRef;

  private svg: any;
  private tooltip: any;
  private margin = { top: 20, right: 20, bottom: 30, left: 40 };
  private width = 460;
  private height = 280;

  constructor() {}

  ngAfterViewInit() {
    if (this.events().length > 0) {
      this.createChart();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['events'] && !changes['events'].firstChange) {
      this.updateChart();
    }
  }

  private createChart() {
    d3.select(this.containerRef.nativeElement).selectAll('svg').remove();

    this.svg = d3
      .select(this.containerRef.nativeElement)
      .append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    this.tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('pointer-events', 'none');

    this.updateChart();
  }

  private updateChart() {
    if (!this.svg || this.events().length === 0) {
      return;
    }

    const shotEvents = this.events().filter(
      (event) => event.type === 'Shot' && event.period < 5
    );

    if (shotEvents.length === 0) {
      this.svg.selectAll('*').remove();
      return;
    }

    shotEvents.sort((a, b) => {
      const indexA = a.index ?? a.newsecond ?? a.minute * 60;
      const indexB = b.index ?? b.newsecond ?? b.minute * 60;
      return indexA - indexB;
    });

    const homeShots = shotEvents.filter(
      (event) => event.team === this.homeTeamName()
    );
    const awayShots = shotEvents.filter(
      (event) => event.team === this.awayTeamName()
    );

    const homeCumulativeXG: { minute: number; xG: number }[] =
      this.calculateCumulativeXG(homeShots);
    const awayCumulativeXG: { minute: number; xG: number }[] =
      this.calculateCumulativeXG(awayShots);

    const maxMinute = this.getMaxMatchMinute(shotEvents);

    const allCumulativeData = homeCumulativeXG.concat(awayCumulativeXG);
    const maxXG = d3.max(allCumulativeData, (d) => d.xG) || 0;

    const xScale = d3
      .scaleLinear()
      .domain([0, maxMinute])
      .range([0, this.width]);
    const yScale = d3.scaleLinear().domain([0, maxXG]).range([this.height, 0]);

    this.svg.selectAll('*').remove();

    const xTicks = [0, 45, 90];
    if (maxMinute > 90) {
      xTicks.push(120);
    }

    const xAxis = d3
      .axisBottom(xScale)
      .tickValues(xTicks)
      .tickFormat((d) => `${d}'`);

    const yAxis = d3.axisLeft(yScale).ticks(5);

    this.svg
      .append('g')
      .attr('transform', `translate(0, ${this.height})`)
      .attr('class', 'axis axis-bottom')
      .call(xAxis)
      .call((g) => g.select('.domain').attr('stroke', '#ccc'))
      .call((g) => g.selectAll('.tick line').remove());

    this.svg
      .append('g')
      .attr('class', 'axis axis-left')
      .call(yAxis)
      .call((g) => g.selectAll('.tick line').remove())
      .call((g) => g.selectAll('.domain').attr('stroke', '#ccc'));

    this.drawCumulativeLine(
      homeCumulativeXG,
      '#2196f3',
      xScale,
      yScale,
      'home-line'
    );
    this.drawCumulativeLine(
      awayCumulativeXG,
      '#d32f2f',
      xScale,
      yScale,
      'away-line'
    );

    this.drawGoalMarkers(
      homeShots,
      homeCumulativeXG,
      '#2196f3',
      xScale,
      yScale
    );
    this.drawGoalMarkers(
      awayShots,
      awayCumulativeXG,
      '#d32f2f',
      xScale,
      yScale
    );

    this.addLegend();

    this.removeBorders();
  }

  private calculateCumulativeXG(shots: Events[]) {
    const cumulativeData: { minute: number; xG: number }[] = [
      { minute: 0, xG: 0 },
    ];

    let cumulativeSum = 0;
    shots.forEach((shot) => {
      const minute = shot.minute;
      cumulativeSum += shot.shot_statsbomb_xg || 0;
      cumulativeData.push({ minute, xG: cumulativeSum });
    });

    return cumulativeData;
  }

  private getMaxMatchMinute(shots: Events[]): number {
    const maxMinute = d3.max(shots, (d) => d.minute) || 90;
    return maxMinute <= 90 ? 90 : maxMinute;
  }

  private drawCumulativeLine(
    data: { minute: number; xG: number }[],
    color: string,
    xScale: d3.ScaleLinear<number, number>,
    yScale: d3.ScaleLinear<number, number>,
    className: string
  ) {
    const lineGenerator = d3
      .line<{ minute: number; xG: number }>()
      .x((d) => xScale(d.minute))
      .y((d) => yScale(d.xG))
      .curve(d3.curveStepAfter);

    this.svg
      .append('path')
      .datum(data)
      .attr('class', className)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 2)
      .attr('d', lineGenerator);
  }

  private drawGoalMarkers(
    shots: Events[],
    cumulativeXG: { minute: number; xG: number }[],
    color: string,
    xScale: d3.ScaleLinear<number, number>,
    yScale: d3.ScaleLinear<number, number>
  ) {
    const goalShots = shots.filter((shot) => shot.shot_outcome === 'Goal');

    goalShots.forEach((goalShot) => {
      const goalTime = goalShot.minute;
      const closestDataPoint = cumulativeXG.find((d) => d.minute === goalTime);
      if (closestDataPoint) {
        const goalGroup = this.svg
          .append('g')
          .attr(
            'transform',
            `translate(${xScale(closestDataPoint.minute)},${yScale(
              closestDataPoint.xG
            )})`
          );

        goalGroup
          .append('circle')
          .attr('r', 6)
          .attr('fill', 'white')
          .attr('stroke', color)
          .attr('stroke-width', 2)
          .on('mouseover', (event) => {
            this.tooltip.transition().duration(200).style('opacity', 0.9);
            this.tooltip
              .html(
                `
                <strong>Player:</strong> ${goalShot.player}<br/>
                <strong>Minute:</strong> ${goalTime}'<br/>
                <strong>Cumulative xG:</strong> ${closestDataPoint.xG.toFixed(
                  2
                )}
              `
              )
              .style('left', event.pageX + 10 + 'px')
              .style('top', event.pageY - 28 + 'px');
          })
          .on('mousemove', (event) => {
            this.tooltip
              .style('left', event.pageX + 10 + 'px')
              .style('top', event.pageY - 28 + 'px');
          })
          .on('mouseout', () => {
            this.tooltip.transition().duration(500).style('opacity', 0);
          });
      }
    });
  }

  private addLegend() {
    const legendData = [
      { color: '#2196f3', teamName: this.homeTeamName() },
      { color: '#d32f2f', teamName: this.awayTeamName() },
    ];

    const legend = this.svg
      .append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(0, 20)`);

    legend
      .selectAll('.legend-item')
      .data(legendData)
      .enter()
      .append('g')
      .attr('transform', (d, i) => `translate(0, ${i * 20})`)
      .call((g) => {
        g.append('rect')
          .attr('x', 10)
          .attr('y', 0)
          .attr('width', 12)
          .attr('height', 12)
          .attr('fill', (d) => d.color);

        g.append('text')
          .attr('x', 30)
          .attr('y', 6)
          .attr('dy', '0.35em')
          .attr('fill', 'white')
          .style('font-weight', 'bold')
          .style('font-size', '14px')
          .text((d) => d.teamName);
      });
  }

  private removeBorders() {
    this.svg.select('.axis-bottom .domain').style('stroke', '#ccc');
    this.svg.select('.axis-left .domain').style('stroke', '#ccc');
  }
}
