import { AbstractControl, ValidationErrors } from "@angular/forms";

 //Custom Validators

export function validUrl(control: AbstractControl) : ValidationErrors | null {  

  let url = control.get("url").value;
  
  if(url!=''){
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    console.log(re.test(String(url).toLowerCase()))
    this.urlTest = re.test(String(url).toLowerCase())
    if (this.urlTest != true) {
      return  {invalidUrl : true};
    }

  }

}
 
