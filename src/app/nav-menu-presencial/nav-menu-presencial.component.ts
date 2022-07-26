import { Component, HostBinding, OnInit } from '@angular/core';
import { Output, EventEmitter } from '@angular/core';
import { AutoHideClientBarAdjust, AutoHideNavbarAdjust, AutoHideLogo } from '../animation';

@Component({
  selector: 'app-nav-menu-presencial',
  templateUrl: './nav-menu-presencial.component.html',
  styleUrls: ['./nav-menu-presencial.component.css'],
  animations: [AutoHideClientBarAdjust, AutoHideNavbarAdjust, AutoHideLogo]
})
export class NavMenuPresencialComponent implements OnInit {

  @Output() toggleNavEvent = new EventEmitter<boolean>();
  @Output() autoHide = new EventEmitter<boolean>();
  

  isToggle: boolean = false;
  isAutohide: boolean = false;

  // progress bar behaviour
  isClientFirstPage: boolean = false;
  isClientSecondPage: boolean = false;
  isClientThirdPage: boolean = false;
  isStakeholderFirstPage: boolean = false;
  isStakeholderSecondPage: boolean = false;
  isComprovativos: boolean = false;
  isInfoDeclarativaClient: boolean = false;
  isInfoDeclarativaStakeholder: boolean = false;
  isInfoDeclarativaAssinaturaPack: boolean = false;


  @HostBinding('style.--navPosition') public navPosition: string = '0';

  prevScrollpos:number = window.pageYOffset;

  constructor() {
  }

  ngOnInit(): void {
    setTimeout(this.toggleEvent.bind(this), 800);

    //this.navPosition = '0';
    var prevScrollpos = window.pageYOffset;

    
    
    window.addEventListener("scroll", this.autohide.bind(this), false);

    //this.navPosition = '0';
    //this.autohide();
    
  }

  toggleEvent() {
    this.isToggle = !this.isToggle;
    this.toggleNavEvent.emit(this.isToggle);
  }

  public autohide() {
    var currentScrollPos = window.pageYOffset;
    if (this.prevScrollpos > currentScrollPos) {
      this.autoHide.emit(false);
      this.isAutohide = false;
    } else {
      this.autoHide.emit(true);
      this.isAutohide = true;
    }
    this.prevScrollpos = currentScrollPos;
  }
}
