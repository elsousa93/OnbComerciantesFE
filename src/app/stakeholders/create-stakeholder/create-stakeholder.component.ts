import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DataService } from '../../nav-menu-interna/data.service';
import { docTypeListE, docTypeListP } from '../docType';
import { IStakeholders } from '../IStakeholders.interface';
import { StakeholderService } from '../stakeholder.service';
import { stakeTypeList } from '../stakeholderType';

@Component({
  selector: 'app-create-stakeholder',
  templateUrl: './create-stakeholder.component.html',
  styleUrls: ['./create-stakeholder.component.css']
})
export class CreateStakeholderComponent implements OnInit {
  UUIDAPI: string = "eefe0ecd-4986-4ceb-9171-99c0b1d14658"

  newStake: IStakeholders = {
    "fiscalId": "",
    "identificationDocument": {
      "type": "",
      "number": "",
      "country": "",
      "expirationDate": "",
    },
    "fullName": "",
    "contactName": "",
    "shortName": ""
  } as IStakeholders;

  submissionId: string = "83199e44-f089-471c-9588-f2a68e24b9ab";

  submissionStakeholders: IStakeholders[] = [];

  //Field "stakeholder type" for the search
  ListStakeholderType = stakeTypeList;
  stakeholderType?: string = "";

  //Field "doc type" for the search
  ListDocTypeP = docTypeListP;
  ListDocTypeE = docTypeListE;
  documentType?: string = "";

  stakeholdersToShow: any[] = [];

  ngForm!: FormGroup;
  public stakes: IStakeholders[] = [];
  public stakeShow: IStakeholders[] = [];
  public stakeType: boolean = false;
  public showFoundStake: boolean = null;
  public stakeDocType: boolean = false;
  public stakeholderId: number = 0;
  public fiscalId: number = 0;
  public clientNr: number = 8875;
  public totalUrl: string = "";
  public auxUrl: string = "";
  public stakeSearch: IStakeholders[] = [this.newStake];
  isShown: boolean = false;
  isFoundStakeholderShown: boolean = false;
  public flagRecolhaEletronica: boolean = true;
  public poppy?: any;

  formStakeholderSearch: FormGroup;

  public map: Map<number, boolean>;
  public currentPage: number;
  public subscription: Subscription;

  public isParticular: boolean = false;
  public isCC: boolean = false;
  public isNoDataReadable: boolean;

  constructor(private router: ActivatedRoute,
    private http: HttpClient, @Inject('BASE_URL')
    private baseUrl: string, private route: Router, private data: DataService, private fb: FormBuilder, private stakeholderService: StakeholderService) {

    this.ngOnInit();

    var context = this;
    this.initializeForm();
    //stakeholderService.GetAllStakeholdersFromSubmission(this.submissionId).subscribe(result => {
    //  result.forEach(function (value, index) {
    //    console.log(value);
    //    context.stakeholderService.GetStakeholderFromSubmission(context.submissionId, value.id).subscribe(result => {
    //      console.log(result);
    //      context.submissionStakeholders.push(result);
    //    }, error => {
    //      console.log(error);
    //    });
    //  });
    //}, error => {
    //  console.log(error);
    //});

  }

  initializeForm() {
    this.formStakeholderSearch = new FormGroup({
      type: new FormControl('', Validators.required),
      documentType: new FormControl('', Validators.required),
      documentNumber: new FormControl('', Validators.required)
    });

    this.formStakeholderSearch.get("documentType").valueChanges.subscribe(data => {
      if (data !== 'Cartão do Cidadão') {
        this.formStakeholderSearch.controls["documentNumber"].setValidators([Validators.required]);
      } else {
        this.formStakeholderSearch.controls["documentNumber"].clearValidators();
      }
      this.formStakeholderSearch.controls["documentNumber"].updateValueAndValidity();
    });
  }

  redirectAddStakeholder() {
    this.route.navigate(['/add-stakeholder/']);
  }

  redirectInfoStakeholder() {
    this.route.navigate(['/add-stakeholder/']);
  }

  //função que altera o valor do map e da currentPage
  updateData(value: boolean, currentPage: number) {
    this.map.set(currentPage, value);
    this.data.changeData(this.map);
    this.data.changeCurrentPage(currentPage);
  }

  changeDataReadable(readable: boolean) {
    this.isNoDataReadable = readable;
  }

  ngOnInit(): void {
    //Get Id from the store
    // this.clientNr = Number(this.router.snapshot.params['nif']);
    //this.form = new FormGroup({
    //   stakeholderType: new FormControl(''),
    //   tipoDocumento: new FormControl(''),
    //   stakeholderNif: new FormControl(''),
    // });
    //this.createForm();
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
  }

  createForm() {
    this.formStakeholderSearch = this.fb.group({
      stakeholderType: [''],
      docType: [''],
      docNumber: [''],
      flagAutCol: [''],
      identificationDocumentId: [''],
      documentType: ['']
    });
  }

  onClickSearch() {
    console.log("pesq");

  }

  //When canceling the create new store feature the user must navigate back to store list
  onClickCancel() {
    this.route.navigate(['stakeholders']);
  }

  onClickNew() {
    let navigationExtras: NavigationExtras = {
      state: {
        isCC: this.isCC
      }
    };
    this.route.navigate(['/add-stakeholder'], navigationExtras);
  }

  onClickEdit(fiscalId) {
    console.log("edit");
    this.route.navigate(['/update-stakeholder/', fiscalId]);
  }

  onClickDelete(fiscalId, clientNr) {
    console.log("delete");
    this.route.navigate(['/add-stakeholder/', fiscalId, clientNr, 'delete']);
  }

  changeListElementStakeType(stakeType: string, e: any) {
    this.stakeholderType = e.target.value;
    if (this.stakeholderType === 'Particular') {
      this.isParticular = true;
    } else {
      this.isParticular = false;
    }
    this.stakeType = true;
  }
  changeListElementDocType(docType: string, e: any) {
    this.documentType = e.target.value;

    this.newStake.identificationDocument.type = this.documentType;

    if (this.documentType === 'Cartão do Cidadão') {
      this.isCC = true;
    } else {
      this.isCC = false;
    }
    this.stakeDocType = true;
  }

  toggleShow(stake: IStakeholders) {
    //clear the array
    this.stakeShow = [];
    this.isShown = !this.isShown;

    this.stakeShow.push(stake);
    console.log("stakeShow array: " + this.stakeShow[0]);
    // GetByid(StakeholderNif, 0)

  }

  //searchStakeholder(formStakeholderSearch) {
  //  console.log(formStakeholderSearch);
  //  this.http.get<IStakeholders>(this.baseUrl + 'BEStakeholders/StakeholderBySubmissionID/' + this.formStakeholderSearch.value.docNumber + "/submission/" + "1").subscribe(result => {
  //    console.log(result);
  //    this.toggleShow(result);
  //  }, error => console.error(error));
  //}

  searchStakeholder() {
    //this.formStakeholderSearch
    //console.log("ola");
    //this.stakeholderService.SearchStakeholderByQuery("000000002", "por mudar", this.UUIDAPI, "2").subscribe(o => {
    //  console.log(o);
    //});

    if (this.formStakeholderSearch.invalid)
      return false;

    var context = this;

    var documentNumberToSearch = this.formStakeholderSearch.get('documentNumber').value;

    /*this.onSearchSimulation(22181900000011);*/
    this.stakeholderService.SearchStakeholderByQuery(documentNumberToSearch, "por mudar", this.UUIDAPI, "2").subscribe(o => {
      var clients = o;

      var context2 = this;

      clients.forEach(function (value, index) {
        console.log(value);
        context2.stakeholderService.getStakeholderByID(value.stakeholderId, "por mudar", "por mudar").subscribe(c => {
          console.log(c);
          var stakeholder = {
            "stakeholderNumber": c.stakeholderId,
            "stakeholderName": c.shortName,
            "stakeholderNIF": c.fiscalIdentification.fiscalId,
            "elegible": "elegivel",
            "associated": "SIM"
          }

          context.stakeholdersToShow.push(stakeholder);
          console.log(context.stakeholdersToShow);
        });
      })
    }, error => {
      console.log("deu erro no stakeholders search request");
      //context.showFoundClient = false;
      //console.log("entrou aqui no erro huajshudsj");
      //context.resultError = "Não existe Comerciante com esse número.";
      //this.searchDone = true;
    });
  }

  refreshDiv() {
    location.reload();
    this.ngOnInit();
  }


}
