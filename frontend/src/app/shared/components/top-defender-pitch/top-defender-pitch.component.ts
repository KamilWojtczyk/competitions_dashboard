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
  selector: 'app-top-defender-pitch',
  standalone: true,
  imports: [PitchComponent],
  template: `
    <div #topDefenderPitchContainer class="top-defender-pitch-container">
      <app-pitch [width]="width" [height]="height"></app-pitch>
    </div>
  `,
  styleUrls: ['./top-defender-pitch.component.scss'],
})
export class TopDefenderPitchComponent implements AfterViewInit, OnChanges {
  events = input.required<Events[]>();
  playerId = input.required<number>();
  playerName = input.required<string>();
  teamName = input.required<string>();
  isHomeTeam = input.required<boolean>();

  @ViewChild('topDefenderPitchContainer', { static: true })
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

    this.svg.selectAll('.defensive-action').remove();
    this.svg.selectAll('.legend').remove();

    let actions = this.events().filter(
      (event) =>
        event.player_id === this.playerId() &&
        event.location &&
        [
          'Duel',
          'Interception',
          'Foul Committed',
          'Ball Recovery',
          'Clearance',
        ].includes(event.type)
    );

    if (!this.isHomeTeam) {
      actions = actions.map((event) => {
        const newEvent = { ...event };
        newEvent.location = [
          this.pitchLength - event.location[0],
          this.pitchWidth - event.location[1],
        ];
        return newEvent;
      });
    }

    this.svg
      .selectAll('.defensive-action')
      .data(actions)
      .enter()
      .append('path')
      .attr('class', 'defensive-action')
      .attr('d', (d) => {
        const symbol = d3.symbol();
        switch (d.type) {
          case 'Duel':
            symbol.type(d3.symbolTriangle);
            break;
          case 'Interception':
            symbol.type(d3.symbolSquare);
            break;
          case 'Foul Committed':
            symbol.type(d3.symbolCross);
            break;
          case 'Ball Recovery':
            symbol.type(d3.symbolCircle);
            break;
          case 'Clearance':
            symbol.type(d3.symbolDiamond);
            break;
          default:
            symbol.type(d3.symbolCircle);
            break;
        }
        symbol.size(100);
        return symbol();
      })
      .attr(
        'transform',
        (d) =>
          `translate(${this.xScale(d.location[0])},${this.yScale(
            d.location[1]
          )})`
      )
      .attr('fill', '#232b2b')
      .attr('opacity', 0.7);

    // Add legend
    const legendData = [
      { type: 'Duel', symbol: d3.symbolTriangle },
      { type: 'Interception', symbol: d3.symbolSquare },
      { type: 'Foul Committed', symbol: d3.symbolCross },
      { type: 'Ball Recovery', symbol: d3.symbolCircle },
      { type: 'Clearance', symbol: d3.symbolDiamond },
    ];

    const legend = this.svg
      .selectAll('.legend')
      .data(legendData)
      .enter()
      .append('g')
      .attr('class', 'legend')
      .attr(
        'transform',
        (_, i) =>
          `translate(${this.width - 150}, ${
            this.height - legendData.length * 20 + i * 20 - 10
          })`
      );

    legend
      .append('path')
      .attr('d', (d) => {
        const symbol = d3.symbol().type(d.symbol).size(100);
        return symbol();
      })
      .attr('fill', '#232b2b')
      .attr('transform', 'translate(0,0)');

    legend
      .append('text')
      .attr('x', 20)
      .attr('y', 5)
      .text((d) => d.type)
      .attr('fill', 'white')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .attr('alignment-baseline', 'middle');
  }
}
