import {
  Component,
  OnChanges,
  ElementRef,
  ViewChild,
  input,
  AfterViewInit,
} from '@angular/core';
import * as d3 from 'd3';
import { Events } from '../../../features/competitions/models/events.model';
import { PitchComponent } from '../pitch/pitch.component';

@Component({
  selector: 'app-top-passer-pitch',
  standalone: true,
  imports: [PitchComponent],
  template: `
    <div #topPasserPitchContainer class="top-passer-pitch-container">
      <app-pitch [width]="width" [height]="height"></app-pitch>
    </div>
  `,
  styleUrls: ['./top-passer-pitch.component.scss'],
})
export class TopPasserPitchComponent implements AfterViewInit, OnChanges {
  events = input.required<Events[]>();
  playerId = input.required<number>();
  playerName = input.required<string>();
  teamName = input.required<string>();
  isHomeTeam = input.required<boolean>();

  @ViewChild('topPasserPitchContainer', { static: true })
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
      this.createVisualization();
    }
  }

  ngOnChanges(): void {
    this.initializeSvg();
    if (this.events().length > 0) {
      this.createVisualization();
    }
  }

  initializeSvg(): void {
    this.svg = d3.select(this.containerRef.nativeElement).select('svg');

    if (this.svg.empty()) {
      return;
    }

    this.xScale = d3
      .scaleLinear()
      .domain([0, this.pitchLength])
      .range([0, this.width]);
    this.yScale = d3
      .scaleLinear()
      .domain([0, this.pitchWidth])
      .range([0, this.height]);
  }

  createVisualization(): void {
    if (!this.svg) {
      return;
    }

    this.svg.selectAll('.pass').remove();
    this.svg.selectAll('.pass-arrow').remove();
    this.svg.selectAll('.pass-count').remove();

    let passes = this.events().filter(
      (event) =>
        event.type === 'Pass' &&
        !event.pass_outcome &&
        event.player_id === this.playerId() &&
        event.location &&
        event.pass_end_location
    );

    if (!this.isHomeTeam()) {
      passes = passes.map((event) => {
        const newEvent = { ...event };
        newEvent.location = [
          this.pitchLength - event.location[0],
          this.pitchWidth - event.location[1],
        ];
        newEvent.pass_end_location = [
          this.pitchLength - event.pass_end_location![0],
          this.pitchWidth - event.pass_end_location![1],
        ];
        return newEvent;
      });
    }

    const lineGenerator = d3
      .line<any>()
      .x((d: any) => this.xScale(d[0]))
      .y((d: any) => this.yScale(d[1]));

    this.svg
      .append('defs')
      .append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 1)
      .attr('refY', 5)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M 0 0 L 10 5 L 0 10 z')
      .attr('fill', 'blue');

    this.svg
      .selectAll('.pass')
      .data(passes)
      .enter()
      .append('path')
      .attr('class', 'pass')
      .attr('d', (d) => lineGenerator([d.location, d.pass_end_location!]))
      .attr('stroke', 'blue')
      .attr('stroke-width', 2)
      .attr('fill', 'none')
      .attr('marker-end', 'url(#arrow)');

    const passCount = passes.length;
    this.svg
      .append('text')
      .attr('class', 'pass-count')
      .attr('x', this.isHomeTeam() ? 10 : this.width - 10)
      .attr('y', this.height - 10)
      .attr('text-anchor', this.isHomeTeam() ? 'start' : 'end')
      .attr('fill', 'white')
      .style('font-size', '14px')
      .text(`Successful passes: ${passCount}`);
  }
}
