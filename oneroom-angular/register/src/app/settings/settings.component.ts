import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { Game, GameService, HubService } from '@oneroomic/oneroomlibrary';
import { NotifierService } from 'angular-notifier';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit, OnDestroy {

  // coordinator
  endPoint: string;

  // current game
  game: Game;

  // other games
  games: Game[];

  // status
  callFaceStatus = true;
  callCustomVisionStatus = true;

  // connection hub
  private hubServiceSub;

  constructor(
    private notifierService: NotifierService,
    private gameService: GameService,
    private hubService: HubService) {
    }

  ngOnInit() {

    // init vars

    this.games = [];

    // coordinator

    if (localStorage.getItem('endpoint')) {
      this.endPoint = localStorage.getItem('endpoint');
      // load available games from coordinator
      this.loadGames();
      // attach to hub if endpoint is set
      this.hubServiceSub = this.hubService.run().subscribe();
    } else {
      this.endPoint = '';
    }

    // enable / disable custom vision

    if (localStorage.getItem('customVisionStatus')) {
      this.callCustomVisionStatus = localStorage.getItem('customVisionStatus') === 'true' ? true : false;
    } else {
      this.callCustomVisionStatus = false;
    }

    // enable / disable face

    if (localStorage.getItem('cognitiveStatus')) {
      this.callFaceStatus = localStorage.getItem('cognitiveStatus') === 'true' ? true : false;
    } else {
      this.callFaceStatus = false;
    }

    // game

    if (localStorage.getItem('gameData')) {
      this.game = JSON.parse(localStorage.getItem('gameData'));
    } else {
      this.game = new Game();
      this.callCustomVisionStatus = false;
      this.callFaceStatus = false;
      this.game.groupName = null;
    }
  }

  loadGames() {
    this.gameService.getGames().subscribe(
        (games) => {
          this.notifierService.notify('success', games.length + ' parties trouvées');
          this.games = games;
        },
        (err) => {
          console.log(err);
        }
      );
  }

  saveCoordinatorSettings(): void {
    localStorage.setItem('endpoint', this.endPoint);
    this.loadGames();
    this.notifierService.notify('success', 'Parametres mis à jour');
    this.hubServiceSub = this.hubService.run().subscribe();
  }

  getGame() {
    const resGame$ = this.gameService.getGame(this.game.groupName);
    resGame$.subscribe( (game: Game) => {
      // leave old group
      if (this.game.gameId !== undefined && this.game.gameId !== null && this.hubService.connected) {
        this.hubService.leaveGroup(this.game.gameId.toString());
      }
      this.game = game;
      // localStorage.setItem('gameData', JSON.stringify(game));
      this.notifierService.notify('success', 'Partie récuperée');
      // join new group
      this.hubService.joinGroup(this.game.gameId.toString());
      if (game.config) {
        console.log('Config detected');
        this.saveConfiguration();
      } else {
        console.log('No Config');
      }
    });
  }

  saveConfiguration() {
    localStorage.setItem('gameData', JSON.stringify(this.game));
    // saving face settings
    localStorage.setItem('endpointCognitive', this.game.config.faceEndpoint);
    localStorage.setItem('subscriptionKey', this.game.config.faceKey);
    // saving refresh rate
    localStorage.setItem('refreshRate', this.game.config.refreshRate + '');
    // saving custom vision
    // hairlength
    localStorage.setItem('endPointCustomVision', this.game.config.visionEndpoint);
    localStorage.setItem('subscriptionKeyCustomVision', this.game.config.visionKey);
    // skincolor
    localStorage.setItem('subscriptionKeyCustomVisionSkinColor', this.game.config.visionEndpointSkinColor);
    localStorage.setItem('endPointCustomVisionSkinColor', this.game.config.visionKeySkinColor);

    this.notifierService.notify('success', 'Configuration sauvée');
  }

  toggleFaceCalls() {
    const status = localStorage.getItem('cognitiveStatus');
    if (status === 'true') {
      localStorage.setItem('cognitiveStatus', 'false');
      this.notifierService.notify('success', 'Appels face désactivé');
    } else {
      localStorage.setItem('cognitiveStatus', 'true');
      this.notifierService.notify('success', 'Appels face activé');
    }
  }

  toggleCustomVisionCalls() {
    const status = localStorage.getItem('customVisionStatus');
    if (status === 'true') {
      localStorage.setItem('customVisionStatus', 'false');
      this.notifierService.notify('success', 'Appels custom vision désactivé');
    } else {
      localStorage.setItem('customVisionStatus', 'true');
      this.notifierService.notify('success', 'Appels custom vision activé');
    }
  }

  ngOnDestroy(): void {
    if (this.hubServiceSub) {
      this.hubServiceSub.unsubscribe();
    }
  }

}
