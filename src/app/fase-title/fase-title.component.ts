import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'fase-title',
  templateUrl: './fase-title.component.html',
  styleUrls: ['./fase-title.component.css']
})
export class FaseTitleComponent implements OnInit {

  @Input() title: string;
  @Input() description: string;
  @Input() percentage: number;

  constructor() { }

  ngOnInit(): void {
  }

}
