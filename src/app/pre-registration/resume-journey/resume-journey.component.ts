import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { authenticator, totp } from 'otplib';
import { AppConfigService } from '../../app-config.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-resume-journey',
  templateUrl: './resume-journey.component.html',
  styleUrls: ['./resume-journey.component.css']
})
export class ResumeJourneyComponent implements OnInit, OnDestroy {

  form: FormGroup;
  secret: string = "";
  token: string = "";
  timeRemaining: number;
  timeUsed: number;
  isValid: boolean;
  timer = null;
  step: number;
  validateCode: boolean = false;
  processNumber: string;

  constructor(private route: Router, private configuration: AppConfigService, private authService: AuthService) {
    this.authService.changeResumeJourney(true);
    this.step = configuration.getConfig().timeout;
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm() {
    this.form = new FormGroup({
      processNumber: new FormControl('', [Validators.required])
    });
  }

  stopTimer() {
    if (this.timer)
      clearInterval(this.timer);
  }

  ngOnDestroy(): void {
    //this.stopTimer();
  }

  submit() {
    if (this.secret == "") {
      var processNumber = this.form.get("processNumber").value;
      this.processNumber = processNumber;
      //chamar API da SIBS para procurar o processo e de seguida redirecionar para a página do 2FA independentemente do resultado retornado

      totp.options = {
        digits: 6,
        step: this.step
      }
      this.secret = authenticator.generateSecret(20);
      console.log("Secret ", this.secret);
      this.token = totp.generate(this.secret);
      console.log("Token ", this.token);
      console.log("Valido ", totp.check(this.token, this.secret));
      this.timeRemaining = totp.timeRemaining();
      this.timeUsed = totp.timeUsed();
      this.isValid = totp.check(this.token, this.secret);
      this.stopTimer();
      this.timer = setInterval(() => {
        this.timeRemaining = totp.timeRemaining();
        console.log("Time remaining ", this.timeRemaining);
        if (totp.check(this.token, this.secret)) {
          this.timeUsed = totp.timeUsed();
          this.isValid = totp.check(this.token, this.secret);
        } else {
          this.token = totp.generate(this.secret);
          console.log("Token depois expirado", this.token);
          console.log("Valido depois expirado", totp.check(this.token, this.secret));
        }
      }, 1000);

      //let navigationExtras = {
      //  state: {
      //    secret: this.secret,
      //    page: "resume",
      //    processNumber: processNumber
      //  }
      //} as NavigationExtras;
      //this.route.navigate(['validate-code'], navigationExtras);

      this.validateCode = true;
    } else {
      this.validateCode = true;
      var processNumber = this.form.get("processNumber").value;
      this.processNumber = processNumber;
    }
  }

  goBack(event) {
    this.validateCode = false;
  }

}
