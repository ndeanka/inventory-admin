export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  quantityOnHand: number;
  unitPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInventoryItem {
  sku: string;
  name: string;
  quantityOnHand: number;
  unitPrice: number;
}

/** PUT /api/v1/items/{id}. SKU is stored uppercase by the API. */
export interface UpdateInventoryItem {
  sku: string;
  name: string;
  quantityOnHand: number;
  unitPrice: number;
}
