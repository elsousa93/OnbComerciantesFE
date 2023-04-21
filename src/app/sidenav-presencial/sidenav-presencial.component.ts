import { MediaMatcher } from '@angular/cdk/layout';
import { ChangeDetectorRef, Component, HostBinding, Input, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { onSideNavChange, AutoHideSidenavAdjust } from '../animation';
import { UserPermissions, MenuPermissions, getMenuPermissions } from '../userPermissions/user-permissions'
import { DataService } from '../nav-menu-interna/data.service';
import { AuthService } from '../services/auth.service';
import { User } from '../userPermissions/user';
import { ProcessNumberService } from '../nav-menu-presencial/process-number.service';
import { LoggerService } from '../logger.service';
import { LoadingService } from '../loading.service';

@Component({
  selector: 'app-sidenav-presencial',
  templateUrl: './sidenav-presencial.component.html',
  styleUrls: ['./sidenav-presencial.component.css'],
  animations: [onSideNavChange, AutoHideSidenavAdjust]
})
export class SidenavPresencialComponent implements OnInit {

  @Input() isToggle: boolean = true;
  @Input() isAutoHide: boolean = false;

  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;
  @HostBinding('style.--toptestexpto') public toptestexpto: string = '5px';

  userPermissions: MenuPermissions;

  currentUser: User = {};
  loading$ = this.loader.loading$;

  constructor(private router: Router,
    changeDetectorRef: ChangeDetectorRef, media: MediaMatcher,
    private dataService: DataService, private authService: AuthService, private processNrService: ProcessNumberService, private logger: LoggerService, public loader: LoadingService) {
    this.mobileQuery = media.matchMedia('(max-width: 850px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      var a = UserPermissions[this.currentUser.permissions];

      this.userPermissions = getMenuPermissions(a);
    });
  }

  hideHistoryTab() {
    localStorage.clear();
    this.dataService.reset();
    this.processNrService.changeProcessNumber(null);
    this.logger.info("Redirecting to Client page");
    this.router.navigate(["/client"]);
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
}
