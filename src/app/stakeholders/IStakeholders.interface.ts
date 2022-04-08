
    export interface IStakeholders    {

      contract: Number,
      associatedToContract: Boolean,
      flagSignedContract: Boolean,
      clientNr: Number,             //ID
      clientName: String,
      nif: Number,
      elegivel: Boolean
      stakeholderType: String,
      documentType: String,
      electronicCollectFlag: Boolean,

      /*De futuro os proximos serao lidos do CC*/
      DocumentCountry: String,
      stakeholderName: String,
      stakeholderIdNr: Number,
      stakeholderNIF: String,
      stakeholderBirthdate: Number,
      stakeholderAddress: String,
      stakeholderPostcode: Number
  }
