//COMO CORRER AS APIS
Ordem neste documento: 1. Submission; 2. Stakeholder; 
------------------------------------------------------------------------------------------------------------------------
SUBMISSION
------------------------------------------------------------------------------------------------------------------------
GET >> /api/submission/{id}
------------------------------------------------------------------------------------------------------------------------
id da submissão (a 06/07/2022)

{id} = adadf30c-bba7-4d7d-b87c-1d076c62e6bc

Request URL = http://localhost:12000/AcquiringAPI/api/submission/adadf30c-bba7-4d7d-b87c-1d076c62e6bc
Response Body - Code: 200
{
  "id": "adadf30c-bba7-4d7d-b87c-1d076c62e6bc",
  "state": "Success",
  "bank": "0800",
  "merchant": {
    "id": "22187900000251",
    "href": "/AcquiringAPI/api/submission/adadf30c-bba7-4d7d-b87c-1d076c62e6bc/merchant"
  },
  "stakeholders": [
    {
      "id": "22187900000271",
      "href": "/AcquiringAPI/api/submission/adadf30c-bba7-4d7d-b87c-1d076c62e6bc/stakeholder?sid=22187900000271"
    }
  ],
  "documents": [],
  "submissionType": "DigitalFirstHalf",
  "processNumber": "v86JwkDK1ki/MNemR6dBPg==",
  "processKind": "MerchantOnboarding",
  "processType": "Standard",
  "isClientAwaiting": true,
  "submissionUser": {
    "user": "joao.silvestre",
    "employer": "SIBS"
  },
  "isComplete": true
}

------------------------------------------------------------------------------------------------------------------------
PUT >> /api/submission/{id}
------------------------------------------------------------------------------------------------------------------------


------------------------------------------------------------------------------------------------------------------------
GET >> /api/submission/
------------------------------------------------------------------------------------------------------------------------

ProcessNumber = adadf30c-bba7-4d7d-b87c-1d076c62e6bc

Request URL = http://localhost:12000/AcquiringAPI/api/submission?ProcessNumber=adadf30c-bba7-4d7d-b87c-1d076c62e6bc

Code 200
Response body = []

------------------------------------------------------------------------------------------------------------------------
POST >> /api/submission/
------------------------------------------------------------------------------------------------------------------------

Request URL: http://localhost:12000/AcquiringAPI/api/submission
(18/07/2022)

BODY:

{
  "submissionType": "DigitalFirstHalf",
  "processKind": "MerchantOnboarding",
  "processType": "Standard",
  "isClientAwaiting": true,
  "submissionUser": {
    "user": "joao.silvestre",
    "employer": "SIBS"
  },
  "isComplete": true,
  "bank": "0800",
  "merchant": {
    "fiscalId": "585597928",
    "companyName": "SILVESTRE LIMITADA",
    "commercialName": "CAFE CENTRAL",
    "shortName": "SILVESTRE LDA",
    "headquartersAddress": {
      "address": "Rua da Azoia 4",
      "postalCode": "2625-236",
      "postalArea": "Povoa de Santa Iria",
      "locality": "string",
      "country": "PT"
    },
    "merchantType": "Corporate",
    "legalNature": "35",
    "crc": {
      "code": "0000-0000-0001",
      "validUntil": "2023-06-29T17:52:08.336Z"
    },
    "shareCapital": {
      "capital": 50000.20,
      "date": "2028-06-29T17:52:08.336Z"
    },
    "byLaws": "O Joao pode assinar tudo, like a boss",
    "mainEconomicActivity": "90010",
    "otherEconomicActivities": ["055111"],
    "mainOfficeAddress": {
      "address": "Rua da Azoia 4",
      "postalCode": "2625-236",
      "postalArea": "Povoa de Santa Iria",
      "locality": "string",
      "country": "PT"
    },
    "establishmentDate": "2020-03-01T17:52:08.336Z",
    "knowYourSales": {
      "estimatedAnualRevenue": 1000000,
      "averageTransactions": 30000,
      "servicesOrProductsSold": ["Cafe"],
      "servicesOrProductsDestinations": ["PT"]
    },
    "bankInformation": {
      "bank": "0033",
      "branch": "0000",
      "iban": "PT00333506518874499677629",
      "accountOpenedAt": "2020-06-29T17:52:08.336Z"
    },
    "contacts": {
      "email": "joao@silvestre.pt",
      "phone1": {
        "countryCode": "+351",
        "phoneNumber": "919654422"
      }
    },
    "documentationDeliveryMethod": "MAIL",
    "billingEmail": "joao@silvestre.pt"
  },
  "stakeholders": [
    {
      "fiscalId": "232012610",
      "identificationDocument": {
        "type": "0020",
        "number": "13713441",
        "country": "PT",
        "expirationDate": "2023-06-29T17:52:08.337Z"
      },
      "fullName": "Joao Paulo Ferreira Silvestre",
      "contactName": "Joao contacto Silvestre",
      "shortName": "Joao Silvestre",
      "address": {
        "address": "Rua da Azoia 4",
        "postalCode": "2625-236",
        "postalArea": "Povoa de Santa Iria",
        "country": "PT"
      },
      "isProxy": false,
      "fiscalAddress": {
        "address": "Rua da Azoia 4",
        "postalCode": "2625-236",
        "postalArea": "Povoa de Santa Iria",
        "country": "PT"
      },
      "phone": {
        "countryCode": "+351",
        "phoneNumber": "919654422"
      },
      "email": "joao@silvestre.pt",
      "birthDate": "1990-08-11"
    }
  ]
}
-----------------------//---------------------------

Resposta do Servidor: Retorna um ID único.
Code 201: Undocumented // Mas funcional

{
  "id": "1cf74116-472e-4fcc-a570-3ee08c08eb2e",
  "state": "Ready",
  "bank": "0800",
  "merchant": {
    "id": "22199900000051",
    "merchantType": "Corporate",
    "commercialName": "CAFE CENTRAL",
    "legalNature": "35",
    "legalNature2": null,
    "crc": {
      "code": "0000-0000-0001",
      "validUntil": "2023-06-29T17:52:08.336Z"
    },
    "shareCapital": {
      "capital": 50000.2,
      "date": "2028-06-29T17:52:08.336Z"
    },
    "byLaws": "O Joao pode assinar tudo, like a boss",
    "mainEconomicActivity": "90010",
    "otherEconomicActivities": [
      "055111"
    ],
    "establishmentDate": "2020-03-01T17:52:08.336Z",
    "businessGroup": null,
    "knowYourSales": {
      "estimatedAnualRevenue": 1000000,
      "averageTransactions": 30000,
      "servicesOrProductsSold": [
        "Cafe"
      ],
      "servicesOrProductsDestinations": [
        "PT"
      ]
    },
    "bankInformation": {
      "bank": "0033",
      "iban": "PT00333506518874499677629"
    },
    "contacts": {
      "email": "joao@silvestre.pt",
      "phone1": {
        "countryCode": "+351",
        "phoneNumber": "919654422"
      },
      "phone2": null,
      "fax": null
    },
    "documentationDeliveryMethod": "Mail",
    "billingEmail": "joao@silvestre.pt",
    "clientId": null,
    "fiscalId": "585597928",
    "legalName": null,
    "shortName": "SILVESTRE LDA",
    "headquartersAddress": {
      "address": "Rua da Azoia 4",
      "postalCode": "2625-236",
      "postalArea": "Povoa de Santa Iria",
      "country": "PT"
    }
  },
  "stakeholders": [
    {
      "id": "22199900000071",
      "stakeholderId": null,
      "isProxy": false,
      "phone": {
        "countryCode": "+351",
        "phoneNumber": "919654422"
      },
      "email": "joao@silvestre.pt",
      "birthDate": "1990-08-11T00:00:00",
      "pep": null,
      "fiscalId": "232012610",
      "identificationDocument": {
        "type": "0020",
        "number": "13713441",
        "country": "PT",
        "expirationDate": "2023-06-29T17:52:08.337Z"
      },
      "fullName": "Joao Paulo Ferreira Silvestre",
      "contactName": "Joao contacto Silvestre",
      "shortName": "Joao Silvestre",
      "fiscalAddress": {
        "address": "Rua da Azoia 4",
        "postalCode": "2625-236",
        "postalArea": "Povoa de Santa Iria",
        "country": "PT"
      }
    }
  ],
  "documents": [],
  "submissionType": "DigitalFirstHalf",
  "processNumber": "ADbEmFA+7UOC9i8HIWZGzg==",
  "processKind": "MerchantOnboarding",
  "processType": "Standard",
  "isClientAwaiting": true,
  "submissionUser": {
    "user": "joao.silvestre",
    "employer": "SIBS"
  },
  "isComplete": true
}

------------------------------------------------------------------------------------------------------------------------
STAKEHOLDER
------------------------------------------------------------------------------------------------------------------------
Vamos usar a Submission feita acima para este exemplo.

------------------------------------------------------------------------------------------------------------------------
GET >> /api/submission/{id}/stakeholder
------------------------------------------------------------------------------------------------------------------------
id: 1cf74116-472e-4fcc-a570-3ee08c08eb2e

Request URL: http://localhost:12000/AcquiringAPI/api/submission/1cf74116-472e-4fcc-a570-3ee08c08eb2e/stakeholder

Server response:
Code 200
Response Body:

[
  {
    "id": "22199900000071",
    "stakeholderId": null,
    "isProxy": false,
    "phone": {
      "countryCode": "+351",
      "phoneNumber": "919654422"
    },
    "email": "joao@silvestre.pt",
    "birthDate": "1990-08-11T00:00:00+01:00",
    "pep": {
      "isPep": false,
      "hasFamilyRelationship": false,
      "familyRelationshipKind": null,
      "hasBusinessRelationship": false,
      "businessRelationshipKind": null,
      "relatedPep": null,
      "pepDetails": null
    },
    "fiscalId": "232012610",
    "identificationDocument": {
      "type": "0020",
      "number": "13713441",
      "country": "PT",
      "expirationDate": "2023-06-29T18:52:08.337+01:00"
    },
    "fullName": "Joao Paulo Ferreira Silvestre",
    "contactName": "Joao contacto Silvestre",
    "shortName": "Joao Silvestre",
    "fiscalAddress": {
      "address": "Rua da Azoia 4",
      "postalCode": "2625-236",
      "postalArea": "Povoa de Santa Iria",
      "country": "PT"
    }
  }
]

------------------------------------------------------------------------------------------------------------------------
POST >> /api/submisison/{id}/stakeholder
------------------------------------------------------------------------------------------------------------------------
Adiciona novo Stakeholder, Ana Sousa.

Body:
{
    "id": "22199900000071",
    "stakeholderId": null,
    "isProxy": false,
    "phone": {
      "countryCode": "+351",
      "phoneNumber": "933428176"
    },
    "email": "ana@sousa.pt",
    "birthDate": "1990-08-11T00:00:00+01:00",
    "pep": {
      "isPep": false,
      "hasFamilyRelationship": false,
      "familyRelationshipKind": null,
      "hasBusinessRelationship": false,
      "businessRelationshipKind": null,
      "relatedPep": null,
      "pepDetails": null
    },
    "fiscalId": "232012610",
    "identificationDocument": {
      "type": "0020",
      "number": "13713441",
      "country": "PT",
      "expirationDate": "2023-06-29T18:52:08.337+01:00"
    },
    "fullName": "Ana Teste Fernandes Sousa",
    "contactName": "Ana T Sousa",
    "shortName": "Ana T Sousa",
    "fiscalAddress": {
      "address": "Avenida dos Defensores de Chaves 20",
      "postalCode": "1000-120",
      "postalArea": "LISBOA",
      "country": "PT"
    }
  }


--------------------------------------//--------------------------------

ATENÇÃO: Não submeter como array [ ], mas sim só com { }.
>> Vamos verificar se fez upload, fazendo o GET anterior --> Ambos aparecem

--------------------------------------//--------------------------------

Há um erro a acontecer (não nesta função):
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "traceId": "00-d253b6edbd661c04bda16d61c517cbe3-1486de01cdeb670d-00",
  "errors": {
    "$": [
      "The JSON value could not be converted to SIBS.Acquiring.API.Models.Stakeholders.AddStakeholderViewModel. Path: $ | LineNumber: 0 | BytePositionInLine: 1."
    ],
   "addStakeholderViewModel": [
      "The addStakeholderViewModel field is required."
    ]

>> Suposto ignorar
-------//-----------



