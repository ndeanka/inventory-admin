import { Routes } from '@angular/router';
import { ItemsPageComponent } from './items/items-page.component';

export const routes: Routes = [
  { path: '', component: ItemsPageComponent },
  { path: '**', redirectTo: '' },
];
