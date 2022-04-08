export interface ICommercialOffer {
  id: number;
  solutionType: string;
  ConfigID: string;
  numberOfTerminals: number;
  CommePack: {
    Brands: {},
    Packages: {},
    AdditionalInfo: {}
  };
};
