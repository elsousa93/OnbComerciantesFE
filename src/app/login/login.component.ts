import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ILogin } from 'src/app/login/ILogin.interface';
import { AuthService } from '../services/auth.service'
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  token: string | null = "";
  clientId: number = 12345;

  model: ILogin = { userid: "admin", password: "admin@123" }
  public loginForm!: FormGroup;
  public message: string = ""; 
  public returnUrl: string = "";
  public isLoggedIn: boolean = true;

  constructor(
    private formBuilder: FormBuilder,
    private route: Router,
    private authService: AuthService,
    private router: ActivatedRoute,
    private cookie: CookieService
  ) {

    this.chackInitiallogin();
  }

  /*ngOnInitOld() {
    //Are we reciving the token for the first time?
    console.log("Is logged in OnIni?: " + localStorage.getItem('isLoggedIn'));

    this.token = this.router.snapshot.params['tokenid'];

    console.log("Token 1: " + this.token);

    if (this.token === undefined || this.token === null) {
      console.log("Token 2: " + this.token);

      //local Storage - Remove
      this.token = localStorage.getItem('token');

      this.cookie.get("jwToken")
      console.log("Token vale: " + localStorage.getItem('token'));
      if (this.token === undefined || this.token === null) {
        console.log("Token 3: " + this.token);
        this.token = "";
      }
    }

    this.loginForm = this.formBuilder.group({
      userid: ['', Validators.required],
      password: ['', Validators.required]
    });
    this.returnUrl = '/';
    this.authService.logout();
  }*/

  ngOnInit() {
    if (this.cookie.get("jwToken") === "" || this.cookie.get("jwToken") === "undefined" || this.cookie.get("jwToken") === null) {
      this.cookie.delete("jwToken")
      console.log("creating cookie 68")
      this.cookie.set("jwToken", this.router.snapshot.params['tokenid'])
      console.log(this.cookie.get("jwToken"))
    }

    //validate if cookie is valid - TO BE IMPLEMENTED
    if (this.cookie.get("jwToken") === "" || this.cookie.get("jwToken") === "undefined" || this.cookie.get("jwToken") === null) {
      this.isLoggedIn = false;
    } else {
      this.isLoggedIn = true;
    }

    this.loginForm = this.formBuilder.group({
      userid: ['', Validators.required],
      password: ['', Validators.required]
    });

  }

  // convenience getter for easy access to form fields  
  get f() { return this.loginForm.controls; }


  /*chackInitialloginOld() {
    this.ngOnInit();
    console.log("Login atempt");
    console.log(this.token);
    if (this.token != "") {
      console.log("Login successful");
      //this.authService.authLogin(this.model);  
      localStorage.setItem('isLoggedIn', "true")
      console.log("Is logged in?: " + localStorage.getItem('isLoggedIn'));
      localStorage.setItem('token', this.token);
      console.log(this.token);
      this.isLoggedIn = true;
      this.route.navigate([this.returnUrl]);
    }
    else {
      this.message = "Tem de efetuar pré-registo";
      this.isLoggedIn = false;
      localStorage.setItem('isLoggedIn', "false");
    }
  }*/

  chackInitiallogin() {
    this.ngOnInit();
    console.log(this.cookie.get("jwToken"));
    if (this.cookie.get("jwToken") != "" && this.cookie.get("jwToken") !== "undefined" && this.cookie.get("jwToken") !== null) {
      //this.cookie.delete("jwToken")
      console.log("Cookie valid")
      //this.cookie.set("jwToken", "someRandomTokenCreated")
      //this.route.navigate(['dashboard']);
    } else {
      this.message = "Tem de efetuar pré-registo";
    }
  }

  /*loginOLD() {
    // stop here if form is invalid  
    if (this.loginForm.invalid) {
      return;
    }
    else {
      if (this.f['userid'].value == this.model.userid && this.f['password'].value == this.model.password) {
        console.log("Login successful");
        //this.authService.authLogin(this.model);  
        localStorage.setItem('isLoggedIn', "true");
        localStorage.setItem('token', this.f['userid'].value);
        this.isLoggedIn = true;
        this.route.navigate([this.returnUrl]);
      }
      else {
        this.message = "Please check your userid and password";
        this.isLoggedIn = false;
        localStorage.setItem('isLoggedIn', "false");
      }
    }
  }*/

  login() {
    console.log("inicio do login")
    if (this.f['userid'].value == this.model.userid && this.f['password'].value == this.model.password) {
      this.cookie.delete("jwToken")
      console.log("dentro do if")
      console.log("creating cookie 151")
      this.cookie.set("jwToken", "someRandomTokenCreated")
      this.isLoggedIn = true;
      //this.route.navigate(['dashboard']);
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
    //localStorage.setItem('isLoggedIn', "false");
    //this.route.navigate(['dashboard']);
  }

}
