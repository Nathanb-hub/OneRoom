import { Component, OnInit } from '@angular/core';
import { Team, Game, GameService, TeamService } from '@oneroomic/oneroomlibrary';
import { NotifierService } from 'angular-notifier';


@Component({
  selector: 'app-teams',
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.css']
})
export class TeamsComponent implements OnInit {

  nbTeams: number;
  teams: Team[] = [];
  games: Game[];
  // column order
  displayedColumns: string[] = ['Name', 'Color', 'Users'];

  constructor(private gameService: GameService,
              private teamService: TeamService,
              private notifierService: NotifierService) { }

  ngOnInit() {
    this.teams = [];
    this.games = [];
    this.nbTeams = 4;
    this.loadGames();
  }

  loadGames() {
    this.gameService.getGames().subscribe( (games) => {
        this.notifierService.notify( 'success', games.length + ' games found' );
        this.games = games;
      },
      (err) => {
        this.notifierService.notify( 'error', err.error );
      }
    );
  }

  loadTeams(game: Game) {
    // set localstorage game
    localStorage.setItem('gameData', JSON.stringify(game));
    this.teamService.getTeamsByGame(game.gameId).subscribe(
        (teams) => {
          this.snackBar.open(teams.length + ' équipe(s)', 'Ok', {
            duration: 1000
          });
          this.teams = teams;
        },
        (err) => {
          console.log(err);
        }
      );
  loadTeams(idGame: number = null) {
    if (idGame !== null) {
      localStorage.setItem('gameData', JSON.stringify(this.games.find(g => g.gameId === idGame)));
    }
    this.teamService.getTeamsByGame(idGame).subscribe( (teams) => {
        this.notifierService.notify( 'success', teams.length + ' teams retrived' );
        this.teams = teams;
      },
      (err) => {
        this.notifierService.notify( 'error', err.error );
      }
    );
  }

  createTeam() {
    this.teamService.createTeam(this.nbTeams).subscribe( (teams: Team[]) => {
        this.notifierService.notify( 'success', 'Teams Created' );
        this.teams = teams;
      },
      (err) => {
        this.notifierService.notify( 'error', err.error );
      }
    );
  }

  deleteTeams() {
    this.teamService.deleteTeams().subscribe( () => {
        this.notifierService.notify( 'warning', 'Teams deleted' );
        this.teams = [];
      },
      (err) => {
        this.notifierService.notify( 'error', err.error );
      }
    );
  }

  getTeamColor(color: string) {
    if (color) {
      return 'rgb(' + color + ')';
    }
  }
}
