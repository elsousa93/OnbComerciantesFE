import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Component, Inject, OnInit, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Process } from '../process.interface';
import { catchError, map, tap } from 'rxjs';
import { ISubmission } from '../../submission/ISubmission.interface';
import { ComprovativosService } from '../../comprovativos/services/comprovativos.services';
import { ProcessService } from '../process.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-acceptance',
  templateUrl: './acceptance.component.html',
  styleUrls: ['./acceptance.component.css']
})
export class AcceptanceComponent implements OnInit {

  processId: string = this.router.snapshot.params['submissionID'];
  //processId: number = 123456;
  process: any;
  isVisible: any;
  isSelected: boolean = true;
  username = "";
  password = "";
  authenticationHeader = "Basic " + this.username + ":" + this.password;

  files: File[] = [];
  localUrl: any;
  fileName: any;

  downloadPath: string = "./write.pdf";
  download: string = "write.pdf";

  representativesSelected: String[] = [];
  isValid: boolean = false;

  modalRef: BsModalRef;

  startedDigitalSignature: boolean = false;
  acceptancePage: boolean = false;

  constructor(private router: ActivatedRoute,
    private http: HttpClient, @Inject('BASE_URL')
    private baseUrl: string, private route: Router,
    private ProcessService: ProcessService,
    private compService: ComprovativosService, private modalService: BsModalService) {

    //this.loadXMLData();
    this.oAuth();
    //this.ngOnInit();
    this.ProcessService.getSubmissionByID(this.processId).subscribe(result => {
      console.log(this.processId);
      console.log(result);
      this.process = result;

    });
    //temos de ir buscar um processo e também os os representantes da empresa

    /*http.get<Process>(baseUrl + 'BEProcess/GetAllProcesses').subscribe(result => {
      this.process = result;
      console.log(this.process);
    }, error => console.error(error));*/

  }

  ngOnInit(): void {
    console.log(this.isSelected);
  }

  //loadXMLData() {


  //  this.http.get('assets/xml_teste/getProcessDetailV3.xml', {
  //    headers: new HttpHeaders().set('Content-Type', 'text/xml')
  //      .append('Access-Control-Allow-Methods', 'GET')
  //      .append('Access-Control-Allow-Origin', '*')
  //      .append('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Access-Control-Allow-Origin, Access-Control-Request-Method'),
  //    responseType: 'text'
  //  })
  //    .subscribe((data) => {
  //      this.parseXML(data).then((data) => {
  //        this.xmlItems = data;
  //      });
  //    });
  //  //Read data
  //}

  //parseXML(data) {
  //  return new Promise(resolve => {
  //    var k: string | number,
  //      arr = [],
  //      parser = new xml2js.Parser(
  //        {
  //          trim: true,
  //          explicitArray: true
  //        });
  //    parser.parseString(data, function (err, results) {
  //      var object = results["soap:Envelope"]["soap:Body"][0]["mtr:GetProcessDetailRequestV3"];
  //      for (var i = 0; i < object.length; i++) {
  //        for (k in object[i]) {
  //          if (Array.isArray(object[i][k])) {
  //            if (object[i][k].length >= 2) {
  //              for (var j = 0; j < object[i][k].length; j++) {
  //                for (var a in object[i][k][j]) {
  //                  console.log('O valor de ', a, 'é: ', object[i][k][j][a][0]);
  //                }
  //              }
  //            } else {
  //              console.log('O valor de ',k, 'é:', object[i][k][0]);
  //            }
  //          }
  //        }
  //      }
  //    })
  //  })
  //}

  //teste() {
  //  return this.http.get('assets/xml_teste/newProcessV3.xml', { responseType: 'text' })
  //    .pipe(
  //      map((xmlString: string) => {
  //        const asJson = this.xmlStringToJson(xmlString);
  //        console.log(asJson);
  //        return asJson;
  //      }),
  //      catchError((err) => {
  //        console.warn('INT ERR:', err);
  //        return err;
  //      })
  //    );
  //}
  // TOCO: In practice, may want to use an HttpInterceptor:
  //       https://angular.io/guide/http#intercepting-requests-and-responses
  //       https://blog.angularindepth.com/the-new-angular-httpclient-api-9e5c85fe3361

  //xmlStringToJson(xml: string) {
  //  // Convert the XML string to an XML Document.
  //  const oParser = new DOMParser();
  //  const oDOM = oParser.parseFromString(xml, "application/xml");
  //  // Convert the XML Document to a JSON Object.
  //  return this.xmlToJson(oDOM);
  //}

  //xmlToJson(xml) {
  //  // Create the return object
  //  var obj = {};

  //  if (xml.nodeType == 1) { // element
  //    // do attributes
  //    if (xml.attributes.length > 0) {
  //      obj["@attributes"] = {};
  //      for (var j = 0; j < xml.attributes.length; j++) {
  //        var attribute = xml.attributes.item(j);
  //        obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
  //      }
  //    }
  //  } else if (xml.nodeType == 3) { // text
  //    obj = xml.nodeValue;
  //  }

  //  // do children
  //  if (xml.hasChildNodes()) {
  //    for (var i = 0; i < xml.childNodes.length; i++) {
  //      var item = xml.childNodes.item(i);
  //      var nodeName = item.nodeName;
  //      if (typeof (obj[nodeName]) == "undefined") {
  //        obj[nodeName] = this.xmlToJson(item);
  //      } else {
  //        if (typeof (obj[nodeName].push) == "undefined") {
  //          var old = obj[nodeName];
  //          obj[nodeName] = [];
  //          obj[nodeName].push(old);
  //        }
  //        obj[nodeName].push(this.xmlToJson(item));
  //      }
  //    }
  //  }
  //  return obj;
  //}

  //teste2() {
  //  this.teste().subscribe((data) => {
  //    console.log('Json data received:', data);
  //},
  //  (err) => {
  //    console.warn('Erroneous! Err:', err);
  //  });
  //}

  soapCall() {
    const xmlhttp = new XMLHttpRequest();
    xmlhttp.open('POST', 'https://teste.multicert.com/mtrust/api/soap/v2.0/MtrustProcess?wsdl', true);

    const request = `<?xml version="1.0" encoding="utf-8" ?>
                    <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"
                      xmlns:mtr="https://teste.multicert.com/mtrust/api/soap/v2.0/MtrustProcess?wsdl">
                      <soap:Header/>
                        <soap:Body>
                          <mtr:GetProcessDetailRequestV3>
                            <mtr:issuerCompanyId>`+ 505767457 + `</mtr:issuerCompanyId>
                            <mtr:username>` + 'demo_no_proof' + `</mtr:username>
                            <mtr:guid>` + "394f7c81ca024d6b8839e6386db424be00613e721c12" + `</mtr:guid>
                            <mtr:downloadDocuments>` + false + `</mtr:downloadDocuments>
                            <mtr:notificationHistory>` + false + `</mtr:notificationHistory>
                          </mtr:GetProcessDetailRequestV3>
                        </soap:Body>
                     </soap:Envelope>`;

    xmlhttp.onreadystatechange = () => {
      if (xmlhttp.readyState == 4) {
        if (xmlhttp.status == 200) {
          const xml = xmlhttp.responseXML;
          const value = xml.getElementsByTagName('return')[0].childNodes[0].nodeValue;
          console.log('Value ', value);
        }
      }
    }

    xmlhttp.setRequestHeader('Content-Type', 'text/xml');
    xmlhttp.setRequestHeader('Authorization', 'Basic ' + this.username + ":" + this.password);
    xmlhttp.responseType = 'document';
    xmlhttp.send(request);

  }

  oAuth() {
    var secret = btoa("ca0c3470904dc3b2ddfe691dd0950d29" + ":" + "n%3Fw0%21uH7h6853%23k6A0fg");

    const HTTP_OPTIONS = {
      headers: new HttpHeaders({
        'Content-Type': 'multipart/form-data',
        'Authorization': 'Basic ' + secret,
      }),
      params: {
        'grant_type': 'password',
        'username': 'PRT/CC/99000245/505767457/4a3d88cbfc37465a999aa3c5fdd19e75ec21e594c81e',
        'password': '',
        'client_id': 'ca0c3470904dc3b2ddfe691dd0950d29',
        'client_secret': 'n%3Fw0%21uH7h6853%23k6A0fg',
      }

    }

    const body = new HttpParams().set('grant_type', 'password')
      .set('username', 'PRT/CC/99000245/505767457/4a3d88cbfc37465a999aa3c5fdd19e75ec21e594c81e')
      .set('password', '')
      .set('client_id', 'ca0c3470904dc3b2ddfe691dd0950d29')
      .set('client_secret', 'n%3Fw0%21uH7h6853%23k6A0fg')
      ;

    this.http.post("mtrust/oauth/token", body, HTTP_OPTIONS)
      .subscribe(tap(res => {
        console.log(res);
      }))
  }

  //Assinatura manual

  removeFile(file: any) {
    //return this.files.filter(function (ele) {
    //  console.log(ele);
    //  console.log(file);
    //  if (ele.name === file.name) {
    //    console.log("sim");
    //  }
    //  return ele.name !== file.name;
    //});

    const index = this.files.indexOf(file);
    console.log(index);
    if (index > -1) {
      this.files.splice(index, 1);
    }
  }

  selectFile(event: any, comp: any) {
    console.log(event);
    //this.file = <File>event.target.files[0];
    //const sizeFile = this.file.size / (1024 * 1024);
    //var file = <File>event.target.files[0];
    //const sizeFile = file.size / (1024 * 1024);
    //var extensoesPermitidas = /(.pdf)$/i;
    //const limSize = 10;
    //if ((sizeFile <= limSize) && (extensoesPermitidas.exec(file.name))) {
    //  if (event.target.files && event.target.files[0]) {
    //    var reader = new FileReader();
    //    reader.onload = (event: any) => {
    //      this.localUrl = event.target.result;
    //    }
    //    reader.readAsDataURL(event.target.files[0]);
    //    this.files.push(file);
    //    //this.uploadFile(comp[0].processNumber);
    //  }
    //} else {
    //  alert("Verifique o tipo / tamanho do ficheiro");
    //}

    const files = <File[]>event.target.files;
    console.log(files);
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      const sizeFile = file.size / (1024 * 1024);
      var extensoesPermitidas = /(.pdf)$/i;
      const limSize = 10;
      if ((sizeFile <= limSize) && (extensoesPermitidas.exec(file.name))) {
        if (event.target.files && files[i]) {
          var reader = new FileReader();
          reader.onload = (event: any) => {
            this.localUrl = event.target.result;
          }
          reader.readAsDataURL(files[i]);
          this.files.push(file);
          //this.uploadFile(comp[0].processNumber);
        }
      } else {
        alert("Verifique o tipo / tamanho do ficheiro");
      }
    }
  }

  uploadFiles() {
    for (var i = 0; i < this.files.length; i++) {
      this.compService.uploadFile(this.files[i], 999).subscribe(data => {
        if (data != null) {
          console.log("upload feito com sucesso");
        }
      },
        err => {
          console.error(err);
        })
    }

    //if (this.file != undefined) {
    //  this.compService.uploadFile(this.file, 999).subscribe(data => {
    //    if (data != null) {
    //      alert("Upload efetuado!");
    //      var elemento = document.getElementById(id);
    //      this.load();
    //    }
    //  },
    //    err => {
    //      console.error(err);
    //    }
    //  )
    //} else {
    //  alert("Selecione um arquivo!")
    //}
  }

  load() {
    location.reload()
  }

  downloadFile(element) {
    console.log(element);
  }

  changeRepresentativeSelected(event) {
    if (this.representativesSelected.indexOf(event.target.id) > -1) { //fazer o id ser o NIF ou outro identificador que seja apenas de um user
      var index = this.representativesSelected.indexOf(event.target.id);
      this.representativesSelected.splice(index, 1);
    } else {
      this.representativesSelected.push(event.target.id);
    }
  }

  isValidChange(value: boolean) {
    this.isValid = value;
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
    this.startedDigitalSignature = true;
  }

  cancelDigitalSignature() {
    if (this.isValid) {
      this.isValid = false;
    }
    this.startedDigitalSignature = false;
  }

  setCurrentPage(value: boolean) {
    this.acceptancePage = value;
  }

}
