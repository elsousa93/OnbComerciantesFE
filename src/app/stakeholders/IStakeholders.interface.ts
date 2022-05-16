
    export interface IStakeholders    {
       stakeholderType: string,
       stakeholderNif: number,
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
       dateDocumentID :number,
       primeiranacionalidade: string,

        // identificacao de intervenientes part 2
       roleStakeholder: string,
       streetAdressStakeholder: string,
       postCodeAdressStakeholder: string,
       areaBillingAdressStakeholder: string,
       countryBillingAdressStakeholder: string,

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
