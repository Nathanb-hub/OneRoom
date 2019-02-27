import { Component, OnInit } from '@angular/core';
import { PersonGroupService } from '../services/cognitive/person-group.service';
import { MatSnackBar } from '@angular/material';
import { GameService } from '../services/OnePoint/game.service';
import { Game } from '../services/OnePoint/model/game';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  // coordinator
  endPoint: string;

  // game
  game: Game = new Game();
  // Face
  subscriptionKey: string;
  endPointCognitive: string;
  callFaceStatus = true;
  // Custom vision
  subscriptionKeyCustomVision: string;
  endPointCustomVision: string;
  callCustomVisionStatus = true;

  constructor(
    private snackBar: MatSnackBar,
    private groupService: PersonGroupService,
    private gameService: GameService) {}

  ngOnInit() {
    // game
    this.game.groupName = '';
    if (localStorage.getItem('gameData')) {
      this.game = JSON.parse(localStorage.getItem('gameData'));
    }
    // coordinator
    this.endPoint = localStorage.getItem('endpoint');
    // face
    this.endPointCognitive = localStorage.getItem('endpointCognitive');
    this.subscriptionKey = localStorage.getItem('subscriptionKey');
    this.callFaceStatus = localStorage.getItem('cognitiveStatus') === 'true' ? true : false;
    // custom vision
    this.subscriptionKeyCustomVision = localStorage.getItem('subscriptionKeyCustomVision');
    this.endPointCustomVision = localStorage.getItem('endPointCustomVision');
    this.callCustomVisionStatus = localStorage.getItem('customVisionStatus') === 'true' ? true : false;
  }

  saveCoordinatorSettings(): void {
    localStorage.setItem('endpoint', this.endPoint);
    this.snackBar.open('Settings updated', 'Ok', {
      duration: 2000
    });
  }

  saveFaceSettings(): void {
    localStorage.setItem('endpointCognitive', this.endPointCognitive);
    localStorage.setItem('subscriptionKey', this.subscriptionKey);
    this.snackBar.open('Settings updated', 'Ok', {
      duration: 2000
    });
  }

  getGame() {
    const resGame$ = this.gameService.getGame(this.game.groupName);
    resGame$.subscribe( (game: Game) => {
      this.game = game;
      localStorage.setItem('gameData', JSON.stringify(game));
      this.snackBar.open('Game fetched', 'Ok', {
        duration: 2000
      });
      if (game.config) {
        console.log('auto Config');
        console.log(game.config);
        // face
        this.endPointCognitive = game.config.faceEndpoint;
        this.subscriptionKey = game.config.faceKey;
        this.saveFaceSettings();
        // custom vision
        this.endPointCustomVision  = game.config.visionEndpoint;
        this.subscriptionKeyCustomVision = game.config.visionKey;
        this.saveCustomVisionSettings();
      }
    });
  }

  saveCustomVisionSettings(): void {
    localStorage.setItem('endPointCustomVision', this.endPointCustomVision);
    localStorage.setItem('subscriptionKeyCustomVision', this.subscriptionKeyCustomVision);
    this.snackBar.open('Settings updated', 'Ok', {
      duration: 2000
    });
  }

  toggleFaceCalls() {
    const status = localStorage.getItem('cognitiveStatus');
    if (status === 'true') {
      localStorage.setItem('cognitiveStatus', 'false');
      this.snackBar.open('Calls face disabled', 'Ok', {
        duration: 2000
      });
    } else {
      localStorage.setItem('cognitiveStatus', 'true');
      this.snackBar.open('Calls face enabled', 'Ok', {
        duration: 2000
      });
    }
  }

  toggleCustomVisionCalls() {
    const status = localStorage.getItem('customVisionStatus');
    if (status === 'true') {
      localStorage.setItem('customVisionStatus', 'false');
      this.snackBar.open('Calls custom vision disabled', 'Ok', {
        duration: 2000
      });
    } else {
      localStorage.setItem('customVisionStatus', 'true');
      this.snackBar.open('Calls custom vision enabled', 'Ok', {
        duration: 2000
      });
    }
  }


}