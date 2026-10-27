import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaginationComponent } from './pagination.component';

describe('PaginationComponent', () => {
  let fixture: ComponentFixture<PaginationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PaginationComponent);
    fixture.componentRef.setInput('page', 2);
    fixture.componentRef.setInput('pageSize', 10);
    fixture.componentRef.setInput('totalItems', 25);
    fixture.detectChanges();
  });

  it('shows the current range and page', () => {
    expect(fixture.nativeElement.textContent).toContain('11–20 of 25');
    expect(fixture.nativeElement.textContent).toContain('Page 2 of 3');
  });

  it('emits the previous page', () => {
    const pages: number[] = [];
    fixture.componentInstance.pageChange.subscribe((page) => pages.push(page));

    buttonNamed(fixture.nativeElement, 'Previous').click();

    expect(pages).toEqual([1]);
  });

  it('emits a new page size', () => {
    const sizes: number[] = [];
    fixture.componentInstance.pageSizeChange.subscribe((size) => sizes.push(size));

    const select: HTMLSelectElement = fixture.nativeElement.querySelector('select');
    select.value = '25';
    select.dispatchEvent(new Event('change'));

    expect(sizes).toEqual([25]);
  });
});

function buttonNamed(root: HTMLElement, label: string): HTMLButtonElement {
  const match = Array.from(root.querySelectorAll('button')).find((button) =>
    button.textContent?.includes(label)
  );
  if (!match) {
    throw new Error(`Missing button: ${label}`);
  }
  return match;
}
