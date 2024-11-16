import {
  Component,
  ElementRef,
  AfterViewInit,
  ViewChild,
  OnChanges,
  SimpleChanges,
  input,
} from '@angular/core';
import * as d3 from 'd3';
import { Events } from '../../../features/competitions/models/events.model';
import { PitchComponent } from '../pitch/pitch.component';

@Component({
  selector: 'app-press-resistance-map',
  template: `
    <div #pressResistanceMapContainer class="press-resistance-map-container">
      <app-pitch [width]="width" [height]="height"></app-pitch>
    </div>
  `,
  styleUrls: ['./press-resistance-map.component.scss'],
  standalone: true,
  imports: [PitchComponent],
})
export class PressResistanceMapComponent implements OnChanges, AfterViewInit {
  events = input.required<Events[]>();
  teamName = input.required<string>();
  isHomeTeam = input.required<boolean>();

  @ViewChild('pressResistanceMapContainer', { static: true })
  containerRef!: ElementRef;

  @ViewChild(PitchComponent, { static: true })
  pitchComponent!: PitchComponent;

  width = 500;
  height = 330;

  private svg: any;
  private xScale: any;
  private yScale: any;

  private pitchWidth = 80;
  private pitchLength = 120;

  constructor() {}

  ngAfterViewInit(): void {
    if (this.events().length > 0) {
      this.initializeSvg();
      this.createPressResistanceMap();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['events'] && !changes['events'].firstChange) {
      if (this.svg) {
        this.createPressResistanceMap();
      }
    }
  }

  private initializeSvg(): void {
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

  private createPressResistanceMap(): void {
    if (!this.svg) {
      return;
    }

    this.svg.selectAll('.event').remove();
    this.svg.selectAll('.pass-line').remove();
    this.svg.selectAll('.carry-line').remove();
    this.svg.selectAll('defs').remove();
    d3.select(this.containerRef.nativeElement).selectAll('.tooltip').remove();

    const data = this.prepareData();

    if (data.length === 0) {
      return;
    }

    this.svg
      .append('defs')
      .append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 10)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', 'currentColor');

    this.plotEvents(data);
  }

  private prepareData(): Events[] {
    const underPressureEvents = this.events().filter(
      (event) =>
        event.team.trim().toLowerCase() ===
          this.teamName().trim().toLowerCase() &&
        event.under_pressure &&
        event.location &&
        ((event.type === 'Pass' &&
          !event.pass_outcome &&
          event.pass_end_location) ||
          (event.type === 'Carry' && event.carry_end_location))
    );

    return underPressureEvents;
  }

  private plotEvents(data: Events[]): void {
    const tooltip = d3
      .select(this.containerRef.nativeElement)
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);

    data.forEach((d: Events) => {
      let xStart = d.location[0];
      let yStart = d.location[1];
      let xEnd: number | null = null;
      let yEnd: number | null = null;

      if (d.type === 'Pass' && d.pass_end_location) {
        xEnd = d.pass_end_location[0];
        yEnd = d.pass_end_location[1];
      } else if (d.type === 'Carry' && d.carry_end_location) {
        xEnd = d.carry_end_location[0];
        yEnd = d.carry_end_location[1];
      }

      if (!this.isHomeTeam()) {
        xStart = this.pitchLength - xStart;
        yStart = this.pitchWidth - yStart;
        if (xEnd !== null && yEnd !== null) {
          xEnd = this.pitchLength - xEnd;
          yEnd = this.pitchWidth - yEnd;
        }
      }

      let strokeColor = '';
      let markerEnd = '';

      if (d.type === 'Pass') {
        strokeColor = 'blue';
        markerEnd = 'url(#arrowhead)';
      } else if (d.type === 'Carry') {
        strokeColor = 'orange';
        markerEnd = '';
      }

      if (xEnd !== null && yEnd !== null) {
        const line = this.svg
          .append('line')
          .attr('class', d.type === 'Pass' ? 'pass-line' : 'carry-line')
          .attr('x1', this.xScale(xStart))
          .attr('y1', this.yScale(yStart))
          .attr('x2', this.xScale(xEnd))
          .attr('y2', this.yScale(yEnd))
          .attr('stroke', strokeColor)
          .attr('stroke-width', 2)
          .attr('fill', 'none')
          .attr('opacity', 0.7)
          .attr('marker-end', markerEnd)
          .on('mouseover', (event: any) => {
            tooltip.transition().duration(200).style('opacity', 1);
            tooltip
              .html(
                `<strong>Player:</strong> ${d.player}<br/>
                 <strong>Type:</strong> ${
                   d.type === 'Pass' ? 'Successful Pass' : 'Successful Carry'
                 }<br/>
                 <strong>Minute:</strong> ${d.minute}:${d.second}`
              )
              .style('left', event.pageX + 10 + 'px')
              .style('top', event.pageY - 28 + 'px');
          })
          .on('mouseout', () => {
            tooltip.transition().duration(500).style('opacity', 0);
          });

        if (d.type === 'Carry') {
          line.attr('stroke-dasharray', '4 2');
        }
      }

      let shape = null;
      if (d.type === 'Pass') {
        shape = this.svg
          .append('circle')
          .attr('cx', this.xScale(xStart))
          .attr('cy', this.yScale(yStart))
          .attr('r', 4)
          .attr('fill', 'blue');
      } else if (d.type === 'Carry') {
        shape = this.svg
          .append('rect')
          .attr('x', this.xScale(xStart) - 4)
          .attr('y', this.yScale(yStart) - 4)
          .attr('width', 8)
          .attr('height', 8)
          .attr('fill', 'orange');
      }

      if (shape) {
        shape
          .on('mouseover', (event: any) => {
            tooltip.transition().duration(200).style('opacity', 1);
            tooltip
              .html(
                `<strong>Player:</strong> ${d.player}<br/>
                 <strong>Type:</strong> ${
                   d.type === 'Pass' ? 'Successful Pass' : 'Successful Carry'
                 }<br/>
                 <strong>Minute:</strong> ${d.minute}:${d.second}`
              )
              .style('left', event.pageX + 10 + 'px')
              .style('top', event.pageY - 28 + 'px');
          })
          .on('mouseout', () => {
            tooltip.transition().duration(500).style('opacity', 0);
          });
      }
    });
  }
}
