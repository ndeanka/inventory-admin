import { FormControl } from '@angular/forms';
import { wholeNumber } from './item.validators';

describe('wholeNumber', () => {
  const validate = wholeNumber();

  it('accepts an integer quantity', () => {
    expect(validate(new FormControl(4))).toBeNull();
  });

  it('rejects a decimal quantity', () => {
    expect(validate(new FormControl(1.5))).toEqual({ wholeNumber: true });
  });
});
