// src/utils/license.ts

export interface LicenseInfo {
  key: string;
  licensee: string;
  quarryName?: string;
  location?: string;
  permisNumber?: string;
  dateOctroi?: string;
  type: 'demo' | 'standard' | 'enterprise' | 'guest' | 'free';
  expiryDate: string; // YYYY-MM-DD
  activatedAt: string; // YYYY-MM-DD
}

// A simple but effective hashing algorithm to generate stable hash codes
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Convert to absolute value hex string, padded to 8 chars
  return Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
}

const LICENSE_SALT = "QUARRY_CORE_SECURE_SALT_2026";

/**
 * Validates a license key against the licensee name and current date
 */
export function validateLicenseKey(
  key: string, 
  licensee: string, 
  quarryName: string = '', 
  location: string = '', 
  permisNumber: string = '', 
  dateOctroi: string = ''
): { isValid: boolean; info?: Omit<LicenseInfo, 'activatedAt'>; error?: string } {
  if (!key) {
    return { isValid: false, error: "La clé de licence est requise." };
  }
  if (!licensee || licensee.trim().length < 2) {
    return { isValid: false, error: "Un nom de titulaire valide (min. 2 caractères) est requis." };
  }
  
  const cleanKey = key.trim().toUpperCase();
  const cleanLicensee = licensee.trim().toUpperCase();
  
  // Master key bypass for testing/demos
  if (cleanKey === 'QCRY-DEMO-KEYS-WORK-FINE' && cleanLicensee === 'DEMO') {
    return {
      isValid: true,
      info: {
        key: cleanKey,
        licensee: "Utilisateur Démo",
        quarryName: "Carrière Démo",
        location: "Alger, Algérie",
        permisNumber: "001-DEMO/2026",
        dateOctroi: "2026-01-01",
        type: 'demo',
        expiryDate: '2026-12-31'
      }
    };
  }
  
  // Format validation
  const parts = cleanKey.split('-');
  if (parts.length !== 5 || parts[0] !== 'QCRY') {
    return { isValid: false, error: "Format de clé invalide. Format attendu : QCRY-XXXX-XXXX-XXXX-XXXX" };
  }
  
  const [_, typeCodeWithX, block3, block4, checksum] = parts;
  if (typeCodeWithX.length !== 4 || !typeCodeWithX.endsWith('X')) {
    return { isValid: false, error: "Clé de licence invalide (code type incorrect)." };
  }
  
  const typeCode = typeCodeWithX.substring(0, 3);
  
  // Verify checksum
  const baseKey = `QCRY-${typeCodeWithX}-${block3}-${block4}`;
  const expectedChecksum = simpleHash(baseKey + LICENSE_SALT).substring(0, 4);
  if (checksum !== expectedChecksum) {
    return { isValid: false, error: "La clé est corrompue ou invalide (checksum incorrect)." };
  }
  
  // 1. Extract Expiry Date
  if (block3.length !== 4 || block4.length !== 4) {
    return { isValid: false, error: "Clé de licence invalide (blocs de date incorrects)." };
  }
  
  const yy = block3.substring(0, 2);
  const mm = block3.substring(2, 4);
  const dd = block4.substring(0, 2);
  
  const year = parseInt(`20${yy}`, 10);
  const month = parseInt(mm, 10);
  const day = parseInt(dd, 10);
  
  if (isNaN(year) || isNaN(month) || isNaN(day) || month < 1 || month > 12 || day < 1 || day > 31) {
    return { isValid: false, error: "Clé de licence corrompue (données de date invalides)." };
  }
  
  const expiryDate = `20${yy}-${mm}-${dd}`;
  
  // Verify Type mapping
  let type: 'demo' | 'standard' | 'enterprise';
  if (typeCode === 'DEM') type = 'demo';
  else if (typeCode === 'STA') type = 'standard';
  else if (typeCode === 'ENT') type = 'enterprise';
  else return { isValid: false, error: "Type de licence inconnu dans la clé." };
  
  // 2. Verify Hashing signature
  const rawData = `${cleanLicensee}|${quarryName.trim().toUpperCase()}|${permisNumber.trim().toUpperCase()}|${dateOctroi.trim()}|${location.trim().toUpperCase()}|${typeCode}|${expiryDate}|${LICENSE_SALT}`;
  const fullHash = simpleHash(rawData);
  const expectedHashPart = fullHash.substring(0, 2);
  const keyHashPart = block4.substring(2, 4);
  
  if (expectedHashPart !== keyHashPart) {
    return { isValid: false, error: "Cette clé ne correspond pas aux informations de la carrière saisies (Nom, Localisation ou Permis)." };
  }
  
  // 3. Check expiration
  const todayStr = new Date().toISOString().split('T')[0];
  if (expiryDate < todayStr) {
    return { isValid: false, error: `La licence a expiré le ${expiryDate}.` };
  }
  
  return {
    isValid: true,
    info: {
      key: cleanKey,
      licensee: licensee.trim(),
      quarryName: quarryName.trim(),
      location: location.trim(),
      permisNumber: permisNumber.trim(),
      dateOctroi: dateOctroi.trim(),
      type,
      expiryDate
    }
  };
}

/**
 * Generates a valid license key with embedded date and signature
 */
export function generateLicenseKeyWithDate(
  licensee: string, 
  type: 'demo' | 'standard' | 'enterprise', 
  expiryDate: string,
  quarryName: string = '',
  location: string = '',
  permisNumber: string = '',
  dateOctroi: string = ''
): string {
  const cleanLicensee = licensee.trim().toUpperCase();
  const typeCode = type.substring(0, 3).toUpperCase(); // DEM, STA, ENT
  
  const dateParts = expiryDate.split('-');
  if (dateParts.length !== 3) {
    throw new Error("Format de date invalide. Attendu: YYYY-MM-DD");
  }
  const yy = dateParts[0].substring(2, 4);
  const mm = dateParts[1];
  const dd = dateParts[2];
  
  const block3 = `${yy}${mm}`; // YYMM
  
  const rawData = `${cleanLicensee}|${quarryName.trim().toUpperCase()}|${permisNumber.trim().toUpperCase()}|${dateOctroi.trim()}|${location.trim().toUpperCase()}|${typeCode}|${expiryDate}|${LICENSE_SALT}`;
  const hash = simpleHash(rawData);
  
  const block4 = `${dd}${hash.substring(0, 2)}`; // DD + 2 chars of hash
  
  const baseKey = `QCRY-${typeCode}X-${block3}-${block4}`;
  const checksum = simpleHash(baseKey + LICENSE_SALT).substring(0, 4);
  
  return `${baseKey}-${checksum}`;
}
