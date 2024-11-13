import {
  Component,
  ElementRef,
  OnChanges,
  SimpleChanges,
  ViewChild,
  input,
  AfterViewInit,
} from '@angular/core';
import * as d3 from 'd3';
import { Events } from '../../../features/competitions/models/events.model';

export interface xTPerMinute {
  minute: number;
  homeTeamxT: number;
  awayTeamxT: number;
}

@Component({
  selector: 'app-xt-chart',
  template: `<div #chartContainer class="xt-chart-container"></div>`,
  styles: [
    `
      .xt-chart-container {
        width: 700px;
        height: 430px;
      }
    `,
  ],
  standalone: true,
})
export class xTChartComponent implements AfterViewInit, OnChanges {
  events = input.required<Events[]>();
  homeTeamName = input.required<string>();
  awayTeamName = input.required<string>();

  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;

  private xTGrid: number[][] = [];

  constructor() {}

  ngAfterViewInit() {
    if (this.events().length > 0) {
      this.createxTGrid();
      this.createChart();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['events'] && !changes['events'].firstChange) {
      this.createxTGrid();
      this.createChart();
    }
  }

  createxTGrid() {
    this.xTGrid = [];

    for (let y = 0; y < 8; y++) {
      const row = [];
      for (let x = 0; x < 12; x++) {
        const xTValue = (x + 1) / 12;
        row.push(parseFloat(xTValue.toFixed(3)));
      }
      this.xTGrid.push(row);
    }
  }

  createChart() {
    d3.select(this.chartContainer.nativeElement).select('svg').remove();

    const margin = { top: 20, right: 30, bottom: 80, left: 60 };
    const width = 700 - margin.left - margin.right;
    const height = 430 - margin.top - margin.bottom;

    const svg = d3
      .select(this.chartContainer.nativeElement)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const relevantEvents = this.events().filter(
      (event) =>
        (event.type === 'Pass' || event.type === 'Carry') &&
        (event.period === 1 || event.period === 2)
    );

    // Calculate xT for each event
    const xTEvents = relevantEvents
      .map((event) => {
        let eventxT = this.calculateEventxT(event);
        eventxT = parseFloat(eventxT.toFixed(2));

        const timeParts = event.timestamp.split(':');
        const hours = parseInt(timeParts[0], 10);
        const minutes = parseInt(timeParts[1], 10);
        const secondsAndMillis = timeParts[2].split('.');
        const seconds = parseInt(secondsAndMillis[0], 10);

        const timestampInSeconds = hours * 3600 + minutes * 60 + seconds;
        let eventMinute = Math.floor(timestampInSeconds / 60);

        if (event.period === 1) {
          if (eventMinute > 45) {
            return null;
          }
        } else if (event.period === 2) {
          eventMinute += 45;
          if (eventMinute > 90) {
            return null;
          }
        }

        return {
          minute: eventMinute,
          team: event.team.trim().toLowerCase(),
          xT: eventxT,
        };
      })
      .filter((event) => event !== null) as {
      minute: number;
      team: string;
      xT: number;
    }[];

    const maxMinute = d3.max(xTEvents, (d) => d.minute)!;

    const xTPerMinuteData: xTPerMinute[] = [];

    for (let i = 0; i <= maxMinute; i++) {
      xTPerMinuteData.push({
        minute: i,
        homeTeamxT: 0,
        awayTeamxT: 0,
      });
    }

    xTEvents.forEach((event) => {
      const minuteData = xTPerMinuteData[event.minute];
      if (event.team === this.homeTeamName().trim().toLowerCase()) {
        minuteData.homeTeamxT += event.xT;
      } else if (event.team === this.awayTeamName().trim().toLowerCase()) {
        minuteData.awayTeamxT += event.xT;
      }
    });

    xTPerMinuteData.forEach((d) => {
      d.awayTeamxT = -parseFloat(d.awayTeamxT.toFixed(2));
    });

    const xScale = d3
      .scaleBand()
      .domain(xTPerMinuteData.map((d) => d.minute.toString()))
      .range([0, width])
      .padding(0.1);

    const subgroups = ['home', 'away'];
    const xSubgroup = d3
      .scaleBand()
      .domain(subgroups)
      .range([0, xScale.bandwidth()])
      .padding(0.05);

    const yMax = d3.max(xTPerMinuteData, (d) => Math.max(d.homeTeamxT, 0))!;
    const yMin = d3.min(xTPerMinuteData, (d) => Math.min(d.awayTeamxT, 0))!;

    const yScale = d3.scaleLinear().domain([yMin, yMax]).range([height, 0]);

    const xAxisMiddle = d3
      .axisBottom(xScale)
      .tickSizeOuter(0)
      .tickSizeInner(0)
      .tickFormat(() => '');

    svg
      .append('g')
      .attr('transform', `translate(0, ${yScale(0)})`)
      .call(xAxisMiddle);

    const xAxisBottom = d3
      .axisBottom(xScale)
      .tickValues(xScale.domain().filter((d) => parseInt(d, 10) % 5 === 0))
      .tickFormat((d) => `${d}'`)
      .tickSize(0)
      .tickSizeOuter(0);

    svg
      .append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxisBottom)
      .selectAll('text')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .attr('transform', 'rotate(0)')
      .style('text-anchor', 'middle');

    // Draw y-axis
    svg.append('g').call(d3.axisLeft(yScale));

    // Draw home team bars
    svg
      .selectAll('.bar-home')
      .data(xTPerMinuteData)
      .enter()
      .append('rect')
      .attr('class', 'bar-home')
      .attr('x', (d) => xScale(d.minute.toString())! + xSubgroup('home')!)
      .attr('y', (d) => yScale(Math.max(0, d.homeTeamxT)))
      .attr('width', xSubgroup.bandwidth())
      .attr('height', (d) => Math.abs(yScale(d.homeTeamxT) - yScale(0)))
      .attr('fill', '#2196f3');

    // Draw away team bars
    svg
      .selectAll('.bar-away')
      .data(xTPerMinuteData)
      .enter()
      .append('rect')
      .attr('class', 'bar-away')
      .attr('x', (d) => xScale(d.minute.toString())! + xSubgroup('away')!)
      .attr('y', (d) => yScale(Math.max(0, d.awayTeamxT)))
      .attr('width', xSubgroup.bandwidth())
      .attr('height', (d) => Math.abs(yScale(d.awayTeamxT) - yScale(0)))
      .attr('fill', '#d32f2f');

    // Add legends and labels
    // Home Team Legend
    svg
      .append('rect')
      .attr('x', width - 120)
      .attr('y', height + 20)
      .attr('width', 15)
      .attr('height', 15)
      .attr('fill', '#2196f3')
      .attr('stroke', 'black');

    svg
      .append('text')
      .attr('x', width - 100)
      .attr('y', height + 32)
      .attr('fill', 'white')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text(this.homeTeamName());

    // Away Team Legend
    svg
      .append('rect')
      .attr('x', width - 120)
      .attr('y', height + 40)
      .attr('width', 15)
      .attr('height', 15)
      .attr('fill', '#d32f2f')
      .attr('stroke', 'black');

    svg
      .append('text')
      .attr('x', width - 100)
      .attr('y', height + 52)
      .attr('fill', 'white')
      .style('font-weight', 'bold')
      .style('font-size', '14px')
      .text(this.awayTeamName());

    // Y-axis label
    svg
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -50)
      .attr('x', -height / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .attr('fill', 'white')
      .text('xT per Minute');

    // X-axis label
    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', height + 60)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .attr('fill', 'white')
      .text('Time (minutes)');
  }

  calculateEventxT(event: Events): number {
    const startCell = this.getGridCell(event.location[0], event.location[1]);
    let endLocation = event.pass_end_location || event.carry_end_location;

    if (!endLocation) {
      return 0;
    }

    const endCell = this.getGridCell(endLocation[0], endLocation[1]);

    const originxT = this.xTGrid[startCell.yIndex][startCell.xIndex];
    const destinationxT = this.xTGrid[endCell.yIndex][endCell.xIndex];

    let xTValue = parseFloat((destinationxT - originxT).toFixed(3));

    if (xTValue < 0) {
      xTValue = 0;
    }

    return xTValue;
  }

  getGridCell(x: number, y: number): { xIndex: number; yIndex: number } {
    const gridWidth = 120 / 12;
    const gridHeight = 80 / 8;

    const xIndex = Math.min(Math.floor(x / gridWidth), 11);
    const yIndex = Math.min(Math.floor(y / gridHeight), 7);

    return { xIndex, yIndex };
  }
}
