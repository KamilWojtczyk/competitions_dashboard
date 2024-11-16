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
  selector: 'app-transition-map',
  template: `
    <div #transitionMapContainer class="transition-map-container">
      <app-pitch [width]="width" [height]="height"></app-pitch>
    </div>
  `,
  styleUrls: ['./transition-map.component.scss'],
  standalone: true,
  imports: [PitchComponent],
})
export class TransitionMapComponent implements OnChanges, AfterViewInit {
  events = input.required<Events[]>();
  teamName = input.required<string>();
  isHomeTeam = input.required<boolean>();

  @ViewChild('transitionMapContainer', { static: true })
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
      this.createTransitionMap();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['events'] && !changes['events'].firstChange) {
      if (this.svg) {
        this.createTransitionMap();
      }
    }
  }

  private initializeSvg(): void {
    this.svg = d3.select(this.containerRef.nativeElement).select('svg');

    const xDomain = [0, this.pitchLength];
    const yDomain = [0, this.pitchWidth];

    this.xScale = d3.scaleLinear().domain(xDomain).range([0, this.width]);
    this.yScale = d3.scaleLinear().domain(yDomain).range([0, this.height]);
  }

  private createTransitionMap(): void {
    if (!this.svg) {
      return;
    }

    this.svg.selectAll('.turnover-event').remove();
    this.svg.selectAll('.transition-path').remove();
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

    this.plotTransitions(data);
  }

  private prepareData(): any[] {
    const eventsWithTime = this.events().map((event) => ({
      ...event,
      compositeTime: event.minute * 60 + event.second + event.index * 1e-6,
    }));

    // Sort events by composite time
    eventsWithTime.sort((a, b) => a.compositeTime - b.compositeTime);

    // Identify possession gain events
    const possessionGainEvents = eventsWithTime.filter((event) => {
      const isTeamEvent =
        event.team.trim().toLowerCase() ===
        this.teamName().trim().toLowerCase();
      const hasLocation = event.location;

      // Check for successful interception
      const isSuccessfulInterception =
        event.type === 'Interception' &&
        event.interception_outcome &&
        ['Success In Play', 'Won'].includes(event.interception_outcome);

      const isPossessionGainEvent =
        isSuccessfulInterception ||
        event.type === 'Tackle' ||
        (event.type === 'Duel' &&
          event.duel_type === 'Tackle' &&
          event.duel_outcome === 'Won') ||
        (event.type === 'Ball Recovery' &&
          !event.ball_recovery_recovery_failure);

      return isTeamEvent && hasLocation && isPossessionGainEvent;
    });

    const transitions: any[] = [];

    possessionGainEvents.forEach((event) => {
      const eventTime = event.compositeTime;

      // Find the next event by the same team after this event
      const nextEvents = eventsWithTime.filter(
        (e) =>
          e.compositeTime > eventTime &&
          e.team.trim().toLowerCase() === this.teamName().trim().toLowerCase()
      );

      const nextAction = nextEvents.find((e) => {
        if (e.type === 'Pass') {
          const excludedPassTypes = [
            'Kick Off',
            'Throw-in',
            'Corner',
            'Goal Kick',
            'Free Kick',
            'Interception',
          ];
          return (
            e.pass_end_location &&
            (!e.pass_type || !excludedPassTypes.includes(e.pass_type))
          );
        } else if (e.type === 'Carry' || e.type === 'Shot') {
          return true;
        }
        return false;
      });

      if (nextAction) {
        transitions.push({
          startEvent: event,
          nextAction,
        });
      }
    });

    return transitions;
  }

  private plotTransitions(transitions: any[]): void {
    const tooltip = d3
      .select(this.containerRef.nativeElement)
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);

    const getSymbolType = (eventType: string) => {
      switch (eventType) {
        case 'Ball Recovery':
          return d3.symbolCircle;
        case 'Interception':
          return d3.symbolSquare;
        case 'Tackle':
          return d3.symbolTriangle;
        case 'Duel':
          return d3.symbolDiamond;
        default:
          return d3.symbolCircle;
      }
    };

    transitions.forEach((transition) => {
      let xStart = transition.startEvent.location[0];
      let yStart = transition.startEvent.location[1];

      if (!this.isHomeTeam()) {
        xStart = this.pitchLength - xStart;
        yStart = this.pitchWidth - yStart;
      }

      const symbolGenerator = d3
        .symbol()
        .type(getSymbolType(transition.startEvent.type))
        .size(150);

      this.svg
        .append('path')
        .attr('class', 'turnover-event')
        .attr('d', symbolGenerator)
        .attr(
          'transform',
          `translate(${this.xScale(xStart)}, ${this.yScale(yStart)})`
        )
        .attr('fill', 'red')
        .on('mouseover', (event: any) => {
          tooltip.transition().duration(200).style('opacity', 1);
          tooltip
            .html(
              `<strong>Type:</strong> ${transition.startEvent.type}<br/>
               <strong>Player:</strong> ${transition.startEvent.player}<br/>
               <strong>Minute:</strong> ${transition.startEvent.minute}:${transition.startEvent.second}`
            )
            .style('left', event.pageX + 10 + 'px')
            .style('top', event.pageY - 28 + 'px');
        })
        .on('mouseout', () => {
          tooltip.transition().duration(500).style('opacity', 0);
        });

      const e = transition.nextAction;
      let xEnd = e.location[0];
      let yEnd = e.location[1];

      if (e.type === 'Pass' && e.pass_end_location) {
        xEnd = e.pass_end_location[0];
        yEnd = e.pass_end_location[1];
      } else if (e.type === 'Carry' && e.carry_end_location) {
        xEnd = e.carry_end_location[0];
        yEnd = e.carry_end_location[1];
      }

      if (!this.isHomeTeam()) {
        xEnd = this.pitchLength - xEnd;
        yEnd = this.pitchWidth - yEnd;
      }

      this.svg
        .append('line')
        .attr('class', 'transition-path')
        .attr('x1', this.xScale(xStart))
        .attr('y1', this.yScale(yStart))
        .attr('x2', this.xScale(xEnd))
        .attr('y2', this.yScale(yEnd))
        .attr('stroke', 'blue')
        .attr('stroke-width', 2)
        .attr('fill', 'none')
        .attr('opacity', 0.7)
        .attr('marker-end', 'url(#arrowhead)')
        .on('mouseover', (event: any) => {
          tooltip.transition().duration(200).style('opacity', 1);
          tooltip
            .html(
              `<strong>Player:</strong> ${e.player}<br/>
               <strong>Action:</strong> ${e.type}<br/>
               <strong>Minute:</strong> ${e.minute}:${e.second}`
            )
            .style('left', event.pageX + 10 + 'px')
            .style('top', event.pageY - 28 + 'px');
        })
        .on('mouseout', () => {
          tooltip.transition().duration(500).style('opacity', 0);
        });
    });
  }
}
