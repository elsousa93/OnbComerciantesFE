import { Component, HostBinding, OnInit } from '@angular/core';
import { Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-nav-menu-presencial',
  templateUrl: './nav-menu-presencial.component.html',
  styleUrls: ['./nav-menu-presencial.component.css']
})
export class NavMenuPresencialComponent implements OnInit {

  @Output() toggleNavEvent = new EventEmitter<boolean>();
  isToggle: boolean = false;

  @HostBinding('style.--navPosition') public navPosition: string = '0';
  @HostBinding('style.--toptestexpto') public toptestexpto: string = '5px';

  prevScrollpos:number = window.pageYOffset;

  constructor() {
  }

  ngOnInit(): void {
    setTimeout(this.toggleEvent.bind(this), 800);

    //this.navPosition = '0';
    var prevScrollpos = window.pageYOffset;
    console.log(prevScrollpos);

    window.addEventListener("scroll", this.autohide.bind(this), false);

    //this.navPosition = '0';
    //this.autohide();
    
  }

  toggleEvent() {
    this.isToggle = !this.isToggle;
    this.toggleNavEvent.emit(this.isToggle);
  }

  public autohide() {
    //this.navPosition = "-50px";

    var currentScrollPos = window.pageYOffset;
    if (this.prevScrollpos > currentScrollPos) {
      console.log("a");
      //this.teste("0");
      this.navPosition = "0";
      this.toptestexpto = "90px";
      console.log(this.navPosition);
    } else {
      console.log("b");
      this.navPosition = "-70px";
      this.toptestexpto = "0";
      console.log(this.navPosition);
      //this.teste("-50px");
    }
    this.prevScrollpos = currentScrollPos;
  }
}
