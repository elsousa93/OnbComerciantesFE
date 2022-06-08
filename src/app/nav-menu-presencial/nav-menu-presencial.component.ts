import { Component, OnInit } from '@angular/core';
import { Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-nav-menu-presencial',
  templateUrl: './nav-menu-presencial.component.html',
  styleUrls: ['./nav-menu-presencial.component.css']
})
export class NavMenuPresencialComponent implements OnInit {

  @Output() toggleNavEvent = new EventEmitter<boolean>();
  isToggle: boolean = true;

  constructor() { }

  ngOnInit(): void {
  }

  toggleEvent() {
    this.isToggle = !this.isToggle;
    this.toggleNavEvent.emit(this.isToggle);
  }

}
