import { HttpClient } from '@angular/common/http';
import { Inject } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { ViewChild } from '@angular/core';
import { Configuration, configurationToken } from '../configuration';
import { IReadCard } from './IReadCard.interface';
import { ElementRef } from '@angular/core';
import { jsPDF } from "jspdf";
import { Input } from '@angular/core';
import autoTable from 'jspdf-autotable';
import { DatePipe } from '@angular/common';

declare var require: any;

@Component({
  selector: 'app-readcard',
  templateUrl: './readcard.component.html'
})
export class ReadcardComponent implements OnInit {

  @Input() ccArrayData = Array;

  private baseUrl: string;

  API_URL: string = '';
  readcard: IReadCard[] = [];

  constructor(public http: HttpClient, @Inject(configurationToken) private configuration: Configuration) {
    this.baseUrl = configuration.baseUrl;
    this.API_URL = this.baseUrl;
  }

  //Read from table
  @ViewChild('cardContent', { static: false }) readCCTableContent!: ElementRef

  ngOnInit(): void {
  }

  transfPDF() {
    //pt-PT importado em app.module
    var date = new Date();
    var pipe = new DatePipe('pt-PT');
    var dateHelper = pipe.transform(Date.now(), 'dd/MM/yyyy, h:mm:ss a zzzz');

    // Default export is a4 paper, portrait, using millimeters for units
    const doc = new jsPDF();

    var ccArrayData: any[] = [
      "Ana Maria Almeida Sousa",
      "13788590",
      "17/09/1998",
      "Portuguesa",
      "Avenida 5 Outubro",
      "1050-053",
      "PT"
    ];
    doc.setFontSize(10);
    doc.text("Ficheiro gerado à data: " + dateHelper, 20, 280)


    var config = {
      autoSize: true,
      margin: { right: 305 },
    };
    var config2 = {
      autoSize: true,
      margin: { left: 305 },
    };

    autoTable(doc,
      {
        startY: 40,
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
              colSpan: 1,
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
              colSpan: 1,
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
              colSpan: 1,
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
              colSpan: 1,
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
              colSpan: 1,
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
              colSpan: 1,
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
              colSpan: 1,
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
              colSpan: 1,
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
              colSpan: 1,
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
              colSpan: 1,
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
              colSpan: 1,
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
              colSpan: 1,
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
              colSpan: 1,
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
              colSpan: 1,
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
              colSpan: 1,
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
          0: { cellWidth: 40 }
        },
        bodyStyles: {
          lineWidth: 0.2,
          lineColor: [30, 102, 176]
        },
        theme: "plain"
      });
    doc.save("a4.pdf");
  }
}