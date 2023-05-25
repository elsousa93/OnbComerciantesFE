import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { authenticator, totp } from 'otplib';
import { LoggerService } from '../../logger.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-validate-code',
  templateUrl: './validate-code.component.html',
  styleUrls: ['./validate-code.component.css']
})
export class ValidateCodeComponent implements OnInit, OnDestroy {

  form: FormGroup;
  @Input() secret: string = "";
  @Input() page: string = "";
  @Input() processNumber?: string = "";
  @Input() name?: string = "";
  @Output() goBackEmitter = new EventEmitter<boolean>();

  constructor(private route: Router, private snackBar: MatSnackBar, private translate: TranslateService, private logger: LoggerService, private authService: AuthService) {
    //if (this.route?.getCurrentNavigation()?.extras?.state) {
    //  this.secret = this.route?.getCurrentNavigation()?.extras?.state["secret"];
    //  this.page = this.route?.getCurrentNavigation()?.extras?.state["page"];
    //  this.processNumber = this.route?.getCurrentNavigation()?.extras?.state["processNumber"];
    //  this.name = this.route?.getCurrentNavigation()?.extras?.state["name"];
    //}
  }

  ngOnDestroy(): void {
    //this.authService.changeValidateCode(false);
  }

  ngOnInit(): void {
    if (this.secret == null || this.secret == "") {
      if (this.page == "registration")
        this.route.navigate(['pre-registration']);
      if (this.page == "resume")
        this.route.navigate(['resume-journey']);
    }
    this.initializeForm();
  }

  initializeForm() {
    this.form = new FormGroup({
      code: new FormControl(null, [Validators.required, Validators.minLength(6), Validators.maxLength(6)]),
    });
    if (this.page == "registration")
      this.form.addControl('name', new FormControl(this.name));
  }

  submit() {
    //validar validade do código inserido
    //se ok, redirecionar para a página do inicio de uma submissão

    var code = this.form.get("code").value.toString();
    if (totp.check(code, this.secret)) {
      console.log("token inserido válido!");
      this.authService.changePreRegistration(false);
      this.authService.changeResumeJourney(false);
      if (this.page == "resume") {
        localStorage.setItem("processNumber", this.processNumber);
        localStorage.setItem("returned", 'edit');
        this.logger.info("Redirecting to Client By Id page");
        this.route.navigate(['/clientbyid'], { skipLocationChange: true });
      } else {
        this.route.navigate(['client'],{ skipLocationChange: true });
      }
    } else {
      console.log("token inserido inválido!");
      this.snackBar.open(this.translate.instant('registration.expired'), '', {
        duration: 4000,
        panelClass: ['snack-bar']
      });
    }
    console.log("Code ", code);
    

  }

  goBack() {
    this.goBackEmitter.emit(false);
  }

}
