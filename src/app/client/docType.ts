
export interface docType {
  docTypeOption: string;
}

export const docType: docType[] = [
  { docTypeOption: "Nº de Cliente"},
  { docTypeOption: "Número de Identificação de Pessoa Colectiva"}  
]

export const docTypeENI: docType[] = [
  { docTypeOption:"Número do Cartão Cidadão"},
  { docTypeOption:"Outro..."},
]
