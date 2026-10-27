import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InventoryItem } from './item.model';
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

  it('shows the next page of the catalog', () => {
    fixture.detectChanges();
    http
      .expectOne('http://localhost:8080/api/v1/items')
      .flush([catalogItem('1', 'SKU-1'), catalogItem('2', 'SKU-2'), catalogItem('3', 'SKU-3')]);
    fixture.componentInstance.setPageSize(1);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('SKU-1');
    expect(fixture.nativeElement.textContent).not.toContain('SKU-2');

    const next = buttonNamed(fixture.nativeElement, 'Next');
    next.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Page 2 of 3');
    expect(fixture.nativeElement.textContent).toContain('SKU-2');
  });
});

function catalogItem(id: string, sku: string): InventoryItem {
  return {
    id,
    sku,
    name: sku,
    quantityOnHand: 1,
    unitPrice: 1,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };
}

function buttonNamed(root: HTMLElement, label: string): HTMLButtonElement {
  const match = Array.from(root.querySelectorAll('button')).find((button) =>
    button.textContent?.includes(label)
  );
  if (!match) {
    throw new Error(`Missing button: ${label}`);
  }
  return match;
}
