
export interface docType {
  description: string;
  code: string;
}

export const docType: docType[] = [
  { description: "Nº de Cliente", code: '001' },
  { description: "Número de Identificação de Pessoa Colectiva", code: '0502' }
]

export const docTypeENI: docType[] = [
  { description: "Bilhete de Identidade Nacional", code: '003' },
  { description: "Cartão do Cidadão", code: '004' },
  { description: "Número de Identificação Fiscal", code: '0501' },
  { description: "Nº de Cliente", code: '006' },
  { description: "Passaporte", code: '007'},
]
