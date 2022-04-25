import { StringMapWithRename } from '@angular/compiler/src/compiler_facade_interface';
import { Component, OnInit, ViewChild } from '@angular/core';
import {MatFormFieldModule} from '@angular/material/form-field';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  @ViewChild('fieldInput') inputField:MatFormFieldModule;
  buttons:number[];
  inputList:string;
  combinaisons:string[];
  info :string;
  buttonState:boolean;
  times:number[];
  i:number;
  valid:boolean;
  constructor() { }

  ngOnInit() {
    this.buttons  = [1,2,3,4,5,6,7,8,9,0,0,0];
    this.info='';
    this.inputList='';
    this.combinaisons =[];
    this.times=[3000,5000,10000];
    this.buttonState=true;
    this.i=0;
    this.valid=false;
    
  }

  addNumber(value:string){
    if (this.inputList.length==4){
      this.Clear();
    }
    this.inputList +=value;
  }
  Check(){
    if(this.inputList.length==4){
      this.info='';
      if (this.inputList=='1234'){
        console.log("Code correct");
        // this.hintColor = 'green';
        this.info='Code bon';
        this.valid=true;
        
      }
      else{
        this.info='Code incorrect';
        // this.hintColor = 'red';
        //console.log(this.inputList);
        this.combinaisons.push(this.inputList);
        //console.log(this.combinaisons);
        if(this.combinaisons.length ==3){
          this.combinaisons = [];
          this.buttonState=false;
          if (this.i>this.times.length-1){
            //console.log("Veuillez attendre", this.times[this.i]/1000," sec");
            this.i=0;
          }
          this.info= "Veuillez attendre " +(this.times[this.i]/1000).toString()+" secondes";
          this.wait(this.times[this.i]);
          this.i++;
        }
      }

    }
    else{
      // this.hintColor="grey";
      this.info="Veuiller entrer un code de 4 caractères";
      console.log(this.info);
    }

  }
  Clear(){
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
