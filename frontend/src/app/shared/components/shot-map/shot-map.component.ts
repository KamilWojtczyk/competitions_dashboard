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
  selector: 'app-shot-map',
  standalone: true,
  imports: [PitchComponent],
  styleUrls: ['./shot-map.component.scss'],
  template: `
    <div #shotMapContainer class="shot-map-container">
      <app-pitch [width]="width" [height]="height"></app-pitch>
    </div>
  `,
})
export class ShotMapComponent implements OnChanges, AfterViewInit {
  events = input.required<Events[]>();
  homeTeamName = input.required<string>();
  awayTeamName = input.required<string>();
  @ViewChild('shotMapContainer', { static: true })
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
      this.createShotMap();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['events'] && !changes['events'].firstChange) {
      if (this.svg) {
        this.createShotMap();
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

  createShotMap(): void {
    if (!this.svg) {
      return;
    }

    // Remove any existing shots
    this.svg.selectAll('.shot').remove();

    // Filter for shots by both teams
    const shots = this.events()
      .filter(
        (event) =>
          (event.team === this.homeTeamName() ||
            event.team === this.awayTeamName()) &&
          event.type === 'Shot' &&
          event.period < 5
      )
      .map((shot) => {
        let [x, y] = shot.location;

        // Flip coordinates for away team
        if (shot.team === this.homeTeamName()) {
          x = this.pitchLength - x;
          y = this.pitchWidth - y;
        }

        return {
          x,
          y,
          outcome: shot.shot_outcome,
          xg: shot.shot_statsbomb_xg,
          player: shot.player,
          team: shot.team,
        };
      });

    // Tooltip
    const tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('pointer-events', 'none');

    // Draw shots
    this.svg
      .selectAll('.shot')
      .data(shots)
      .enter()
      .append('circle')
      .attr('class', 'shot')
      .attr('cx', (d) => this.xScale(d.x))
      .attr('cy', (d) => this.yScale(d.y))
      .attr('r', (d) => Math.sqrt(d.xg) * 15)
      .attr('fill', (d) => (d.outcome === 'Goal' ? 'green' : 'white'))
      .attr('stroke', 'black')
      .attr('stroke-width', 1)
      .attr('opacity', 0.7)
      .on('mouseover', (event, d) => {
        tooltip.transition().duration(200).style('opacity', 0.9);
        tooltip
          .html(
            `
            <strong>Player:</strong> ${d.player}<br>
            <strong>Team:</strong> ${d.team}<br>
            <strong>xG:</strong> ${d.xg}<br>
            <strong>Outcome:</strong> ${d.outcome}
          `
          )
          .style('left', event.pageX + 10 + 'px')
          .style('top', event.pageY - 28 + 'px');
      })
      .on('mouseout', () => {
        tooltip.transition().duration(500).style('opacity', 0);
      });
  }
}
