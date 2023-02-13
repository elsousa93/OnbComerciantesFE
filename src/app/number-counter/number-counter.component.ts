import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-number-counter',
  templateUrl: './number-counter.component.html',
  styleUrls: ['./number-counter.component.css']
})
export class NumberCounterComponent implements OnInit {

  @Input() number: number = 0; //Percentage defined by the user
  @Input() timeToDisplay: number = 1; //Time that it takes to increment the percentage
  @Input() speed: number = 600;
  steps: number;

  numberDisplay: number = 0; //Percentage that will be displayed in HTML

  constructor() { }

  ngOnInit(): void {
    this.displayPercentage();
  }

  public displayPercentage() {
    var context = this;
    if (this.speed > this.number)
      this.speed = this.number;


    const updateCount = () => {
      const target = context.number;
      const count = context.numberDisplay;
      const increment = Math.trunc(target / this.speed);

      if (count < target) {
        context.numberDisplay = count + increment;
        setTimeout(updateCount, 1);
      } else {
        context.numberDisplay = target;
      }
    };
    updateCount();
  }

  public numberWithCommas(x) {
    let str = x + "";
    while (str.length < 4) {
      str = "0" + str;
    }
    return str;
    //return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ".");
  }
}
