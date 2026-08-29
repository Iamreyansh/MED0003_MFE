import type { CatalogueCommand } from '@medmate/catalogue-contract';

export type MappingDrawer =
  | { kind: 'create'; medicineId: string }
  | { kind: 'edit'; mappingId: string }
  | null;

export function buildMappingCommand(
  drawer: MappingDrawer,
  values: {
    medicineId: string;
    pharmacyPrice: number;
    stockQuantity: number;
    visible: boolean;
  },
): CatalogueCommand | null {
  if (!drawer) {
    return null;
  }
  if (drawer.kind === 'create') {
    const masterMedicineId = values.medicineId.trim();
    if (!masterMedicineId) {
      return null;
    }
    return {
      screen: 'mapping',
      action: 'create',
      values: {
        master_medicine_id: masterMedicineId,
        pharmacy_price: values.pharmacyPrice,
        stock_quantity: values.stockQuantity,
      },
    };
  }
  return {
    screen: 'mapping',
    action: 'update',
    values: {
      mapping_id: drawer.mappingId,
      pharmacy_price: values.pharmacyPrice,
      stock_quantity: values.stockQuantity,
      is_visible: values.visible,
    },
  };
}
