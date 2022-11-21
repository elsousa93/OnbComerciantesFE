import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { Subscription } from 'rxjs';
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

    }
    if (changes["storeEquip"]) {
      if (changes["storeEquip"].previousValue != null) {
        //this.updateFormData();
      }
    }
  }

  disableForm() {
    if (this.currentStore.productCode.toLowerCase() == "Card Present" || this.currentStore.productCode.toLowerCase() == "cardpresent") {
      if (this.currentStore.supportEntity.toLowerCase() == "acquirer") { //caso o ETA seja UNICRE
        if (this.currentStore.subproductCode.toLowerCase() == "easy" || this.currentStore.subproductCode.toLowerCase() == "Easy") {
          this.formConfig.get("terminalProperty").setValue("self");
          //this.formConfig.controls["terminalProperty"].disable();
          var terminalProperty = this.formConfig.get("terminalProperty") as FormControl;
          terminalProperty.disable();

          this.formConfig.get("communicationOwnership").setValue("self");
          var communicationOwnership = this.formConfig.get("communicationOwnership") as FormControl;
          communicationOwnership.disable();
          //this.formConfig.controls["communicationOwnership"].disable();
          this.formConfig.updateValueAndValidity();
          console.log('FORM CONFIG ', this.formConfig);
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
    if (this.storeEquip != null) {
      this.updateFormData();
    }
    //if (this.rootFormGroup.form != null) {
    //  this.rootFormGroup.form.setControl('configTerm', this.formConfig);

    //  if (this.returned == 'consult') {
    //    this.formConfig.disable();
    //  }
    //}
  }

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub?.unsubscribe);
  }

  initializeForm() {
    this.formConfig = new FormGroup({
      name: new FormControl(this.isNewConfig == false ? this.storeEquip.shopEquipmentId : '', Validators.required),
      terminalProperty: new FormControl(this.isNewConfig == false ? this.storeEquip.equipmentType : '', Validators.required),
      communicationOwnership: new FormControl(this.isNewConfig == false ? this.storeEquip.communicationOwnership : '', Validators.required),
      terminalType: new FormControl(this.isNewConfig == false ? this.storeEquip.equipmentType : '', Validators.required),
      communicationType: new FormControl(this.isNewConfig == false ? this.storeEquip.communicationType : '', Validators.required),
      terminalAmount: new FormControl(this.isNewConfig == false ? this.storeEquip.quantity : '', Validators.required),
      //adicionar um form para o preço
      
    });
    this.disableForm();

    this.formConfig.get("terminalProperty").valueChanges.subscribe(val => {
      if (val === 'self') {
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
  }

  updateFormData() {
    this.formConfig.get("name").setValue(this.storeEquip.shopEquipmentId);
    this.formConfig.get("communicationOwnership").setValue(this.storeEquip.communicationOwnership);
    this.formConfig.get("terminalType").setValue(this.storeEquip.equipmentType);
    this.formConfig.get("communicationType").setValue(this.storeEquip.communicationType);
    this.formConfig.get("terminalAmount").setValue(this.storeEquip.quantity);
  }

  //chamar tabela onde podemos selecionar a mensalidade que pretendemos
  loadMensalidades() {
    this.pricingOptions = [];
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
      if (result.result.length == 1) {
        this.pricingOptions.push(result.result[0]);
        this.chooseMensalidade(result.result[0].id);
      } else {
        result.result.forEach(options => {
          this.pricingOptions.push(options);
        });
      }
    });
  }



  //ao escolher uma mensalidade, é carregado os valors associados a essa mensalidade escolhida
  chooseMensalidade(id: string) {
    this.pricingAttributeList = [];
    if (this.formConfig.valid) {
      this.COService.GetProductCommercialPackPricing(this.packId, id, this.productPackPricingFilter).then(res => {
        res.result.attributes.forEach(attr => {
          this.pricingAttributeList.push(attr);
        });
        this.addPricingForm();
      });
      //this.formConfig.valueChanges.subscribe(value => {
      //  if (value) { //se algum valor do form for alterado, é preciso carregar as mensalidades novamente e as que já existiam são limpas
      //    this.pricingOptions = [];
      //    this.pricingAttributeList = [];
      //    this.loadMensalidades();
      //  }
      //});
    }
  }

  addPricingForm() {
    var context = this;
    var valueGroup = new FormGroup({});
    this.pricingAttributeList.forEach(function (value, idx) {
      valueGroup.addControl("formControlPricingOriginal" + value.id, new FormControl(value.value));
      valueGroup.addControl("formControlPricingDiscount" + value.id, new FormControl(value.value));
      valueGroup.addControl("formControlPricingFinal" + value.id, new FormControl(value.value));
      context.formConfig.addControl("formGroupPricing" + value.id, valueGroup);
    });
  }

  numericOnly(event): boolean {
    var ASCIICode = (event.which) ? event.which : event.keyCode;

    if (ASCIICode > 31 && (ASCIICode < 48 || ASCIICode > 57))
      return false;
    return true;
  }

  submit() {
    if (this.formConfig.valid) {
      this.storeEquip = {};
      this.storeEquip.shopEquipmentId = this.formConfig.get("name").value;
      this.storeEquip.equipmentOwnership = this.formConfig.get("terminalProperty").value;
      this.storeEquip.communicationOwnership = this.formConfig.get("communicationOwnership").value;
      this.storeEquip.equipmentType = this.formConfig.get("terminalType").value;
      this.storeEquip.communicationType = this.formConfig.get("communicationType").value;
      this.storeEquip.quantity = Number(this.formConfig.get("terminalAmount").value);

      this.pricingAttributeList.forEach(attr => {
        var group = this.formConfig.controls["formGroupPricing" + attr.id];
        if (!attr.isReadOnly) {
          attr.originalValue = group.get("formControlPricingOriginal" + attr.id).value;
          attr.value = group.get("formControlPricingDiscount" + attr.id).value; //não existe variável para este valor
          attr.finalValue = group.get("formControlPricingFinal" + attr.id).value;
        }
      });

      this.storeEquip.pricing = {};
      this.storeEquip.pricing.attribute = this.pricingAttributeList[0];

      console.log('Valor do store equip ', this.storeEquip);

      if (this.edit) {
        //chamada à API para editar uma configuração
        this.storeService.updateShopEquipmentConfigurationsInSubmission(this.submissionId, this.currentStore.id, this.storeEquip).subscribe(result => {
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
    //let navigationExtras: NavigationExtras = {
    //  state: {
    //    store: this.currentStore,
    //  }
    //}
    //this.route.navigate(['commercial-offert-list'], navigationExtras);
    this.changedStoreEvent.emit(true);
  }
}
