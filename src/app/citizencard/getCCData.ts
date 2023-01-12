import { addresstranformed } from './addresstranformed.interface';

// Cartão de Cidadão
export function GetCCData(): any {
  var elName = (<HTMLInputElement>document.getElementById("CCDivNome"));
  var elCCNumber = (<HTMLInputElement>document.getElementById("CCDivID"));
  var elNif = (<HTMLInputElement>document.getElementById("CCDivNIF"));
  var elBirthDate = (<HTMLInputElement>document.getElementById("CCDivDN"));
  var elAddress = (<HTMLInputElement>document.getElementById("CCDivMr"));
  var elPostalCode = (<HTMLInputElement>document.getElementById("CCDivPostalCode"));
  var elCanSign = (<HTMLInputElement>document.getElementById("CCCanSign"));

  // ******* Hidden Fields *********

  var elNotes = (<HTMLInputElement>document.getElementById("CCDivNotes"));
  var elNationality = (<HTMLInputElement>document.getElementById("CCDivNationality"));
  var elGender = (<HTMLInputElement>document.getElementById("CCDivGender"));
  var elHeight = (<HTMLInputElement>document.getElementById("CCDivHeight"));
  var elEmissoneDate = (<HTMLInputElement>document.getElementById("CCDivEmissonDate"));
  var elExpireDate = (<HTMLInputElement>document.getElementById("CCDivExpireDate"));
  var elFatherName = (<HTMLInputElement>document.getElementById("CCDivFatherName"));
  var elMotherName = (<HTMLInputElement>document.getElementById("CCDivMotherName"));
  var elSSNumber = (<HTMLInputElement>document.getElementById("CCDivSSNumber"));
  var elSNS = (<HTMLInputElement>document.getElementById("CCDivSNSNumber"));
  var elEmissionLocal = (<HTMLInputElement>document.getElementById("CCDivEmissonLocal"));
  var photo = (<HTMLInputElement>document.getElementById("CCDivPhoto"));
  var country = (<HTMLInputElement>document.getElementById("CCDivCountry"));


  if ((elName != null && elName.innerText != "") &&
    (elCCNumber != null && elCCNumber.innerText != "") &&
    (elNif != null && elNif.innerText != "") &&
    (elBirthDate != null && elBirthDate.innerText != "")) {
    var ccID = "";
    ccID = elCCNumber.innerText;
    this.CCID.Name = elName.innerText;
    this.CCID.CardNumber = ccID; //elCCNumber.innerText;
    //this.CCID.CardNumberPAN = ccID.substring(9);
    this.CCID.NIF = elNif.innerText;
    this.CCID.Nationality = null; // this.RefDataService.CountriesCCCodes.filter(x => x.ThreeLetterCode == elNationality.innerText)[0].TwoLetterCode;
    this.CCID.Sex = elGender.innerText;
    this.CCID.Height = elHeight.innerText;

    this.CCID.NameFather = elFatherName.innerText;
    this.CCID.NameMother = elMotherName.innerText;
    this.CCID.NSS = elSSNumber.innerText;
    this.CCID.SNS = elSNS.innerText;
    this.CCID.CanSign = elCanSign.innerText;
    this.CCID.Notes = elNotes.innerText;

    var deliverydate = elEmissoneDate.innerText.split(' ');
    var BirthDate = elBirthDate.innerText.split(' ');
    var Expired = elExpireDate.innerText.split(' ');

    this.CCID.BirthDate = new Date(BirthDate[2] + "/" + BirthDate[1] + "/" + BirthDate[0]);
    this.CCID.ExpiryDate = new Date(Expired[2] + "/" + Expired[1] + "/" + Expired[0]);
    this.CCID.DeliveryDate = new Date(deliverydate[2] + "/" + deliverydate[1] + "/" + deliverydate[0]);

    if (elAddress != null && elAddress.innerText != "" && elAddress.innerText != "X" && elAddress.innerText.length > 2 && elAddress.innerText.substring(0, 2) != "X ") {
      this.CCID.FullAddress = elAddress.innerText + " " + elPostalCode.innerText;
      const ccmorada: addresstranformed = {

        address1: "",
        address2: "",
        address3: "",
        Zipcode: "",
        Locality: "",
      };

      this.CCID.Address1 = ccmorada.address1;
      this.CCID.Address2 = ccmorada.address2;
      this.CCID.Address3 = ccmorada.address3;
      this.CCID.ZipCode = ccmorada.Zipcode;
      this.CCID.Locality = ccmorada.Locality;
      this.CCID.CountryCC = country.innerText;
    }
    this.CCID.Localemission = elEmissionLocal.innerText;
    this.CCID.Photo = photo.innerText;
    this.CCID.DocumentType = "1001";
  }
}
