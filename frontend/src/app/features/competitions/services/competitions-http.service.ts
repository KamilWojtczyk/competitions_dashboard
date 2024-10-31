import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Competition } from '../models/competition.model';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Match } from '../models/match.model';
import { TopPlayer } from '../models/top-players.model';

@Injectable({ providedIn: 'root' })
export class CompetitionsHttpService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getCompetitions(): Observable<Competition[]> {
    return this.http.get<Competition[]>(`${this.apiUrl}/competitions`);
  }

  getMatches(competition_id: number, season_id: number): Observable<Match[]> {
    const params = new HttpParams()
      .set('competition_id', competition_id?.toString())
      .set('season_id', season_id?.toString());

    return this.http.get<Match[]>(`${this.apiUrl}/matches`, { params });
  }

  getTopScorers(
    country: string,
    division: string,
    season: string,
    gender: string
  ): Observable<TopPlayer[]> {
    const params = new HttpParams()
      .set('country', country)
      .set('division', division)
      .set('season', season)
      .set('gender', gender);

    return this.http.get<TopPlayer[]>(`${this.apiUrl}/top_scorers`, {
      params,
    });
  }

  getTopAssists(
    country: string,
    division: string,
    season: string,
    gender: string
  ): Observable<TopPlayer[]> {
    const params = new HttpParams()
      .set('country', country)
      .set('division', division)
      .set('season', season)
      .set('gender', gender);

    return this.http.get<TopPlayer[]>(`${this.apiUrl}/top_assists`, {
      params,
    });
  }
}
