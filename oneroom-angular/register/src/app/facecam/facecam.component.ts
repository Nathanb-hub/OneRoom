import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import * as faceapi from 'face-api.js';
// tslint:disable-next-line:max-line-length
import { Group, FaceProcessService, CustomVisionPredictionService, ImagePrediction } from '@oneroomic/facecognitivelibrary';
import { MatDialog } from '@angular/material';
import { Subject } from 'rxjs';
// tslint:disable-next-line:max-line-length
import { User, UserService, FaceService, GameService, Game, Face, GlassesType, GameState, HubService } from '@oneroomic/oneroomlibrary';
import { FaceMatcher } from 'face-api.js';
import { NotifierService } from 'angular-notifier';
// patch electron
faceapi.env.monkeyPatch({
  Canvas: HTMLCanvasElement,
  Image: HTMLImageElement,
  // tslint:disable-next-line:object-literal-shorthand
  ImageData: ImageData,
  Video: HTMLVideoElement,
  createCanvasElement: () => document.createElement('canvas'),
  createImageElement: () => document.createElement('img')
});

@Component({
  selector: 'app-facecam',
  templateUrl: './facecam.component.html',
  styleUrls: ['./facecam.component.css']
})
export class FacecamComponent implements OnInit, OnDestroy {

  /* input stream devices */
  /* selector devices */
  public selectors;
  // containers
  @ViewChild('canvas2')
  public overlay;
  // canvas 2D context
  private ctx;
  @ViewChild('webcam')
  public video;

  // stream video
  private stream;
  // face detections options
  private options;

  // loading models and stream not available
  displayStream = 'none';
  isLoading = true;

  private detectId;

  private lock = false;

  // preview
  lastUsers: User[];

  // alert
  alertContainer = false;
  alertMessage = '';

  // state game
  stateContainer = false;
  stateMessage = '';

  // signalR
  private hubServiceSub;
  private gameSub;

  // current game
  private game: Game;
  private group: Group;

  // refresh rate
  refreshRate: number;

  // camid
  videoSource;

  // start processing stream
  private modelsReady = false;

  private faceCallsDisabled = false;
  private customVisionCallsDisabled = false;

  private faceMatcher: FaceMatcher;
  private descriptors: Float32Array[];
  private captureStorage = [];
  private timerData;
  private timerLock;

  private observableLock;

  constructor(
    public dialog: MatDialog,
    private faceProcess: FaceProcessService,
    private userService: UserService,
    private faceService: FaceService,
    private customVisionPredictionService: CustomVisionPredictionService,
    private hubService: HubService,
    private gameService: GameService,
    private notifierService: NotifierService) {
      this.opencam();
      this.loadModels();
    }

  ngOnInit() {
    // init lock
    this.lastUsers = [];
    this.alertContainer = false;
    this.stateContainer = false;
    this.lock = false;

    this.descriptors = [];
    this.timerData = setInterval(
      val => {
      console.log('sending data');
      // send data to face
      this.sendData();
    }, 5000);
    // last video source

    if (localStorage.getItem('videoSource')) {
      this.videoSource = localStorage.getItem('videoSource');
    }

    // active / disable custom vision

    if (localStorage.getItem('cognitiveStatus')) {
      this.faceCallsDisabled = localStorage.getItem('cognitiveStatus') === 'false' ? false : true;
    } else {
      this.faceCallsDisabled = false;
    }

    if (localStorage.getItem('customVisionStatus')) {
      this.customVisionCallsDisabled = localStorage.getItem('customVisionStatus') === 'false' ? false : true;
    } else {
      this.customVisionCallsDisabled = false;
    }

    // save canvas context
    this.ctx = this.overlay.nativeElement.getContext('2d');

    // game context
    if (localStorage.getItem('gameData')) {
      this.game = JSON.parse(localStorage.getItem('gameData'));
      // set du groupe
      this.group = new Group();
      this.group.personGroupId = this.game.groupName;
      this.group.name = this.game.groupName;
      this.group.userData = this.game.groupName;

      // join new group
      if (localStorage.getItem('endpoint')) {
        this.hubServiceSub = this.hubService.run().subscribe(
          () => this.hubService.joinGroup(this.game.gameId.toString()).subscribe(
            () => {
              // attach to hub and a game
              this.notifierService.notify( 'success', 'Ce client est relié à une partie');
            },
            () => {
              // failed to attach
              this.notifierService.notify( 'error', 'Ce client n\'a pas réussi à se lier à une partie');
            }
          ),
          () => this.notifierService.notify( 'error', 'Connexion au hub impossible')
        );

        // new game state
        this.gameSub = this.hubService.refreshGameState.subscribe(
          (gameId) => {
          if (gameId === this.game.gameId) {
            this.refreshGameState(this.game);
          }
          },
          (err) => {
          console.log(err);
        });

        this.refreshGameState(this.game);
      }
    } else {
      this.game = null;
      this.group = null;
      this.faceCallsDisabled = false;
      this.customVisionCallsDisabled = false;
    }
  }

  private async loadModels() {
    this.notifierService.notify( 'info', 'Chargement des modèles');

    this.options = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.85});
    
    await faceapi.loadSsdMobilenetv1Model('/assets/models').then(
        async () => await faceapi.loadFaceLandmarkModel('/assets/models')
        ).then( async () => await faceapi.loadFaceRecognitionModel('/assets/models')).then(
          async () => {
            this.modelsReady = true;
            this.notifierService.notify( 'info', 'Modèles prêt');
          }
        );
  }

  initStreamDetection() {
    if (!this.stream) {
      this.startStream();
      if (!this.detectId) {
        this.detectId = setInterval( () => {
          // state still registering
          if (!this.stateContainer) {
            if (this.modelsReady === true) {
              this.detectFaces();
            }
          }
        }, this.refreshRate ? this.refreshRate : 2000);
      }
    }
  }

  sendData() {
      this.lock = true;
      if (this.captureStorage.length > 0) {
        this.notifierService.notify('default', 'Envoi de ' + this.captureStorage.length + ' image(s)');
      }
       // lock capture
      this.timerLock = setTimeout(
        (val) => {
          this.lock = false;
          this.captureStorage = [];
          this.faceMatcher = null;
        }
      , 1500 * this.captureStorage.length + 100);

      this.captureStorage.forEach(
        (canvas) => {
          this.imageCapture(canvas);
        }
      );

  }

  public async detectFaces() {
        this.clearOverlay();

        if (this.lock === false) {

        const fullFaceDescriptions = await faceapi
                                    .detectAllFaces(this.video.nativeElement, this.options)
                                    .withFaceLandmarks()
                                    .withFaceDescriptors();

        if (fullFaceDescriptions.length > 0) {

          const detectionsArray = fullFaceDescriptions.map(fd => fd.detection);
          await faceapi.drawDetection(this.overlay.nativeElement, detectionsArray, { withScore: false });
          const imgData = faceapi.createCanvasFromMedia(this.video.nativeElement);

          if (this.faceMatcher) {
            fullFaceDescriptions.map(f => f.descriptor).forEach(
              fd => {
                const res = this.faceMatcher.findBestMatch(fd);
                console.log(res.label);
                if (res.label === 'unknown') {
                  // store image
                  // this.imageCapture(imgData);
                  if (this.descriptors.length > 10) {
                    // send data if more than 10 persons
                    this.sendData();
                  } else {
                    this.captureStorage.push(imgData);
                    this.descriptors.push(fd);
                    this.faceMatcher = new faceapi.FaceMatcher(this.descriptors);
                  }
                }
              }
            );
          } else {
            this.faceMatcher = new faceapi.FaceMatcher(fullFaceDescriptions.map(f => f.descriptor));
            this.captureStorage.push(imgData);
          }

        }

        if (this.displayStream === 'none') {
          this.displayStream = 'block';
          this.isLoading = false;
        }

      }
  }

  // clear canvas overlay
  private clearOverlay() {
    this.ctx.clearRect(0, 0, this.overlay.nativeElement.width, this.overlay.nativeElement.height);
    this.ctx.stroke();
  }

  /* initialize capture webcam */
  private opencam() {
    navigator.mediaDevices
              .enumerateDevices()
              .then((d) => {
                this.selectors = [];
                this.selectors = this.getCaptureDevices(d);
                // init stream
                this.initStreamDetection();
              })
              .catch(this.handleError);
  }

   /* Start or restart the stream using a specific videosource and inject it in a container */
  public startStream(videoSource = null) {

    if (navigator.mediaDevices) {
        // select specific camera on mobile
        if (this.selectors.map(s => s.id).indexOf(this.videoSource) === -1) {
          // check if prefered cam is available in the list
          this.videoSource = null;
        }
        this.videoSource = videoSource ? videoSource : (this.videoSource ? this.videoSource : this.selectors[0].id);
        localStorage.setItem('videoSource', this.videoSource);
        // access the web cam
        navigator.mediaDevices.getUserMedia({
            audio : false,
            video: {
                // selfie mode
                deviceId: this.videoSource ? { exact: this.videoSource } : undefined
            }
        })
            // permission granted:
            .then( (stream) => {
                this.video.nativeElement.addEventListener('loadedmetadata', () => {
                  // set canvas size = video size when known
                  this.overlay.nativeElement.width = this.video.nativeElement.videoWidth;
                  this.overlay.nativeElement.height = this.video.nativeElement.videoHeight;
                });
                this.stream = stream;
                this.alertContainer = false;
                // on getUserMedia
                this.video.nativeElement.srcObject = this.stream;
            })
            // permission denied:
            .catch( (error) => {
              console.log('Camera init failed : ' + error.name);
              this.alertContainer = true;
              this.alertMessage = 'Could not access the camera. Error: ' + error.name;
              this.notifierService.notify('error', 'Caméra inaccessible');
            });
    }
    return this.video;
  }

   /* Detect possible capture devices */
  private getCaptureDevices(deviceInfos) {
    // Handles being called several times to update labels. Preserve values.
    const videouputs = [];
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < deviceInfos.length; i++) {
        if (deviceInfos[i].kind === 'videoinput') {
          videouputs.push({ id: deviceInfos[i].deviceId, label: deviceInfos[i].label});
        }
    }

    return videouputs;
  }

  /* handles all type of errors from usermedia API */
  private handleError(error) {
    this.notifierService.notify('error', 'Erreur dans le chargement des medias disponibles');
    console.log('navigator.getUserMedia error: ', error);
  }

  private crop(canvas, x1, y1, width, height) {
    // get your canvas and a context for it
    const ctx = canvas.getContext('2d');
    // get the image data you want to keep.
    const imageData = ctx.getImageData(x1, y1, width, height);
    // create a new cavnas same as clipped size and a context
    const newCan = document.createElement('canvas');
    // define sizes
    newCan.width = width;
    newCan.height = height;
    const newCtx = newCan.getContext('2d');
    // put the clipped image on the new canvas.
    newCtx.putImageData(imageData, 0, 0);
    return newCan;
  }

  imageCapture(canvas) {

    if (!this.faceCallsDisabled) {
      this.notifierService.notify('warning', 'Les appels vers face api sont désactivés' );
      return;
    }
    if (!this.customVisionCallsDisabled) {
      this.notifierService.notify('warning', 'Les appels vers custom vision api sont désactivés' );
      return;
    }

    if (this.group === null || this.game === null) {
      this.notifierService.notify('warning', 'La partie n\'a pas été configurée');
      return;
    }

    const can = canvas;

    try {
      console.log(localStorage.getItem('subscriptionKey'));
      can.toBlob((blob) => {
        const res$ = this.faceProcess.byImg(blob, this.group);
        // traitement face API
        res$.subscribe(
        (data) => {
          if (this.observableLock === false) {
            this.observableLock = true;
            if (data === null) {
              // nothing detected
              console.log('lock disabled');
              this.lock = false;
              return;
            }
            data.persons.forEach(element => {
            const u = new User();
            u.name = 'user_' + Math.random();
            u.userId = element.person.personId;
            u.faces = [];
            element.faces.forEach(face => {
                    // adapt results for our api
                    const f = this.processFaceAttributes(face);
                    // crop face for skin and hairlength
                    const faceCanvas = this.crop(canvas,
                      face.faceRectangle.left / 1.5,
                      face.faceRectangle.top / 1.5,
                      face.faceRectangle.width * 1.5,
                      face.faceRectangle.height * 1.5);

                    faceCanvas.toBlob(
                      (faceBlob) => {
                        // call to custom vision
                        this.getSkinColor(faceBlob).subscribe(
                          (sc) => {
                            f.skinColor = sc;
                            this.getHairLength(faceBlob).subscribe(
                              (hl) => {
                                f.hairLength = hl;
                                u.faces = Array.from(new Set(u.faces));
                                if (u.faces.map(ff => ff.faceId).indexOf(f.faceId) === -1 ) {
                                  u.faces.push(f);
                                  // save user
                                  this.saveUsers(u, f);
                                }
                                this.lock = false;
                              },
                              (err) => {
                                this.lock = false;
                              }
                            );
                          },
                          (err) => {
                            this.lock = false;
                          }
                        );
                      }
                    );

            });
            this.faceProcess.cleanResult();
          });
          }
        },
        () => {
          console.log('Error occured : 429');
          // unlock capture
          this.lock = false;
        }
      );

        // Optimisation
        /*this.faceProcess.resForDuplicate$.subscribe(
        (result) => {
          console.log(result);
          this.userService.mergeUser(result.keepId, result.delId).subscribe(
            (res: any) => console.log(res)
          );
          // console.log('Deleting user from oneroom: ' + result.delId);
          // const d$ = this.userService.deleteUser(result.delId);
          // d$.subscribe(
          //   () => console.log('user deleted')
          // );
        });*/

    });
      this.observableLock = false;
  } catch (e) {
    console.log('Error : ' + e.message);
    // unlock capture
    this.lock = false;
  }
}

private processFaceAttributes(face) {
  const f = new Face();
  f.faceId = face.faceId;
  f.age = face.faceAttributes.age;
  f.baldLevel = face.faceAttributes.hair.bald;
  f.beardLevel = face.faceAttributes.facialHair.beard;
  f.glassesType = face.faceAttributes.glasses === 'NoGlasses' ?
                  GlassesType.NoGlasses : face.faceAttributes.glasses === 'ReadingGlasses' ?
                  GlassesType.ReadingGlasses : face.faceAttributes.glasses === 'SunGlasses' ?
                  GlassesType.Sunglasses : GlassesType.SwimmingGoggles ;
                  // check haircolor
  if (face.faceAttributes.hair.hairColor.length > 0) {
                    f.hairColor = face.faceAttributes.hair.hairColor[0].color;
                  } else {
                    f.hairColor = '';
                  }
  f.isMale = face.faceAttributes.gender === 'male';
  f.moustacheLevel = face.faceAttributes.facialHair.moustache;
  f.smileLevel = face.faceAttributes.smile;
  let emotion = 0;
  let emotionType = '';
  if (face.faceAttributes.emotion.anger < face.faceAttributes.emotion.contempt) {
                    emotion = face.faceAttributes.emotion.contempt;
                    emotionType = 'contempt';
                  } else {
                    emotion = face.faceAttributes.emotion.anger;
                    emotionType = 'anger';
                  }
  if (emotion < face.faceAttributes.emotion.disgust) {
                    emotion =  face.faceAttributes.emotion.disgust;
                    emotionType = 'disgust';
                  }
  if (emotion < face.faceAttributes.emotion.fear) {
                    emotion = face.faceAttributes.emotion.fear;
                    emotionType = 'fear';
                  }
  if (emotion < face.faceAttributes.emotion.happiness) {
                    emotion = face.faceAttributes.emotion.happiness;
                    emotionType = 'happiness';
                  }
  if (emotion < face.faceAttributes.emotion.neutral) {
                    emotion = face.faceAttributes.emotion.neutral;
                    emotionType = 'neutral';
                  }
  if (emotion < face.faceAttributes.emotion.sadness) {
                    emotion = face.faceAttributes.emotion.sadness;
                    emotionType = 'sadness';
                  }
  if (emotion < face.faceAttributes.emotion.surprise) {
                    emotion = face.faceAttributes.emotion.surprise;
                    emotionType = 'surprise';
                  }
  f.emotionDominant = emotionType;
  return f;
}

// detection hair length with custom vision
private getHairLength(stream) {
  const sub = new Subject<string>();
  this.customVisionPredictionService.predictImageWithNoStore(stream, this.game.config.visionEndpoint, this.game.config.visionKey).subscribe(
    (result: ImagePrediction) => {
      if (result.predictions.length > 0) {
        sub.next(result.predictions[0].tagName);
      } else {
        sub.next(null);
      }
    },
    (err) => {
      console.log(err);
      this.notifierService.notify('error', 'Custom vision : HairLength erreur');
    }
  );
  return sub;
}

// detection skin color with custom vision
private getSkinColor(stream) {
  const sub = new Subject<string>();
  // tslint:disable-next-line:max-line-length
  this.customVisionPredictionService.predictImageWithNoStore(stream, this.game.config.visionEndpointSkinColor, this.game.config.visionKeySkinColor).subscribe(
      (result: ImagePrediction) => {
      if (result.predictions.length > 0) {
        sub.next(result.predictions[0].tagName);
      } else {
        sub.next(null);
      }
    },
    (err) => {
      console.log(err);
      this.notifierService.notify('error', 'Custom vision : SkinColor erreur');
    }
  );
  return sub;
}

private saveUsers(user: User, face: Face) {
    console.log('saving user');
    // adding user
    const user$ = this.userService.addUser(user);
    user$.subscribe(
      () => {
        this.notifierService.notify( 'success', 'Un nouvel utilisateur a été créé');
        this.lock = false;
      }
    , (error) => {
        if (error.status === 409 && error.ok === false) {
          this.notifierService.notify( 'info', 'Un utilisateur a été reconnu');
          const face$ = this.faceService.addFace(user.userId, face);
          face$.subscribe(
              () => {
                  this.lock = false;
                },
              (err) => {
                  console.log(err);
                  this.lock = false;
          });
        }
    });
}

    /* Update the game state and stop registering candidates when done */
    refreshGameState(game: Game) {
      const res$ = this.gameService.getStateGame(game.groupName);
      res$.subscribe(
        (state) => {
          console.log("State",state);
          if (state !== GameState.REGISTER) {
            this.stopCaptureStream();
            this.notifierService.notify( 'info', 'Enregistrement des participants désormais cloturé !');
            this.stateMessage = 'Enregistrement des participants désormais cloturé !';
            this.stateContainer = true;
            this.displayStream = 'none';
          } else {
            this.stateMessage = '';
            this.stateContainer = false;
            this.detectId = null;
            this.stream = null;
            this.opencam();
            this.startStream();
          }
        },
        (err) => {
          console.log(err);
          this.notifierService.notify('error', 'Echec lors de la récuperation du status de la partie');
        }
      );
    }

    private stopCaptureStream() {
      // stop camera capture
      if (this.stream) {
        this.stream.getTracks().forEach(
          (track) => {
          track.stop();
        });
      }

      clearInterval(this.detectId);
      clearInterval(this.timerData);
      clearTimeout(this.timerLock);
      console.log('disabling interval');
    }

    ngOnDestroy(): void {
      this.stopCaptureStream();
      // stop game context signal
      if (localStorage.getItem('gameData')) {
        if (this.hubServiceSub) {
          this.hubServiceSub.unsubscribe();
        }
        if (this.gameSub) {
          this.gameSub.unsubscribe();
        }
      }
    }

}
