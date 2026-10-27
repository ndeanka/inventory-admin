import { apiErrorMessage } from './api-error';

describe('apiErrorMessage', () => {
  it('prefers field details from inventory-api', () => {
    expect(
      apiErrorMessage(
        {
          status: 400,
          error: { message: 'Validation failed', details: ['sku: must not be blank'] },
        },
        'fallback'
      )
    ).toBe('sku: must not be blank');
  });

  it('uses the API message when there are no details', () => {
    expect(apiErrorMessage({ error: { message: 'SKU already exists: SKU-1' } }, 'fallback')).toBe(
      'SKU already exists: SKU-1'
    );
  });

  it('uses the fallback when the body is empty', () => {
    expect(apiErrorMessage({ status: 0 }, 'network')).toBe('network');
  });
});
