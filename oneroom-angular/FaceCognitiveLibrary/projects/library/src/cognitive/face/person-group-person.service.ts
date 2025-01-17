import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FaceRectangle, PersistedFace, PersistedPerson, Person } from './face-models';
import { EndPointGetterService } from '../../public_api';

@Injectable({
  providedIn: 'root'
})
export class PersonGroupPersonService {

  private endPoint: string;
  private subscriptionKey: string;
  private headers: HttpHeaders;

  constructor(
    private http: HttpClient,
    private endPointGetter: EndPointGetterService) {
    this.set(endPointGetter.getFaceEndPointUrl(), endPointGetter.getFaceSubscriptionKey());
  }

  set(endPoint: string, key: string, recognitionModel = 'recognition_02') {
    this.endPoint = endPoint;
    this.subscriptionKey = key;
    this.headers = new HttpHeaders({
      'Access-Control-Allow-Origin': 'http://localhost:4200',
      'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': '*',
      'Ocp-Apim-Subscription-Key' : this.subscriptionKey,
      recognitionModel,
      returnRecognitionModel: 'true'
    });
  }

  /*
  Add a face image to a person into a person group for face identification or verification.
  */
  // tslint:disable-next-line:max-line-length
  addFace(personGroupId: string, personId: string, stream: Blob, targetFace: FaceRectangle = null, userData: string = null): Observable<PersistedFace> {

    const customHeaders = this.headers.set('Content-Type', 'application/octet-stream');
    // customHeaders = customHeaders.set('Content-Length', contentLength + '' );

    const httpOptions = {
      headers: customHeaders
    };

    let parameters = '?';

    if (targetFace !== null) {
        parameters += 'targetFace=' +  targetFace.left + ',' + targetFace.top + ',' + targetFace.width + ',' + targetFace.height + '&';
    }

    if (userData !== null) {
        parameters += 'userData=' + userData;
    }

    // tslint:disable-next-line:max-line-length
    return this.http.post<PersistedFace>(this.endPoint + '/persongroups/' + personGroupId.toLowerCase() + '/persons/' + personId + '/persistedFaces' + parameters, stream, httpOptions);
  }

  /*
  Create a new person in a specified person group
  */
  create(personGroupId: string, name: string, userData: string = ''): Observable<PersistedPerson> {

    const httpOptions = {
      headers: this.headers
    };

    const body = {
      name: name + '',
      userData : userData + ''
    };

    // tslint:disable-next-line:max-line-length
    return this.http.post<PersistedPerson>(this.endPoint + '/persongroups/' + personGroupId.toLowerCase() + '/persons', body, httpOptions);
  }

  /*
  Delete an existing person from a person group. All stored person data, and face images in the person entry will be deleted.
  */
  delete(personGroupId: string, personId: string): Observable<any> {

    const httpOptions = {
      headers: this.headers
    };

    return this.http.delete(this.endPoint + '/persongroups/' + personGroupId.toLowerCase() + '/persons/' + personId, httpOptions);
  }

  /*
  Delete a face from a person in a person group. Face data and image related to this face entry will be also deleted.
  */
  deleteFace(personGroupId: string, personId: string, persistedFaceId: string): Observable<any> {

    const httpOptions = {
      headers: this.headers
    };

    // tslint:disable-next-line:max-line-length
    return this.http.delete(this.endPoint + '/persongroups/' + personGroupId.toLowerCase() + '/persons/' + personId + '/persistedFaces/' + persistedFaceId, httpOptions);
  }

  /*
  Retrieve a person's name and userData, and the persisted faceIds representing the registered person face image.
  */
  get(personGroupId: string, personId: string): Observable<Person> {

    const httpOptions = {
      headers: this.headers
    };

    return this.http.get<Person>(this.endPoint + '/persongroups/' + personGroupId.toLowerCase() + '/persons/' + personId, httpOptions);
  }

  /*
  Retrieve person face information. The persisted person face is specified by its personGroupId, personId and persistedFaceId.
  */
  getFace(personGroupId: string, personId: string, persistedFaceId: string): Observable<PersistedFace> {

    const httpOptions = {
      headers: this.headers
    };

    // tslint:disable-next-line:max-line-length
    return this.http.get<PersistedFace>(this.endPoint + '/persongroups/' + personGroupId.toLowerCase() + '/persons/' + personId + '/persistedFaces/' + persistedFaceId, httpOptions);
  }

  /*
  List all persons’ information in the specified person group.
  */
  list(personGroupId: string, startPersonGroupId: string = null, topCount: number = 1000): Observable<Person[]> {

    const httpOptions = {
      headers: this.headers
    };

    let parameters = '?';

    if (startPersonGroupId !== null) {
        parameters += 'start=' + startPersonGroupId.toLowerCase() + '&';
    }

    parameters += 'top=' + topCount;


    // tslint:disable-next-line:max-line-length
    return this.http.get<Person[]>(this.endPoint + '/persongroups/' + personGroupId.toLowerCase() + '/persons' + parameters, httpOptions);
  }

  /*
  Update name or userData of a person.
  */
  update(personGroupId: string, personId: string, name: string): Observable<any> {

    const httpOptions = {
      headers: this.headers
    };

    // tslint:disable-next-line:max-line-length
    return this.http.patch(this.endPoint + '/persongroups/' + personGroupId.toLowerCase() + '/persons/' + personId, {name: name + ''}, httpOptions);
  }

  /*
  Update a person persisted face's userData field.
  */
  updateFace(personGroupId: string, personId: string, persistedFaceId: string, userData: string): Observable<any> {

    const httpOptions = {
      headers: this.headers
    };

    // tslint:disable-next-line:max-line-length
    return this.http.patch(this.endPoint + '/persongroups/' + personGroupId.toLowerCase() + '/persons/' + personId + '/persistedFaces/' + persistedFaceId, { userData: userData + ''}, httpOptions);
  }
}
