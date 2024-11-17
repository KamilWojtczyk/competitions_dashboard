import { Events } from '../../features/competitions/models/events.model';
import {
  PlayerDefensiveStats,
  PlayerPassStats,
  TeamTopPlayerStats,
} from '../../features/competitions/models/player.model';
import { isProgressivePass } from './isprogressive-pass.func';

export function computeTeamTopPlayerStats(
  events: Events[],
  teamName: string
): TeamTopPlayerStats {
  const passStatsMap: Map<number, PlayerPassStats> = new Map();
  const defensiveStatsMap: Map<number, PlayerDefensiveStats> = new Map();

  events.forEach((event) => {
    const playerId = event.player_id;
    const playerName = event.player;

    // Initialize pass stats
    if (!passStatsMap.has(playerId)) {
      passStatsMap.set(playerId, {
        playerId,
        playerName,
        team: teamName,
        successfulPasses: 0,
        progressivePasses: 0,
        keyPasses: 0,
      });
    }

    // Initialize defensive stats
    if (!defensiveStatsMap.has(playerId)) {
      defensiveStatsMap.set(playerId, {
        playerId,
        playerName,
        team: teamName,
        tackles: 0,
        interceptions: 0,
        fouls: 0,
        ballRecoveries: 0,
        clearances: 0,
        totalDefensiveActions: 0,
      });
    }

    // Process passes
    if (event.type === 'Pass') {
      // Check if pass was successful
      if (!event.pass_outcome) {
        const passStats = passStatsMap.get(playerId)!;

        // Check for key pass first
        if (event.pass_shot_assist) {
          passStats.keyPasses++;
        }
        // Else, check for progressive pass
        else if (isProgressivePass(event)) {
          passStats.progressivePasses++;
        }
        // Else, it's a normal successful pass
        else {
          passStats.successfulPasses++;
        }
      }
    }
    // Process defensive actions
    const defensiveStats = defensiveStatsMap.get(playerId)!;

    // Tackles
    if (
      event.type === 'Duel' &&
      event.duel_type === 'Tackle' &&
      event.duel_outcome === 'Won'
    ) {
      defensiveStats.tackles++;
      defensiveStats.totalDefensiveActions++;
    }

    // Interceptions
    if (event.type === 'Interception' || event.interception_outcome) {
      defensiveStats.interceptions++;
      defensiveStats.totalDefensiveActions++;
    }

    // Fouls
    if (event.type === 'Foul Committed') {
      defensiveStats.fouls++;
      defensiveStats.totalDefensiveActions++;
    }

    // Ball Recoveries
    if (event.type === 'Ball Recovery') {
      defensiveStats.ballRecoveries++;
      defensiveStats.totalDefensiveActions++;
    }

    // Clearances
    if (event.type === 'Clearance') {
      defensiveStats.clearances++;
      defensiveStats.totalDefensiveActions++;
    }
  });

  // Convert pass stats map to array and sort
  const passStatsArray = Array.from(passStatsMap.values());
  passStatsArray.sort((a, b) => b.successfulPasses - a.successfulPasses);
  const topPassers = passStatsArray.slice(0, 10);

  // Get player with most successful passes
  const topPasserPlayer = passStatsArray[0];

  // Convert defensive stats map to array and sort
  const defensiveStatsArray = Array.from(defensiveStatsMap.values());
  defensiveStatsArray.sort(
    (a, b) => b.totalDefensiveActions - a.totalDefensiveActions
  );
  const topDefenders = defensiveStatsArray.slice(0, 10);

  // Get player with most defensive actions
  const topDefenderPlayer = defensiveStatsArray[0];

  return {
    team: teamName,
    topPassers,
    topDefenders,
    topPasserPlayer,
    topDefenderPlayer,
  } as TeamTopPlayerStats;
}
