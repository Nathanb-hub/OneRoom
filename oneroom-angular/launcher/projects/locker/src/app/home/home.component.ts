import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  buttons:number[] =[1,2,3,4,5,6,7,8,9];
  inputList:string= '';
  constructor() { }

  ngOnInit() {
    
  }

  addNumber(value:string){
    if (this.inputList.length==4){
      this.Clear();
    }
    this.inputList +=value;
  }
  Check(){
    if (this.inputList=='1234'){
      console.log("Code correct");
    }
  }
  Clear(){
    this.inputList ='';
  }
    

}
