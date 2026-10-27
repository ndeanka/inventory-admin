import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ItemsPageComponent } from './items-page.component';

describe('ItemsPageComponent', () => {
  let fixture: ComponentFixture<ItemsPageComponent>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemsPageComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(ItemsPageComponent);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('loads the catalog when the page starts', () => {
    fixture.detectChanges();
    const request = http.expectOne('http://localhost:8080/api/v1/items');
    request.flush([]);
    fixture.detectChanges();

    expect(fixture.componentInstance.store.items()).toEqual([]);
    expect(fixture.nativeElement.textContent).toContain('No items yet');
  });

  it('does not create an item when the form is empty', () => {
    fixture.detectChanges();
    http.expectOne('http://localhost:8080/api/v1/items').flush([]);

    fixture.componentInstance.submit();
    http.expectNone('http://localhost:8080/api/v1/items');
    expect(fixture.componentInstance.form.touched).toBe(true);
  });

  it('keeps entered values when create fails', () => {
    fixture.detectChanges();
    http.expectOne('http://localhost:8080/api/v1/items').flush([]);

    fixture.componentInstance.form.setValue({
      sku: 'SKU-9',
      name: 'Cable',
      quantityOnHand: 2,
      unitPrice: 4,
    });
    fixture.componentInstance.submit();

    const request = http.expectOne('http://localhost:8080/api/v1/items');
    expect(request.request.method).toBe('POST');
    request.flush({ message: 'SKU already exists' }, { status: 409, statusText: 'Conflict' });

    expect(fixture.componentInstance.form.controls.sku.value).toBe('SKU-9');
    expect(fixture.componentInstance.store.error()).toBe('SKU already exists');
  });
});
