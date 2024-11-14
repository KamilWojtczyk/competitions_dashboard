import {
  Component,
  OnChanges,
  SimpleChanges,
  ElementRef,
  ViewChild,
  AfterViewInit,
  Input,
  input,
} from '@angular/core';
import * as d3 from 'd3';
import { Events } from '../../../features/competitions/models/events.model';
import { PitchComponent } from '../pitch/pitch.component';

@Component({
  selector: 'app-heat-map',
  standalone: true,
  imports: [PitchComponent],
  styleUrls: ['./heat-map.component.scss'],
  template: `
    <div #heatMapContainer class="heat-map-container">
      <app-pitch
        [width]="width"
        [height]="height"
        [orientation]="orientation()"
      ></app-pitch>
    </div>
  `,
})
export class HeatMapComponent implements OnChanges, AfterViewInit {
  events = input.required<Events[]>();
  teamName = input.required<string>();
  orientation = input.required<'horizontal' | 'vertical'>();
  isHomeTeam = input.required<boolean>();

  @ViewChild('heatMapContainer', { static: true })
  containerRef!: ElementRef;

  width = 500;
  height = 330;

  private svg: any;
  private xScale: any;
  private yScale: any;

  private pitchWidth = 80;
  private pitchLength = 120;

  constructor() {}

  ngAfterViewInit(): void {
    this.initializeSvg();
    if (this.events().length > 0) {
      this.createHeatMap();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['events'] && !changes['events'].firstChange) {
      if (this.svg) {
        this.createHeatMap();
      }
    }
  }

  initializeSvg(): void {
    this.svg = d3.select(this.containerRef.nativeElement).select('svg');

    this.xScale = d3
      .scaleLinear()
      .domain([0, this.pitchLength])
      .range([0, this.width]);
    this.yScale = d3
      .scaleLinear()
      .domain([0, this.pitchWidth])
      .range([0, this.height]);
  }

  createHeatMap(): void {
    if (!this.svg) {
      return;
    }

    this.svg.selectAll('.heatmap-rect').remove();

    const teamEvents = this.events().filter(
      (event) =>
        event.team.trim().toLowerCase() ===
          this.teamName().trim().toLowerCase() &&
        event.type === 'Pass' &&
        !event.pass_outcome &&
        event.location &&
        event.location.length === 2
    );

    const gridSizeX = 12;
    const gridSizeY = 8;
    const cellWidth = this.pitchLength / gridSizeX;
    const cellHeight = this.pitchWidth / gridSizeY;

    const grid: number[][] = Array.from({ length: gridSizeY }, () =>
      Array(gridSizeX).fill(0)
    );

    teamEvents.forEach((event) => {
      let [x, y] = event.location;

      if (!this.isHomeTeam) {
        x = this.pitchLength - x;
        y = this.pitchWidth - y;
      }

      if (this.orientation() === 'vertical') {
        [x, y] = [y, x];
      }

      const xIndex = Math.min(
        Math.floor((x / this.pitchLength) * gridSizeX),
        gridSizeX - 1
      );
      const yIndex = Math.min(
        Math.floor((y / this.pitchWidth) * gridSizeY),
        gridSizeY - 1
      );

      grid[yIndex][xIndex] += 1;
    });

    const gridData = [];
    for (let y = 0; y < gridSizeY; y++) {
      for (let x = 0; x < gridSizeX; x++) {
        gridData.push({
          x,
          y,
          count: grid[y][x],
        });
      }
    }

    const maxCount = d3.max(gridData, (d) => d.count) || 1;
    const colorScale = d3
      .scaleSequential(d3.interpolateReds)
      .domain([0, maxCount]);

    // Draw the heatmap rectangles
    this.svg
      .selectAll('.heatmap-rect')
      .data(gridData)
      .enter()
      .append('rect')
      .attr('class', 'heatmap-rect')
      .attr('x', (d) => this.xScale(d.x * cellWidth))
      .attr('y', (d) => this.yScale(d.y * cellHeight))
      .attr('width', this.xScale(cellWidth) - this.xScale(0))
      .attr('height', this.yScale(cellHeight) - this.yScale(0))
      .attr('fill', (d) => colorScale(d.count))
      .attr('stroke', 'none')
      .attr('opacity', 0.7);
  }
}
