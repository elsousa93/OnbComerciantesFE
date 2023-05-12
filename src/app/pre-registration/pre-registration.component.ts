import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { authenticator, totp } from 'otplib';
import { Subscription } from 'rxjs';
import { validPhoneNumber } from '../client/info-declarativa/info-declarativa.model';
import { LoggerService } from '../logger.service';
import { CountryInformation } from '../table-info/ITable-info.interface';
import { TableInfoService } from '../table-info/table-info.service';

@Component({
  selector: 'app-pre-registration',
  templateUrl: './pre-registration.component.html',
  styleUrls: ['./pre-registration.component.css']
})
export class PreRegistrationComponent implements OnInit, OnDestroy {

  registrationForm: FormGroup;
  incorrectNIFSize: boolean = false;
  incorrectNIF: boolean = false;
  incorrectNIPCSize: boolean = false;
  incorrectNIPC: boolean = false;
  internationalCallingCodes: CountryInformation[];
  public subs: Subscription[] = [];
  public emailRegex: string;
  phone1: AbstractControl;

  secret: string = "";
  token: string = "";
  timeRemaining: number;
  timeUsed: number;
  isValid: boolean;
  timer = null;

  constructor(private tableInfo: TableInfoService, private logger: LoggerService, private route: Router) {
    this.subs.push(this.tableInfo.GetAllCountries().subscribe(result => {
      this.logger.info("Fetch all countries " + JSON.stringify(result));
      this.internationalCallingCodes = result;
      this.internationalCallingCodes = this.internationalCallingCodes.sort(function (a, b) {
        return a.description.localeCompare(b.description, 'pt-PT');
      }); //ordenar resposta
    }, error => this.logger.error(error)));
    this.emailRegex = '^(([^<>()\\[\\]\\\.,;:\\s@"]+(\.[^<>()\\[\\]\\\.,;:\\s@"]+)*)|(".+"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\.[0-9]{1,3}\\.[0-9]{1,3}])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$';
  }

  ngOnDestroy(): void {
    //this.stopTimer();
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm() {
    this.registrationForm = new FormGroup({
      username: new FormControl('', Validators.required),
      nif: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.pattern(this.emailRegex)]),
      contact: new FormGroup({
        countryCode: new FormControl(''),
        phoneNumber: new FormControl('')
      }, [Validators.required, validPhoneNumber])
    });
    this.phone1 = this.registrationForm.get("contact");
  }

  get emailValid() {
    return this.registrationForm.get('email');
  }

  numericOnly(event): boolean {
    var ASCIICode = (event.which) ? event.which : event.keyCode;
    if (ASCIICode > 31 && (ASCIICode < 48 || ASCIICode > 57))
      return false;
    return true;
  }

  checkValidationType(event) {
    var value = event.target.value;

    if (['1', '2', '3'].includes(value.substr(0, 1)))
      this.validateNIF(value)

    if (['5', '6', '8', '9'].includes(value.substr(0, 1)))
      this.validateNIPC(value)
  }

  validateNIF(nif: string): boolean {
    this.incorrectNIFSize = false;
    this.incorrectNIF = false;
    this.incorrectNIPCSize = false;
    this.incorrectNIPC = false;
    if (nif != '') {
      if (nif.length != 9) {
        this.incorrectNIFSize = true;
        return false;
      }
      if (!['1', '2', '3'].includes(nif.substr(0, 1))) {
        this.incorrectNIF = true;
        return false;
      }

      const total = Number(nif[0]) * 9 + Number(nif[1]) * 8 + Number(nif[2]) * 7 + Number(nif[3]) * 6 + Number(nif[4]) * 5 + Number(nif[5]) * 4 + Number(nif[6]) * 3 + Number(nif[7]) * 2;
      const modulo11 = total - Math.trunc(total / 11) * 11;
      const comparador = modulo11 === 1 || modulo11 === 0 ? 0 : 11 - modulo11;

      if (Number(nif[8]) !== comparador) {
        this.incorrectNIF = true;
        return false;
      }
      return Number(nif[8]) === comparador;
    }
  }

  validateNIPC(nipc: string): boolean {
    this.incorrectNIFSize = false;
    this.incorrectNIF = false;
    this.incorrectNIPCSize = false;
    this.incorrectNIPC = false;
    if (nipc != '') {
      if (nipc.length != 9) {
        this.incorrectNIPCSize = true;
        return false;
      }
      if (!['5', '6', '8', '9'].includes(nipc.substr(0, 1))) {
        this.incorrectNIPC = true;
        return false;
      }

      const total = Number(nipc[0]) * 9 + Number(nipc[1]) * 8 + Number(nipc[2]) * 7 + Number(nipc[3]) * 6 + Number(nipc[4]) * 5 + Number(nipc[5]) * 4 + Number(nipc[6]) * 3 + Number(nipc[7]) * 2;
      const modulo11 = total - Math.trunc(total / 11) * 11;
      const comparador = modulo11 === 1 || modulo11 === 0 ? 0 : 11 - modulo11;

      if (Number(nipc[8]) !== comparador) {
        this.incorrectNIPC = true;
        return false;
      }

      return Number(nipc[8]) === comparador;
    }
  }

  stopTimer() {
    if (this.timer)
      clearInterval(this.timer);
  }

  submit() {
    if (this.secret == "") {
      totp.options = {
        digits: 6,
        step: 30
      }
      var username = this.registrationForm.get("username").value;
      var nif = this.registrationForm.get("nif").value;
      var email = this.registrationForm.get("email").value;
      var countryCode = this.registrationForm.get("contact").get("countryCode").value;
      var phoneNumber = this.registrationForm.get("contact").get("phoneNumber").value;
      //enviar dados do form para API SIBS


      //gerar código e redirecionar para outra página
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

      let navigationExtras = {
        state: {
          secret: this.secret,
          page: "registration",
          name: username
        }
      } as NavigationExtras;
      this.route.navigate(['validate-code'], navigationExtras);
    }
  }

}
