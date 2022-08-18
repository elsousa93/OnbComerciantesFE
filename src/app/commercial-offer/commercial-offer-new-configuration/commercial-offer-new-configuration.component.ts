import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Configuration, configurationToken } from 'src/app/configuration';
import { DataService } from '../../nav-menu-interna/data.service';
import { Istore, ShopDetailsAcquiring, ShopEquipment } from '../../store/IStore.interface';
import { NGXLogger } from 'ngx-logger';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-commercial-offer-new-configuration',
  templateUrl: './commercial-offer-new-configuration.component.html',
  styleUrls: ['./commercial-offer-new-configuration.component.css']
})
export class CommercialOfferNewConfigurationComponent implements OnInit {
  private baseUrl: string;

  public storeEquip: ShopEquipment;
  public store: ShopDetailsAcquiring;
  public clientID: number = 12345678;

  /*Is it supposed to relicate the Commercial offert from another store?*/
  selectionsReplicate = ['Não', 'Sim'];
  /*Default case*/
  selectedOption = 'Não';

  public subscription: Subscription;
  public map: Map<number, boolean>;
  public currentPage: number;

  form: FormGroup;

  constructor(private logger : NGXLogger, http: HttpClient, @Inject(configurationToken) private configuration: Configuration, private route: Router, private data: DataService) {
    this.baseUrl = configuration.baseUrl;

    if (this.route.getCurrentNavigation().extras.state) {
      this.store = this.route.getCurrentNavigation().extras.state["store"];
    }

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


    /*Get stores list*/
    this.ngOnInit();
    
    this.data.updateData(false, 5);
  }

  ngOnInit(): void {
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
  }

  initializeForm() {
    this.form = new FormGroup({
      name: new FormControl(''),
      terminalProperty: new FormControl('', [Validators.required]),
      communicationOwnership: new FormControl('', [Validators.required]),
      terminalType: new FormControl('', [Validators.required]),
      communicationType: new FormControl('', [Validators.required]),
      terminalAmount: new FormControl('', [Validators.required]),
      //adicionar um form para o preço
    });
    console.log(this.form);
    this.form.get("terminalProperty").valueChanges.subscribe(val => {
      if (val === 'acquirer') {
        this.form.get('communicationOwnership').setValidators([Validators.required]);
        this.form.get('terminalType').setValidators([Validators.required]);
        this.form.get('communicationType').setValidators([Validators.required]);
        this.form.get('terminalAmount').setValidators([Validators.required]);
        console.log("ESCOLHIDO ACQUIRER ", this.form.get("terminalAmount").hasValidator(Validators.required));
      } else {
        this.form.get('communicationOwnership').setValidators(null);
        this.form.get('terminalType').setValidators(null);
        this.form.get('communicationType').setValidators(null);
        this.form.get('terminalAmount').setValidators(null);
        console.log("OUTRO");
      }
      console.log('FORM ', this.form);
    });
  }

  loadMensalidades() {
    //chamar a primeira tabela em que podemos selecionar o pacote comercial - quando tivermos Mocks ou APIs  :^)
  }

  submit() {
    this.storeEquip.equipmentOwnership = this.form.get("terminalProperty").value;
    this.storeEquip.communicationOwnership = this.form.get("communicationOwnership").value;
    this.storeEquip.equipmentType = this.form.get("terminalType").value;
    this.storeEquip.equipmentType = this.form.get("communicationType").value;
    this.storeEquip.quantity = this.form.get("terminalAmount").value;
    //falta o campo para o preço
  }
}
