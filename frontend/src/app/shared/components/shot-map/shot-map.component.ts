import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ElementRef,
  ViewChild,
  AfterViewInit,
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
      <app-pitch
        [width]="width"
        [height]="height"
        [halfPitch]="true"
      ></app-pitch>
    </div>
  `,
})
export class ShotMapComponent implements OnChanges, AfterViewInit {
  @Input() events: Events[] = [];
  @Input() teamName!: string;

  @ViewChild('shotMapContainer', { static: true })
  containerRef!: ElementRef;

  width = 500; // Adjusted width
  height = 330; // Adjusted height

  private svg: any;
  private xScale: any;
  private yScale: any;

  constructor() {}

  ngAfterViewInit(): void {
    this.initializeSvg();
    this.createShotMap();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['events'] && this.events.length > 0) {
      if (this.svg) {
        this.createShotMap();
      }
    }
  }

  initializeSvg(): void {
    this.svg = d3.select(this.containerRef.nativeElement).select('svg');

    // Scales (match the ones in the pitch component)
    const pitchWidth = 120;
    const pitchHeight = 80;
    this.xScale = d3
      .scaleLinear()
      .domain([0, pitchWidth])
      .range([0, this.width]);
    this.yScale = d3.scaleLinear().domain([40, 80]).range([0, this.height]); // For half-pitch
  }

  createShotMap(): void {
    if (!this.svg) {
      return;
    }

    // Remove any existing shots
    this.svg.selectAll('.shot').remove();

    // Filter for shots by the team
    const teamShots = this.events.filter(
      (event) => event.team === this.teamName && event.type === 'Shot'
    );

    // Extract necessary data
    const shots = teamShots.map((shot) => {
      const [x, y] = shot.location;
      return {
        x,
        y,
        outcome: shot.shot_outcome,
        xg: shot.shot_statsbomb_xg,
        player: shot.player,
      };
    });

    console.log(shots);

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
      .attr('fill', (d) => (d.shot_outcome === 'Goal' ? 'red' : 'white'))
      .attr('stroke', 'black')
      .attr('stroke-width', 1)
      .attr('opacity', 0.7)
      .on('mouseover', (event, d) => {
        tooltip.transition().duration(200).style('opacity', 0.9);
        tooltip
          .html(
            `
            <strong>Player:</strong> ${d.player}<br>
            <strong>xG:</strong> ${d.xg}<br>
            <strong>Outcome:</strong> ${d.outcome}
          `
          )
          .style('left', event.pageX + 'px')
          .style('top', event.pageY + 'px')
          .style('opacity', 1);
      })
      .on('mouseout', () => {
        tooltip.transition().duration(500).style('opacity', 0);
      });
  }
}
