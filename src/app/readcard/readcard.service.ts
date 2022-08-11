import { Injectable, ViewChild , ElementRef } from '@angular/core';
import { dataCC } from '../client/dataCC.interface';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { DatePipe } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ReadcardService {

  constructor() { }


formatPDF(ccArrayData: Array<string>) {

  const doc = new jsPDF('p', 'pt', 'a4');

  //pt-PT importado em app.module
  var date = new Date();
  var pipe = new DatePipe('pt-PT');
  var dateHelper = pipe.transform(Date.now(), 'dd/MM/yyyy, h:mm:ss a zzzz');

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

  //Cor Unicre: [30, 102, 176]
  //Cor background 190, 217, 243
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
            { content: ccArrayData[14]+ " " +  ccArrayData[15]+ " " +  ccArrayData[16], colSpan: 4, styles: { valign: "middle" } }
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

  doc.save("digitalCC_NIF" + ccArrayData[10] + ".pdf");

  //Associar à submission /api/submission/{id}/document  POST  Upload a new document (?)
  //Codficar 


  }
}
