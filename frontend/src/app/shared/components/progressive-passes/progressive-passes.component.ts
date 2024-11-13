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
  selector: 'app-progressive-passes',
  standalone: true,
  imports: [PitchComponent],
  styleUrls: ['./progressive-passes.component.scss'],
  template: `
    <div #passMapContainer class="pass-map-container">
      <app-pitch [width]="width" [height]="height"></app-pitch>
    </div>
  `,
})
export class ProgressivePassesComponent implements OnChanges, AfterViewInit {
  events = input.required<Events[]>();
  teamName = input.required<string>();
  isHomeTeam = input.required<boolean>();

  @ViewChild('passMapContainer', { static: true })
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
      this.createPassMap();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['events'] && !changes['events'].firstChange) {
      if (this.svg) {
        this.createPassMap();
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

    // Define arrowhead marker
    const defs = this.svg.append('defs');

    defs
      .append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 10)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', 'currentColor');
  }

  createPassMap(): void {
    if (!this.svg) {
      return;
    }

    // Remove any existing passes and labels
    this.svg.selectAll('.pass').remove();
    this.svg.selectAll('.zone-line').remove();
    this.svg.selectAll('.pass-label').remove();
    this.svg.selectAll('.zone-label').remove();

    // Filter passes for the team
    const teamPasses = this.events().filter(
      (event) => event.type === 'Pass' && event.team === this.teamName()
    );

    // Calculate progressive passes entering the final third (x >= 80)
    const progressivePasses = teamPasses.filter((pass) => {
      let x = pass.location[0];
      let endX = pass.pass_end_location[0];
      return endX >= 80 && x < 80;
    });

    // Determine successful and unsuccessful progressive passes
    const successfulProgressivePasses = progressivePasses.filter(
      (pass) => !pass.pass_outcome
    );

    const unsuccessfulProgressivePasses = progressivePasses.filter(
      (pass) => pass.pass_outcome === 'Incomplete'
    );

    // Draw only progressive passes
    const drawPasses = (passes: Events[], className: string, color: string) => {
      this.svg
        .selectAll(null)
        .data(passes)
        .enter()
        .append('line')
        .attr('class', className)
        .attr('x1', (d) => this.xScale(this.adjustX(d.location[0])))
        .attr('y1', (d) => this.yScale(this.adjustY(d.location[1])))
        .attr('x2', (d) => this.xScale(this.adjustX(d.pass_end_location[0])))
        .attr('y2', (d) => this.yScale(this.adjustY(d.pass_end_location[1])))
        .attr('stroke', color)
        .attr('stroke-width', 2)
        .attr('opacity', 0.7)
        .attr('marker-end', 'url(#arrowhead)');
    };

    // Draw successful progressive passes in blue
    drawPasses(successfulProgressivePasses, 'pass-successful', 'blue');

    // Draw unsuccessful progressive passes in red
    // drawPasses(unsuccessfulProgressivePasses, 'pass-unsuccessful', '#d32f2f');

    this.svg
      .append('text')
      .attr('class', 'pass-label')
      .attr('x', this.isHomeTeam() ? 10 : 310)
      .attr('y', 20)
      .attr('fill', 'white')
      .attr('font-size', '16px')
      .text(`Progressive Passes: ${progressivePasses.length}`);

    // Split the pitch into three zones along the y-axis
    const zoneHeight = this.pitchWidth / 3;

    // Draw zone lines
    this.svg
      .selectAll('.zone-line')
      .data([zoneHeight, zoneHeight * 2])
      .enter()
      .append('line')
      .attr('class', 'zone-line')
      .attr('x1', this.xScale(0))
      .attr('y1', (d) => this.yScale(d))
      .attr('x2', this.xScale(this.pitchLength))
      .attr('y2', (d) => this.yScale(d))
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5');

    // Calculate passes per zone
    const zones = [
      { minY: 0, maxY: zoneHeight, labelY: zoneHeight / 2 },
      {
        minY: zoneHeight,
        maxY: zoneHeight * 2,
        labelY: zoneHeight + zoneHeight / 2,
      },
      {
        minY: zoneHeight * 2,
        maxY: this.pitchWidth,
        labelY: zoneHeight * 2 + zoneHeight / 2,
      },
    ];

    const zonePassCounts = zones.map((zone) => {
      const passesInZone = progressivePasses.filter((pass) => {
        let y = pass.location[1];
        if (!this.isHomeTeam) {
          y = this.pitchWidth - y;
        }
        return y >= zone.minY && y < zone.maxY;
      });
      return { ...zone, count: passesInZone.length };
    });

    // Display passes per zone
    this.svg
      .selectAll('.zone-label')
      .data(zonePassCounts)
      .enter()
      .append('text')
      .attr('class', 'zone-label')
      .attr(
        'x',
        this.xScale(
          this.isHomeTeam() ? this.pitchLength / 3 : (this.pitchLength / 3) * 2
        )
      )
      .attr('y', (d) => this.yScale(d.labelY))
      .attr('fill', 'white')
      .attr('font-size', '14px')
      .attr('text-anchor', 'middle')
      .text((d) => `Passes: ${d.count}`);
  }

  adjustX(x: number): number {
    if (!this.isHomeTeam()) {
      return this.pitchLength - x;
    }
    return x;
  }

  adjustY(y: number): number {
    if (!this.isHomeTeam()) {
      return this.pitchWidth - y;
    }
    return y;
  }
}
