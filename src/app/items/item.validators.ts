import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Matches inventory-api, which stores quantityOnHand as an int. */
export function wholeNumber(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value === null || value === undefined || value === '') {
      return null;
    }
    return Number.isInteger(Number(value)) ? null : { wholeNumber: true };
  };
}
