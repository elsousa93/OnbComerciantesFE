
    export interface IStakeholders    {
       stakeholderType: string,
       nif: number,
       clientName: string,
       clientNr: number,
       electronicCollectFlag: boolean,
       documentType: string,
       documentCountry: string,

       flagAssociado: boolean,
       flagProcurador: boolean,
       flagRecolhaEletronica: boolean,
       tipoDocumento: string,
       paisDocumentoID: string,
       nrDocumentoID: number,
       primeiranacionalidade: string,
       dtValidadeID: number,
       paisNIFEstrangeiro: string,
       indicadorNIFPaisEstrangeiro: string,
       nifEstrangeiro: number

       flagElectableStakeholder : boolean,
       flagValidStakeholder:boolean,
       callingCodeStakeholder: string,
       phoneStakeholder: number,
       emailStakeholder: string,
       hourContractStart: number,
       hourContractEnd: number,
       schoolingStakeholder: string,
       maritalStatusStakeholder: string,
       finEstateStakeholder: number,
       monthlyEarnsStakeholder: number
  }
