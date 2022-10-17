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
import { EquipmentOwnershipTypeEnum, CommunicationOwnershipTypeEnum, ProductPackKindEnum, ProductPackPricingFilter, TerminalSupportEntityEnum, MerchantCatalog, ProductPackRootAttributeProductPackKind, ProductPackPricingEntry, ProductPackPricingAttribute } from '../../commercial-offer/ICommercialOffer.interface';
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

  packId: string;
  productPackPricingFilter: ProductPackPricingFilter;
  merchantCatalog: MerchantCatalog;
  groupsList: ProductPackRootAttributeProductPackKind[] = [];
  pricingOptions: ProductPackPricingEntry[] = [];
  pricingAttributeList: ProductPackPricingAttribute[] = [];

  returned: string;

  @Input() parentFormGroup: FormGroup;
  @Input() isNewConfig: boolean;
  @Input() currentStore: ShopDetailsAcquiring;
  @Input() storeEquip: ShopEquipment;

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

    // this.tableInfo.GetTenantTerminals().subscribe(result => {
    //   this.allTerminals = result;
    // });
  }

  public subs: Subscription[] = [];

  constructor(private logger: LoggerService, http: HttpClient, @Inject(configurationToken) private configuration: Configuration, private route: Router, private data: DataService, private storeService: StoreService, private tableInfo: TableInfoService, private COService: CommercialOfferService, private rootFormGroup: FormGroupDirective) {
    this.baseUrl = configuration.baseUrl;
    
    //if (this.route.getCurrentNavigation()?.extras?.state) {
    //  this.store = this.route.getCurrentNavigation().extras.state["store"];
    //  this.storeEquip = this.route.getCurrentNavigation().extras.state["storeEquip"]; //CASO SEJA PARA EDITAR UMA CONFIGURAÇÃO
    //  this.packId = this.route.getCurrentNavigation().extras.state["packId"];
    //  this.merchantCatalog = this.route.getCurrentNavigation().extras.state["merchantCatalog"];
    //  this.groupsList = this.route.getCurrentNavigation().extras.state["groupsList"];

    //  if (this.storeEquip != undefined)
    //    this.edit = true;
    //}

    

    //this.ngOnInit();
    
    this.data.updateData(false, 5, 2);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["currentStore"]) {
      this.changedStoreEvent.emit(true);
    }
    if (changes["isNewConfig"]) {

    }
    if (changes["storeEquip"]) {
      this.updateFormData();
    }
  }

  disableForm() {
    if (this.currentStore.productCode == 'CARD PRESENT' || this.currentStore.productCode == 'card present' || this.currentStore.productCode == 'cardPresent') {
      if (this.currentStore.supportEntity == 'acquirer') { //caso o ETA seja UNICRE
        if (this.currentStore.subproductCode == 'EASY' || this.currentStore.subproductCode == 'easy') {
          this.formConfig.get("terminalProperty").setValue("acquirer");
          this.formConfig.get("terminalProperty").disable();

          this.formConfig.get("communicationOwnership").setValue("acquirer");
          this.formConfig.get("communicationOwnership").disable();
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
      name: new FormControl(''),
      terminalProperty: new FormControl(this.isNewConfig == false ? this.storeEquip.equipmentOwnership : '', Validators.required),
      communicationOwnership: new FormControl(this.isNewConfig == false ? this.storeEquip.communicationOwnership : ''),
      terminalType: new FormControl(this.isNewConfig == false ? this.storeEquip.equipmentType : ''),
      communicationType: new FormControl(this.isNewConfig == false ? this.storeEquip.communicationType : ''),
      terminalAmount: new FormControl(this.isNewConfig == false ? this.storeEquip.quantity : ''),
      //adicionar um form para o preço
    });

    this.disableForm();

    this.formConfig.get("terminalProperty").valueChanges.subscribe(val => {
      if (val === 'acquirer') {
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
    this.formConfig.get("terminalProperty").setValue(this.storeEquip.equipmentOwnership);
    this.formConfig.get("communicationOwnership").setValue(this.storeEquip.communicationOwnership);
    this.formConfig.get("terminalType").setValue(this.storeEquip.equipmentType);
    this.formConfig.get("communicationType").setValue(this.storeEquip.communicationType);
    this.formConfig.get("terminalAmount").setValue(this.storeEquip.quantity);
  }

  //chamar tabela onde podemos selecionar a mensalidade que pretendemos
  loadMensalidades() {
    this.productPackPricingFilter = {
      processorId: this.currentStore.processorId,
      productCode: this.packId,
      subproductCode: "",
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
        communicationOwnership: CommunicationOwnershipTypeEnum[this.storeEquip.communicationOwnership] as CommunicationOwnershipTypeEnum,
        communicationType: this.storeEquip.communicationType,
        equipmentOwnership: EquipmentOwnershipTypeEnum[this.storeEquip.equipmentOwnership] as EquipmentOwnershipTypeEnum,
        equipmentType: this.storeEquip.equipmentType,
        quantity: this.storeEquip.quantity
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
    if (this.formConfig.valid) {
      this.COService.GetProductCommercialPackPricing(this.packId, id, this.productPackPricingFilter).then(res => {
        res.result.attributes.forEach(attr => {
          this.pricingAttributeList.push(attr);
        });
      });
      this.formConfig.valueChanges.subscribe(value => {
        if (value) { //se algum valor do form for alterado, é preciso carregar as mensalidades novamente e as que já existiam são limpas
          this.pricingOptions = [];
          this.pricingAttributeList = [];
          this.loadMensalidades();
        }
      });
    }
  }

  submit() {
    if (this.formConfig.valid) {
      this.storeEquip = {};
      this.storeEquip.equipmentOwnership = this.formConfig.get("terminalProperty").value;
      this.storeEquip.communicationOwnership = this.formConfig.get("communicationOwnership").value;
      this.storeEquip.equipmentType = this.formConfig.get("terminalType").value;
      this.storeEquip.communicationType = this.formConfig.get("communicationType").value;
      this.storeEquip.quantity = this.formConfig.get("terminalAmount").value;

      this.pricingAttributeList.forEach(attr => {
        var group = this.formConfig.controls["formGroupPricing" + attr.id];
        if (!attr.isReadOnly && attr.isVisible) {
          attr.originalValue = group.get("formControlPricingOriginal" + attr.id).value;
          group.get("formControlPricingDiscount" + attr.id); //não existe variável para este valor
          attr.finalValue = group.get("formControlPricingFinal" + attr.id).value;
        }
      });

      this.storeEquip.pricing = {
        attribute: this.pricingAttributeList
      }

      if (this.edit) {
        //chamada à API para editar uma configuração
        this.storeService.updateShopEquipmentConfigurationsInSubmission(this.submissionId, this.currentStore.shopId, this.storeEquip).subscribe(result => {
          this.changedStoreEvent.emit(true);
          this.storeEquipEvent.emit(this.storeEquip);
          this.logger.debug("Update Shop Equipment From Submission Response ", result.id);
        });
      } else {
        //chamada à API para criar uma nova configuração
        this.storeService.addShopEquipmentConfigurationsToSubmission(this.submissionId, this.currentStore.shopId, this.storeEquip).subscribe(result => {
          this.storeEquip.shopEquipmentId = result.id;
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
