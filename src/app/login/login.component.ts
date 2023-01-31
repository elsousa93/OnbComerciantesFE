import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ILogin } from 'src/app/login/ILogin.interface';
import { FormBuilder, Validators } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service'
import { LoggerService } from 'src/app/logger.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  token: string | null = "";
  model: ILogin = { userid: "admin", password: "admin@123" }

  public message: string = "";
  public returnUrl: string = "";
  public isLoggedIn: boolean = true;
  public myDate = new Date();

  loginForm = this.formBuilder.group({
    userid: ['', Validators.required],
    password: ['', Validators.required]
  })
  constructor(private logger: LoggerService,
    private formBuilder: FormBuilder,
    private route: Router,
    private router: ActivatedRoute,
    private cookie: CookieService
  ) {
    this.myDate.setHours(this.myDate.getHours() + 1);
    this.chackInitiallogin();
  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      userid: ['', Validators.required],
      password: ['', Validators.required]
    })
  }

  validateRecievedCookie() {
    if (this.cookie.get("jwToken") === "" || this.cookie.get("jwToken") === "undefined" || this.cookie.get("jwToken") === null) {
      this.cookie.delete("jwToken")
      this.cookie.set('jwToken', this.router.snapshot.params['tokenid'], {
        expires: this.myDate,
        path: '/',
        sameSite: 'Strict'
      });
    }

    //validate if cookie is valid - TO BE IMPLEMENTED
    if (this.cookie.get("jwToken") === "" || this.cookie.get("jwToken") === "undefined" || this.cookie.get("jwToken") === null) {
      this.isLoggedIn = false;
    } else {
      this.isLoggedIn = true;
    }
  }

  // convenience getter for easy access to form fields  
  get f() { return this.loginForm.controls; }

  chackInitiallogin() {
    this.validateRecievedCookie();
    if (this.cookie.get("jwToken") != "" && this.cookie.get("jwToken") !== "undefined" && this.cookie.get("jwToken") !== null) {
      this.route.navigate(['login']);
    } else {
      this.message = "Tem de efetuar pré-registo";
    }
  }

  login() {
    if (this.f['userid'].value == this.model.userid && this.f['password'].value == this.model.password) {
      this.cookie.delete("jwToken")
      //set cookie when log-in credentials are inserted
      this.cookie.set('jwToken', 'someRandomTokenCreated', {
        expires: this.myDate,
        path: '/',
        sameSite: 'Strict'
      });
      this.isLoggedIn = true;
    } else {
      this.isLoggedIn = false;
      this.message = "Please check your userid and password";
    }
  }

  onCickLogOut() {
    this.cookie.delete("jwToken")
    localStorage.clear();
    this.isLoggedIn = false;
    this.route.navigate(['login']);
  }
}
