
export interface Client {
  id: Number,
  clientTypology: String,
  newClientNr: Number,
  docType: String,
  docNr: String,
  flagAutCol: Boolean,
  crcCode: String,
  socialDenomination: String,

  natJuridicaN1: String,
  natJuridicaNIFNIPC: Number,
  natJuridicaN2: String,
  categoriaComerciante: String,
  categoriaNIPC: Number,
  caePrincipal: String,
  caeSecundario1: String,
  caeSecundario2: String,
  caeSecundario3: String;
  ramoPrincipal: String,
  ramoSecundario1: String,
  ramoSecundario2: String,
  ramoSecundario3: String,

  dataConst: String,
  paisSedeSocial: String,
  localidadeSedeSocial: String,
  cpSedeSocial: String,
  moradaSedeSocial: String,

  franchiseName: String;
  groupNIPC: Number,
  expectableAnualInvoicing: String,
  services: String,
  transactionsAverage: Number,
  preferenceDocuments: String,
  preferenceContacts: String,
  destinationCountries: String,


  nameClient: String,
  callingCodeLandClient: String,
  phoneLandClient: Number,
  callingCodeMobileClient: String,
  mobilePhoneClient: Number,
  emailClient: String,
  callingCodeFaxClient: String,
  faxClient: String,
  billingEmail: String

}
 
