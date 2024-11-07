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
  @Input() orientation: 'horizontal' | 'vertical' = 'horizontal';

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    this.drawPitch();
  }

  drawPitch(): void {
    d3.select(this.elementRef.nativeElement).selectAll('svg').remove();

    const svg = d3
      .select(this.elementRef.nativeElement)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height);

    const pitchLength = 120;
    const pitchWidth = 80;

    let xDomain, yDomain;
    if (this.orientation === 'horizontal') {
      xDomain = [0, pitchLength];
      yDomain = [0, pitchWidth];
    } else {
      xDomain = [0, pitchWidth];
      yDomain = [0, pitchLength];
    }

    const xScale = d3.scaleLinear().domain(xDomain).range([0, this.width]);
    const yScale = d3.scaleLinear().domain(yDomain).range([0, this.height]);

    // Draw the pitch background
    svg
      .append('rect')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('fill', '#006600');

    svg
      .append('rect')
      .attr('x', xScale(xDomain[0]))
      .attr('y', yScale(yDomain[0]))
      .attr('width', xScale(xDomain[1]) - xScale(xDomain[0]))
      .attr('height', yScale(yDomain[1]) - yScale(yDomain[0]))
      .attr('fill', 'none')
      .attr('stroke', 'white')
      .attr('stroke-width', 2);

    if (this.orientation === 'horizontal') {
      this.drawHorizontalPitch(svg, xScale, yScale, pitchLength, pitchWidth);
    } else {
      this.drawVerticalPitch(svg, xScale, yScale, pitchLength, pitchWidth);
    }
  }

  private drawHorizontalPitch(
    svg: any,
    xScale: any,
    yScale: any,
    pitchLength: number,
    pitchWidth: number
  ): void {
    const penaltyAreaWidth = 44;
    const penaltyAreaHeight = 18;
    const goalAreaWidth = 20;
    const goalAreaHeight = 6;
    const goalWidth = 7.32;

    // Central Line
    svg
      .append('line')
      .attr('x1', xScale(pitchLength / 2))
      .attr('y1', yScale(0))
      .attr('x2', xScale(pitchLength / 2))
      .attr('y2', yScale(pitchWidth))
      .attr('stroke', 'white')
      .attr('stroke-width', 2);

    // Central Circle
    svg
      .append('circle')
      .attr('cx', xScale(pitchLength / 2))
      .attr('cy', yScale(pitchWidth / 2))
      .attr('r', xScale(10) - xScale(0))
      .attr('fill', 'none')
      .attr('stroke', 'white')
      .attr('stroke-width', 2);

    // Left Penalty Area
    svg
      .append('rect')
      .attr('x', xScale(0))
      .attr('y', yScale((pitchWidth - penaltyAreaWidth) / 2))
      .attr('width', xScale(penaltyAreaHeight) - xScale(0))
      .attr(
        'height',
        yScale((pitchWidth + penaltyAreaWidth) / 2) -
          yScale((pitchWidth - penaltyAreaWidth) / 2)
      )
      .attr('fill', 'none')
      .attr('stroke', 'white')
      .attr('stroke-width', 2);

    // Right Penalty Area
    svg
      .append('rect')
      .attr('x', xScale(pitchLength - penaltyAreaHeight))
      .attr('y', yScale((pitchWidth - penaltyAreaWidth) / 2))
      .attr(
        'width',
        xScale(pitchLength) - xScale(pitchLength - penaltyAreaHeight)
      )
      .attr(
        'height',
        yScale((pitchWidth + penaltyAreaWidth) / 2) -
          yScale((pitchWidth - penaltyAreaWidth) / 2)
      )
      .attr('fill', 'none')
      .attr('stroke', 'white')
      .attr('stroke-width', 2);

    // Left Goal Area
    svg
      .append('rect')
      .attr('x', xScale(0))
      .attr('y', yScale((pitchWidth - goalAreaWidth) / 2))
      .attr('width', xScale(goalAreaHeight) - xScale(0))
      .attr(
        'height',
        yScale((pitchWidth + goalAreaWidth) / 2) -
          yScale((pitchWidth - goalAreaWidth) / 2)
      )
      .attr('fill', 'none')
      .attr('stroke', 'white')
      .attr('stroke-width', 2);

    // Right Goal Area
    svg
      .append('rect')
      .attr('x', xScale(pitchLength - goalAreaHeight))
      .attr('y', yScale((pitchWidth - goalAreaWidth) / 2))
      .attr('width', xScale(pitchLength) - xScale(pitchLength - goalAreaHeight))
      .attr(
        'height',
        yScale((pitchWidth + goalAreaWidth) / 2) -
          yScale((pitchWidth - goalAreaWidth) / 2)
      )
      .attr('fill', 'none')
      .attr('stroke', 'white')
      .attr('stroke-width', 2);

    // Left Penalty Spot
    svg
      .append('circle')
      .attr('cx', xScale(12))
      .attr('cy', yScale(pitchWidth / 2))
      .attr('r', 2)
      .attr('fill', 'white');

    // Right Penalty Spot
    svg
      .append('circle')
      .attr('cx', xScale(pitchLength - 12))
      .attr('cy', yScale(pitchWidth / 2))
      .attr('r', 2)
      .attr('fill', 'white');

    // Left Penalty Arc
    const leftPenaltyArc = d3
      .arc<any, any>()
      .innerRadius(0)
      .outerRadius(xScale(10) - xScale(0))
      .startAngle(0)
      .endAngle(Math.PI);

    svg
      .append('path')
      .attr('d', leftPenaltyArc)
      .attr('transform', `translate(${xScale(18)},${yScale(pitchWidth / 2)})`)
      .attr('fill', 'none')
      .attr('stroke', 'white')
      .attr('stroke-width', 2);

    // Right Penalty Arc
    const rightPenaltyArc = d3
      .arc<any, any>()
      .innerRadius(0)
      .outerRadius(xScale(10) - xScale(0))
      .startAngle(-Math.PI)
      .endAngle(0);

    svg
      .append('path')
      .attr('d', rightPenaltyArc)
      .attr(
        'transform',
        `translate(${xScale(pitchLength - 18)},${yScale(pitchWidth / 2)})`
      )
      .attr('fill', 'none')
      .attr('stroke', 'white')
      .attr('stroke-width', 2);

    // Left Goal (Net)
    svg
      .append('rect')
      .attr('x', xScale(0))
      .attr('y', yScale((pitchWidth - goalWidth) / 2))
      .attr('width', xScale(0) - xScale(-1))
      .attr(
        'height',
        yScale((pitchWidth + goalWidth) / 2) -
          yScale((pitchWidth - goalWidth) / 2)
      )
      .attr('fill', 'white')
      .attr('stroke', 'white')
      .attr('stroke-width', 2);

    // Right Goal (Net)
    svg
      .append('rect')
      .attr('x', xScale(pitchLength - 1))
      .attr('y', yScale((pitchWidth - goalWidth) / 2))
      .attr('width', xScale(pitchLength + 2) - xScale(pitchLength))
      .attr(
        'height',
        yScale((pitchWidth + goalWidth) / 2) -
          yScale((pitchWidth - goalWidth) / 2)
      )
      .attr('fill', 'white')
      .attr('stroke', 'white')
      .attr('stroke-width', 2);
  }

  private drawVerticalPitch(
    svg: any,
    xScale: any,
    yScale: any,
    pitchLength: number,
    pitchWidth: number
  ): void {
    const penaltyAreaWidth = 44;
    const penaltyAreaHeight = 18;
    const goalAreaWidth = 20;
    const goalAreaHeight = 6;
    const goalWidth = 7.32;

    // Central Line
    svg
      .append('line')
      .attr('x1', xScale(0))
      .attr('y1', yScale(pitchLength / 2))
      .attr('x2', xScale(pitchWidth))
      .attr('y2', yScale(pitchLength / 2))
      .attr('stroke', 'white')
      .attr('stroke-width', 2);

    // Central Circle
    svg
      .append('circle')
      .attr('cx', xScale(pitchWidth / 2))
      .attr('cy', yScale(pitchLength / 2))
      .attr('r', yScale(10) - yScale(0))
      .attr('fill', 'none')
      .attr('stroke', 'white')
      .attr('stroke-width', 2);

    // Bottom Penalty Area
    svg
      .append('rect')
      .attr('x', xScale((pitchWidth - penaltyAreaWidth) / 2))
      .attr('y', yScale(pitchLength - penaltyAreaHeight))
      .attr(
        'width',
        xScale((pitchWidth + penaltyAreaWidth) / 2) -
          xScale((pitchWidth - penaltyAreaWidth) / 2)
      )
      .attr(
        'height',
        yScale(pitchLength) - yScale(pitchLength - penaltyAreaHeight)
      )
      .attr('fill', 'none')
      .attr('stroke', 'white')
      .attr('stroke-width', 2);

    // Top Penalty Area
    svg
      .append('rect')
      .attr('x', xScale((pitchWidth - penaltyAreaWidth) / 2))
      .attr('y', yScale(0))
      .attr(
        'width',
        xScale((pitchWidth + penaltyAreaWidth) / 2) -
          xScale((pitchWidth - penaltyAreaWidth) / 2)
      )
      .attr('height', yScale(penaltyAreaHeight) - yScale(0))
      .attr('fill', 'none')
      .attr('stroke', 'white')
      .attr('stroke-width', 2);

    // Bottom Goal Area
    svg
      .append('rect')
      .attr('x', xScale((pitchWidth - goalAreaWidth) / 2))
      .attr('y', yScale(pitchLength - goalAreaHeight))
      .attr(
        'width',
        xScale((pitchWidth + goalAreaWidth) / 2) -
          xScale((pitchWidth - goalAreaWidth) / 2)
      )
      .attr(
        'height',
        yScale(pitchLength) - yScale(pitchLength - goalAreaHeight)
      )
      .attr('fill', 'none')
      .attr('stroke', 'white')
      .attr('stroke-width', 2);

    // Top Goal Area
    svg
      .append('rect')
      .attr('x', xScale((pitchWidth - goalAreaWidth) / 2))
      .attr('y', yScale(0))
      .attr(
        'width',
        xScale((pitchWidth + goalAreaWidth) / 2) -
          xScale((pitchWidth - goalAreaWidth) / 2)
      )
      .attr('height', yScale(goalAreaHeight) - yScale(0))
      .attr('fill', 'none')
      .attr('stroke', 'white')
      .attr('stroke-width', 2);

    // Bottom Penalty Spot
    svg
      .append('circle')
      .attr('cx', xScale(pitchWidth / 2))
      .attr('cy', yScale(pitchLength - 12))
      .attr('r', 2)
      .attr('fill', 'white');

    // Top Penalty Spot
    svg
      .append('circle')
      .attr('cx', xScale(pitchWidth / 2))
      .attr('cy', yScale(12))
      .attr('r', 2)
      .attr('fill', 'white');

    // Bottom Penalty Arc
    const penaltyArcBottom = d3
      .arc<any, any>()
      .innerRadius(0)
      .outerRadius(yScale(10) - yScale(0))
      .startAngle(-Math.PI / 2)
      .endAngle(Math.PI / 2);

    svg
      .append('path')
      .attr('d', penaltyArcBottom)
      .attr(
        'transform',
        `translate(${xScale(pitchWidth / 2)},${yScale(pitchLength - 18)})`
      )
      .attr('fill', 'none')
      .attr('stroke', 'white')
      .attr('stroke-width', 2);

    // Top Penalty Arc
    const penaltyArcTop = d3
      .arc<any, any>()
      .innerRadius(0)
      .outerRadius(yScale(10) - yScale(0))
      .startAngle(Math.PI / 2)
      .endAngle((3 * Math.PI) / 2);

    svg
      .append('path')
      .attr('d', penaltyArcTop)
      .attr('transform', `translate(${xScale(pitchWidth / 2)},${yScale(18)})`)
      .attr('fill', 'none')
      .attr('stroke', 'white')
      .attr('stroke-width', 2);

    // Top Goal (Net)
    svg
      .append('rect')
      .attr('x', xScale((pitchWidth - goalWidth) / 2))
      .attr('y', yScale(0))
      .attr(
        'width',
        xScale((pitchWidth + goalWidth) / 2) -
          xScale((pitchWidth - goalWidth) / 2)
      )
      .attr('height', yScale(0) - yScale(-1))
      .attr('fill', 'white')
      .attr('stroke', 'white')
      .attr('stroke-width', 2);

    // Bottom Goal (Net)
    svg
      .append('rect')
      .attr('x', xScale((pitchWidth - goalWidth) / 2))
      .attr('y', yScale(pitchLength - 1))
      .attr(
        'width',
        xScale((pitchWidth + goalWidth) / 2) -
          xScale((pitchWidth - goalWidth) / 2)
      )
      .attr('height', yScale(pitchLength + 2) - yScale(pitchLength))
      .attr('fill', 'white')
      .attr('stroke', 'white')
      .attr('stroke-width', 2);
  }
}
