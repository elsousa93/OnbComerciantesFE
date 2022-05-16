
    export interface IPep    {
      id: number;
      clientNr: number;

      pep12months: boolean;        //É, ou foi nos últimos 12 meses, Pessoa Politicamente Exposta (PEP)?:
        pepType: string;
        pepCountry: string;
        pepSinceWhen: string;

      pepFamiliarOf: boolean;        //é familiar de uma PEP
        pepFamilyRelation: string;

      pepRelations: boolean;       // Mantem relações de natureza societária ou comercial com uma PEP
        pepTypeOfRelation: string;

      pepPoliticalPublicJobs: boolean; // É, ou foi nos últimos 12 meses, titular de outros Cargos Políticos ou Públicos em território nacional?
      pepPoliticalPublicJobDesignation: boolean;

      relatedPep_type: string; //Identificação do PEP relacionado
      relatedPep_country: string;
      relatedPep_sinceWhen: string; //beginning of relationship
      relatedPep_nif: string;
      relatedPep_name: string;
      relatedPep_idNumber: string;
      relatedPep_idDocumentType: string;
      relatedPep_idDocumentValidity: string;
      relatedPep_idDocumentCountry: string;
    
      relatedPep_address: string;
      relatedPep_addressLocation: string;
      relatedPep_postalCode: string;
      relatedPep_addressCountry: string;
      

  }
