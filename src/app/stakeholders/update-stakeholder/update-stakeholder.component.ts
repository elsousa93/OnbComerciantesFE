import { Component, Inject, OnInit, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { IStakeholders } from '../IStakeholders.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, NgForm, Form, FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Configuration, configurationToken } from 'src/app/configuration';
//import { DataService } from '../nav-menu-interna/data.service';
import { LoggerService } from 'src/app/logger.service';

@Component({
  selector: 'app-update-stakeholder',
  templateUrl: './update-stakeholder.component.html',
  styleUrls: ['./update-stakeholder.component.css']
})
export class UpdateStakeholderComponent implements OnInit {

  private baseUrl;


  newStake: IStakeholders = {
  "fiscalId": 0,
    "identificationDocument": {
    "identificationDocumentType": "",
      "identificationDocumentId": "",
        "identificationDocumentCountry": "",
          "identificationDocumentValidUntil": ""
  },
  "fullName": "it",
  "contactName": "",
  "shortName": "",
  "role": "",
  "fiscalAddress": {
    "address": "",
      "postalCode": "",
        "postalArea": "",
          "country": ""
  },
  "foreignFiscalInformation": {
    "issuerCountry": "",
      "issuanceIndicator": "",
        "fiscalId": "",
          "issuanceReason": ""
  },
  "isProxy": false,
    "phone": {
    "phoneNumber": "",
      "countryCode": ""
  },
  "email": "",
    "birthDate": "",
      "pep": {
    "isPep": false,
      "pepDetails": {
      "kind": "",
      "country": "",
      "sinceWhen": "",
      "name": "",
      "fiscalId": "",
      "identificationDocumentType": "",
      "identificationDocumentId": "",
      "identificationDocumentValidUntil": "",
      "address": {
      "address": "",
      "postalCode": "",
      "postalArea": "",
      "country": {
          "value": ""
        }
      }
    },
    "hasFamilityRelationship": true,
      "familyRelationshipKind": "",
        "hasBusinessRelationship": true,
          "businessRelationshipKind": "",
            "relatedPep": {
      "id": "",
        "href": ""
    }
    }
  } as unknown as IStakeholders

  formUpdateStakeholder!: FormGroup;

  ngForm!: FormGroup;
  public stakes: IStakeholders[] = [];
  public fiscalId: number = 0;

  public stakeSearch: IStakeholders[] = [this.newStake];
  public flagRecolhaEletronica: boolean = true;
  public poppy?: any;

  formStakeholderSearch: FormGroup;

  public map: Map<number, boolean>;
  public currentPage: number;
  public subscription: Subscription;

  constructor(private logger : LoggerService, private router: ActivatedRoute,
    private http: HttpClient, 
    private route: Router,  private fb: FormBuilder) {
    //private data: DataService

    this.ngOnInit();
  }

  ngOnInit(): void {
    this.createForm();
    this.fiscalId = Number(this.router.snapshot.params['nif']);
    this.http.get<IStakeholders>(this.baseUrl + 'BEStakeholders/GetStakeholderByID/'
      + this.fiscalId).subscribe(result => {
        this.logger.debug("GetStakeholderById");
        this.logger.debug(result);
        this.createForm();
        this.resultToStake(result);
   
      }, error => console.error(error));
  }



  createForm() {
    this.formUpdateStakeholder = this.fb.group({
      flagAssociado: ['True'],
      flagProcurador: ['True'],
      flagRecolhaEletronica: ['True'],
      fullName: ['Test'],
      documentType: [''],
      identificationDocumentCountry: ['PT'],
      identificationDocumentValidUntil: ['PT'],
      fiscalId: [10],
      address: ['A'],
      postalCode: ['A'],
      postalArea: ['A'],
      country: ['A'],

    });
  }

  //Funcao para associar os campos do formulario aos campos do Stakeholder
  //Nao esta a ser chamado
  //Feito de outra forma no submit, para debug
  resultToStake(result) {
    this.newStake = result;
    
    this.formUpdateStakeholder = this.fb.group({
      fullName: this.newStake.fullName,
      documentType: this.newStake.identificationDocument.type,
      documentCountry: this.newStake.identificationDocument.country,
      identificationDocumentId: this.newStake.identificationDocument.number,
      identificationDocumentValidUntil: this.newStake.identificationDocument.expirationDate,
      fiscalId: this.newStake.fiscalId,
      //roleStakeholder: this.newStake.role,    NÃO SEI QUAL È ESTE CAMPO
      address: this.newStake.fiscalAddress.address,
      postalCode: this.newStake.fiscalAddress.postalCode,
      postalArea: this.newStake.fiscalAddress.postalArea,
      country: this.newStake.fiscalAddress.country,
    });
    this.logger.debug("New Stake uploaded: " + this.newStake);
  }

  submit(formUpdateStakeholder) {
    this.logger.debug("Form result: " + formUpdateStakeholder);
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }
   
    this.newStake.fullName = formUpdateStakeholder.fullName;
    this.newStake.identificationDocument.type = formUpdateStakeholder.documentType;
    this.newStake.identificationDocument.country = formUpdateStakeholder.documentCountry;
    this.newStake.identificationDocument.number = formUpdateStakeholder.identificationDocumentId;
    this.newStake.identificationDocument.expirationDate = formUpdateStakeholder.identificationDocumentValidUntil;
    this.newStake.fiscalId = formUpdateStakeholder.fiscalId;
    //this.newStake.role = formUpdateStakeholder.roleStakeholder;    NAO SEI QUAL É ESTE CAMPO
    this.newStake.fiscalAddress.address = formUpdateStakeholder.streetAdressStakeholder;
    this.newStake.fiscalAddress.postalCode = formUpdateStakeholder.postCodeAdressStakeholder;
    this.newStake.fiscalAddress.postalArea = formUpdateStakeholder.areaBillingAdressStakeholder;
    this.newStake.fiscalAddress.country = formUpdateStakeholder.countryBillingAdressStakeholder;

     this.logger.debug("TESTE");
    // https:/ / localhost: 7269 / BEStakeholders / EditStakeholderByID / 1000
    this.http.post<IStakeholders>(this.baseUrl + 'BEStakeholders/EditStakeholderByID/' +
    this.newStake.fiscalId, this.newStake).subscribe(result => {
      alert("Atualização efetuada!");
      this.route.navigate(['stakeholders']);
    }, error => console.error(error));

    this.logger.debug("executed edit stake by ID");
  }
}
