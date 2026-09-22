export const formatCurrency = (amount: number, currency: string = '€'): string => {
  return `${amount.toLocaleString('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })} ${currency}`;
};

export const formatPercent = (percent: number): string => {
  return `${percent.toLocaleString('fr-FR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  })}%`;
};

export const formatTonnage = (tons: number): string => {
  return `${tons.toLocaleString('fr-FR')} T`;
};

export const formatCostPerTon = (cost: number, currency: string = '€'): string => {
  return `${cost.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 3
  })} ${currency}/T`;
};

export const formatVolume = (m3: number): string => {
  return `${Math.round(m3).toLocaleString('fr-FR')} m³`;
};

export const formatCostPerM3 = (cost: number, currency: string = '€'): string => {
  return `${cost.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 3
  })} ${currency}/m³`;
};

export const formatCostPerUnit = (
  costPerTon: number,
  densite: number,
  unite: 'T' | 'm3',
  currency: string = '€'
): { primary: string; secondary: string; combined: string } => {
  const dens = densite || 1.6;
  const costPerM3 = costPerTon * dens;

  const tStr = formatCostPerTon(costPerTon, currency);
  const m3Str = formatCostPerM3(costPerM3, currency);

  if (unite === 'm3') {
    return {
      primary: m3Str,
      secondary: tStr,
      combined: `${m3Str} (${tStr})`
    };
  } else {
    return {
      primary: tStr,
      secondary: m3Str,
      combined: `${tStr} (${m3Str})`
    };
  }
};
