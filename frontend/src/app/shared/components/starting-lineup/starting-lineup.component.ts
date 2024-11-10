import { Component, input, OnInit } from '@angular/core';
import { Events } from '../../../features/competitions/models/events.model';
import { NgClass } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';

interface Player {
  id: string;
  name: string;
  jerseyNumber: string;
}

@Component({
  selector: 'app-starting-lineup',
  templateUrl: './starting-lineup.component.html',
  styleUrls: ['./starting-lineup.component.scss'],
  standalone: true,
  imports: [NgClass, MatTooltipModule],
})
export class StartingLineupComponent implements OnInit {
  events = input.required<Events[]>();
  teamName = input.required<string>();
  isHomeTeam = input.required<boolean>();

  startingPlayers: Player[] = [];

  ngOnInit(): void {
    this.extractStartingLineup();
  }

  extractStartingLineup(): void {
    const lineupEvent = this.events().find(
      (event) => event.team === this.teamName() && event.type === 'Starting XI'
    );

    if (lineupEvent && lineupEvent.tactics && lineupEvent.tactics.lineup) {
      this.startingPlayers = lineupEvent.tactics.lineup.map(
        (playerInfo: any) => {
          return {
            id: playerInfo.player.id.toString(),
            name: playerInfo.player.name,
            jerseyNumber: playerInfo.jersey_number.toString(),
          };
        }
      );
    } else {
      console.warn(`No starting lineup found for team: ${this.teamName()}`);
    }
  }
}
