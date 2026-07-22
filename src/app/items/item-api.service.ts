import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CreateInventoryItem, InventoryItem } from './item.model';

@Injectable({ providedIn: 'root' })
export class ItemApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.inventoryApiBaseUrl}/api/v1/items`;

  list(): Observable<InventoryItem[]> {
    return this.http.get<InventoryItem[]>(this.base);
  }

  create(payload: CreateInventoryItem): Observable<InventoryItem> {
    return this.http.post<InventoryItem>(this.base, payload);
  }
}
