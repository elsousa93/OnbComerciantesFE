export interface ICommercialOffer {
  id: number;
  solutionType: string;
  configID: string;
  numberOfTerminals: number;
  brands: {
    fieldName: string,
    selected: boolean,
    editable: boolean
  }[],
  packages: {
    fieldName: string,
    selected: boolean,
    editable: boolean
  }[],
  additionalInfo: {
    fieldName: string,
    selected: boolean,
    editable: boolean
  }[],
  terminalType: string;
  communicationType: string;
};
