
export interface docType {
  docTypeOption: string;
  docTypeCode: string;
}

export const docType: docType[] = [
  { docTypeOption: "Nº de Cliente", docTypeCode: '001' },
  { docTypeOption: "Número de Identificação de Pessoa Colectiva", docTypeCode: '002' }
]

export const docTypeENI: docType[] = [
  { docTypeOption: "Bilhete de Identidade Nacional", docTypeCode: '003' },
  { docTypeOption: "Cartão do Cidadão", docTypeCode: '004' },
  { docTypeOption: "Número de Identificação Fiscal", docTypeCode: '005' },
  { docTypeOption: "Nº de Cliente", docTypeCode: '006' },
  { docTypeOption: "Passaporte", docTypeCode: '007'},
]
