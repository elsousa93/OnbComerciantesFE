import { MediaMatcher } from '@angular/cdk/layout';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, HostBinding, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { onSideNavChange, AutoHideSidenavAdjust } from '../animation';
import { UserPermissions, MenuPermissions, getMenuPermissions } from '../userPermissions/user-permissions'

@Component({
  selector: 'app-sidenav-presencial',
  templateUrl: './sidenav-presencial.component.html',
  styleUrls: ['./sidenav-presencial.component.css'],
  animations: [onSideNavChange, AutoHideSidenavAdjust]
})
export class SidenavPresencialComponent implements OnInit {

  @Input() isToggle: boolean = false;
  @Input() isAutoHide: boolean = false;

  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;
  @HostBinding('style.--toptestexpto') public toptestexpto: string = '5px';


  userType: string = "Banca";
  userPermissions: MenuPermissions;

  constructor(private http: HttpClient, private cookie: CookieService, private router: Router,
    changeDetectorRef: ChangeDetectorRef, media: MediaMatcher) {
    this.mobileQuery = media.matchMedia('(max-width: 850px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnInit(): void {
    this.userPermissions = getMenuPermissions(UserPermissions.DO);
  //  alert(this.isAutoHide);
  }

  public close() {

  }


  assignMenus() {
  }

  public toggleSideNav(toggled: boolean) {
    this.isToggle = toggled;
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

}
