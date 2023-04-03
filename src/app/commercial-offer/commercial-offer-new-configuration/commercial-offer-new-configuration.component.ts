import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { distinctUntilChanged, Subscription } from 'rxjs';
import { DataService } from '../../nav-menu-interna/data.service';
import { ShopDetailsAcquiring, ShopEquipment } from '../../store/IStore.interface';
import { LoggerService } from 'src/app/logger.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { StoreService } from '../../store/store.service';
import { TenantCommunication, TenantTerminal } from '../../table-info/ITable-info.interface';
import { TableInfoService } from '../../table-info/table-info.service';
import { EquipmentOwnershipTypeEnum, CommunicationOwnershipTypeEnum, ProductPackKindEnum, ProductPackPricingFilter, TerminalSupportEntityEnum, MerchantCatalog, ProductPackRootAttributeProductPackKind, ProductPackPricingEntry, ProductPackPricingAttribute, ProductPackEntry, ProductPackAttributeProductPackKind, ProductPackAttribute } from '../../commercial-offer/ICommercialOffer.interface';
import { CommercialOfferService } from '../commercial-offer.service';
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';

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

  allCommunications: TenantCommunication[] = [];
  allTerminals: TenantTerminal[] = [];

  /*Is it supposed to relicate the Commercial offert from another store?*/
  selectionsReplicate = ['Não', 'Sim'];
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
  isInvalidNumber: boolean = false;

  @Input() parentFormGroup: FormGroup;
  @Input() isNewConfig: boolean;
  @Input() currentStore: ShopDetailsAcquiring;
  @Input() storeEquip: ShopEquipment;
  @Input() packId: string = "";
  @Input() packs: ProductPackEntry[];
  @Input() merchantCatalog: MerchantCatalog;
  @Input() groupsList: ProductPackRootAttributeProductPackKind[];
  @Input() changedPackValue: boolean;
  @Input() equipmentSettings: ProductPackAttributeProductPackKind[] = []

  @Output() changedStoreEvent = new EventEmitter<boolean>();
  @Output() storeEquipEvent = new EventEmitter<ShopEquipment>();

  @ViewChild('focusContent') el: any;

  firstTime: boolean = true;
  selectedMensalidadeId: string = "";
  firstTimeEdit: boolean = true;
  calledMensalidades: boolean = false;
  formValid: boolean = false;
  list: ProductPackAttributeProductPackKind[];
  finalList: ProductPackAttributeProductPackKind[];
  firstTimeChanged: boolean = true;

  loadReferenceData() {
    this.subs.push(this.tableInfo.GetTenantCommunications().subscribe(result => {
      this.logger.info("Get tenant communications: " + JSON.stringify(result));
      this.allCommunications = result;
      this.allCommunications = this.allCommunications.sort((a, b) => a.description > b.description ? 1 : -1); //ordenar resposta
    }), this.tableInfo.GetTenantTerminals().subscribe(result => {
      this.logger.info("Get tenant terminals: " + JSON.stringify(result));
      this.allTerminals = result;
      this.allTerminals = this.allTerminals.sort((a, b) => a.description > b.description ? 1 : -1); //ordenar resposta
    }));
  }

  public subs: Subscription[] = [];

  constructor(private logger: LoggerService, private data: DataService, private storeService: StoreService, private tableInfo: TableInfoService, private COService: CommercialOfferService, private translate: TranslateService, private snackBar: MatSnackBar) {
    this.data.updateData(false, 5, 2);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["currentStore"]) {
      this.currentStore = changes["currentStore"].currentValue;
    }
    if (changes["isNewConfig"]) {
      this.isNewConfig = changes["isNewConfig"].currentValue;
    }
    if (changes["storeEquip"]) {
      if (changes["storeEquip"].previousValue != null) {
      }
    }
    if (changes["groupsList"]) {
      var oldArray = JSON.stringify(changes["groupsList"].currentValue);
      this.groupsList = JSON.parse(oldArray);
      if (this.changedPackValue == true && this.calledMensalidades == true) {
        this.selectedMensalidadeId = "";
        this.calledMensalidades = false;
        this.pricingOptions = [];
        this.pricingAttributeList = [];
      }
    }
    if (changes["changedPackValue"]) {
      this.changedPackValue = changes["changedPackValue"].currentValue;
    }
    if (changes["equipmentSettings"]) {
      this.equipmentSettings = changes["equipmentSettings"].currentValue;
    }
  }

  disableForm() {
    //if (this.currentStore.productCode.toLowerCase() == "card present" || this.currentStore.productCode.toLowerCase() == "cardpresent") {
    //  if (this.currentStore.supportEntity.toLowerCase() == "acquirer") { //caso o ETA seja UNICRE
    //    if (this.currentStore.subProductCode.toLowerCase() == "easy" || this.currentStore.subProductCode.toLowerCase() == "Easy") {
    //      this.formConfig.get("terminalProperty").setValue("self");
    //      this.formConfig.get("terminalProperty").disable();

    //      this.formConfig.get("communicationOwnership").setValue("self");
    //      this.formConfig.controls["communicationOwnership"].disable();

    //      this.formConfig.updateValueAndValidity();
    //    } else {
    //      //slide 97, não percebi qual é a exceção que deve ser feita
    //    }
    //  } else { // caso seja BANCO

    //  }
    //}
  }

  ngOnInit(): void {
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
    this.submissionId = localStorage.getItem("submissionId");
    this.returned = localStorage.getItem("returned");
    //this.loadReferenceData();
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
    var context = this;
    this.formConfig = new FormGroup({
      terminalAmount: new FormControl(this.isNewConfig == false ? this.storeEquip.quantity : '', Validators.required)
    });
    this.equipmentSettings.forEach(function (value, idx) {
      var group = new FormGroup({});
      var attributes = value.attributes;

      attributes.forEach(function (value, idx) {
        if (value.aggregatorId != null && value.aggregatorId != '') {
          if (value.isSelected) {
            if (group.get("formControl" + value["aggregatorId"])) {
              group.setControl("formControl" + value.aggregatorId, new FormControl(value.value));
            } else {
              group.addControl("formControl" + value.aggregatorId, new FormControl(value.value));
            }
          } else {
            if (group.get("formControl" + value.aggregatorId)) {

            } else {
              group.addControl("formControl" + value.aggregatorId, new FormControl(''));
            }
          }
        } else {
          group.addControl("formControl" + value.id, new FormControl(value.isSelected));
        }
      });
      context.formConfig.addControl("formGroup" + value.id, group);
    });

    this.changedValue("", "");
    //this.formConfig = new FormGroup({
    //  name: new FormControl(this.isNewConfig == false ? this.storeEquip.shopEquipmentId : ''/*, Validators.required*/),
    //  terminalProperty: new FormControl(this.isNewConfig == false ? this.storeEquip.equipmentOwnership.toLocaleLowerCase() : '', Validators.required),
    //  communicationOwnership: new FormControl(this.isNewConfig == false ? this.storeEquip.communicationOwnership.toLocaleLowerCase() : '', Validators.required),
    //  terminalType: new FormControl(this.isNewConfig == false ? this.storeEquip.equipmentType : '', Validators.required),
    //  communicationType: new FormControl(this.isNewConfig == false ? this.storeEquip.communicationType : '', Validators.required),
    //  terminalAmount: new FormControl(this.isNewConfig == false ? this.storeEquip.quantity : '', Validators.required)
    //});

    this.pricingForm = new FormGroup({});

    this.disableForm();

    //this.formConfig.get("terminalProperty").valueChanges.pipe(distinctUntilChanged()).subscribe(val => {
    //  if (val.toLocaleLowerCase() === 'self') {
    //    this.formConfig.get('communicationOwnership').setValidators([Validators.required]);
    //  } else if (val.toLocaleLowerCase() === 'client') {
    //    this.formConfig.get('communicationOwnership').setValidators(null);
    //  }
    //  this.formConfig.get('communicationOwnership').updateValueAndValidity({ emitEvent: false });
    //});

    //this.formConfig.get("communicationOwnership").valueChanges.pipe(distinctUntilChanged()).subscribe(val => {
    //  if (val.toLocaleLowerCase() === 'self') {
    //    this.formConfig.get('terminalType').setValidators([Validators.required]);
    //    this.formConfig.get('communicationType').setValidators([Validators.required]);
    //    this.formConfig.get('terminalAmount').setValidators([Validators.required]);
    //  } else if (val.toLocaleLowerCase() === 'client') {
    //    this.formConfig.get('terminalType').setValidators(null);
    //    this.formConfig.get('communicationType').setValidators(null);
    //    this.formConfig.get('terminalAmount').setValidators(null);
    //  }
    //  this.formConfig.get('terminalType').updateValueAndValidity({ emitEvent: false });
    //  this.formConfig.get('communicationType').updateValueAndValidity({ emitEvent: false });
    //  this.formConfig.get('terminalAmount').updateValueAndValidity({ emitEvent: false });
    //});

    //this.formConfig.statusChanges.subscribe(res => {
    //  if (res === 'VALID') {
    //    if (this.calledMensalidades) {
    //      this.loadMensalidades();
    //    }
    //    this.formValid = true;
    //  } else {
    //    if (this.formValid) {
    //      this.pricingOptions = [];
    //      this.pricingAttributeList = [];
    //    }
    //    this.formValid = false;
    //  }
    //})
  }

  updateFormData() {
    if (this.formConfig.valid) {
      this.pricingOptions = [];
      this.pricingAttributeList = [];
      this.loadMensalidades();
      this.firstTime = false;
    }
  }

  //chamar tabela onde podemos selecionar a mensalidade que pretendemos
  loadMensalidades() {
    if (this.packId != "" && this.changedPackValue) {
      this.groupsList.push(...this.list);
      this.calledMensalidades = true;
      this.changedPackValue = false;
      this.productPackPricingFilter = {
        processorId: this.packs[0].processors[0],
        productCode: this.currentStore.productCode,
        subproductCode: this.currentStore.subProductCode,
        merchant: this.merchantCatalog,
        packAttributes: this.groupsList,
        store: {
          activity: this.currentStore.activity,
          subActivity: this.currentStore.subActivity,
          supportEntity: this.currentStore.supportEntity,
          referenceStore: this.currentStore.shopId,
          supportBank: this.currentStore.supportEntity
        },
        equipment: {
          //communicationOwnership: this.formConfig.get("communicationOwnership").value == 'self' ? 'Acquirer' : 'Client',
          //communicationType: this.formConfig.get('communicationType').value,
          //equipmentOwnership: this.formConfig.get("terminalProperty").value == 'self' ? 'Acquirer' : 'Client',
          //equipmentType: this.formConfig.get('terminalType').value,
          quantity: this.formConfig.get('terminalAmount').value
        }
      }
      this.logger.info("Filter to get commercial pack pricing list" + JSON.stringify(this.productPackPricingFilter));
      this.COService.ListProductCommercialPackPricing(this.packId, this.productPackPricingFilter).then(result => {
        this.logger.info("Get commercial pack pricing list result: " + JSON.stringify(result));
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
    } else {
      document.getElementById("flush-collapseThree").className = "accordion-collapse collapse";
      document.getElementById("accordionButton3").className = "accordion1-button collapsed";
      this.snackBar.open(this.translate.instant('commercialOffer.openError'), '', {
        duration: 4000,
        panelClass: ['snack-bar']
      });
    }
  }

  //ao escolher uma mensalidade, é carregado os valores associados a essa mensalidade escolhida
  chooseMensalidade(id: string) {
    this.selectedMensalidadeId = id;
    if (this.formConfig.valid) {
      if (this.storeEquip?.pricing == null) {
        this.COService.GetProductCommercialPackPricing(this.packId, id, this.productPackPricingFilter).then(res => {
          this.logger.info("Get commercial pack pricing result: " + JSON.stringify(res));
          this.pricingAttributeList = [];
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
        valueGroup.addControl("formControlPricingDiscount" + value.id, new FormControl(0, Validators.required));
        valueGroup.addControl("formControlPricingFinal" + value.id, new FormControl(value.value));
        context.pricingForm.addControl("formGroupPricing" + value.id, valueGroup);
      });
    } else {
      this.pricingAttributeList.forEach(function (value, idx) {
        valueGroup.addControl("formControlPricingOriginal" + value.id, new FormControl(value.originalValue));
        valueGroup.addControl("formControlPricingDiscount" + value.id, new FormControl(value.value - value.finalValue, Validators.required));
        valueGroup.addControl("formControlPricingFinal" + value.id, new FormControl(value.finalValue));
        context.pricingForm.addControl("formGroupPricing" + value.id, valueGroup);
      });
    }
  }

  resetValues() {
    var context = this;
    this.pricingAttributeList.forEach(function (value, idx) {
      context.pricingForm.removeControl("formGroupPricing" + value.id);
    });
    if (this.isNewConfig) {
      this.pricingAttributeList.forEach(function (value, idx) {
        var valueGroup = new FormGroup({});
        valueGroup.addControl("formControlPricingOriginal" + value.id, new FormControl(value.value));
        valueGroup.addControl("formControlPricingDiscount" + value.id, new FormControl(0, Validators.required));
        valueGroup.addControl("formControlPricingFinal" + value.id, new FormControl(value.value));
        context.pricingForm.addControl("formGroupPricing" + value.id, valueGroup);
      });
    } else {
      this.pricingAttributeList.forEach(function (value, idx) {
        var valueGroup = new FormGroup({});
        valueGroup.addControl("formControlPricingOriginal" + value.id, new FormControl(value.originalValue));
        valueGroup.addControl("formControlPricingDiscount" + value.id, new FormControl(value.value - value.finalValue, Validators.required));
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

      this.storeEquip.equipmentSettings = this.list;

      this.pricingAttributeList.forEach(attr => {
        var group = this.pricingForm.controls["formGroupPricing" + attr.id];
        if (!attr.isReadOnly) {
          attr.originalValue = group.get("formControlPricingOriginal" + attr.id).value;
          attr.value = group.get("formControlPricingDiscount" + attr.id).value;
          attr.finalValue = group.get("formControlPricingFinal" + attr.id).value;
        }
      });
      this.storeEquip.quantity = this.formConfig.get("terminalAmount").value;
      this.storeEquip.pricing = {};
      this.storeEquip.pricing.id = this.selectedMensalidadeId;
      this.storeEquip.pricing.attribute = this.pricingAttributeList[0];
      this.logger.info("Store equipment data: " + JSON.stringify(this.storeEquip));

      if (this.isNewConfig == false) {
        //chamada à API para editar uma configuração
        this.storeService.updateShopEquipmentConfigurationsInSubmission(this.submissionId, this.currentStore.id, this.storeEquip.id, this.storeEquip).subscribe(result => {
          this.changedStoreEvent.emit(true);
          this.storeEquipEvent.emit(this.storeEquip);
          this.logger.info("Update Shop Equipment From Submission Response " + JSON.stringify(result));
        });
      } else {
        //chamada à API para criar uma nova configuração
        this.storeService.addShopEquipmentConfigurationsToSubmission(this.submissionId, this.currentStore.id, this.storeEquip).subscribe(result => {
          this.storeEquip.id = result.id;
          this.changedStoreEvent.emit(true);
          this.storeEquipEvent.emit(this.storeEquip);
          this.logger.info("Add Shop Equipment To Submission Response " + JSON.stringify(result));
        });
      }
      this.el?.nativeElement?.focus();
    }
  }

  //check if it exists at least one attribute with 'isVisible' == true
  existsNotVisibleAttr(group: ProductPackAttributeProductPackKind) {
    var found = group.attributes.find(attr => attr.isVisible);
    if (found == undefined)
      return true;
    else
      return false;
  }

  changedValue(equipmentId: string, attrId: string) {
    var context = this;
    if (!this.firstTimeChanged) {
      this.formConfig.removeValidators(Validators.required);
      this.formConfig.updateValueAndValidity();
      this.formConfig.get("terminalAmount").setValidators(Validators.required);
      this.formConfig.updateValueAndValidity();
      var findGroupAttr = this.equipmentSettings.find(group => group.id == "AK_000016");
      var attr = findGroupAttr.attributes.find(attr => attr.id == "AV_000091");
      if (attr.aggregatorId != null && attr.aggregatorId != "") {
        if (this.formConfig.get("formGroup" + "AK_000016").get("formControl" + attr.aggregatorId).value == "AV_000091") { //comunicações cliente selecionado
          var findGroupAttr = this.equipmentSettings.find(group => group.id == "AK_000017");
          var attr = findGroupAttr.attributes.find(att => att.id == "AV_000085");
          if (attr.aggregatorId != null && attr.aggregatorId != "") {
            if (this.formConfig.get("formGroup" + "AK_000017").get("formControl" + attr.aggregatorId).value == "AV_000085") { //Tipo de Terminal ser fixo
              var findGroupAttr = this.equipmentSettings.find(group => group.id == "AK_000011");
              var attr = findGroupAttr.attributes.find(att => att.id == "AV_000099");
              if (attr.aggregatorId != null && attr.aggregatorId != "") {
                this.formConfig.get("formGroup" + "AK_000011").get("formControl" + attr.aggregatorId).setValue("AV_000099"); // Tipo de Comunicações com o valor IP/ADSL
              } else {
                this.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000099").setValue(true); // Tipo de Comunicações com o valor IP/ADSL
              }
            }
          } else {
            if (this.formConfig.get("formGroup" + "AK_000017").get("formControl" + "AV_000085").value) { //Tipo de Terminal ser fixo
              this.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000099").setValue(true); // Tipo de Comunicações com o valor IP/ADSL
            }
          }

          var findGroupAttr = this.equipmentSettings.find(group => group.id == "AK_000017");
          var attr = findGroupAttr.attributes.find(att => att.id == "AV_000086");
          if (attr.aggregatorId != null && attr.aggregatorId != "") {
            if (this.formConfig.get("formGroup" + "AK_000017").get("formControl" + attr.aggregatorId).value == "AV_000086") { // Tipo de Terminal ser móvel
              var findGroupAttr = this.equipmentSettings.find(group => group.id == "AK_000011");
              findGroupAttr.attributes.forEach(value => {
                if (value.aggregatorId != null && value.aggregatorId != "") {
                  if (value.id == "AV_000099") {
                    value["condition"] = true;
                    //context.formConfig.get("formGroup" + "AK_000011").get("formControl" + value.aggregatorId).disable();
                  } else {
                    context.formConfig.get("formGroup" + "AK_000011").get("formControl" + value.aggregatorId).setValidators([Validators.required]);
                    context.formConfig.updateValueAndValidity();
                  }
                } else {
                  if (value.id == "AV_000099") {
                    value["condition"] = true;
                    //context.formConfig.get("formGroup" + "AK_000011").get("formControl" + value.id).disable();
                  } else {
                    if ((attrId == 'AV_000097' && context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000098").valid && context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000097").value == true) || (attrId == 'AV_000098' && context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000097").valid && context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000098").value == true)) {

                    } else {
                      context.formConfig.get("formGroup" + "AK_000011").get("formControl" + value.id).setValidators([Validators.required]);
                    }

                    if (context.formConfig.get("formGroup" + "AK_000011").get("formControl" + value.id).value == false || context.formConfig.get("formGroup" + "AK_000011").get("formControl" + value.id).value == null) {
                      context.formConfig.get("formGroup" + "AK_000011").get("formControl" + value.id).setValue(null);
                    } else {
                      if (attrId == 'AV_000097') {
                        if (context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000097").value == false || context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000097").value == null) {
                          context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000098").setValidators([Validators.required]);
                          context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000097").setValidators(null);
                          context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000097").setErrors(null);
                        } else {
                          context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000098").setValidators(null);
                          context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000098").setErrors(null);
                        }
                      }
                      if (attrId == "AV_000098") {
                        if (context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000098").value == false || context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000098").value == null) {
                          context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000097").setValidators([Validators.required]);
                          context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000098").setValidators(null);
                          context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000098").setErrors(null);
                        } else {
                          context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000097").setValidators(null);
                          context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000097").setErrors(null);
                        }

                      }
                    }
                    context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000099").setValue(null);
                    context.formConfig.updateValueAndValidity();
                  }
                }
              });
            } else {
              var findGroupAttr = this.equipmentSettings.find(group => group.id == "AK_000011");
              var attr = findGroupAttr.attributes.find(att => att.id == "AV_000099");
              attr["condition"] = false;
            }
          } else {
            if (this.formConfig.get("formGroup" + "AK_000017").get("formControl" + "AV_000086").value) {
              var findGroupAttr = this.equipmentSettings.find(group => group.id == "AK_000011");
              findGroupAttr.attributes.forEach(value => {
                if (value.aggregatorId != null && value.aggregatorId != "") {
                  if (value.id == "AV_000099") {
                    value["condition"] = true;
                    //context.formConfig.get("formGroup" + "AK_000011").get("formControl" + value.aggregatorId).disable();
                  } else {
                    context.formConfig.get("formGroup" + "AK_000011").get("formControl" + value.aggregatorId).setValidators([Validators.required]);
                    context.formConfig.updateValueAndValidity();
                  }
                } else {
                  if (value.id == "AV_000099") {
                    value["condition"] = true;
                    //context.formConfig.get("formGroup" + "AK_000011").get("formControl" + value.id).disable();
                  } else {
                    if ((attrId == 'AV_000097' && context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000098").valid && context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000097").value == true) || (attrId == 'AV_000098' && context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000097").valid && context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000098").value == true)) {

                    } else {
                      context.formConfig.get("formGroup" + "AK_000011").get("formControl" + value.id).setValidators([Validators.required]);
                    }

                    if (context.formConfig.get("formGroup" + "AK_000011").get("formControl" + value.id).value == false || context.formConfig.get("formGroup" + "AK_000011").get("formControl" + value.id).value == null) {
                      context.formConfig.get("formGroup" + "AK_000011").get("formControl" + value.id).setValue(null);
                    } else {
                      if (attrId == 'AV_000097') {
                        if (context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000097").value == false || context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000097").value == null) {
                          context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000098").setValidators([Validators.required]);
                          context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000097").setValidators(null);
                          context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000097").setErrors(null);
                        } else {
                          context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000098").setValidators(null);
                          context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000098").setErrors(null);
                        }
                      }
                      if (attrId == "AV_000098") {
                        if (context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000098").value == false || context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000098").value == null) {
                          context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000097").setValidators([Validators.required]);
                          context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000098").setValidators(null);
                          context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000098").setErrors(null);
                        } else {
                          context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000097").setValidators(null);
                          context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000097").setErrors(null);
                        }

                      }
                    }
                    context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000099").setValue(null);
                    context.formConfig.updateValueAndValidity();
                  }
                }
              });
            } else {
              var findGroupAttr = this.equipmentSettings.find(group => group.id == "AK_000011");
              var attr = findGroupAttr.attributes.find(att => att.id == "AV_000099");
              attr["condition"] = false;
              //remove validators e errors 
            }
          }
        }
      } else {
        if (this.formConfig.get("formGroup" + "AK_000016").get("formControl" + "AV_000091").value) { //comunicações cliente selecionado
          var findGroupAttr = this.equipmentSettings.find(group => group.id == "AK_000017");
          var attr = findGroupAttr.attributes.find(att => att.id == "AV_000085");
          if (attr.aggregatorId != null && attr.aggregatorId != "") {
            if (this.formConfig.get("formGroup" + "AK_000017").get("formControl" + attr.aggregatorId).value == "AV_000085") { //Tipo de Terminal ser fixo
              var findGroupAttr = this.equipmentSettings.find(group => group.id == "AK_000011");
              var attr = findGroupAttr.attributes.find(att => att.id == "AV_000099");
              if (attr.aggregatorId != null && attr.aggregatorId != "") {
                this.formConfig.get("formGroup" + "AK_000011").get("formControl" + attr.aggregatorId).setValue("AV_000099"); // Tipo de Comunicações com o valor IP/ADSL
              } else {
                this.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000099").setValue(true); // Tipo de Comunicações com o valor IP/ADSL
              }
            }
          } else {
            if (this.formConfig.get("formGroup" + "AK_000017").get("formControl" + "AV_000085").value) { //Tipo de Terminal ser fixo
              this.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000099").setValue(true); // Tipo de Comunicações com o valor IP/ADSL
            }
          }


          var findGroupAttr = this.equipmentSettings.find(group => group.id == "AK_000017");
          var attr = findGroupAttr.attributes.find(att => att.id == "AV_000086");
          if (attr.aggregatorId != null && attr.aggregatorId != "") {
            if (this.formConfig.get("formGroup" + "AK_000017").get("formControl" + attr.aggregatorId).value == "AV_000086") { // Tipo de Terminal ser móvel
              var findGroupAttr = this.equipmentSettings.find(group => group.id == "AK_000011");
              findGroupAttr.attributes.forEach(value => {
                if (value.aggregatorId != null && value.aggregatorId != "") {
                  if (value.id == "AV_000099") {
                    value["condition"] = true;
                    //context.formConfig.get("formGroup" + "AK_000011").get("formControl" + value.aggregatorId).disable();
                  } else {
                    context.formConfig.get("formGroup" + "AK_000011").get("formControl" + value.aggregatorId).setValidators([Validators.required]);
                    context.formConfig.updateValueAndValidity();
                  }
                } else {
                  if (value.id == "AV_000099") {
                    value["condition"] = true;
                    //context.formConfig.get("formGroup" + "AK_000011").get("formControl" + value.id).disable();
                  } else {
                    if ((attrId == 'AV_000097' && context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000098").valid && context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000097").value == true) || (attrId == 'AV_000098' && context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000097").valid && context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000098").value == true)) {

                    } else {
                      context.formConfig.get("formGroup" + "AK_000011").get("formControl" + value.id).setValidators([Validators.required]);
                    }

                    if (context.formConfig.get("formGroup" + "AK_000011").get("formControl" + value.id).value == false || context.formConfig.get("formGroup" + "AK_000011").get("formControl" + value.id).value == null) {
                      context.formConfig.get("formGroup" + "AK_000011").get("formControl" + value.id).setValue(null);
                    } else {
                      if (attrId == 'AV_000097') {
                        if (context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000097").value == false || context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000097").value == null) {
                          context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000098").setValidators([Validators.required]);
                          context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000097").setValidators(null);
                          context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000097").setErrors(null);
                        } else {
                          context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000098").setValidators(null);
                          context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000098").setErrors(null);
                        }
                      }
                      if (attrId == "AV_000098") {
                        if (context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000098").value == false || context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000098").value == null) {
                          context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000097").setValidators([Validators.required]);
                          context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000098").setValidators(null);
                          context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000098").setErrors(null);
                        } else {
                          context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000097").setValidators(null);
                          context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000097").setErrors(null);
                        }

                      }
                    }
                    context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000099").setValue(null);
                    context.formConfig.updateValueAndValidity();
                  }
                }
              });
            } else {
              var findGroupAttr = this.equipmentSettings.find(group => group.id == "AK_000011");
              var attr = findGroupAttr.attributes.find(att => att.id == "AV_000099");
              attr["condition"] = false;
            }
          } else {
            if (this.formConfig.get("formGroup" + "AK_000017").get("formControl" + "AV_000086").value) {
              var findGroupAttr = this.equipmentSettings.find(group => group.id == "AK_000011");
              findGroupAttr.attributes.forEach(value => {
                if (value.aggregatorId != null && value.aggregatorId != "") {
                  if (value.id == "AV_000099") {
                    value["condition"] = true;
                    //context.formConfig.get("formGroup" + "AK_000011").get("formControl" + value.aggregatorId).disable();
                  } else {
                    context.formConfig.get("formGroup" + "AK_000011").get("formControl" + value.aggregatorId).setValidators([Validators.required]);
                    context.formConfig.updateValueAndValidity();
                  }
                } else {
                  if (value.id == "AV_000099") {
                    value["condition"] = true;
                    //context.formConfig.get("formGroup" + "AK_000011").get("formControl" + value.id).disable();
                  } else {
                    if ((attrId == 'AV_000097' && context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000098").valid && context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000097").value == true) || (attrId == 'AV_000098' && context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000097").valid && context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000098").value == true)) {

                    } else {
                      context.formConfig.get("formGroup" + "AK_000011").get("formControl" + value.id).setValidators([Validators.required]);
                    }

                    if (context.formConfig.get("formGroup" + "AK_000011").get("formControl" + value.id).value == false || context.formConfig.get("formGroup" + "AK_000011").get("formControl" + value.id).value == null) {
                      context.formConfig.get("formGroup" + "AK_000011").get("formControl" + value.id).setValue(null);
                    } else {
                      if (attrId == 'AV_000097') {
                        if (context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000097").value == false || context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000097").value == null) {
                          context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000098").setValidators([Validators.required]);
                          context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000097").setValidators(null);
                          context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000097").setErrors(null);
                        } else {
                          context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000098").setValidators(null);
                          context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000098").setErrors(null);
                        }
                      }
                      if (attrId == "AV_000098") {
                        if (context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000098").value == false || context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000098").value == null) {
                          context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000097").setValidators([Validators.required]);
                          context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000098").setValidators(null);
                          context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000098").setErrors(null);
                        } else {
                          context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000097").setValidators(null);
                          context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000097").setErrors(null);
                        }

                      }
                    }
                    context.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000099").setValue(null);
                    context.formConfig.updateValueAndValidity();
                  }
                }
              });
            } else {
              var findGroupAttr = this.equipmentSettings.find(group => group.id == "AK_000011");
              var attr = findGroupAttr.attributes.find(att => att.id == "AV_000099");
              attr["condition"] = false;
              //tirar validators
            }
          }
        }
      }


      if (equipmentId == "AK_000016") { //AK_000016 - Comunicações a Cargo

        if (attrId == "AV_000090") { //AV_000090 - Comunicações Reduniq

          var findGroupAttr = this.equipmentSettings.find(group => group.id == "AK_000017");
          var findGroupAttr2 = this.equipmentSettings.find(group => group.id == "AK_000011");

          var attr = findGroupAttr.attributes.find(attr => attr.id == "AV_000086");
          var attr2 = findGroupAttr2.attributes.find(attr => attr.id == "AV_000097");

          if (attr.aggregatorId != null && attr.aggregatorId != "") {
            this.formConfig.get("formGroup" + "AK_000017").get("formControl" + attr.aggregatorId).setValue("AV_000086");
          } else {
            if (this.formConfig.get("formGroup" + "AK_000016").get("formControl" + "AV_000090").value) {
              this.formConfig.get("formGroup" + "AK_000017").get("formControl" + "AV_000086").setValue(true); //Tipo de Terminal com o valor Móvel
            }
          }

          if (attr2.aggregatorId != null && attr2.aggregatorId != "") {
            this.formConfig.get("formGroup" + "AK_000011").get("formControl" + attr2.aggregatorId).setValue("AV_000097");
          } else {
            if (this.formConfig.get("formGroup" + "AK_000016").get("formControl" + "AV_000090").value) {
              this.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000097").setValue(true); //Tipo de Comunicações com o valor GPRS
            }
          }

        }


        //if (attrId == "AV_000091") { //AV_000091 - Comunicações Cliente
        //  var findGroupAttr = this.equipmentSettings.find(group => group.id == "AK_000017");
        //  var attr = findGroupAttr.attributes.find(att => att.id == "AV_000085");
        //  if (attr.aggregatorId != null && attr.aggregatorId != "") {
        //    if (this.formConfig.get("formGroup" + "AK_000017").get("formControl" + attr.aggregatorId).value == "AV_000085") { //Tipo de Terminal ser fixo
        //      var findGroupAttr = this.equipmentSettings.find(group => group.id == "AK_000011");
        //      var attr = findGroupAttr.attributes.find(att => att.id == "AV_000099");
        //      if (attr.aggregatorId != null && attr.aggregatorId != "") {
        //        this.formConfig.get("formGroup" + "AK_000011").get("formControl" + attr.aggregatorId).setValue("AV_000099"); // Tipo de Comunicações com o valor IP/ADSL
        //      } else {
        //        this.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000099").setValue(true); // Tipo de Comunicações com o valor IP/ADSL
        //      }
        //    }
        //  } else {
        //    if (this.formConfig.get("formGroup" + "AK_000017").get("formControl" + "AV_000085").value) { //Tipo de Terminal ser fixo
        //      this.formConfig.get("formGroup" + "AK_000011").get("formControl" + "AV_000099").setValue(true); // Tipo de Comunicações com o valor IP/ADSL
        //    }
        //  }


        //  var findGroupAttr = this.equipmentSettings.find(group => group.id == "AK_000017");
        //  var attr = findGroupAttr.attributes.find(att => att.id == "AV_000086");
        //  if (attr.aggregatorId != null && attr.aggregatorId != "") {
        //    if (this.formConfig.get("formGroup" + "AK_000017").get("formControl" + attr.aggregatorId).value == "AV_000086") { // Tipo de Terminal ser móvel
        //      var findGroupAttr = this.equipmentSettings.find(group => group.id == "AK_000011");
        //      findGroupAttr.attributes.forEach(value => {
        //        if (value.aggregatorId != null && value.aggregatorId != "") {
        //          if (value.id != "AV_000097" && value.id != "AV_000098") {
        //            context.formConfig.get("formGroup" + "AK_000011").get("formControl" + value.aggregatorId).disable();
        //          } else {
        //            context.formConfig.get("formGroup" + "AK_000011").get("formControl" + value.aggregatorId).setValidators(Validators.required);
        //          }
        //        } else {
        //          if (value.id != "AV_000097" && value.id != "AV_000098") {
        //            context.formConfig.get("formGroup" + "AK_000011").get("formControl" + value.id).disable();
        //          } else {
        //            context.formConfig.get("formGroup" + "AK_000011").get("formControl" + value.id).setValidators(Validators.required);
        //          }
        //        }
        //      });
        //    }
        //  } else {
        //    if (this.formConfig.get("formGroup" + "AK_000017").get("formControl" + "AV_000086").value) {
        //      var findGroupAttr = this.equipmentSettings.find(group => group.id == "AK_000011");
        //      findGroupAttr.attributes.forEach(value => {
        //        if (value.aggregatorId != null && value.aggregatorId != "") {
        //          if (value.id != "AV_000097" && value.id != "AV_000098") {
        //            context.formConfig.get("formGroup" + "AK_000011").get("formControl" + value.aggregatorId).disable();
        //          } else {
        //            context.formConfig.get("formGroup" + "AK_000011").get("formControl" + value.aggregatorId).setValidators(Validators.required);
        //          }
        //        } else {
        //          if (value.id != "AV_000097" && value.id != "AV_000098") {
        //            context.formConfig.get("formGroup" + "AK_000011").get("formControl" + value.id).disable();
        //          } else {
        //            context.formConfig.get("formGroup" + "AK_000011").get("formControl" + value.id).setValidators(Validators.required);
        //          }
        //        }
        //      });
        //    }
        //  }
        //}
      }

      if (equipmentId == "AK_000015") { // Propriedade Terminal
        if (attrId == "AV_000089") { // Terminal Cliente
          var findGroupAttr = this.equipmentSettings.find(group => group.id == "AK_000016");
          var attr = findGroupAttr.attributes.find(att => att.id == "AV_000091");
          if (attr.aggregatorId != null && attr.aggregatorId != "") {
            this.formConfig.get("formGroup" + "AK_000016").get("formControl" + attr.aggregatorId).setValue("AV_000091");
          } else {
            if (this.formConfig.get("formGroup" + "AK_000015").get("formControl" + "AV_000089").value) {
              this.formConfig.get("formGroup" + "AK_000016").get("formControl" + "AV_000091").setValue(true);
            }
          }
        }
      }

      this.formConfig.updateValueAndValidity();
      this.changedPackValue = true;
      if (this.calledMensalidades) {
        this.calledMensalidades = false;
        this.selectedMensalidadeId = "";
        this.pricingOptions = [];
        this.pricingAttributeList = [];
      }
    }
    this.firstTimeChanged = false;
    this.finalList = [];
    this.list = [];

    var oldArray = JSON.stringify(this.equipmentSettings);
    this.list = JSON.parse(oldArray);

    this.list.forEach((group) => {
      group.attributes.forEach((attr) => {
        if (attr["aggregatorId"] !== null && attr["aggregatorId"] !== "") {
          if (attr.value === this.formConfig.get("formGroup" + group.id)?.get("formControl" + attr["aggregatorId"])?.value) {
            attr.isSelected = true;
          } else {
            attr.isSelected = false;
          }
        } else {
          attr.isSelected = this.formConfig.get("formGroup" + group.id)?.get("formControl" + attr.id)?.value;
        }
      });
    });

    var finalGroupsList = this.list.filter(group => group.attributes.filter(attr => {
      if (attr.isSelected) {
        return true;
      } else {
        return false;
      }
    }));

    this.list.forEach(group => {
      var groupList = group.attributes.filter(attr => attr.isSelected == true || (attr["aggregatorId"] != null && attr["aggregatorId"] != undefined && attr["aggregatorId"] != "" && attr.value == context.formConfig.get("formGroup" + group.id)?.get("formControl" + attr["aggregatorId"])?.value));
      context.finalList.push(group);
      context.finalList.find(l => l.id == group.id).attributes = groupList;
    });

    this.list = this.finalList.filter(group => group.attributes.length > 0);

    //remover da lista dos pacotes comerciais, os grupos que não foram selecionados
    this.list.forEach((group) => {
      group.attributes.forEach((attr, ind) => {
        if (attr["aggregatorId"] != null && attr["aggregatorId"] != undefined && attr["aggregatorId"] != "") {
          if (attr.value !== this.formConfig.get("formGroup" + group.id)?.get("formControl" + attr["aggregatorId"])?.value) {
            var removedGroup = group.attributes.splice(ind, 1);
            return;
          }
        } else {
          if (attr.isSelected === false || attr.isSelected == undefined) {
            var removedGroup = group.attributes.splice(ind, 1);
            return;
          }
        }
      });
    });
  }

  onActivate() {
    document.getElementById("btn5a4").addEventListener("click", () => {
      document.getElementById("btn5a2").focus({ preventScroll: false });  // default: {preventScroll:false}
    });
  }

  cancelConfig() {
    this.pricingOptions = [];
    this.pricingAttributeList = [];
    this.changedStoreEvent.emit(true);
  }

  calculateValue(event) {
    let discount = Number(event.target.value);
    let originalValue = this.pricingForm.get("formGroupPricing" + event.target.id).get("formControlPricingOriginal" + event.target.id).value;
    let finalValue = originalValue - discount;
    this.pricingForm.get("formGroupPricing" + event.target.id).get("formControlPricingFinal" + event.target.id).setValue(finalValue.toFixed(2));
    if (finalValue < 0) {
      this.isInvalidNumber = true;
    } else {
      this.isInvalidNumber = false;
    }
  }

  decimalOnly(event): boolean { // restrict e,+,-,E characters in  input type number
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode == 101 || charCode == 69 || charCode == 45 || charCode == 43) {
      return false;
    }

    let discount = event.target.value;
    let originalValue = this.pricingForm.get("formGroupPricing" + event.target.id).get("formControlPricingOriginal" + event.target.id).value;
    if (discount > originalValue) {
      this.isInvalidNumber = true;
      return false;
    }

    this.isInvalidNumber = false;
    return true;
  }
}
