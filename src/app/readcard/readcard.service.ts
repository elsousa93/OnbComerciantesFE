import { Injectable, ViewChild, ElementRef } from '@angular/core';
import { dataCC } from '../citizencard/dataCC.interface';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { DatePipe } from '@angular/common';
import { ComprovativosService } from '../comprovativos/services/comprovativos.services';
import { SubmissionDocumentService } from '../submission/document/submission-document.service';
import { NGXLogger } from 'ngx-logger';
import { FileAndDetailsCC } from './fileAndDetailsCC.interface';
import { readCC } from '../citizencard/CitizenCardController.js';
import { readCCAddress } from '../citizencard/CitizenCardController.js';
import { ICCInfo } from '../citizencard/ICCInfo.interface';


@Injectable({
  providedIn: 'root'
})

export class ReadcardService {

  constructor(private comprovativosService: ComprovativosService, private documentService: SubmissionDocumentService,
    private logger: NGXLogger) { }

  public prettyPDF: FileAndDetailsCC = null;

  //---- Cartão de Cidadao - vars ---
  dataCCcontents: dataCC = {
    cardNumberCC: null,
    nameCC: null,
    sexCC: null,
    heightCC: null,
    nationalityCC: null,
    birthdateCC: null,
    expiricyDateCC: null,
    localOfEmissionCC: null,
    fathersNameCC: null,
    mothersNameCC: null,
    nifCC: null,
    socialSecurityCC: null,
    healthNumberCC: null,
    signatureCC: null,
    addressCC: null,
    postalCodeCC: null,
    countryCC: " "
  };

 //novo objecto a enviar 
  objectCCsend: FileAndDetailsCC = {
    lastModifiedDate: null,
    expirationDate: null,
    name: null,
    file: null,
  }

  public addressReading = null; //user chooses to read the address or not

  SetNewCCData(name, cardNumber, nif, birthDate, imgSrc, cardIsExpired,
    gender, height, nationality, expiryDate, nameFather, nameMother,
    nss, sns, address, postalCode, notes, emissonDate, emissonLocal, country, countryIssuer) {

    console.log("address reading - serviço - chegoui aqui ");
    console.log("Name: ", name);

    this.dataCCcontents.nameCC = name;
    this.dataCCcontents.nationalityCC = nationality;
    // this.birthDateCC = birthDate;
    this.dataCCcontents.cardNumberCC = cardNumber; // Nº do CC
    this.dataCCcontents.nifCC = nif;
    this.dataCCcontents.countryCC = country;
    this.dataCCcontents.countryCC = countryIssuer; //HTML

    console.log("country: ", country);
    console.log("country issuer: ", countryIssuer);


    if (notes != null || notes != "") {
      var assinatura = "Sabe assinar";
      if (notes.toLowerCase().includes("não sabe assinar") || notes.toLowerCase().includes("não pode assinar")) {
        assinatura = "Não sabe assinar";
      }
    }

    if (this.addressReading == false) {
      //Without address
      console.log("Without Address PDF");
      this.dataCCcontents.addressCC = "Sem PIN de morada";
      this.dataCCcontents.postalCodeCC = " ";
      //this.dataCCcontents.countryCC = " ";

      var ccArrayData: Array<string> = [name, gender, height, nationality, birthDate, cardNumber, expiryDate,
        emissonLocal, nameFather, nameMother, nif, nss, sns, assinatura, this.dataCCcontents.addressCC, this.dataCCcontents.postalCodeCC, this.dataCCcontents.countryCC];

      console.log(ccArrayData);

      //Send to PDF without address -- type base64
      this.formatPDF(ccArrayData).then(resolve => {
        this.prettyPDF = resolve;
      });
      console.log("PRETTY PDF DEPOIS DO SET: ", this.prettyPDF)

      return this.dataCCcontents;

    } else {

      //WITH ADDRESS
      console.log("With Address PDF");
      this.dataCCcontents.addressCC = address;
      this.dataCCcontents.postalCodeCC = postalCode;

      var ccArrayData: Array<string> = [name, gender, height, nationality, birthDate, cardNumber, expiryDate,
        emissonLocal, nameFather, nameMother, nif, nss, sns, assinatura, address, postalCode, country];

      //Send to PDF
      this.formatPDF(ccArrayData).then(resolve => {
        this.prettyPDF = resolve;
      });
      console.log("PRETTY PDF DEPOIS DO SET: ", this.prettyPDF)
    }
    return this.dataCCcontents;
  }

  //Calls the .js function
  async startReadCC(): Promise<any>{
    return new Promise<any>((resolve, reject) => {
      resolve(readCC(this.SetNewCCData));
    });
  };

  //Calls the .js function
  async startReadCCAddress(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      return readCCAddress(this.SetNewCCData);
    });
  };

  /** Formats PFD - All design choices are done in this function.
  */
  async formatPDF(ccArrayData: Array<string>): Promise<FileAndDetailsCC> {

    return new Promise<FileAndDetailsCC>((resolve, reject) => {

      const doc = new jsPDF('p', 'pt', 'a4');
      //pt-PT importado em app.module
      var date = new Date();
      var pipe = new DatePipe('pt-PT');
      var dateHelper = pipe.transform(Date.now(), 'dd/MM/yyyy, h:mm:ss a zzzz');

      doc.setFontSize(10);
      doc.text("Ficheiro gerado à data: " + dateHelper, 20, 820)

      var config = {
        autoSize: true,
        margin: { right: 305 },
      };
      var config2 = {
        autoSize: true,
        margin: { left: 305 },
      };

      //Cor Unicre: [30, 102, 176]
      //Cor background das celulas: [190, 217, 243]

      autoTable(doc,
        {
          startY: 20,
          head: [
            [
              {
                content: "Digital CC - Leitura automática do Cartão de Cidadão",
                colSpan: 5,
                styles: { halign: "center", fillColor: [255, 255, 255], textColor: [0, 0, 0] }
              }
            ]
          ], body: [],
        }),

        autoTable(doc,
          {
            startY: 50,
            head: [
              [
                {
                  content: "Documento gerado a partir da utilização eletrónica do Cartão de Cidadão",
                  colSpan: 5,
                  styles: { halign: "center", fillColor: [30, 102, 176], textColor: [255, 255, 255] }
                }
              ]
            ],
            body: [
              [
                {
                  content: "NOME",
                  colSpan: 3,
                  styles: {
                    valign: "middle",
                    fillColor: [190, 217, 243],
                    fontStyle: "bold"
                  }
                },
                { content: ccArrayData[0], colSpan: 4, styles: { valign: "middle" } }
              ],

              [
                {
                  content: "SEXO",
                  colSpan: 3,
                  styles: {
                    valign: "middle",
                    fillColor: [190, 217, 243],
                    fontStyle: "bold"
                  }
                },
                { content: ccArrayData[1], colSpan: 4, styles: { valign: "middle" } }
              ],
              [
                {
                  content: "ALTURA",
                  colSpan: 3,
                  styles: {
                    valign: "middle",
                    fillColor: [190, 217, 243],
                    fontStyle: "bold"
                  }
                },
                { content: ccArrayData[2], colSpan: 4, styles: { valign: "middle" } }
              ],
              [
                {
                  content: "NACIONALIDADE",
                  colSpan: 3,
                  styles: {
                    valign: "middle",
                    fillColor: [190, 217, 243],
                    fontStyle: "bold"
                  }
                },
                { content: ccArrayData[3], colSpan: 4, styles: { valign: "middle" } }
              ],
              [
                {
                  content: "DATA DE NASCIMENTO",
                  colSpan: 3,
                  styles: {
                    valign: "middle",
                    fillColor: [190, 217, 243],
                    fontStyle: "bold"
                  }
                },
                { content: ccArrayData[4], colSpan: 4, styles: { valign: "middle" } }
              ],
              [
                {
                  content: "Nº DO DOCUMENTO DE IDENTIFICAÇÃO",
                  colSpan: 3,
                  styles: {
                    valign: "middle",
                    fillColor: [190, 217, 243],
                    fontStyle: "bold"
                  }
                },
                { content: ccArrayData[5], colSpan: 4, styles: { valign: "middle" } }
              ],
              [
                {
                  content: "DATA DE VALIDADE",
                  colSpan: 3,
                  styles: {
                    valign: "middle",
                    fillColor: [190, 217, 243],
                    fontStyle: "bold"
                  }
                },
                { content: ccArrayData[6], colSpan: 4, styles: { valign: "middle" } }
              ],
              [
                {
                  content: "LOCAL DE EMISSÃO",
                  colSpan: 3,
                  styles: {
                    valign: "middle",
                    fillColor: [190, 217, 243],
                    fontStyle: "bold"
                  }
                },
                { content: ccArrayData[7], colSpan: 4, styles: { valign: "middle" } }
              ],
              [
                {
                  content: "NOME DO PAI",
                  colSpan: 3,
                  styles: {
                    valign: "middle",
                    fillColor: [190, 217, 243],
                    fontStyle: "bold"
                  }
                },
                { content: ccArrayData[8], colSpan: 4, styles: { valign: "middle" } }
              ],
              [
                {
                  content: "NOME DA MÃE",
                  colSpan: 3,
                  styles: {
                    valign: "middle",
                    fillColor: [190, 217, 243],
                    fontStyle: "bold"
                  }
                },
                { content: ccArrayData[9], colSpan: 4, styles: { valign: "middle" } }
              ],
              [
                {
                  content: "Nº DE IDENTIFICAÇÃO FISCAL",
                  colSpan: 3,
                  styles: {
                    valign: "middle",
                    fillColor: [190, 217, 243],
                    fontStyle: "bold"
                  }
                },
                { content: ccArrayData[10], colSpan: 4, styles: { valign: "middle" } }
              ],
              [
                {
                  content: "Nº DE SEGURANÇA SOCIAL",
                  colSpan: 3,
                  styles: {
                    valign: "middle",
                    fillColor: [190, 217, 243],
                    fontStyle: "bold"
                  }
                },
                { content: ccArrayData[11], colSpan: 4, styles: { valign: "middle" } }
              ],
              [
                {
                  content: "Nº DE UTENTE DE SAÚDE",
                  colSpan: 3,
                  styles: {
                    valign: "middle",
                    fillColor: [190, 217, 243],
                    fontStyle: "bold"
                  }
                },
                { content: ccArrayData[12], colSpan: 4, styles: { valign: "middle" } }
              ],
              [
                {
                  content: "ASSINATURA",
                  colSpan: 3,
                  styles: {
                    valign: "middle",
                    fillColor: [190, 217, 243],
                    fontStyle: "bold"
                  }
                },
                { content: ccArrayData[13], colSpan: 4, styles: { valign: "middle" } }
              ],
              [
                {
                  content: "MORADA",
                  colSpan: 3,
                  styles: {
                    valign: "middle",
                    fillColor: [190, 217, 243],
                    fontStyle: "bold"
                  }
                },
                { content: ccArrayData[14] + " " + ccArrayData[15], colSpan: 4, styles: { valign: "middle" } }
              ],

            ],
            columnStyles: {
              0: { cellWidth: 150 }
            },
            bodyStyles: {
              lineWidth: 0.2,
              lineColor: [30, 102, 176]
            },
            theme: "plain"
          });


      doc.save("digitalCC_NIF" + ccArrayData[10] + ".pdf"); //Download automatico do comprovativo
      var doc_base64 = doc.output('datauristring'); //retorna base64(?)
    //  var splitres = doc_base64.split(',')[1];
      var doc_blob = doc.output('blob');

      var ficheiroCC = <File>doc_blob;

      //ReadBase64 devolve uma promessa - aqui 
      this.comprovativosService.readBase64(ficheiroCC).then(result => {
        var result_clean = result.split(',')[1]; //para retirar a parte inicial "data:application/pdf;base64"

        //Popular o objecto a enviar 
         this.objectCCsend = {
          lastModifiedDate: new Date(),
          expirationDate: new Date() + "", // A confirmar com a equipa de produto
          name: 'comprovativoCC',
          file: result_clean
        }

        resolve(this.objectCCsend);

      }, error => {
        //reject(null);
        console.log(error);
      });

      //resolve da Promessa da linha 131!
      resolve(this.objectCCsend);

    });//fecha a promessa da linha 131
  
  }
}
