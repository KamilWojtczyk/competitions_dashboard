import { Component, Input, OnInit, ElementRef } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-pitch',
  standalone: true,
  template: '',
})
export class PitchComponent implements OnInit {
  @Input() width = 600;
  @Input() height = 400;
  @Input() halfPitch = false;
  @Input() orientation: 'horizontal' | 'vertical' = 'horizontal';

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    this.drawPitch();
  }

  drawPitch(): void {
    const svg = d3
      .select(this.elementRef.nativeElement)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height);

    const pitchWidth = 120;
    const pitchHeight = 80;

    let xDomain, yDomain;
    if (this.orientation === 'horizontal') {
      xDomain = [0, pitchWidth];
      yDomain = this.halfPitch ? [40, 0] : [0, pitchHeight];
    } else {
      xDomain = [0, pitchHeight];
      yDomain = this.halfPitch ? [0, 60] : [0, pitchWidth];
    }

    const xScale = d3.scaleLinear().domain(xDomain).range([0, this.width]);
    const yScale = d3.scaleLinear().domain(yDomain).range([0, this.height]);

    // Draw the pitch background
    svg
      .append('rect')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('fill', '#006600');

    // Draw the boundaries
    svg
      .append('rect')
      .attr('x', xScale(0))
      .attr('y', yScale(0))
      .attr('width', xScale(pitchWidth) - xScale(0))
      .attr('height', yScale(pitchHeight) - yScale(0))
      .attr('fill', 'none')
      .attr('stroke', 'white')
      .attr('stroke-width', 2);

    // Center line
    svg
      .append('line')
      .attr('x1', xScale(pitchWidth / 2))
      .attr('y1', yScale(0))
      .attr('x2', xScale(pitchWidth / 2))
      .attr('y2', yScale(pitchHeight))
      .attr('stroke', 'white')
      .attr('stroke-width', 2);

    // Center circle
    svg
      .append('circle')
      .attr('cx', xScale(pitchWidth / 2))
      .attr('cy', yScale(pitchHeight / 2))
      .attr('r', xScale(10) - xScale(0)) // Adjusted for correct scaling
      .attr('fill', 'none')
      .attr('stroke', 'white')
      .attr('stroke-width', 2);

    // Penalty areas and goal areas
    const penaltyAreaWidth = 44;
    const penaltyAreaHeight = 18;
    const goalAreaWidth = 20;
    const goalAreaHeight = 6;

    // Left penalty area
    svg
      .append('rect')
      .attr('x', xScale(0))
      .attr('y', yScale((pitchHeight - penaltyAreaWidth) / 2))
      .attr('width', xScale(penaltyAreaHeight) - xScale(0))
      .attr(
        'height',
        yScale((pitchHeight + penaltyAreaWidth) / 2) -
          yScale((pitchHeight - penaltyAreaWidth) / 2)
      )
      .attr('fill', 'none')
      .attr('stroke', 'white')
      .attr('stroke-width', 2);

    // Right penalty area
    svg
      .append('rect')
      .attr('x', xScale(pitchWidth - penaltyAreaHeight))
      .attr('y', yScale((pitchHeight - penaltyAreaWidth) / 2))
      .attr(
        'width',
        xScale(pitchWidth) - xScale(pitchWidth - penaltyAreaHeight)
      )
      .attr(
        'height',
        yScale((pitchHeight + penaltyAreaWidth) / 2) -
          yScale((pitchHeight - penaltyAreaWidth) / 2)
      )
      .attr('fill', 'none')
      .attr('stroke', 'white')
      .attr('stroke-width', 2);

    // Left goal area
    svg
      .append('rect')
      .attr('x', xScale(0))
      .attr('y', yScale((pitchHeight - goalAreaWidth) / 2))
      .attr('width', xScale(goalAreaHeight) - xScale(0))
      .attr(
        'height',
        yScale((pitchHeight + goalAreaWidth) / 2) -
          yScale((pitchHeight - goalAreaWidth) / 2)
      )
      .attr('fill', 'none')
      .attr('stroke', 'white')
      .attr('stroke-width', 2);

    // Right goal area
    svg
      .append('rect')
      .attr('x', xScale(pitchWidth - goalAreaHeight))
      .attr('y', yScale((pitchHeight - goalAreaWidth) / 2))
      .attr('width', xScale(pitchWidth) - xScale(pitchWidth - goalAreaHeight))
      .attr(
        'height',
        yScale((pitchHeight + goalAreaWidth) / 2) -
          yScale((pitchHeight - goalAreaWidth) / 2)
      )
      .attr('fill', 'none')
      .attr('stroke', 'white')
      .attr('stroke-width', 2);

    // Corner arcs
    const cornerRadius = xScale(1) - xScale(0);

    // Top-left corner
    svg
      .append('path')
      .attr(
        'd',
        `M ${xScale(0)},${yScale(
          cornerRadius
        )} A ${cornerRadius},${cornerRadius} 0 0,0 ${xScale(
          cornerRadius
        )},${yScale(0)}`
      )
      .attr('stroke', 'white')
      .attr('fill', 'none')
      .attr('stroke-width', 2);

    // Top-right corner
    svg
      .append('path')
      .attr(
        'd',
        `M ${xScale(pitchWidth)},${yScale(
          cornerRadius
        )} A ${cornerRadius},${cornerRadius} 0 0,1 ${xScale(
          pitchWidth - cornerRadius
        )},${yScale(0)}`
      )
      .attr('stroke', 'white')
      .attr('fill', 'none')
      .attr('stroke-width', 2);

    // Bottom-left corner
    svg
      .append('path')
      .attr(
        'd',
        `M ${xScale(0)},${yScale(
          pitchHeight - cornerRadius
        )} A ${cornerRadius},${cornerRadius} 0 0,1 ${xScale(
          cornerRadius
        )},${yScale(pitchHeight)}`
      )
      .attr('stroke', 'white')
      .attr('fill', 'none')
      .attr('stroke-width', 2);

    // Bottom-right corner
    svg
      .append('path')
      .attr(
        'd',
        `M ${xScale(pitchWidth)},${yScale(
          pitchHeight - cornerRadius
        )} A ${cornerRadius},${cornerRadius} 0 0,0 ${xScale(
          pitchWidth - cornerRadius
        )},${yScale(pitchHeight)}`
      )
      .attr('stroke', 'white')
      .attr('fill', 'none')
      .attr('stroke-width', 2);
  }
}
