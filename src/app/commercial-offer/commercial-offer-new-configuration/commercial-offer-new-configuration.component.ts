import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { distinctUntilChanged, Subscription } from 'rxjs';
import { Configuration, configurationToken } from 'src/app/configuration';
import { DataService } from '../../nav-menu-interna/data.service';
import { Istore, ShopDetailsAcquiring, ShopEquipment } from '../../store/IStore.interface';
import { LoggerService } from 'src/app/logger.service';
import { FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { StoreService } from '../../store/store.service';
import { TenantCommunication, TenantTerminal } from '../../table-info/ITable-info.interface';
import { TableInfoService } from '../../table-info/table-info.service';
import { EquipmentOwnershipTypeEnum, CommunicationOwnershipTypeEnum, ProductPackKindEnum, ProductPackPricingFilter, TerminalSupportEntityEnum, MerchantCatalog, ProductPackRootAttributeProductPackKind, ProductPackPricingEntry, ProductPackPricingAttribute, ProductPackEntry } from '../../commercial-offer/ICommercialOffer.interface';
import { CommercialOfferService } from '../commercial-offer.service';



@Component({
  selector: 'app-commercial-offer-new-configuration',
  templateUrl: './commercial-offer-new-configuration.component.html',
  styleUrls: ['./commercial-offer-new-configuration.component.css']
})
export class CommercialOfferNewConfigurationComponent implements OnInit, OnChanges {
  private baseUrl: string;
  public EquipmentOwnershipTypeEnum = EquipmentOwnershipTypeEnum;
  public CommunicationOwnershipTypeEnum = CommunicationOwnershipTypeEnum;
  public ProductPackKindEnum = ProductPackKindEnum;


  //public storeEquip: ShopEquipment = { };
  public store: ShopDetailsAcquiring;
  public clientID: number = 12345678;

  /////////////////////////////////////////
  //Informação proveniente de reference data
  allCommunications: TenantCommunication[] = [];
  allTerminals: TenantTerminal[] = [];

  //////////////////////////////////////////


  /*Is it supposed to relicate the Commercial offert from another store?*/
  selectionsReplicate = ['Não', 'Sim'];
  /*Default case*/
  selectedOption = 'Não';

  public subscription: Subscription;
  public map: Map<number, boolean>;
  public currentPage: number;

  formConfig: FormGroup;
  pricingForm: FormGroup;
  edit: boolean;
  submissionId: string;

  productPackPricingFilter = new ProductPackPricingFilter();
  pricingOptions: ProductPackPricingEntry[] = [];
  pricingAttributeList: ProductPackPricingAttribute[] = [];

  returned: string;

  @Input() parentFormGroup: FormGroup;
  @Input() isNewConfig: boolean;
  @Input() currentStore: ShopDetailsAcquiring;
  @Input() storeEquip: ShopEquipment;
  @Input() packId: string;
  @Input() packs: ProductPackEntry[];
  @Input() merchantCatalog: MerchantCatalog;
  @Input() groupsList: ProductPackRootAttributeProductPackKind[];

  @Output() changedStoreEvent = new EventEmitter<boolean>();
  @Output() storeEquipEvent = new EventEmitter<ShopEquipment>();

  firstTime: boolean = true;
  selectedMensalidadeId: string = "";
  firstTimeEdit: boolean = true;

  loadReferenceData() {
    this.subs.push(this.tableInfo.GetTenantCommunications().subscribe(result => {
      this.allCommunications = result;
      this.allCommunications = this.allCommunications.sort((a, b) => a.description> b.description? 1 : -1); //ordenar resposta
    }), this.tableInfo.GetTenantTerminals().subscribe(result => {
      this.allTerminals = result;
      this.allTerminals = this.allTerminals.sort((a, b) => a.description> b.description? 1 : -1); //ordenar resposta
    }));
  }

  public subs: Subscription[] = [];

  constructor(private logger: LoggerService, http: HttpClient, @Inject(configurationToken) private configuration: Configuration, private route: Router, private data: DataService, private storeService: StoreService, private tableInfo: TableInfoService, private COService: CommercialOfferService, private rootFormGroup: FormGroupDirective) {
    this.baseUrl = configuration.baseUrl;

    
    this.data.updateData(false, 5, 2);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["currentStore"]) {
      //this.changedStoreEvent.emit(true);
      this.currentStore = changes["currentStore"].currentValue;
    }
    if (changes["isNewConfig"]) {
      this.isNewConfig = changes["isNewConfig"].currentValue;
    }
    if (changes["storeEquip"]) {
      if (changes["storeEquip"].previousValue != null) {
        //this.updateFormData();
      }
    }
  }

  disableForm() {
    if (this.currentStore.productCode.toLowerCase() == "card present" || this.currentStore.productCode.toLowerCase() == "cardpresent") {
      if (this.currentStore.supportEntity.toLowerCase() == "acquirer") { //caso o ETA seja UNICRE
        if (this.currentStore.subproductCode.toLowerCase() == "easy" || this.currentStore.subproductCode.toLowerCase() == "Easy") {
          this.formConfig.get("terminalProperty").setValue("self");
          this.formConfig.get("terminalProperty").disable();

          this.formConfig.get("communicationOwnership").setValue("self");
          this.formConfig.controls["communicationOwnership"].disable();

          this.formConfig.updateValueAndValidity();
        } else {
          //slide 97, não percebi qual é a exceção que deve ser feita
        }
      } else { // caso seja BANCO

      }
    }
  }

  ngOnInit(): void {
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
    this.submissionId = localStorage.getItem("submissionId");
    this.returned = localStorage.getItem("returned");
    console.log('VALOR DA LOJA SELECIONADA NAS CONFIGURAÇÕES ', this.currentStore);
    this.loadReferenceData();
    this.initializeForm();
    if (this.isNewConfig == false) {
      this.storeEquip.equipmentOwnership = this.storeEquip.equipmentOwnership.toLocaleLowerCase();
      this.storeEquip.communicationOwnership = this.storeEquip.communicationOwnership.toLocaleLowerCase();
      this.updateFormData();
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub?.unsubscribe);
  }

  initializeForm() {
    this.formConfig = new FormGroup({
      name: new FormControl(this.isNewConfig == false ? this.storeEquip.shopEquipmentId : ''/*, Validators.required*/),
      terminalProperty: new FormControl(this.isNewConfig == false ? this.storeEquip.equipmentOwnership.toLocaleLowerCase() : '', Validators.required),
      communicationOwnership: new FormControl(this.isNewConfig == false ? this.storeEquip.communicationOwnership.toLocaleLowerCase() : '', Validators.required),
      terminalType: new FormControl(this.isNewConfig == false ? this.storeEquip.equipmentType : '', Validators.required),
      communicationType: new FormControl(this.isNewConfig == false ? this.storeEquip.communicationType : '', Validators.required),
      terminalAmount: new FormControl(this.isNewConfig == false ? this.storeEquip.quantity : '', Validators.required)
    });

    this.pricingForm = new FormGroup({});

    this.disableForm();

    this.formConfig.get("terminalProperty").valueChanges.pipe(distinctUntilChanged()).subscribe(val => {
      if (val.toLocaleLowerCase() === 'self') {
        this.formConfig.get('communicationOwnership').setValidators([Validators.required]);
        this.formConfig.get('terminalType').setValidators([Validators.required]);
        this.formConfig.get('communicationType').setValidators([Validators.required]);
        this.formConfig.get('terminalAmount').setValidators([Validators.required]);
      } else {
        this.formConfig.get('communicationOwnership').setValidators(null);
        this.formConfig.get('terminalType').setValidators(null);
        this.formConfig.get('communicationType').setValidators(null);
        this.formConfig.get('terminalAmount').setValidators(null);
      }
      this.formConfig.get('communicationOwnership').updateValueAndValidity();
      this.formConfig.get('terminalType').updateValueAndValidity();
      this.formConfig.get('communicationType').updateValueAndValidity();
      this.formConfig.get('terminalAmount').updateValueAndValidity();
    });

    this.formConfig.valueChanges.pipe(distinctUntilChanged()).subscribe(val => {
      if (((this.formConfig.valid && val.terminalProperty.toLocaleLowerCase() === 'self') || (val.terminalProperty.toLocaleLowerCase() === 'client' && this.checkFormValid())) && this.firstTime) {
        this.firstTime = false;
      } else if (((this.formConfig.valid && val.terminalProperty.toLocaleLowerCase() === 'self') || (val.terminalProperty.toLocaleLowerCase() === 'client' && this.checkFormValid())) && !this.firstTime) {
        this.pricingOptions = [];
        this.pricingAttributeList = [];
        this.loadMensalidades();
      } else if (((!this.formConfig.valid && val.terminalProperty.toLocaleLowerCase() === 'self') || (val.terminalProperty.toLocaleLowerCase() === 'client' && !this.checkFormValid())) && !this.firstTime) {
        this.pricingOptions = [];
        this.pricingAttributeList = [];
      }
    });
  }

  checkFormValid() {
    if (this.formConfig.get("terminalProperty").value != "" && this.formConfig.get("communicationOwnership").value != "" && this.formConfig.get("terminalType").value != "" && this.formConfig.get("communicationType").value != "" && this.formConfig.get("terminalAmount").value != null /*&& this.formConfig.get("name").value != ""*/)
      return true;
    else
      return false;
  }

  updateFormData() {
    if (this.formConfig.valid) {
      this.pricingOptions = [];
      this.pricingAttributeList = [];
      this.loadMensalidades();
      this.firstTime = false;
    }
    //this.formConfig.get("name").setValue(this.storeEquip.shopEquipmentId, {emitEvent: false});
    //this.formConfig.get("terminalProperty").setValue(this.storeEquip.equipmentOwnership, { emitEvent: false });
    //this.formConfig.get("communicationOwnership").setValue(this.storeEquip.communicationOwnership, { emitEvent: false });
    //this.formConfig.get("terminalType").setValue(this.storeEquip.equipmentType, { emitEvent: false });
    //this.formConfig.get("communicationType").setValue(this.storeEquip.communicationType, { emitEvent: false });
    //this.formConfig.get("terminalAmount").setValue(this.storeEquip.quantity, { emitEvent: false });
    //this.pricingOptions = [];
    //this.pricingAttributeList = [];
    //this.loadMensalidades();
  }

  //chamar tabela onde podemos selecionar a mensalidade que pretendemos
  loadMensalidades() {
    this.productPackPricingFilter = {
      processorId: this.packs[0].processors[0],
      productCode: this.currentStore.productCode,
      subproductCode: this.currentStore.subproductCode,
      merchant: this.merchantCatalog,
      packAttributes: this.groupsList,
      store: {
        activity: this.currentStore.activity,
        subActivity: this.currentStore.subActivity,
        supportEntity: TerminalSupportEntityEnum[this.currentStore.supportEntity] as TerminalSupportEntityEnum,
        referenceStore: this.currentStore.shopId,
        supportBank: this.currentStore.supportEntity
      },
      equipment: {
        communicationOwnership: CommunicationOwnershipTypeEnum[this.formConfig.get("communicationOwnership").value] as CommunicationOwnershipTypeEnum,
        communicationType: this.formConfig.get('communicationType').value,
        equipmentOwnership: EquipmentOwnershipTypeEnum[this.formConfig.get("terminalProperty").value] as EquipmentOwnershipTypeEnum,
        equipmentType: this.formConfig.get('terminalType').value,
        quantity: this.formConfig.get('terminalAmount').value
      }
    }

    this.COService.ListProductCommercialPackPricing(this.packId, this.productPackPricingFilter).then(result => {
      this.pricingOptions = [];
      if (this.storeEquip?.pricing == null) {
        if (result.result.length == 1) {
          this.pricingOptions.push(result.result[0]);
          this.chooseMensalidade(result.result[0].id);
        } else {
          result.result.forEach(options => {
            this.pricingOptions.push(options);
          });
        }
      } else {
        result.result.forEach(options => {
          this.pricingOptions.push(options);
        });
        if (this.firstTimeEdit) {
          this.firstTimeEdit = false;
          this.chooseMensalidade(this.storeEquip.pricing.id);
        }
      }
    });
  }



  //ao escolher uma mensalidade, é carregado os valores associados a essa mensalidade escolhida
  chooseMensalidade(id: string) {
    this.selectedMensalidadeId = id;
    this.pricingAttributeList = [];
    if (this.formConfig.valid) {
      if (this.storeEquip?.pricing == null) {
        this.COService.GetProductCommercialPackPricing(this.packId, id, this.productPackPricingFilter).then(res => {
          res.result.attributes.forEach(attr => {
            this.pricingAttributeList.push(attr);
          });
          this.addPricingForm();
        });
      } else {
        this.pricingAttributeList.push(this.storeEquip.pricing.attribute);
        this.addPricingForm();
      }
    }
  }

  addPricingForm() {
    var context = this;
    var valueGroup = new FormGroup({});
    if (this.isNewConfig) {
      this.pricingAttributeList.forEach(function (value, idx) {
        valueGroup.addControl("formControlPricingOriginal" + value.id, new FormControl(value.value));
        valueGroup.addControl("formControlPricingDiscount" + value.id, new FormControl(value.value));
        valueGroup.addControl("formControlPricingFinal" + value.id, new FormControl(value.value));
        context.pricingForm.addControl("formGroupPricing" + value.id, valueGroup);
      });
    } else {
      this.pricingAttributeList.forEach(function (value, idx) {
        valueGroup.addControl("formControlPricingOriginal" + value.id, new FormControl(value.finalValue));
        valueGroup.addControl("formControlPricingDiscount" + value.id, new FormControl(value.finalValue));
        valueGroup.addControl("formControlPricingFinal" + value.id, new FormControl(value.finalValue));
        context.pricingForm.addControl("formGroupPricing" + value.id, valueGroup);
      });
    }
  }

  numericOnly(event): boolean {
    var ASCIICode = (event.which) ? event.which : event.keyCode;

    if (ASCIICode > 31 && (ASCIICode < 48 || ASCIICode > 57))
      return false;
    return true;
  }

  submit() {
    if (this.formConfig.valid) {

      if (this.isNewConfig == true) {
        this.storeEquip = {};
      }

      this.storeEquip.shopEquipmentId = this.formConfig.get("name").value;
      this.storeEquip.equipmentOwnership = this.formConfig.get("terminalProperty").value;
      this.storeEquip.communicationOwnership = this.formConfig.get("communicationOwnership").value;
      this.storeEquip.equipmentType = this.formConfig.get("terminalType").value;
      this.storeEquip.communicationType = this.formConfig.get("communicationType").value;
      this.storeEquip.quantity = Number(this.formConfig.get("terminalAmount").value);

      this.pricingAttributeList.forEach(attr => {
        var group = this.pricingForm.controls["formGroupPricing" + attr.id];
        if (!attr.isReadOnly) {
          attr.originalValue = group.get("formControlPricingOriginal" + attr.id).value;
          attr.value = group.get("formControlPricingDiscount" + attr.id).value; 
          attr.finalValue = group.get("formControlPricingFinal" + attr.id).value;
        }
      });

      this.storeEquip.pricing = {};
      this.storeEquip.pricing.id = this.selectedMensalidadeId;
      this.storeEquip.pricing.attribute = this.pricingAttributeList[0];

      console.log('Valor do store equip ', this.storeEquip);

      if (this.isNewConfig == false) {
        console.log('EDITAR STORE EQUIP');
        //chamada à API para editar uma configuração
        this.storeService.updateShopEquipmentConfigurationsInSubmission(this.submissionId, this.currentStore.id, this.storeEquip.id, this.storeEquip).subscribe(result => {
          this.changedStoreEvent.emit(true);
          this.storeEquipEvent.emit(this.storeEquip);
          this.logger.debug("Update Shop Equipment From Submission Response ", result.id);
        });
      } else {
        //chamada à API para criar uma nova configuração
        this.storeService.addShopEquipmentConfigurationsToSubmission(this.submissionId, this.currentStore.id, this.storeEquip).subscribe(result => {
          this.storeEquip.id = result.id;
          this.changedStoreEvent.emit(true);
          this.storeEquipEvent.emit(this.storeEquip);
          this.logger.debug("Add Shop Equipment To Submission Response ", result.id);
        });
      }

    }
  }

  cancelConfig() {
    this.pricingOptions = [];
    this.pricingAttributeList = [];
    this.changedStoreEvent.emit(true);
  }
}
