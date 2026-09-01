import { EquipmentItem } from '../types';

/**
 * Generates the canonical URL for an equipment's digital passport.
 * This URL can be scanned with any smartphone camera or QR scanner.
 */
export function getEquipmentPassportUrl(equipment: EquipmentItem | { code: string; id?: string }): string {
  const origin = typeof window !== 'undefined' && window.location?.origin ? window.location.origin : 'https://hospital-asset-system.local';
  const pathname = typeof window !== 'undefined' && window.location?.pathname ? window.location.pathname : '/';
  
  const code = equipment.code || equipment.id || 'UNKNOWN';
  return `${origin}${pathname}?equipmentCode=${encodeURIComponent(code)}#passport`;
}

/**
 * Returns a compact data payload for offline or NFC / barcode tags.
 */
export function getEquipmentTagPayload(equipment: EquipmentItem): string {
  return JSON.stringify({
    code: equipment.code,
    name: equipment.faName,
    brand: equipment.brand,
    dept: equipment.department,
    operator: equipment.assignedOperator || 'N/A',
    sn: equipment.serialNumber,
    url: getEquipmentPassportUrl(equipment),
  });
}
