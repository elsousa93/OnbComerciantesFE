import { Component, HostBinding, Input, OnInit } from '@angular/core';

@Component({
  selector: 'circular-progress',
  templateUrl: './circular-progress.component.html',
  styleUrls: ['./circular-progress.component.css']
})
export class CircularProgressComponent implements OnInit {

  @Input() percentage: number = 0; //Percentage defined by the user
  @Input() timeToDisplay: number = 25; //Time that it takes to increment the percentage

  @HostBinding('style.--dashoffset') private dashoffset; //Variable that defines the dashoffset that is going to be used in css

  percentageDisplay: number = 0; //Percentage that will be displayed in HTML

  //Function that calculates the offset based on the percentage defined
  public calculateDashoffset() {
    return 435 - ((this.percentage / 100) * 435);
  }

  //Function that increments the percentage according to the time
  public displayPercentage() {
    setInterval(() => {
      if (this.percentageDisplay == this.percentage) {
        clearInterval();
      } else {
        this.percentageDisplay += 1;
      }

    }, this.timeToDisplay);
  }

  constructor() { }

  ngOnInit(): void {
    this.dashoffset = this.calculateDashoffset();
    this.displayPercentage();
  }

}
