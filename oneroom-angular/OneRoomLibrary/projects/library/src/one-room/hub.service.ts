import { Injectable, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpTransportType } from '@aspnet/signalr';
import { SignalRCoreService } from './abstracts/signalr/signalr.core.service';
import { SignalrMethod, SignalrMethods } from './abstracts/signalr/signalr.abstract.service';
import { User } from './model/user';
import { Team } from './model/team';

interface MonitoringMethods extends SignalrMethods {
  UpdateGameState: SignalrMethod;
  UpdateUsers: SignalrMethod;
  UpdateTeams: SignalrMethod;
  DeleteTeams: SignalrMethod;
  UpdateUser: SignalrMethod;
  CreateUser: SignalrMethod;
  DeleteUser: SignalrMethod;
  HighlightUser: SignalrMethod;
  HasCompletedChallenge: SignalrMethod;
}

@Injectable({
  providedIn: 'root'
})
export class HubService extends SignalRCoreService<MonitoringMethods> {

  // tslint:disable-next-line:variable-name
  private _refreshGameState = new EventEmitter<number>();
  public refreshGameState  = this._refreshGameState.asObservable();

  // tslint:disable-next-line:variable-name
  private _refreshUserList = new EventEmitter<User[]>();
  public refreshUserList  = this._refreshUserList.asObservable();

  // tslint:disable-next-line:variable-name
  private _refreshTeamList = new EventEmitter<Team[]>();
  public refreshTeamList  = this._refreshTeamList.asObservable();

  // tslint:disable-next-line:variable-name
  private _deleteTeamList = new EventEmitter<number>();
  public deleteTeamList = this._deleteTeamList.asObservable();

  // tslint:disable-next-line:variable-name
  private _highlightUser = new EventEmitter<any>();
  public highlightUser  = this._highlightUser.asObservable();

  // tslint:disable-next-line:variable-name
  private _refreshUser = new EventEmitter<any>();
  public refreshUser = this._refreshUser.asObservable();

  // tslint:disable-next-line:variable-name
  private _createUser = new EventEmitter<any>();
  public createUser = this._createUser.asObservable();

  // tslint:disable-next-line:variable-name
  private _deleteUser = new EventEmitter<any>();
  public deleteUser = this._deleteUser.asObservable();

  // tslint:disable-next-line:variable-name
  private _finishGame = new EventEmitter<any>();
  public finishGame = this._finishGame.asObservable();

  // tslint:disable-next-line:variable-name
  private _hasCompletedChallenge = new EventEmitter<any>();
  public hasCompletedChallenge = this._hasCompletedChallenge.asObservable();

  protected url = '/LeaderBoardHub';
  protected transport = HttpTransportType.LongPolling;
  protected connectionTryDelay = 10000;

  protected methods: MonitoringMethods = {
    UpdateGameState: (state) => this._refreshGameState.emit(state),
    UpdateUsers: (Users) => this._refreshUserList.emit(Users),
    UpdateTeams: (result) => this._refreshTeamList.emit(result),
    DeleteTeams: (result) => this._deleteTeamList.emit(result),
    UpdateUser: (result) => this._refreshUser.emit(result),
    CreateUser: (result) => this._createUser.emit(result),
    DeleteUser: (result) => this._deleteUser.emit(result),
    HighlightUser: (userId) => this._highlightUser.emit(userId),
    FinishGame: (teamId) => this._finishGame.emit(teamId),
    HasCompletedChallenge: (teamId, challengeId) => this._hasCompletedChallenge.emit({teamId, challengeId}),
  };

  constructor() {
    super();
  }

  public joinGroup(groupName: string): Observable<any> {
    if (localStorage.getItem('endpoint')) {
      this.baseUrl = localStorage.getItem('endpoint').replace('/api', '');
    }
    return this.send('JoinGroupAsync', groupName);
  }

  public leaveGroup(groupName: string): Observable<any> {
    if (localStorage.getItem('endpoint')) {
      this.baseUrl = localStorage.getItem('endpoint').replace('/api', '');
    }
    return this.send('LeaveGroupAsync', groupName);
  }

  public run(): Observable<any> {
    if (localStorage.getItem('endpoint')) {
      this.baseUrl = localStorage.getItem('endpoint').replace('/api', '');
    }
    return this.start();
  }

  public stopService() {
    this.stop();
    return true;
  }

}
