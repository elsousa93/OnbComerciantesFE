import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CookieService } from 'ngx-cookie-service'
import { MediaMatcher } from '@angular/cdk/layout';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, HostBinding, Input, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { onSideNavChange, AutoHideSidenavAdjust } from '../animation';
import { UserPermissions, MenuPermissions, getMenuPermissions } from '../userPermissions/user-permissions'
import { Sort } from '@angular/material/sort';
import { DataService } from '../nav-menu-interna/data.service';
import { ProcessGet, ProcessService, UpdateProcess } from '../process/process.service';
import { Process } from '../process/process.interface';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  animations: [onSideNavChange, AutoHideSidenavAdjust]
})
export class DashboardComponent implements OnInit {
  displayedColumns1: string[] = ['id', 'name', 'progress', 'color', 'teste']

  displayedColumnsWithObject: string[] = [
    'id',
    'firstname',
    'lastname',
    'email',
    'gender',
    'jobtitle',
    'department',
    'project.name',
  ];

  EmpData: Employee[] = [
    {
      id: 1,
      firstname: 'Mellie',
      lastname: 'Gabbott',
      email: 'mgabbott0@indiatimes.com',
      gender: 'Female',
      department: 'Support',
      jobtitle: 'Support Analyst',
      project: { name: 'project1', id: 1 },
    },
    {
      id: 2,
      firstname: 'Yehudi',
      lastname: 'Ainsby',
      email: 'yainsby1@w3.org',
      gender: 'Female',
      department: 'Support',
      jobtitle: 'Support Analyst',
      project: { name: 'project2', id: 2 },
    },
    {
      id: 3,
      firstname: 'Noellyn',
      lastname: 'Primett',
      email: 'nprimett2@ning.com',
      gender: 'Female',
      department: 'Human Resources',
      jobtitle: 'Project Manager',
      project: { name: 'project3', id: 3 },
    },
    {
      id: 4,
      firstname: 'Stefanie',
      lastname: 'Yurenin',
      email: 'syurenin3@boston.com',
      gender: 'Female',
      department: 'Marketing',
      jobtitle: 'Senior officer',
      project: { name: 'project4', id: 4 },
    },
    {
      id: 5,
      firstname: 'Stormi',
      lastname: "O'Lunny",
      email: 'solunny4@patch.com',
      gender: 'Female',
      department: 'Engineering',
      jobtitle: 'Software Engineer',
      project: { name: 'project5', id: 5 },
    },
    {
      id: 6,
      firstname: 'Keelia',
      lastname: 'Giraudy',
      email: 'kgiraudy5@nba.com',
      gender: 'Male',
      department: 'Marketing',
      jobtitle: 'Senior officer',
      project: { name: 'project6', id: 6 },
    },
    {
      id: 7,
      firstname: 'Ikey',
      lastname: 'Laight',
      email: 'ilaight6@wiley.com',
      gender: 'Male',
      department: 'Support',
      jobtitle: 'Support Analyst',
      project: { name: 'project7', id: 7 },
    },
    {
      id: 8,
      firstname: 'Adrianna',
      lastname: 'Ruddom',
      email: 'aruddom7@seattletimes.com',
      gender: 'Male',
      department: 'Marketing',
      jobtitle: 'Senior officer',
      project: { name: 'project8', id: 8 },
    },
    {
      id: 9,
      firstname: 'Dionysus',
      lastname: 'McCory',
      email: 'dmccory8@ox.ac.uk',
      gender: 'Male',
      department: 'Engineering',
      jobtitle: 'Software Engineer',
      project: { name: 'project9', id: 9 },
    },
    {
      id: 10,
      firstname: 'Claybourne',
      lastname: 'Shellard',
      email: 'cshellard9@rediff.com',
      gender: 'Male',
      department: 'Engineering',
      jobtitle: 'Software Engineer',
      project: { name: 'project10', id: 10 },
    },
  ];

  dataSourcePendentes: MatTableDataSource<ProcessGet>;
  dataSourceTratamento: MatTableDataSource<ProcessGet>;
  dataSourceDevolvidos: MatTableDataSource<ProcessGet>;
  dataSourceAceitacao: MatTableDataSource<ProcessGet>;
  dataSourceArquivoFisico: MatTableDataSource<ProcessGet>;
  
  @ViewChild('empTbSort') empTbSort = new MatSort();
  @ViewChild('empTbSortWithObject') empTbSortWithObject = new MatSort();
  @ViewChild('empTbSortDevolvidos') empTbSortDevolvidos = new MatSort();
  @ViewChild('empTbSortAceitacao') empTbSortAceitacao = new MatSort();
  @ViewChild('empTbSortArquivoFisico') empTbSortArquivoFisico = new MatSort();
  @ViewChild('paginatorPage') paginatorPage : MatPaginator;
  @ViewChild('paginatorPageSize') paginatorPageSize: MatPaginator;
  @ViewChild('paginatorPageDevolvidos') paginatorPageDevolvidos: MatPaginator;
  @ViewChild('paginatorPageAceitacao') paginatorPageAceitacao: MatPaginator;
  @ViewChild('paginatorPageArquivoFisico') paginatorPageArquivoFisico: MatPaginator;
  
  //---------------------------
  
  @Input() isToggle: boolean = false;
  @Input() isAutoHide: boolean = false;

  displayedColumns = ['processNumber', 'contractNumber', 'requestDate', 'user', 'buttons'];

  process: ProcessGet = {
    processNumber: "",
    isClientAwaiting: true,
    processId: "",
    processKind: "",
    processType: "",
    startedBy: {
      partner: "",
      partnerBranch: "",
      user:""
    },
    state: ""
  }

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  pageSizes = [10, 25, 100];

  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;
  @HostBinding('style.--toptestexpto') public toptestexpto: string = '5px';


  userType: string = "Banca";
  userPermissions: MenuPermissions;

  incompleteProcessess: ProcessGet[] = [];
  ongoingProcessess: ProcessGet[] = [];
  returnedProcessess: ProcessGet[] = [];
  contractAcceptanceProcessess: ProcessGet[] = [];
  completeProcessess: ProcessGet[] = [];

  constructor(private http: HttpClient, private cookie: CookieService, private router: Router,
    changeDetectorRef: ChangeDetectorRef, media: MediaMatcher, private dataService: DataService, private processService: ProcessService) {
    this.mobileQuery = media.matchMedia('(max-width: 850px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
    localStorage.clear();
    this.dataSourcePendentes = new MatTableDataSource(this.incompleteProcessess);
    //const users: UserData[] = [];
    //for (let i = 1; i <= 100; i++) {
    //  users.push(createNewUser(i));
    //}

    // Assign the data to the data source for the table to render

    //Pendentes de envio
    this.processService.searchProcessByState('Incomplete').subscribe(result => {
      console.log('Pendentes de envio ', result);
      console.log('Número total de processos incompletos ', result.length);
      this.incompleteProcessess = result;
      this.dataSourcePendentes = new MatTableDataSource(this.incompleteProcessess);

      this.dataSourcePendentes.paginator = this.paginator;
      this.dataSourcePendentes.sort = this.sort;
    });

    //Tratamento BackOffice
    this.processService.searchProcessByState('Ongoing').subscribe(result => {
      console.log('Tratamento BackOffice ', result);
      this.ongoingProcessess = result;
      this.dataSourceTratamento = new MatTableDataSource(this.ongoingProcessess);

      this.empTbSortWithObject.disableClear = true;
      this.dataSourceTratamento.sort = this.empTbSortWithObject;
      this.dataSourceTratamento.paginator = this.paginatorPageSize;
    });


    //Devolvido BackOffice
    this.processService.searchProcessByState('Returned').subscribe(result => {
      console.log('Devolvidos BackOffice ', result);
      this.returnedProcessess = result;
      this.dataSourceDevolvidos = new MatTableDataSource(this.returnedProcessess);

      this.dataSourceDevolvidos.paginator = this.paginatorPageDevolvidos;
      this.dataSourceDevolvidos.sort = this.empTbSortDevolvidos;

    });


    //Fase de aceitação
    //this.processService.searchProcessByState('ContractAcceptance').subscribe(result => {
    //  console.log('Fase de aceitação ', result);
    //  this.contractAcceptanceProcessess = result;
    //  this.dataSourceAceitacao = new MatTableDataSource(this.contractAcceptanceProcessess);

    //  this.dataSourceAceitacao.paginator = this.paginatorPageAceitacao;
    //  this.dataSourceAceitacao.sort = this.empTbSortAceitacao;
    //});
    

    //Arquivo Fisico
    this.processService.searchProcessByState('Completed').subscribe(result => {
      console.log('Completos ', result);
      this.completeProcessess = result;
      this.dataSourceArquivoFisico = new MatTableDataSource(this.completeProcessess);

      this.dataSourceArquivoFisico.paginator = this.paginatorPageArquivoFisico;
      this.dataSourceArquivoFisico.sort = this.empTbSortArquivoFisico;
    });
    
    
  }

  cancelProcess(processId: string) {
    var updateProcess: UpdateProcess = {
      state: "canceled",
      cancellationReason: "promptedByUser"
    }

    this.processService.UpdateProcess(processId, updateProcess, "fQkRbjO+7kGqtbjwnDMAag==", "8ed4a062-b943-51ad-4ea9-392bb0a23bac", "22195900002451", "fQkRbjO+7kGqtbjwnDMAag==").
    subscribe(result => {
      console.log("Processo cancelado ", result);
    });
  }

  ngOnInit(): void {
    this.userPermissions = getMenuPermissions(UserPermissions.DO);
  }

  assignMenus() {
  }

  public toggleSideNav(toggled: boolean) {
    this.isToggle = toggled;
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  streamHistoryMenu(){
    this.dataService.historyStream$.next(true); 
  }

  ngAfterViewInit() {
    //this.dataSourcePendentes.paginator = this.paginator;
    //this.dataSourcePendentes.sort = this.sort;

    ////-------------------------------------
    //this.empTbSortWithObject.disableClear = true;
    //this.dataSourceTratamento.sort = this.empTbSortWithObject;
    //this.dataSourceTratamento.paginator = this.paginatorPageSize;

    //this.dataSourceDevolvidos.paginator = this.paginatorPageDevolvidos;
    //this.dataSourceDevolvidos.sort = this.empTbSortDevolvidos;

    //this.dataSourceAceitacao.paginator = this.paginatorPageAceitacao;
    //this.dataSourceAceitacao.sort = this.empTbSortAceitacao;

    //this.dataSourceArquivoFisico.paginator = this.paginatorPageArquivoFisico;
    //this.dataSourceArquivoFisico.sort = this.empTbSortArquivoFisico;

  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSourcePendentes.filter = filterValue;
  }

  applyFilter1(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSourceTratamento.filter = filterValue;
  }

  applyFilterDevolvidos(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSourceDevolvidos.filter = filterValue;
  }

  applyFilterAceitacao(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSourceAceitacao.filter = filterValue;
  }
  
  applyFilterArquivoFisico(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSourceArquivoFisico.filter = filterValue;
  }
}


/** Builds and returns a new User. */
function createNewUser(id: number): UserData {
  const name =
    NAMES[Math.round(Math.random() * (NAMES.length - 1))] + ' ' +
    NAMES[Math.round(Math.random() * (NAMES.length - 1))].charAt(0) + '.';

  return {
    id: id.toString(),
    name: name,
    progress: Math.round(Math.random() * 100).toString(),
    color: COLORS[Math.round(Math.random() * (COLORS.length - 1))],
    teste: ''
  };
}



/** Constants used to fill up our data base. */
const COLORS = ['maroon', 'red', 'orange', 'yellow', 'olive', 'green', 'purple',
  'fuchsia', 'lime', 'teal', 'aqua', 'blue', 'navy', 'black', 'gray'];
const NAMES = ['Maia', 'Asher', 'Olivia', 'Atticus', 'Amelia', 'Jack',
  'Charlotte', 'Theodore', 'Isla', 'Oliver', 'Isabella', 'Jasper',
  'Cora', 'Levi', 'Violet', 'Arthur', 'Mia', 'Thomas', 'Elizabeth'];

export interface UserData {
  id: string;
  name: string;
  progress: string;
  color: string;
  teste: string;
}

export interface Employee {
  id: number,
  firstname: string,
  lastname: string,
  email: string,
  gender: string,
  jobtitle: string,
  department: string,
  project: Project
}

export interface Project {
  name: string,
  id: number
}
