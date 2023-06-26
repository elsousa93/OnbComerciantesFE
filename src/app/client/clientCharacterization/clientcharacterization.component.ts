import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AcquiringClientPost } from '../Client.interface';
import { EconomicActivityInformation, LegalNature, SecondLegalNature } from '../../table-info/ITable-info.interface';
import { TableInfoService } from '../../table-info/table-info.service';
import { AbstractControl, FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { IStakeholders } from '../../stakeholders/IStakeholders.interface';
import { DataService } from '../../nav-menu-interna/data.service';
import { CRCService } from '../../CRC/crcservice.service';
import { CRCProcess } from '../../CRC/crcinterfaces';
import { DatePipe, formatDate } from '@angular/common';
import { LoggerService } from 'src/app/logger.service';
import { FileAndDetailsCC } from '../../readcard/fileAndDetailsCC.interface';
import { ClientContext } from '../clientById/clientById.model';
import { ProcessNumberService } from '../../nav-menu-presencial/process-number.service';


@Component({
  selector: 'app-client-characterization',
  templateUrl: './clientcharacterization.component.html',
  providers: [DatePipe]
})

export class ClientCharacterizationComponent implements OnInit {
  processId: string;

  tipologia: string;
  @Input() clientContext: ClientContext;
  @ViewChild('searchInput') input: ElementRef;

  /*Variable declaration*/
  form: AbstractControl;
  myControl = new FormControl('');

  errorMsg: string = "";

  public clientId: string;

  public client: AcquiringClientPost;

  crcError: boolean = false;
  crcNotExists: boolean = false;
  crcIncorrect: boolean = false;
  crcMatchNIF: boolean = false;
  processClient: CRCProcess = {
    capitalStock: {},
    code: '',
    companyName: '',
    mainEconomicActivity: '',
    secondaryEconomicActivity: [],
    expirationDate: '',
    fiscalId: '',
    hasOutstandingFacts: false,
    headquartersAddress: {},
    legalNature: '',
    pdf: '',
    requestId: '',
    stakeholders: [],
    byLaws: '',
    creationDate: ''
  };
  tempClient: any;
  dataCC = null;
  crcCode: string;
  clientExists: boolean;
  crcFound: boolean = false;
  isCommercialSociety: boolean = null;
  isCompany: boolean;
  checkedContinents = []; // posso manter esta variavel para os continentes selecionados
  countryVal: string;

  //Natureza Juridica N1
  legalNatureList: LegalNature[] = [];
  //Natureza Juridica N2
  legalNatureList2: SecondLegalNature[] = [];
  //CAEs
  CAEsList: EconomicActivityInformation[] = [];

  public map = new Map();
  public currentPage: number;
  public subscription: Subscription;
  public subs: Subscription[] = [];

  returned: string; //variável para saber se estamos a editar um processo
  merchantInfo: any;
  associatedWithGroupOrFranchise: boolean = false;
  isAssociatedWithFranchise: boolean;
  NIFNIPC: any;
  idClient: string;
  comprovativoCC: FileAndDetailsCC;
  DisableNIFNIPC = null;
  collectCRC: boolean;
  rootForm: FormGroup;
  hasCRC: boolean;
  legalNatError: boolean = false;

  @Output() formClientCharacterizationReady: EventEmitter<AbstractControl> = new EventEmitter();

  updatedClient: boolean;
  window: any = window;

  changeFormStructure(newForm: FormGroup) {
    this.rootForm.setControl("clientCharacterizationForm", newForm);
    this.form = this.rootForm.get("clientCharacterizationForm");
  }

  initializeTableInfo() {
    //Chamada à API para obter as naturezas juridicas
    this.tableInfo.GetAllLegalNatures().then(result => {
      this.legalNatureList = result.result;
      this.logger.info("Fetched legal natures: " + JSON.stringify(result));
    }).then(val => {
      this.legalNatureList = this.legalNatureList.sort((a, b) => a.description > b.description ? 1 : -1);
    });
  }

  initializeENI() {
    this.logger.info("Initialized ENI Form");
    var collectCRC = this.form.get("collectCRC")?.value;

    this.changeFormStructure(new FormGroup({
      natJuridicaNIFNIPC: new FormControl(this.NIFNIPC, Validators.required),
      socialDenomination: new FormControl((this.returned != null && this.returned != undefined) ? this.merchantInfo?.commercialName?.slice(0, 100) : localStorage.getItem("clientName")?.slice(0, 100) ?? this.client?.commercialName?.slice(0, 100), Validators.required), //sim,
      commercialSociety: new FormControl(false, [Validators.required]), //sim
      collectCRC: new FormControl(this.hasCRC ? true : collectCRC)
    }));
    if (this.form.get("socialDenomination").value.length > 40) {
      this.form.get("socialDenomination").enable();
    } else {
      this.form.get("socialDenomination").disable();
    }
    this.formClientCharacterizationReady.emit(this.form);
  }

  initializeBasicCRCFormControl() {
    this.logger.info("Initialized Basic CRC Form");
    this.NIFNIPC = this.form.get("natJuridicaNIFNIPC").value;
    this.changeFormStructure(new FormGroup({
      natJuridicaNIFNIPC: new FormControl(this.NIFNIPC, Validators.required), //sim
      commercialSociety: new FormControl(this.isCommercialSociety, [Validators.required]), //sim
      crcCode: new FormControl((this.returned != null && this.merchantInfo?.incorporationStatement != undefined) ? this.merchantInfo?.incorporationStatement.code : (this.hasCRC ? this.client.incorporationStatement.code : ''), [Validators.required]), //sim
      collectCRC: new FormControl(this.collectCRC)
    }));
    this.formClientCharacterizationReady.emit(this.form);
  }

  initializeBasicFormControl() {
    this.logger.info("Initialized Basic Form");
    this.setCommercialSociety(false);
    var collectCRC = this.form.get("collectCRC")?.value;

    this.changeFormStructure(new FormGroup({
      natJuridicaNIFNIPC: new FormControl(this.NIFNIPC, [Validators.required]), //sim
      commercialSociety: new FormControl(this.isCommercialSociety, [Validators.required]), //sim
      collectCRC: new FormControl(this.hasCRC ? true : null, [Validators.required])
    }));

    this.form.get("natJuridicaNIFNIPC").updateValueAndValidity();

    if (this.tipologia === 'ENI' || this.tipologia === 'Entrepeneur' || this.tipologia === '02') {
      this.setCommercialSociety(false);
    }
    this.formClientCharacterizationReady.emit(this.form);
  }

  searchBranch(code) {
    return this.tableInfo.GetCAEByCode(code).toPromise();
  }

  initializeFormControlOther() {
    this.logger.info("Initialized Other Form");
    this.NIFNIPC = this.form.get("natJuridicaNIFNIPC").value;
    var collectCRC = this.form.get("collectCRC")?.value;

    this.changeFormStructure(new FormGroup({
      natJuridicaNIFNIPC: new FormControl(this.NIFNIPC, Validators.required),
      natJuridicaN1: new FormControl((this.returned != null) ? this.merchantInfo?.legalNature : this.client.legalNature, Validators.required), //sim
      natJuridicaN2: new FormControl((this.returned != null) ? this.merchantInfo?.legalNature2 : this.client.legalNature2), //sim
      socialDenomination: new FormControl({ value: (this.returned != null) ? this.merchantInfo?.legalName?.slice(0, 100) : localStorage.getItem("clientName")?.slice(0, 100) ?? this.client?.commercialName?.slice(0, 100) ?? this.client?.legalName?.slice(0, 100), disabled: ((localStorage?.getItem("clientName")?.length <= 40 && localStorage?.getItem("clientName")?.length <= 40) || (this.client?.commercialName?.length <= 40 && this.client?.commercialName?.length <= 40) || (this.client?.legalName?.length <= 40 && this.client?.legalName?.length <= 40)) }, Validators.required), //sim
      commercialSociety: new FormControl(this.isCommercialSociety, [Validators.required]), //sim
      collectCRC: new FormControl(false)
    }));

    this.form.get("natJuridicaN1").valueChanges.subscribe(data => {

      this.onLegalNatureSelected();

      if (this.legalNatureList2.length > 0)
        this.form.get("natJuridicaN2").setValidators([Validators.required]);
      else
        this.form.get("natJuridicaN2").clearValidators();
      this.form.get("natJuridicaN2").updateValueAndValidity();
    });

    if (this.form.get("natJuridicaN1").value != null && this.form.get("natJuridicaN1").value != '')
      this.onLegalNatureSelected();

    if (this.form.get("natJuridicaN2").value != null && this.form.get("natJuridicaN2").value != '') {
      this.form.get("natJuridicaN2").setValue(this.client.legalNature2);
      this.form.get("natJuridicaN2").updateValueAndValidity();
    }
    this.formClientCharacterizationReady.emit(this.form);
  }

  initializeFormControlCRC() {
    this.logger.info("Initialized CRC Form");
    this.crcCode = this.form.get("crcCode").value;
    this.logger.info("Date from CRC capital stock: " + this.processClient.capitalStock.date);
    //var b = this.datepipe.transform(this.processClient.capitalStock.date, 'dd-MM-yyyy').toString(); //'MM-dd-yyyy'
    var formatedDate = formatDate(this.processClient.capitalStock.date, 'dd-MM-yyyy', 'pt_PT'); // yyyy-MM-dd
    var branch1 = '';

    this.NIFNIPC = this.form.get("natJuridicaNIFNIPC").value;

    this.changeFormStructure(new FormGroup({
      crcCode: new FormControl(this.processClient.code /*this.client.incorporationStatement.code*/, [Validators.required]), //sim
      natJuridicaN1: new FormControl({ value: this.processClient.legalNature, disabled: (this.processClient.legalNature == "" || this.processClient.legalNature == null) ? false : true/*, disabled: this.clientExists */ }, [Validators.required]), //sim
      natJuridicaNIFNIPC: new FormControl(this.NIFNIPC, [Validators.required]), //sim
      natJuridicaN2: new FormControl(''), //sim
      socialDenomination: new FormControl(this.processClient?.companyName?.slice(0, 100), Validators.required), //sim
      CAE1: new FormControl(this.processClient.mainEconomicActivity, Validators.required), //sim
      CAE1Branch: new FormControl(branch1), //talvez
      CAESecondary1: new FormControl((this.processClient.secondaryEconomicActivity !== null) ? this.processClient.secondaryEconomicActivity[0] : ''), //sim
      CAESecondary1Branch: new FormControl(''), //talvez
      CAESecondary2: new FormControl((this.processClient.secondaryEconomicActivity !== null) ? this.processClient.secondaryEconomicActivity[1] : ''), //sim
      CAESecondary2Branch: new FormControl(''), //talvez
      CAESecondary3: new FormControl((this.processClient.secondaryEconomicActivity !== null) ? this.processClient.secondaryEconomicActivity[2] : ''), //sim
      CAESecondary3Branch: new FormControl(''), //talvez
      constitutionDate: new FormControl(formatedDate), //sim this.processClient.capitalStock.date + ''
      country: new FormControl(this.processClient.headquartersAddress.country, Validators.required), //sim
      location: new FormControl(this.processClient.headquartersAddress.postalArea, Validators.required), //sim
      ZIPCode: new FormControl(this.processClient.headquartersAddress.postalCode, Validators.required), //sim
      address: new FormControl(this.processClient.headquartersAddress.address, Validators.required), //sim
      commercialSociety: new FormControl(this.isCommercialSociety, [Validators.required]), //sim
      collectCRC: new FormControl(true, [Validators.required])
    }));

    if (this.form.get("socialDenomination").value.length > 40) {
      this.form.get("socialDenomination").enable();
    } else {
      this.form.get("socialDenomination").disable();
    }

    this.form.get("CAE1").valueChanges.subscribe(data => {
      if (data !== '') {
        this.form.get("CAE1Branch").setValidators([Validators.required]);
      } else {
        this.form.get("CAE1Branch").clearValidators();
      }
      this.form.get("CAE1Branch").updateValueAndValidity();
    });
    this.form.get("CAESecondary1").valueChanges.subscribe(data => {
      if (data !== '') {
        this.form.get("CAESecondary1Branch").setValidators([Validators.required]);
      } else {
        this.form.get("CAESecondary1Branch").clearValidators();
      }
      this.form.get("CAESecondary1Branch").updateValueAndValidity();
    });
    this.form.get("CAESecondary2").valueChanges.subscribe(data => {
      if (data !== '') {
        this.form.get("CAESecondary2Branch").setValidators([Validators.required]);
      } else {
        this.form.get("CAESecondary2Branch").clearValidators();
      }
      this.form.get("CAESecondary2Branch").updateValueAndValidity();
    });
    this.form.get("CAESecondary3").valueChanges.subscribe(data => {
      if (data !== '') {
        this.form.get("CAESecondary3Branch").setValidators([Validators.required]);
      } else {
        this.form.get("CAESecondary3Branch").clearValidators();
      }
      this.form.get("CAESecondary3Branch").updateValueAndValidity();
    });

    this.searchBranch(this.processClient.mainEconomicActivity.split("-")[0])
      .then((data) => {
        this.form.get("CAE1Branch").setValue(data.description);
      });

    if (this.processClient.secondaryEconomicActivity[0] != null && this.processClient.secondaryEconomicActivity[0] != '') {
      this.searchBranch(this.processClient.secondaryEconomicActivity[0]?.split("-")[0])
        .then((data) => {
          this.form.get("CAESecondary1Branch").setValue(data.description);
        });
    }

    if (this.processClient.secondaryEconomicActivity[1] != null && this.processClient.secondaryEconomicActivity[1] != '') {
      this.searchBranch(this.processClient.secondaryEconomicActivity[1]?.split("-")[0])
        .then((data) => {
          this.form.get("CAESecondary2Branch").setValue(data.description);
        });
    }

    if (this.processClient.secondaryEconomicActivity[2] != null && this.processClient.secondaryEconomicActivity[2] != '') {
      this.searchBranch(this.processClient.secondaryEconomicActivity[2]?.split("-")[0])
        .then((data) => {
          this.form.get("CAESecondary3Branch").setValue(data.description);
        });
    }
    this.formClientCharacterizationReady.emit(this.form);
  }

  constructor(private logger: LoggerService, private datepipe: DatePipe, private rootFormDirective: FormGroupDirective,
    private route: Router, private tableInfo: TableInfoService, private data: DataService, private crcService: CRCService, private processNrService: ProcessNumberService) {
    this.rootForm = this.rootFormDirective.form;
    this.form = this.rootForm.get("clientCharacterizationForm");
    this.initializeTableInfo();
    this.subscription = this.data.updatedClient.subscribe(updatedClient => this.updatedClient = updatedClient);
  }

  ngOnInit(): void {

    this.returned = localStorage.getItem("returned");
    this.tipologia = this.clientContext.tipologia;
    this.clientExists = this.clientContext.clientExists;
    this.comprovativoCC = this.clientContext.comprovativoCC;
    this.processNrService.processId.subscribe(id => this.processId = id);;
    this.clientContext.currentNIFNIPC.subscribe(result => {
      this.NIFNIPC = result;
      this.form.get("natJuridicaNIFNIPC").setValue(this.NIFNIPC + '');
      this.form.get("natJuridicaNIFNIPC").updateValueAndValidity();
    });
    this.DisableNIFNIPC = true;

    this.clientId = this.clientContext.clientId;
    this.dataCC = this.clientContext.dataCC;

    this.getCurrentClientAsync().then(result => {
      if (this.tipologia == 'ENI' || this.tipologia == 'Entrepeneur' || this.tipologia === '02') {
        this.isCommercialSociety = false;
        this.collectCRC = false;
        this.initializeENI();
      } else {
        this.isCommercialSociety = true;
        //this.collectCRC = false;
        //this.initializeFormControlOther();
        this.collectCRC = true;
        this.initializeBasicCRCFormControl();
      }
    });

    if (this.returned != null) {
      this.getMerchantInfoAsync().then(res => {
        this.getClientContextValues();
      })
    }
  }

  getCurrentClientAsync() {
    return new Promise(resolve => {
      this.clientContext.currentClient.subscribe(result => {
        this.client = result;
        resolve(true);
      });
    });
  }

  getMerchantInfoAsync() {
    return new Promise(resolve => {
      this.clientContext.merchantInfo.subscribe(result => {
        this.merchantInfo = result;
        resolve(true);
      })
    });
  }

  getClientContextValues() {
    var context = this;

    this.clientExists = this.clientContext.clientExists;
    this.NIFNIPC = this.clientContext.getNIFNIPC();
    this.tipologia = this.clientContext.tipologia;


    this.getCurrentClientAsync().then(result => {

      this.hasCRC = (JSON.stringify(this.client.incorporationStatement) !== '{}' && this.client.incorporationStatement !== null && this.client.incorporationStatement !== undefined && this.client.incorporationStatement?.code !== '' && this.client.incorporationStatement?.code !== null && this.client.incorporationStatement?.code !== undefined);

      if (this.tipologia === 'ENI' || this.tipologia === 'Entrepeneur' || this.tipologia === '02') {
        this.isCommercialSociety = false;
        this.collectCRC = false;
        this.initializeENI();
      } else {
        if (this.hasCRC) {
          this.isCommercialSociety = true;
          this.collectCRC = true;
          this.initializeBasicCRCFormControl();
          if (this.processId == '' || this.processId == null)
            this.searchByCRC();
        } else {
          if (this.tipologia === 'Company' || this.tipologia === 'Corporate' || this.tipologia === '01' || this.tipologia === 'corporation') {
            setTimeout(() => {
              this.isCommercialSociety = this.getIsCommercialSocietyFromLegalNature(this.client.legalNature);
              this.collectCRC = false;
              this.initializeFormControlOther();
            }, 100);
          }
        }
      }
    });
  }

  getIsCommercialSocietyFromLegalNature(legalNatureCode: string) {
    return this.legalNatureList.find(ln => ln.code === legalNatureCode).isCommercialCompany;
  }

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub?.unsubscribe);
  }

  setCommercialSociety(id: boolean) {
    this.crcFound = false;
    this.collectCRC = undefined;
    this.crcIncorrect = false;
    this.crcNotExists = false;
    this.crcMatchNIF = false;
    var context = this;
    this.form.get('collectCRC').setValue(undefined);
    if (id == true) {
      this.initializeBasicCRCFormControl();
      this.isCommercialSociety = true;
      this.form.get("commercialSociety").setValue(true);
    } else {
      if (this.tipologia === 'Company' || this.tipologia === 'Corporate' || this.tipologia === '01') {
        var stakeholdersToInsert = this.clientContext.getStakeholdersToInsert();
        stakeholdersToInsert.forEach(stake => {
          var index = context.processClient.stakeholders.findIndex(s => s.name == stake["fullName"]);
          if (index != -1)
            stakeholdersToInsert.splice(index, 1);
        });
        this.clientContext.setStakeholdersToInsert(stakeholdersToInsert);
        this.initializeFormControlOther();
      }
      else
        this.initializeENI();
      this.isCommercialSociety = false;
      this.form.get("commercialSociety").setValue(false);
    }
  }

  onLegalNatureSelected() {
    this.legalNatureList2 = [];
    this.legalNatError = false;
    var exists = false;

    var legalNatureToSearch = this.form.get('natJuridicaN1').value;

    if (legalNatureToSearch != "") {
      if (this.isCommercialSociety != this.getIsCommercialSocietyFromLegalNature(legalNatureToSearch)) {
        this.form.get("natJuridicaN1").setErrors({ 'incorrect': true });
        this.legalNatError = true;
        return;
      }
      if (this.form.get("natJuridicaN1").hasError('incorrect')) {
        this.form.get("natJuridicaN1").setErrors(null);
      }
    }

    this.legalNatureList.forEach(legalNat => {
      if (legalNatureToSearch == legalNat.code) {
        exists = true;
        this.legalNatureList2 = legalNat.secondaryNatures;
        this.legalNatureList2 = this.legalNatureList2.sort((a, b) => a.description > b.description ? 1 : -1);
      }
    })

  }

  searchByCRC(event?) {
    const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Delete', 'Tab'];
    this.crcIncorrect = false;
    this.crcNotExists = false;
    this.crcMatchNIF = false;
    var crcInserted = this.form.get('crcCode').value;

    if (allowedKeys.indexOf(event?.key) === -1) {
      if (crcInserted.length <= 14) {
        crcInserted = crcInserted.replace(/\D/g, '');
        crcInserted = crcInserted.replace(/(\d{4})/g, '$1-');
      }
      if (crcInserted.length > 14)
        crcInserted = crcInserted.substring(0, 14);

      this.form.get('crcCode').setValue(crcInserted);
    }
    var crcFormat = /(\b\d{4})-(\b\d{4})-(\b\d{4})/i;
    if (!crcFormat.test(crcInserted)) {
      this.form.get("crcCode").setErrors({ 'incorrect': true });
      this.crcIncorrect = true;
      this.crcFound = false;
      return;
    }
    this.crcIncorrect = false;

    if (this.client.incorporationStatement == null || this.client.incorporationStatement?.code == null || this.client.incorporationStatement?.code == "" || this.client.incorporationStatement?.code != crcInserted) {
      this.crcService.getCRC(crcInserted, '001').subscribe({
        next: clientByCRC => {
          if (clientByCRC === undefined || clientByCRC === null) {
            this.form.get("crcCode").setErrors({ 'incorrect': true });
            this.crcNotExists = true;
            this.crcFound = false;
            return;
          }
          this.crcNotExists = false;

          var nif = this.form.get("natJuridicaNIFNIPC").value;
          if (clientByCRC.fiscalId !== nif) {
            this.form.get("crcCode").setErrors({ 'incorrect': true });
            this.crcMatchNIF = true;
            this.crcFound = false;
            return;
          }
          this.crcMatchNIF = false;

          if (this.form.get("crcCode").hasError("incorrect")) {
            this.form.get("crcCode").setErrors(null);
          }

          var economicActivity = clientByCRC.economicActivity.main.split('-')[0];

          this.crcFound = true;
          this.errorMsg = '';
          let legalNatureCode = this.legalNatureList?.find(nature => nature.description.toLowerCase() == clientByCRC.legalNature.toLowerCase())?.code;
          if (legalNatureCode == undefined) {
            if (clientByCRC.legalNature.toLowerCase().includes("quotas")) {
              legalNatureCode = this.legalNatureList?.find(nature => nature.description.includes("quotas"))?.code;
              if (legalNatureCode == undefined) {
                legalNatureCode = "";
              }
            }
          }

          this.processClient.legalNature = legalNatureCode;

          this.processClient.mainEconomicActivity = economicActivity;
          //this.processClient.secondaryEconomicActivity[0] = clientByCRC.economicActivity?.secondary[0]?.split('-')[0];
          //this.processClient.secondaryEconomicActivity[1] = clientByCRC.economicActivity?.secondary[1]?.split('-')[0];
          //this.processClient.secondaryEconomicActivity[2] = clientByCRC.economicActivity?.secondary[2]?.split('-')[0];
          this.processClient.secondaryEconomicActivity = [];
          clientByCRC.economicActivity?.secondary.forEach(value => {
            this.processClient.secondaryEconomicActivity.push(value.split('-')[0]);
          });
          this.processClient.fiscalId = clientByCRC.fiscalId;
          this.processClient.companyName = clientByCRC.companyName; //
          this.processClient.capitalStock.date = clientByCRC.capitalStock.date; //
          this.processClient.capitalStock.capital = clientByCRC.capitalStock.amount; //
          this.processClient.headquartersAddress.address = clientByCRC.headquartersAddress.fullAddress;
          this.processClient.headquartersAddress.postalCode = clientByCRC.headquartersAddress.postalCode;
          this.processClient.headquartersAddress.postalArea = clientByCRC.headquartersAddress.postalArea;
          this.processClient.headquartersAddress.country = clientByCRC.headquartersAddress.country;
          this.processClient.expirationDate = clientByCRC.expirationDate; //
          this.processClient.byLaws = clientByCRC.obligeWay;
          this.processClient.hasOutstandingFacts = clientByCRC.hasOutstandingFacts;
          this.processClient.stakeholders = clientByCRC.stakeholders;
          this.clientContext.setStakeholdersToInsert(clientByCRC.stakeholders);
          this.processClient.pdf = clientByCRC.pdf;
          this.processClient.code = crcInserted;
          this.processClient.requestId = clientByCRC.requestId;
          this.processClient.creationDate = clientByCRC.creationDate;
          this.initializeFormControlCRC();
        }, error: (error) => {
          this.crcNotExists = true;
          this.crcFound = false;
          this.form.get("crcCode").setErrors({ 'incorrect': true });
        }
      });
    } else {
      this.processClient.legalNature = this.client?.legalNature;
      this.processClient.mainEconomicActivity = this.client?.mainEconomicActivity;
      this.processClient.secondaryEconomicActivity = [];
      this.client?.otherEconomicActivities?.forEach(value => {
        this.processClient.secondaryEconomicActivity.push(value);
      });
      this.processClient.fiscalId = this.client?.fiscalId;
      this.processClient.companyName = this.client?.legalName; //
      this.processClient.capitalStock.date = this.client?.shareCapital?.date; //
      this.processClient.capitalStock.capital = this.client?.shareCapital?.capital; //
      this.processClient.headquartersAddress.address = this.client?.headquartersAddress?.address;
      this.processClient.headquartersAddress.postalCode = this.client?.headquartersAddress?.postalCode;
      this.processClient.headquartersAddress.postalArea = this.client?.headquartersAddress?.postalArea;
      this.processClient.headquartersAddress.country = this.client?.headquartersAddress?.country;
      this.processClient.expirationDate = this.client?.incorporationStatement?.validUntil; //
      this.processClient.byLaws = this.client?.byLaws;
      this.processClient.stakeholders = [];
      this.clientContext.setStakeholdersToInsert(this.processClient?.stakeholders);
      this.processClient.code = this.client?.incorporationStatement?.code;
      this.crcFound = true;
      this.initializeFormControlCRC();
    }
  }

  submit() {
    var formValues = this.form.value;

    var delivery = this.client.documentationDeliveryMethod;

    if (delivery === 'viaDigital' || delivery === 'Portal')
      this.client.documentationDeliveryMethod = 'Portal';
    else
      this.client.documentationDeliveryMethod = 'Mail';

    if (this.isCommercialSociety && this.collectCRC) { // adicionei o this.collectCRC
      if (this.processClient.code != "") {
        this.client.headquartersAddress = {
          address: this.form.value["address"],
          country: this.form.value["country"],
          postalCode: this.form.value["ZIPCode"],
          postalArea: this.form.value["location"]
        }
        this.client.mainEconomicActivity = this.form.value["CAE1"];
        this.client.otherEconomicActivities = [];

        //var CAESecondary1 = (this.form.value["CAESecondary1"]);
        //var CAESecondary2 = (this.form.value["CAESecondary2"]);
        //var CAESecondary3 = (this.form.value["CAESecondary3"]);

        //if (CAESecondary1 !== null)
        //  this.client.otherEconomicActivities.push(this.form.value["CAESecondary1"]);
        //if (CAESecondary2 !== null)
        //  this.client.otherEconomicActivities.push(this.form.value["CAESecondary2"]);
        //if (CAESecondary3 !== null)
        //  this.client.otherEconomicActivities.push(this.form.value["CAESecondary3"]);

        this.client.otherEconomicActivities = this.processClient.secondaryEconomicActivity;
        //Paises destino

        if (this.form.value["constitutionDate"] == "" || this.form.value["constitutionDate"] == null) {
          this.client.incorporationDate = null;
        } else {
          this.client.incorporationDate = this.processClient.capitalStock.date;
        }
        this.client.incorporationStatement = {
          code: this.form.value["crcCode"],
          validUntil: this.processClient.expirationDate
        }
        this.client.fiscalId = this.form.value["natJuridicaNIFNIPC"];
        this.client['fiscalId'] = this.form.value["natJuridicaNIFNIPC"];
        this.client.commercialName = this.form.get("socialDenomination").value.slice(0, 40); 
        this.client.legalName = this.form.get("socialDenomination").value;
        this.client.shortName = this.form.get("socialDenomination").value.slice(0, 40);
        this.client.shareCapital = {
          capital: this.processClient.capitalStock.capital,
          date: this.processClient.capitalStock.date
        }
        this.client.byLaws = this.processClient.byLaws;
        this.client.legalNature = this.form.get("natJuridicaN1").value;//this.processClient.legalNature;
        this.client.legalNature2 = (this.form.value["natJuridicaN2"] != '' && this.form.value["natJuridicaN2"] != null) ? this.form.value["natJuridicaN2"] : null;

        if (this.tipologia === 'corporation' || this.tipologia === 'Corporate' || this.tipologia === 'Company' || this.tipologia === '01')
          this.client.merchantType = 'Corporate';

        if (this.tipologia === 'Entrepeneur' || this.tipologia === 'ENI' || this.tipologia === '02')
          this.client.merchantType = 'Entrepeneur';
      }
    } else {

      this.client.incorporationStatement = null;
      this.client.fiscalId = this.form.value["natJuridicaNIFNIPC"];
      this.client['fiscalId'] = this.form.value["natJuridicaNIFNIPC"];
      this.client.commercialName = this.form.get("socialDenomination")?.value?.slice(0, 40);
      this.client.legalName = this.form.get("socialDenomination")?.value;
      this.client.shortName = this.form.get("socialDenomination")?.value?.slice(0, 40);

      if (this.tipologia === 'corporation' || this.tipologia === 'Company' || this.tipologia === 'Corporate' || this.tipologia === '01') {
        this.client.legalNature = this.form.value["natJuridicaN1"];

        var natJuridicaN2 = this.form.value["natJuridicaN2"];

        this.client.merchantType = 'Corporate';

        if (natJuridicaN2 != null && natJuridicaN2 != '')
          this.client.legalNature2 = this.form.value["natJuridicaN2"];
      }
      //this.client.commercialName = this.form.value["socialDenomination"];
    }
    if (this.tipologia === 'ENI' || this.tipologia === 'Entrepeneur' || this.tipologia === '02') {
      this.client.legalName = this.form.get("socialDenomination").value;
      this.client.commercialName = this.form.get("socialDenomination").value.slice(0, 40);
      this.client.merchantType = 'Entrepeneur';
      if (this.dataCC !== undefined && this.dataCC !== null) {
        this.client.shortName = this.dataCC.nameCC;
        this.client.fiscalId = this.dataCC.nifCC;
        this.client.commercialName = this.dataCC.nameCC;
        this.client.legalName = this.dataCC.nameCC;

        if (this.dataCC.countryCC != null) {
          this.client.headquartersAddress.address = this.dataCC.addressCC;
          this.client.headquartersAddress.country = this.dataCC.countryCC;
          this.client.headquartersAddress.postalArea = this.dataCC.localityCC;
          this.client.headquartersAddress.postalCode = this.dataCC.postalCodeCC.split(" ")[0];
        }
      }
    }

    this.NIFNIPC = this.form.get("natJuridicaNIFNIPC").value;
    this.clientContext.clientExists = this.clientExists;
    this.clientContext.tipologia = this.tipologia;
    this.clientContext.NIFNIPC = this.NIFNIPC;
    this.clientContext.setClient(this.client);
    this.clientContext.clientId = this.clientId;
    this.clientContext.processId = this.processId;
    this.clientContext.setMerchantInfo(this.merchantInfo);
    this.clientContext.crc = (this.crcFound) ? this.processClient : null;
    this.clientContext.comprovativoCC = this.comprovativoCC;

    //Intervenientes do processo
    var newSubmission = this.clientContext.newSubmission;
    var stakeholdersToInsert = this.clientContext.getStakeholdersToInsert();
    var crc = this.clientContext.crc;
    var context = this;
    var client = this.clientContext.getClient();
    var CC = null;
    this.data.currentDataCC.subscribe(dataCC => CC = dataCC);

    newSubmission.stakeholders = [];
    stakeholdersToInsert.forEach(function (value, idx) {
      if (client.fiscalId !== value.fiscalId) {
        var fiscalID = value.fiscalId;

        var stakeholderToInsert = {
          "fiscalId": (fiscalID != null && fiscalID != undefined) ? fiscalID : '',
          "shortName": value.name == null ? value["shortName"] : value.name?.slice(0, 40),
          "fullName": value.name == null ? value["fullName"] : value.name,
          "contactName": value.name == null ? value["contactName"] : value.name,
          "fiscalAddress": {
            "postalCode": value["address"] != null ? value["address"]["postalCode"]?.replace(/\s/g, "") : null,
            "postalArea": value["address"] != null ? value["address"]["postalArea"] : null,
            "country": value["address"] != null ? value["address"]["country"] : null,
            "address": value["address"] != null ? value["address"]["fullAddress"] : null
          },
          "directCapitalHeld": value.capitalHeldPercentage,
          "isBeneficiary": value.isBeneficiary,
          "role": value.role,
          "isProxy": false,
          "signType": "CitizenCard"
        } as IStakeholders;
        newSubmission.stakeholders.push(stakeholderToInsert);
      } else {
        newSubmission.stakeholders.push(value);
      }
    });

    if (crc != null && crc != undefined) {
      newSubmission.documents.push({
        documentType: "0034",
        documentPurpose: 'CorporateBody',
        file: {
          fileType: 'PDF',
          binary: crc.pdf
        },
        validUntil: crc.expirationDate,
        data: {
          code: this.processClient.code,
          corporateName: this.processClient.companyName,
          fiscalId: this.processClient.fiscalId,
          legalNature: this.form.get("natJuridicaN1").value,
          legalNature2: (this.form.get("natJuridicaN2").value != null && this.form.get("natJuridicaN2").value != "") ? this.form.get("natJuridicaN2").value : null,
          shareCapital: this.processClient.capitalStock.capital,
          byLaws: this.processClient.byLaws,
          shareCapitalDate: this.processClient.capitalStock.date,
          establishmentDate: this.processClient.creationDate,
          address: this.processClient.headquartersAddress.address,
          postalCode: this.processClient.headquartersAddress.postalCode,
          postalArea: this.processClient.headquartersAddress.postalArea,
          country: this.processClient.headquartersAddress.country,
          economicActivityCode: this.processClient.mainEconomicActivity,
          economicActivityCode2: this.processClient?.secondaryEconomicActivity[0],
          economicActivityCode3: this.processClient?.secondaryEconomicActivity[1],
          economicActivityCode4: this.processClient?.secondaryEconomicActivity[2],
          economicActivityCode5: null,
          economicActivityCode6: null,
          validUntil: this.processClient.expirationDate
        }
      })
    }

    var comprovativoCC = this.clientContext.comprovativoCC;

    if (comprovativoCC !== null && comprovativoCC !== undefined) {
      if (CC?.notes != null || CC?.notes != "") {
        var assinatura = "Sabe assinar";
        if (CC?.notes.toLowerCase().includes("não sabe assinar") || CC.notes.toLowerCase().includes("não pode assinar")) {
          assinatura = "Não sabe assinar";
        }
      }
      newSubmission.documents.push({
        documentType: "0018",
        documentPurpose: 'Identification',
        file: {
          fileType: 'PDF',
          binary: comprovativoCC.file
        },
        validUntil: new Date(comprovativoCC.expirationDate).toISOString(),
        data: {
          fullName: CC.nameCC,
          documentNumber: CC.cardNumberCC,
          fiscalNumber: CC.nifCC,
          gender: CC.gender,
          birthday: CC.birthdateCC,
          validUntil: CC.expiryDate,
          canSign: assinatura == "Sabe assinar" ? true : false,
          country: CC.countryCC,
          address: CC.addressCC,
          postalArea: CC.localityCC,
          postalCode: CC.postalCodeCC 
        }
      })
    }
    if (newSubmission.documents.find(doc => doc.documentType == "0034") != undefined)
      newSubmission.documents.find(doc => doc.documentType == "0034").data = Object.fromEntries(Object.entries(newSubmission.documents.find(doc => doc.documentType == "0034").data).filter(([_, v]) => v != null));
    if (newSubmission.documents.find(doc => doc.documentType == "0018") != undefined)
      newSubmission.documents.find(doc => doc.documentType == "0018").data = Object.fromEntries(Object.entries(newSubmission.documents.find(doc => doc.documentType == "0018").data).filter(([_, v]) => v != null));

    this.clientContext.newSubmission = newSubmission;
  }

  GetCountryByZipCode() {
    var zipcode = this.form.value['ZIPCode'];
    if (zipcode.length === 8) {
      var zipCode = zipcode.split('-');

      this.subs.push(this.tableInfo.GetAddressByZipCode(Number(zipCode[0]), Number(zipCode[1])).subscribe(address => {
        var addressToShow = address[0];
        this.form.get('address').setValue(addressToShow.address);
        this.form.get('country').setValue(addressToShow.country);
        this.form.get('location').setValue(addressToShow.postalArea);
      }));
    }
  }

  setCollectCRC(value: boolean) {
    this.collectCRC = value;
    this.crcIncorrect = false;
    this.crcNotExists = false;
    this.crcMatchNIF = false;
    var context = this;
    if (value == false) {
      this.crcFound = false;
      if ((this.returned == 'edit' || this.returned == null) && (this.processId == '' || this.processId == null)) { 
        var stakeholdersToInsert = this.clientContext.getStakeholdersToInsert();
        stakeholdersToInsert.forEach(stake => {
          var index = context.processClient.stakeholders.findIndex(s => s.name == stake["fullName"]);
          if (index != -1)
            stakeholdersToInsert.splice(index, 1);
        });
        this.clientContext.setStakeholdersToInsert(stakeholdersToInsert);
        this.processClient.stakeholders = [];
      }
      this.initializeFormControlOther();
    }
    else
      this.initializeBasicCRCFormControl();
  }
}
