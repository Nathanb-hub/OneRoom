import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';
import { User } from './model/user';
import { EndPointGetterService } from '../utilities/end-point-getter.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private headers: HttpHeaders;

  constructor(private http: HttpClient, private EPGetter: EndPointGetterService) {
    this.headers = new HttpHeaders({
      'Content-Type' : 'application/json'
      // 'Access-Control-Allow-Origin': 'http://localhost:4200/welcome',
      // 'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
      // 'Access-Control-Allow-Headers': '*',
    });

  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.EPGetter.getEndPointUrlWithId() + '/Users', { headers: this.headers })
      .pipe(catchError(this.handleError));
  }

  addUser(user: User): Observable<boolean> {
    // tslint:disable-next-line:object-literal-shorthand
    return this.http.post<boolean>(this.EPGetter.getEndPointUrlWithId() + '/Users', user, { headers: this.headers });
  }

  deleteUser(userId: string): Observable<User> {
    return this.http.delete<User>(this.EPGetter.getEndPointUrlWithId() + '/Users/' + userId, { headers: this.headers });
  }

  updateAvatar(userId: string, urlAvatar: string): Observable<any> {
    return this.http.put<any>(this.EPGetter.getEndPointUrlWithId() + '/Users/'
        + userId, {url : urlAvatar.toString()}, { headers: this.headers });
  }

  private handleError(err: HttpErrorResponse) {
    let errorMessage = '';
    if (err.error instanceof ErrorEvent) {
      errorMessage = 'An error occured:' + err.error.message;
    } else {
      errorMessage = 'server returnerd code ' + err.status + ' error message is: ' + err.message;
    }
    console.log(errorMessage);
    return throwError(errorMessage);
  }

}