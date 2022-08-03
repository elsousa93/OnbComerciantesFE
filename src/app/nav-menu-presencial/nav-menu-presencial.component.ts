import { Component, HostBinding, OnInit } from '@angular/core';
import { Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AutoHideClientBarAdjust, AutoHideNavbarAdjust, AutoHideLogo } from '../animation';
import { DataService } from '../nav-menu-interna/data.service';
import { ProcessNumberService } from './process-number.service';
import { progressSteps } from './progressSteps';

@Component({
  selector: 'app-nav-menu-presencial',
  templateUrl: './nav-menu-presencial.component.html',
  styleUrls: ['./nav-menu-presencial.component.css'],
  animations: [AutoHideClientBarAdjust, AutoHideNavbarAdjust, AutoHideLogo]
})
export class NavMenuPresencialComponent implements OnInit {

  //Procura de processo
  processNumberToSearch: string;
  /////////////////////

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

  prevScrollpos: number = window.pageYOffset;

  processNumber: string = "";
  subscription: Subscription;

  currentPage:number = 0;
  currentSubPage:number = 0;
  progressImage: string;

  constructor(private route: Router, private processNrService: ProcessNumberService, private dataService: DataService) {
    this.processNrService.changeProcessNumber(localStorage.getItem("processNumber"));
  }

  ngOnInit(): void {
    this.subscription = this.processNrService.processNumber.subscribe(processNumber => this.processNumber = processNumber);
    this.dataService.currentPage.subscribe((currentPage) => {
      this.currentPage = currentPage;
      this.updateProgress();
    });
    this.dataService.currentSubPage.subscribe((currentSubPage) => {
      this.currentSubPage = currentSubPage
      this.updateProgress();
    });

    setTimeout(this.toggleEvent.bind(this), 800);

    //this.navPosition = '0';
    var prevScrollpos = window.pageYOffset;

    
    
    window.addEventListener("scroll", this.autohide.bind(this), false);

    //this.navPosition = '0';
    //this.autohide();
    
  }

  openProcess(process) {
    console.log(process);
    localStorage.setItem("processNumber", process.processNumber);
    localStorage.setItem("returned", 'consult');

    this.route.navigate(['/client']);
    //this.submissionService.GetSubmissionByProcessNumber(localStorage.getItem("processNumber")).subscribe(result => {
    //  console.log('Submissão retornada quando pesquisada pelo número de processo', result);
    //  this.submissionService.GetSubmissionByID(result[0].submissionId).subscribe(resul => {
    //    console.log('Submissão com detalhes mais especificos ', resul);
    //    this.clientService.GetClientById(resul.id).subscribe(res => {
    //      this.route.navigate(['/client']);
    //    });
    //  });
    //});

  }

  updateProgress(){
    if (this.currentPage == 0 || this.currentSubPage == 0){
      this.progressImage = undefined;
      return;
    }
    let progress = progressSteps[this.currentPage-1][this.currentSubPage-1];
    this.progressImage = "assets/images/progress_bar/progress_bar_" + progress + ".svg"
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

  searchProcess() {
    console.log(this.processNumberToSearch);
    this.route.navigate(['/app-consultas/', this.processNumberToSearch]);
  }
}
