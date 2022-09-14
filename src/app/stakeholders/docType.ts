export interface docType {
  code: string,
  description: string;
}

export const docTypeListE: docType[] = [
  {"code":"0502","description":"Número de Identificação de Pessoa Colectiva"},
  {"code":"1010","description":"Nº de Cliente"}
]

export const docTypeListP: docType[] = [
  {"code":"0101","description":"Bilhete de Identidade Nacional"},
  {"code":"1001","description":"Cartão do Cidadão"},
  {"code":"0501","description":"Número de Identificação Fiscal"},
  {"code":"1010","description":"Nº de Cliente"},
  {"code":"0302","description":"Passaporte"}
]