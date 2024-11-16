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
import { PitchComponent } from '../pitch/pitch.component';

@Component({
  selector: 'app-cross-map',
  standalone: true,
  imports: [PitchComponent],
  styleUrls: ['./cross-map.component.scss'],
  template: `
    <div #crossMapContainer class="cross-map-container">
      <app-pitch [width]="width" [height]="height"></app-pitch>
    </div>
  `,
})
export class CrossMapComponent implements OnChanges, AfterViewInit {
  events = input.required<Events[]>();
  homeTeamName = input.required<string>();
  awayTeamName = input.required<string>();

  @ViewChild('crossMapContainer', { static: true })
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
      this.createCrossMap();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['events'] && !changes['events'].firstChange) {
      if (this.svg) {
        this.createCrossMap();
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

  createCrossMap(): void {
    if (!this.svg) {
      return;
    }
    this.svg.selectAll('.cross').remove();
    this.svg.selectAll('defs').remove();
    this.svg.selectAll('.cross-count').remove();

    this.svg
      .append('defs')
      .append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 8)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', 'currentColor');

    const crosses = this.events()
      .filter(
        (event) =>
          (event.team === this.homeTeamName() ||
            event.team === this.awayTeamName()) &&
          event.type === 'Pass' &&
          event.pass_cross === true &&
          event.location &&
          event.pass_end_location
      )
      .map((cross) => {
        let [xStart, yStart] = cross.location;
        let [xEnd, yEnd] = cross.pass_end_location;

        if (cross.team === this.homeTeamName()) {
          xStart = this.pitchLength - xStart;
          yStart = this.pitchWidth - yStart;
          xEnd = this.pitchLength - xEnd;
          yEnd = this.pitchWidth - yEnd;
        }

        return {
          xStart,
          yStart,
          xEnd,
          yEnd,
          outcome: cross.pass_outcome,
          player: cross.player,
          team: cross.team,
        };
      });

    const tooltip = d3
      .select(this.containerRef.nativeElement)
      .append('div')
      .attr('class', 'tooltip');

    this.svg
      .selectAll('.cross')
      .data(crosses)
      .enter()
      .append('line')
      .attr('class', 'cross')
      .attr('x1', (d) => this.xScale(d.xStart))
      .attr('y1', (d) => this.yScale(d.yStart))
      .attr('x2', (d) => this.xScale(d.xEnd))
      .attr('y2', (d) => this.yScale(d.yEnd))
      .attr('stroke', (d) => (d.outcome ? '#d32f2f' : 'blue'))
      .attr('stroke-width', 2)
      .attr('marker-end', 'url(#arrowhead)')
      .attr('opacity', 0.8)
      .on('mouseover', (event, d) => {
        tooltip.transition().duration(200).style('opacity', 1);
        tooltip
          .html(
            `
            <strong>Player:</strong> ${d.player}<br>
            <strong>Team:</strong> ${d.team}<br>
            <strong>Outcome:</strong> ${d.outcome ? d.outcome : 'Successful'}
          `
          )
          .style('left', event.pageX + 10 + 'px')
          .style('top', event.pageY - 28 + 'px');
      })
      .on('mouseout', () => {
        tooltip.transition().duration(500).style('opacity', 0);
      });

    const teamCrosses = d3.group(crosses, (d) => d.team);

    const crossSummary = Array.from(teamCrosses.entries()).map(
      ([team, crosses]) => {
        const successful = crosses.filter((d) => !d.outcome).length;
        const unsuccessful = crosses.filter((d) => d.outcome).length;
        return { team, successful, unsuccessful };
      }
    );

    this.displayCrossCounts(crossSummary);
  }

  private displayCrossCounts(crossSummary: any[]): void {
    const textGroup = this.svg.append('g').attr('class', 'cross-count');

    crossSummary.forEach((teamData) => {
      let xPos = 0;
      if (teamData.team === this.homeTeamName()) {
        xPos = this.width * 0.25 + 60;
      } else if (teamData.team === this.awayTeamName()) {
        xPos = this.width * 0.75 - 60;
      }

      // Start yPos at a fixed value
      let yPos = 20;

      // Display successful crosses
      yPos = 20;
      textGroup
        .append('text')
        .attr('x', xPos)
        .attr('y', yPos)
        .attr('text-anchor', 'middle')
        .style('fill', 'white')
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .text(`Successful: ${teamData.successful}`);

      yPos += 20;
      textGroup
        .append('text')
        .attr('x', xPos)
        .attr('y', yPos)
        .attr('text-anchor', 'middle')
        .style('fill', 'white')
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .text(`Unsuccessful: ${teamData.unsuccessful}`);
    });
  }
}
