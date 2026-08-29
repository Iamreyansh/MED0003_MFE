import { describe, expect, it } from 'vitest';
import { buildMappingCommand } from '../mapping-command';

describe('buildMappingCommand', () => {
  it('returns null without a drawer and builds create or update commands', () => {
    expect(
      buildMappingCommand(
        { kind: 'create', medicineId: '' },
        {
          medicineId: '   ',
          pharmacyPrice: 1,
          stockQuantity: 1,
          visible: true,
        },
      ),
    ).toBeNull();
    expect(
      buildMappingCommand(null, {
        medicineId: 'x',
        pharmacyPrice: 1,
        stockQuantity: 1,
        visible: true,
      }),
    ).toBeNull();
    expect(
      buildMappingCommand(
        { kind: 'create', medicineId: 'a' },
        {
          medicineId: '  mid  ',
          pharmacyPrice: 21,
          stockQuantity: 4,
          visible: false,
        },
      ),
    ).toEqual({
      screen: 'mapping',
      action: 'create',
      values: {
        master_medicine_id: 'mid',
        pharmacy_price: 21,
        stock_quantity: 4,
      },
    });
    expect(
      buildMappingCommand(
        { kind: 'edit', mappingId: 'map-1' },
        {
          medicineId: 'mid',
          pharmacyPrice: 20,
          stockQuantity: 3,
          visible: false,
        },
      ),
    ).toEqual({
      screen: 'mapping',
      action: 'update',
      values: {
        mapping_id: 'map-1',
        pharmacy_price: 20,
        stock_quantity: 3,
        is_visible: false,
      },
    });
  });
});
