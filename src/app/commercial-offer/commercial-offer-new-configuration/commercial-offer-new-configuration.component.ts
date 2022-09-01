import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Configuration, configurationToken } from 'src/app/configuration';
import { DataService } from '../../nav-menu-interna/data.service';
import { Istore, ShopDetailsAcquiring, ShopEquipment } from '../../store/IStore.interface';
import { NGXLogger } from 'ngx-logger';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { StoreService } from '../../store/store.service';
import { TenantCommunication, TenantTerminal } from '../../table-info/ITable-info.interface';
import { TableInfoService } from '../../table-info/table-info.service';

@Component({
  selector: 'app-commercial-offer-new-configuration',
  templateUrl: './commercial-offer-new-configuration.component.html',
  styleUrls: ['./commercial-offer-new-configuration.component.css']
})
export class CommercialOfferNewConfigurationComponent implements OnInit {
  private baseUrl: string;

  public storeEquip: ShopEquipment = {};
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

  form: FormGroup;
  edit: boolean;
  submissionId: string;

  loadReferenceData() {
    this.tableInfo.GetTenantCommunications().then(success => {
      this.allCommunications = success.result
    }, error => {
      console.log(error.msg);
    });

    this.tableInfo.GetTenantTerminals().then(success => {
      this.allTerminals = success.result
    }, error => {
      console.log(error.msg);
    });
  }

  constructor(private logger: NGXLogger, http: HttpClient, @Inject(configurationToken) private configuration: Configuration, private route: Router, private data: DataService, private storeService: StoreService, private tableInfo: TableInfoService) {
    this.baseUrl = configuration.baseUrl;

    if (this.route.getCurrentNavigation()?.extras?.state) {
      this.store = this.route.getCurrentNavigation().extras.state["store"];
      this.storeEquip = this.route.getCurrentNavigation().extras.state["storeEquip"]; //CASO SEJA PARA EDITAR UMA CONFIGURAÇÃO

      if (this.storeEquip != undefined)
        this.edit = true;
    }
    this.loadReferenceData();
    this.initializeForm();

    if (this.store.productCode == 'cardPresent') {
      if (this.store.supportEntity == 'acquirer') { //caso o ETA seja UNICRE
        if (this.store.subproductCode == 'easy') {
          this.form.get("terminalProperty").setValue("acquirer");
          this.form.get("terminalProperty").disable();

          this.form.get("communicationOwnership").setValue("acquirer");
          this.form.get("communicationOwnership").disable();
        } else {
          //slide 97, não percebi qual é a exceção que deve ser feita
        }
      } else { // caso seja BANCO
        
      }
    }

    this.ngOnInit();
    
    this.data.updateData(false, 5);
  }

  ngOnInit(): void {
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
    this.submissionId = localStorage.getItem("submissionId");
  }

  initializeForm() {
    this.form = new FormGroup({
      name: new FormControl(''),
      terminalProperty: new FormControl(this.storeEquip != null ? this.storeEquip.equipmentOwnership : '', Validators.required),
      communicationOwnership: new FormControl(this.storeEquip != null ? this.storeEquip.communicationOwnership : ''),
      terminalType: new FormControl(this.storeEquip != null ? this.storeEquip.equipmentType : ''),
      communicationType: new FormControl(this.storeEquip != null ? this.storeEquip.communicationType : ''),
      terminalAmount: new FormControl(this.storeEquip != null ? this.storeEquip.quantity : ''),
      //adicionar um form para o preço
    });

    this.form.get("terminalProperty").valueChanges.subscribe(val => {
      if (val === 'acquirer') {
        this.form.get('communicationOwnership').setValidators([Validators.required]);
        this.form.get('terminalType').setValidators([Validators.required]);
        this.form.get('communicationType').setValidators([Validators.required]);
        this.form.get('terminalAmount').setValidators([Validators.required]);
      } else {
        this.form.get('communicationOwnership').setValidators(null);
        this.form.get('terminalType').setValidators(null);
        this.form.get('communicationType').setValidators(null);
        this.form.get('terminalAmount').setValidators(null);
      }
      this.form.get('communicationOwnership').updateValueAndValidity();
      this.form.get('terminalType').updateValueAndValidity();
      this.form.get('communicationType').updateValueAndValidity();
      this.form.get('terminalAmount').updateValueAndValidity();
    });

  }

  loadMensalidades() {
    //chamar a primeira tabela em que podemos selecionar o pacote comercial - quando tivermos Mocks ou APIs  :^)
    if (this.form.valid) {
      //carregamos a tabela
      this.form.valueChanges.subscribe(value => {
        if (value) { 
          //se algum valor do form foi alterado, é necessário carregar as mensalidades novamente e as que já existiam são limpas
        }
      });
    }
  }

  submit() {
    if (this.form.valid) {
      this.storeEquip = {};
      this.storeEquip.equipmentOwnership = this.form.get("terminalProperty").value;
      this.storeEquip.communicationOwnership = this.form.get("communicationOwnership").value;
      this.storeEquip.equipmentType = this.form.get("terminalType").value;
      this.storeEquip.equipmentType = this.form.get("communicationType").value;
      this.storeEquip.quantity = this.form.get("terminalAmount").value;
      //falta o campo para o preço

      let navigationExtras: NavigationExtras = {
        state: {
          store: this.store,
        }
      }

      if (this.edit) {
        console.log("Editar ");
        //chamada à API para editar uma configuração
        //this.storeService.updateShopEquipmentConfigurationsInSubmission(this.submissionId, this.store.id, this.storeEquip).subscribe(result => {
        //  this.logger.debug("Update Shop Equipment From Submission Response ", result);
        //});
      } else {
        console.log("Criar ");
        //chamada à API para criar uma nova configuração
        //this.storeService.addShopEquipmentConfigurationsToSubmission(this.submissionId, this.store.id, this.storeEquip).subscribe(result => {
        //  this.logger.debug("Add Shop Equipment To Submission Response ", result);
        //});
      }

      this.route.navigate(['commercial-offert-list'], navigationExtras);
    }
  }

  cancelConfig() {
    let navigationExtras: NavigationExtras = {
      state: {
        store: this.store,
      }
    }
    this.route.navigate(['commercial-offert-list'], navigationExtras);
  }
}
