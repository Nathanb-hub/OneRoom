import { Component, OnInit } from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  buttons:string[];
  inputList:string;
  combinaisons:string[];
  info :string;
  buttonState:boolean;
  times:number[];
  i:number;
  valid:boolean;
  isActive:boolean;
  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.buttons  = ["1","2","3","4","5","6","7","8","9","#","0","*"];
    this.info='';
    this.inputList='';
    this.combinaisons =[];
    this.times=[3000,5000,10000];
    this.buttonState=true;
    this.i=0;
    this.valid=false;
  }

  addNumber(value:string){
    //il faut supprimer la classe d'anilmation animate-icon
    //
    if (this.inputList.length==4){
      this.Clear();
    }
    this.inputList +=value;
  }
  Check(){
    if(this.inputList.length==4){
      this.info='';
      if (this.inputList=='1234'){
        console.log("Code correct, ouverture du coffre ...");
        this.ngOnInit();
        this.info='Code bon';
        this.inputList ='1234';
        this.valid=true;
        //Intégrer le service pour actionner l'aduino 

        //pour le kit azure
        // this.http.get<any>('https://devkit-function.azurewebsites.net/api/devkit-state?action=set&state=1&key=userLED').subscribe(data => {
        //   console.log(data);
        // });
        //pour l'arduino
        this.http.get<any>('https://oneroom-lockerv2-api.azurewebsites.net/api/locker-state?action=set&state=1&key=SERVO').subscribe(data => {
          console.log(data);
        });

      }
      else{
        this.info='Code incorrect';
        setTimeout(()=>{
          document.querySelector('#animate-icon').classList.remove('animate-icon');
        },2000);
        document.querySelector('#animate-icon').classList.add('animate-icon');
        


        this.combinaisons.push(this.inputList);
 
        if(this.combinaisons.length ==3){
          this.combinaisons = [];
          this.buttonState=false;
          if (this.i>this.times.length-1){
            this.i=0;
          }
          this.info= "Veuillez attendre " +(this.times[this.i]/1000).toString()+" secondes";
          this.wait(this.times[this.i]);
          this.i++;
        }
      }

    }
    else{
      this.info="Veuiller entrer un code de 4 caractères";
    }

  }
  Clear(){
    this.valid=false;
    this.inputList ='';
    this.info="";
  }
  wait(ms:number){
    setTimeout(() => {      
      this.buttonState=true;
      this.info="Essayer à nouveau";
      this.inputList="";
    }, ms);

      }
    

}
