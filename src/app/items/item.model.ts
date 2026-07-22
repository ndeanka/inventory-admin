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
