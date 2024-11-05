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
  selector: 'app-pass-network',
  template: `
    <div #passNetworkContainer class="pass-network-container">
      <app-pitch [width]="width" [height]="height"></app-pitch>
    </div>
  `,
  standalone: true,
  imports: [PitchComponent],
  styleUrls: ['./pass-network.component.scss'],
})
export class PassNetworkComponent implements OnChanges, AfterViewInit {
  @Input() events: Events[] = [];
  @Input() teamName!: string;

  @ViewChild('passNetworkContainer', { static: true })
  containerRef!: ElementRef;

  width = 500;
  height = 330;

  private svg: any;
  private xScale: any;
  private yScale: any;

  constructor() {}

  ngAfterViewInit(): void {
    this.initializeSvg();
    if (this.events.length > 0) {
      this.createPassNetwork();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['events'] && !changes['events'].firstChange) {
      if (this.svg) {
        this.createPassNetwork();
      }
    }
  }

  initializeSvg(): void {
    this.svg = d3.select(this.containerRef.nativeElement).select('svg');

    this.xScale = d3.scaleLinear().domain([0, 120]).range([0, this.width]);
    this.yScale = d3.scaleLinear().domain([0, 80]).range([0, this.height]);
  }

  async createPassNetwork(): Promise<void> {
    if (!this.svg) {
      return;
    }

    this.svg
      .selectAll('.pass-line, .player-node, .jersey-number-text')
      .remove();

    const eventsWithNewSecond = this.events.map((event) => ({
      ...event,
      newsecond: event.minute * 60 + event.second,
    }));

    // Sort events by newsecond
    eventsWithNewSecond.sort((a, b) => a.newsecond - b.newsecond);

    const teamEvents = eventsWithNewSecond.filter(
      (event) => event.team === this.teamName
    );

    // Collect jersey numbers from all tactics events
    const tacticsEvents = eventsWithNewSecond.filter(
      (event) =>
        event.team === this.teamName && event.tactics && event.tactics.lineup
    );

    const jerseyNumberMap: { [playerId: string]: string } = {};

    tacticsEvents.forEach((tacticsEvent) => {
      tacticsEvent.tactics.lineup.forEach((player: any) => {
        const playerId = player.player.id.toString();
        if (!jerseyNumberMap[playerId]) {
          jerseyNumberMap[playerId] = player.jersey_number.toString();
        }
      });
    });

    // Build a map of player_id to playerName
    const playerIdToNameMap: { [playerId: string]: string } = {};

    eventsWithNewSecond.forEach((event) => {
      if (event.player_id && event.player) {
        playerIdToNameMap[event.player_id.toString()] = event.player;
      }
    });

    // Extract passes before the first substitution
    const subEvents = eventsWithNewSecond.filter(
      (event) => event.team === this.teamName && event.type === 'Substitution'
    );

    // Find time of the team's first substitution
    let firstSubSecond =
      subEvents.length > 0
        ? Math.min(...subEvents.map((e) => e.newsecond))
        : 90 * 60; // Assume full match if no substitution

    // If first substitution is before or at halftime, set to halftime (45 * 60 seconds)
    if (firstSubSecond <= 45 * 60) {
      firstSubSecond = 45 * 60;
    }

    // Filter passes before the first substitution
    const passes = teamEvents.filter(
      (event) => event.type === 'Pass' && event.newsecond < firstSubSecond
    );

    // Fill null pass_outcome with "Successful"
    passes.forEach((pass) => {
      if (!pass.pass_outcome) {
        pass.pass_outcome = 'Successful';
      }
    });

    // Filter for successful passes
    const completions = passes.filter(
      (pass) => pass.pass_outcome === 'Successful'
    );

    // Calculate average positions
    const playerPositionsMap = new Map<
      string,
      { x: number; y: number; count: number }
    >();

    completions.forEach((pass) => {
      const playerId = pass.player_id.toString();
      if (!playerPositionsMap.has(playerId)) {
        playerPositionsMap.set(playerId, { x: 0, y: 0, count: 0 });
      }
      const playerData = playerPositionsMap.get(playerId)!;
      playerData.x += pass.location[0];
      playerData.y += pass.location[1];
      playerData.count += 1;
    });

    const playerPositions = Array.from(playerPositionsMap.entries()).map(
      ([playerId, data]) => {
        const jerseyNumber = jerseyNumberMap[playerId] || '';
        const playerName = playerIdToNameMap[playerId] || '';
        if (jerseyNumber === '') {
          console.warn(
            `Missing jersey number for player ID: ${playerId} (${playerName})`
          );
        }

        // Limit x and y to two decimal places
        const x = parseFloat((data.x / data.count).toFixed(2));
        const y = parseFloat((data.y / data.count).toFixed(2));

        return {
          id: playerId,
          x,
          y,
          count: data.count,
          jerseyNumber,
          playerName,
        };
      }
    );

    // Identify players who didn't make any passes
    const startingPlayerIds = tacticsEvents[0].tactics.lineup.map(
      (player: any) => player.player.id.toString()
    );

    startingPlayerIds.forEach((playerId) => {
      if (!playerPositionsMap.has(playerId)) {
        // Assign default position (e.g., center of the pitch)
        const jerseyNumber = jerseyNumberMap[playerId] || '';
        const playerName = playerIdToNameMap[playerId] || '';
        playerPositions.push({
          id: playerId,
          x: 60, // Center x-coordinate
          y: 40, // Center y-coordinate
          count: 0,
          jerseyNumber,
          playerName,
        });
        console.warn(
          `Assigned default position for player ${playerName} (ID: ${playerId})`
        );
      }
    });

    // Calculate pass counts between players
    const passCombosMap = new Map<string, number>();

    for (let i = 0; i < completions.length - 1; i++) {
      const pass = completions[i];
      const nextEvent = completions[i + 1];

      if (
        pass.team === nextEvent.team &&
        pass.player_id &&
        nextEvent.player_id &&
        pass.newsecond < firstSubSecond &&
        nextEvent.newsecond < firstSubSecond
      ) {
        const passerId = pass.player_id.toString();
        const recipientId = nextEvent.player_id.toString();

        const key = `${passerId}-${recipientId}`;
        passCombosMap.set(key, (passCombosMap.get(key) || 0) + 1);
      }
    }

    // Filter pass combinations with at least 4 passes
    const filteredPassCombos = Array.from(passCombosMap.entries())
      .filter(([_, count]) => count >= 3)
      .map(([key, count]) => {
        const [sourceId, targetId] = key.split('-');
        return { source: sourceId, target: targetId, count };
      });

    // Prepare nodes and links
    const nodes = playerPositions;
    const links = filteredPassCombos;

    // Create tooltip
    const tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('pointer-events', 'none');

    // Draw links
    this.svg
      .selectAll('.pass-line')
      .data(links)
      .enter()
      .append('line')
      .attr('class', 'pass-line')
      .attr('x1', (d) => this.xScale(nodes.find((n) => n.id === d.source)!.x))
      .attr('y1', (d) => this.yScale(nodes.find((n) => n.id === d.source)!.y))
      .attr('x2', (d) => this.xScale(nodes.find((n) => n.id === d.target)!.x))
      .attr('y2', (d) => this.yScale(nodes.find((n) => n.id === d.target)!.y))
      .attr('stroke', '#000')
      .attr('stroke-width', (d) => Math.min(d.count, 6));

    // Draw nodes with tooltip functionality
    this.svg
      .selectAll('.player-node')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('class', 'player-node')
      .attr('cx', (d) => this.xScale(d.x))
      .attr('cy', (d) => this.yScale(d.y))
      .attr('r', (d) => Math.max(Math.min(d.count * 3, 16), 10))
      .attr('fill', 'gray')
      .attr('stroke', 'black')
      .attr('stroke-width', 1)
      .on('mouseover', (event, d) => {
        tooltip.transition().duration(200).style('opacity', 0.9);
        tooltip
          .html(d.playerName)
          .style('left', event.pageX + 10 + 'px')
          .style('top', event.pageY - 28 + 'px');
      })
      .on('mouseout', () => {
        tooltip.transition().duration(500).style('opacity', 0);
      });

    // Add jersey numbers
    this.svg
      .selectAll('.jersey-number-text')
      .data(nodes)
      .enter()
      .append('text')
      .attr('class', 'jersey-number-text')
      .attr('x', (d) => this.xScale(d.x))
      .attr('y', (d) => this.yScale(d.y) + 4)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('fill', 'black')
      .text((d) => d.jerseyNumber);
  }
}
