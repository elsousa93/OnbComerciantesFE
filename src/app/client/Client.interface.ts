
export interface Client {
  id: Number,
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
  caeSecundário1: String,
  caeSecundário2: String,
  ramoPrincipal: String,
  ramoSecundario1: String,
  ramoSecundario2: String,
  ramoSecundario3: String,

  dataConst: String,
  paisSedeSocial: String,
  localidadeSedeSocial: String,
  cpSedeSocial: String,
  moradaSedeSocial: String,


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
 
