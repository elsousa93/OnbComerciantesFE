import { MediaMatcher } from '@angular/cdk/layout';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-sidenav-presencial',
  templateUrl: './sidenav-presencial.component.html',
  styleUrls: ['./sidenav-presencial.component.css']
})
export class SidenavPresencialComponent implements OnInit {

  @Input() isToggle: boolean = false;
  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;

  userType: string = "Banca";

  constructor(private http: HttpClient, private cookie: CookieService, private router: Router,
    changeDetectorRef: ChangeDetectorRef, media: MediaMatcher) {
    this.mobileQuery = media.matchMedia('(max-width: 850px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnInit(): void {
  }


  assignMenus() {
    switch (this.userType) {
      case "Banca":

    }
  }

  public toggleSideNav(toggled: boolean) {
    this.isToggle = toggled;
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

}
