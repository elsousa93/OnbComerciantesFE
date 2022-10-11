import { MediaMatcher } from '@angular/cdk/layout';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, HostBinding, Input, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { onSideNavChange, AutoHideSidenavAdjust } from '../animation';
import { Client, Crc } from '../client/Client.interface';
import { ClientService } from '../client/client.service';
import { StakeholderService } from '../stakeholders/stakeholder.service';
import { CRCService } from '../CRC/crcservice.service';
import { SubmissionPostTemplate, SubmissionPutTemplate } from '../submission/ISubmission.interface';
import { SubmissionService } from '../submission/service/submission-service.service';
import { TableInfoService } from '../table-info/table-info.service';
import { UserPermissions, MenuPermissions, getMenuPermissions } from '../userPermissions/user-permissions'
import { IStakeholders } from '../stakeholders/IStakeholders.interface';
import { DataService } from '../nav-menu-interna/data.service';
import { AuthService } from '../services/auth.service';
import { User } from '../userPermissions/user';

@Component({
  selector: 'app-sidenav-presencial',
  templateUrl: './sidenav-presencial.component.html',
  styleUrls: ['./sidenav-presencial.component.css'],
  animations: [onSideNavChange, AutoHideSidenavAdjust]
})
export class SidenavPresencialComponent implements OnInit {

  @Input() isToggle: boolean;
  @Input() isAutoHide: boolean = false;

  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;
  @HostBinding('style.--toptestexpto') public toptestexpto: string = '5px';

  userPermissions: MenuPermissions;

  currentUser: User = {};

  constructor(private http: HttpClient, private cookie: CookieService, private router: Router,
    changeDetectorRef: ChangeDetectorRef, media: MediaMatcher, private submissionService: SubmissionService,
    private clientService: ClientService, private crcService: CRCService, private stakeholderService: StakeholderService, private tableInfo: TableInfoService,
    private dataService: DataService, private authService: AuthService) {
    this.mobileQuery = media.matchMedia('(max-width: 850px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      var a = UserPermissions[this.currentUser.permissions];

      console.log("permissões: ", this.currentUser.permissions);
      console.log("userPermission tratada: ", a);

      this.userPermissions = getMenuPermissions(a);

    });
  }

  hideHistoryTab() {
    this.dataService.historyStream$.next(false);
  }

  public toggleSideNav(toggled: boolean) {
    this.isToggle = toggled;
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  FTSearch(queue: string) {
    let navigationExtras: NavigationExtras = {
      state: {
        queueName: queue
      }
    };
    this.router.navigate(["/"]).then(() => {
      this.router.navigate(["/app-consultas-ft"], navigationExtras);
    });
  }

  testeAuth() {
    console.log(this.currentUser);
    console.log(this.userPermissions);
  }

  logout() {
    localStorage.removeItem('auth');
    this.authService.reset();
  }

  login() {
    this.authService.reset();

    console.log("currentUser: ", this.authService.GetCurrentUser());

    this.logout();
  }
}
