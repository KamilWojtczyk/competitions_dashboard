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
  selector: 'app-zone14-analysis',
  standalone: true,
  imports: [PitchComponent],
  template: `
    <div #zone14Container class="zone14-analysis-container">
      <app-pitch [width]="width" [height]="height"></app-pitch>
    </div>
  `,
  styleUrls: ['./zone14-analysis.component.scss'],
})
export class Zone14AnalysisComponent implements OnChanges, AfterViewInit {
  events = input.required<Events[]>();
  homeTeam = input.required<string>();
  awayTeam = input.required<string>();

  @ViewChild('zone14Container', { static: true })
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
    this.initializeSvg();
    if (this.events().length > 0) {
      this.createVisualization();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['events'] && !changes['events'].firstChange) {
      if (this.svg) {
        this.createVisualization();
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

  createVisualization(): void {
    if (!this.svg) {
      return;
    }

    this.svg.selectAll('.zone14-event').remove();
    this.svg.selectAll('.zone14-overlay').remove();

    const processedEvents = this.processEventData(this.events());

    this.drawZone14Overlays();

    const zone14Events = this.filterZone14Events(processedEvents);

    const teamColors = d3
      .scaleOrdinal()
      .domain([this.homeTeam(), this.awayTeam()])
      .range(['blue', 'red']);

    // Tooltip
    const tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('pointer-events', 'none');

    this.svg
      .selectAll('.zone14-event')
      .data(zone14Events)
      .enter()
      .append('path')
      .attr('class', 'zone14-event')
      .attr('d', (d) => {
        const symbol = d3.symbol();
        if (d.type === 'Shot') {
          symbol.type(d3.symbolDiamond);
        } else if (d.type === 'Dribble') {
          symbol.type(d3.symbolSquare);
        } else {
          symbol.type(d3.symbolCircle);
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
      .attr('fill', (d) => {
        if (d.type === 'Pass') return teamColors(d.team);
        if (d.type === 'Shot') return '#232b2b';
        if (d.type === 'Dribble') return 'orange';
        return 'black';
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .on('mouseover', (event, d) => {
        tooltip.transition().duration(200).style('opacity', 0.9);
        tooltip
          .html(
            `<strong>Team:</strong> ${d.team}<br/>
             <strong>Player:</strong> ${d.player}<br/>
             <strong>Type:</strong> ${d.type}<br/>`
          )
          .style('left', event.pageX + 10 + 'px')
          .style('top', event.pageY - 28 + 'px');
      })
      .on('mouseout', () => {
        tooltip.transition().duration(500).style('opacity', 0);
      });
  }

  private drawZone14Overlays(): void {
    const penaltyAreaHeight = 18;
    const penaltyAreaWidth = 44;
    const zone14Depth = 18;
    const zone14Width = penaltyAreaWidth;

    const zone14Away = {
      xMin: this.pitchLength - penaltyAreaHeight - zone14Depth,
      xMax: this.pitchLength - penaltyAreaHeight,
      yMin: (this.pitchWidth - penaltyAreaWidth) / 2,
      yMax: (this.pitchWidth + penaltyAreaWidth) / 2,
    };

    const zone14Home = {
      xMin: penaltyAreaHeight,
      xMax: penaltyAreaHeight + zone14Depth,
      yMin: (this.pitchWidth - penaltyAreaWidth) / 2,
      yMax: (this.pitchWidth + penaltyAreaWidth) / 2,
    };

    this.svg
      .append('rect')
      .attr('class', 'zone14-overlay')
      .attr('x', this.xScale(zone14Away.xMin))
      .attr('y', this.yScale(zone14Away.yMin))
      .attr(
        'width',
        this.xScale(zone14Away.xMax) - this.xScale(zone14Away.xMin)
      )
      .attr(
        'height',
        this.yScale(zone14Away.yMax) - this.yScale(zone14Away.yMin)
      )
      .attr('fill', 'rgba(255, 255, 0, 0.1)')
      .attr('stroke', 'yellow')
      .attr('stroke-width', 1);

    // Draw Zone 14 for Home Team
    this.svg
      .append('rect')
      .attr('class', 'zone14-overlay')
      .attr('x', this.xScale(zone14Home.xMin))
      .attr('y', this.yScale(zone14Home.yMin))
      .attr(
        'width',
        this.xScale(zone14Home.xMax) - this.xScale(zone14Home.xMin)
      )
      .attr(
        'height',
        this.yScale(zone14Home.yMax) - this.yScale(zone14Home.yMin)
      )
      .attr('fill', 'rgba(255, 255, 0, 0.1)')
      .attr('stroke', 'yellow')
      .attr('stroke-width', 1);
  }

  private filterZone14Events(events: Events[]): Events[] {
    const penaltyAreaHeight = 18;
    const penaltyAreaWidth = 44;
    const zone14Depth = 18;
    const zone14Width = penaltyAreaWidth;

    // Zone 14 for Away Team (Right Side)
    const zone14Away = {
      xMin: this.pitchLength - penaltyAreaHeight - zone14Depth,
      xMax: this.pitchLength - penaltyAreaHeight,
      yMin: (this.pitchWidth - penaltyAreaWidth) / 2,
      yMax: (this.pitchWidth + penaltyAreaWidth) / 2,
    };

    // Zone 14 for Home Team (Left Side)
    const zone14Home = {
      xMin: penaltyAreaHeight,
      xMax: penaltyAreaHeight + zone14Depth,
      yMin: (this.pitchWidth - penaltyAreaWidth) / 2,
      yMax: (this.pitchWidth + penaltyAreaWidth) / 2,
    };

    return events.filter((event) => {
      const location = event.location;
      if (!location) return false;
      const x = location[0];
      const y = location[1];

      if (event.team === this.awayTeam()) {
        return (
          x >= zone14Away.xMin &&
          x <= zone14Away.xMax &&
          y >= zone14Away.yMin &&
          y <= zone14Away.yMax &&
          ['Pass', 'Shot', 'Dribble'].includes(event.type)
        );
      } else if (event.team === this.homeTeam()) {
        return (
          x >= zone14Home.xMin &&
          x <= zone14Home.xMax &&
          y >= zone14Home.yMin &&
          y <= zone14Home.yMax &&
          ['Pass', 'Shot', 'Dribble'].includes(event.type)
        );
      }
      return false;
    });
  }

  private processEventData(events: Events[]): any[] {
    return events.map((event) => {
      const newEvent = { ...event };
      if (event.location) {
        if (event.team === this.homeTeam()) {
          newEvent.location = [
            this.pitchLength - event.location[0],
            this.pitchWidth - event.location[1],
          ];
        }
      }
      return newEvent;
    });
  }
}
