// 货币工具函数与汇率配置

export type CurrencyCode = 'MZN' | 'USD' | 'CNY';

export interface CurrencyInfo {
  code: CurrencyCode;
  name: string;
  symbol: string;
  locale: string;
  flag: string;
}

/** 货币信息映射 */
export const CURRENCY_INFO: Record<CurrencyCode, CurrencyInfo> = {
  MZN: { code: 'MZN', name: 'Metical', symbol: 'Mt', locale: 'pt-MZ', flag: '🇲🇿' },
  USD: { code: 'USD', name: 'US Dollar', symbol: '$', locale: 'en-US', flag: '🇺🇸' },
  CNY: { code: 'CNY', name: '人民币', symbol: '¥', locale: 'zh-CN', flag: '🇨🇳' },
};

/**
 * 默认汇率（基于 MZN 为基准货币）
 * 管理员可在后台更新实时汇率
 * 
 * 示例汇率（2025年参考值）：
 *   1 MZN ≈ 0.0156 USD
 *   1 MZN ≈ 0.113 CNY
 *   1 USD ≈ 64 MZN
 *   1 CNY ≈ 8.85 MZN
 */
export const DEFAULT_EXCHANGE_RATES: Record<CurrencyCode, number> = {
  MZN: 1,       // 基准货币
  USD: 0.0156,  // 1 MZN = 0.0156 USD
  CNY: 0.113,   // 1 MZN = 0.113 CNY
};

/** 从 localStorage 读取用户偏好的货币 */
export function getStoredCurrency(): CurrencyCode {
  if (typeof window === 'undefined') return 'MZN';
  try {
    const stored = localStorage.getItem('fjb_currency');
    if (stored && CURRENCY_INFO[stored as CurrencyCode]) {
      return stored as CurrencyCode;
    }
  } catch { /* ignore */ }
  return 'MZN';
}

/** 保存用户偏好的货币到 localStorage */
export function setStoredCurrency(currency: CurrencyCode): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('fjb_currency', currency);
  } catch { /* ignore */ }
}

/** 从 localStorage 读取自定义汇率 */
export function getStoredRates(): Record<CurrencyCode, number> | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('fjb_exchange_rates');
    if (stored) {
      return JSON.parse(stored) as Record<CurrencyCode, number>;
    }
  } catch { /* ignore */ }
  return null;
}

/** 
 * 将 MZN 价格转换为目标货币
 * @param priceInMZN - MZN 为单位的价格
 * @param targetCurrency - 目标货币
 * @param rates - 汇率表（MZN 为基准）
 * @returns 转换后的价格
 */
export function convertPrice(
  priceInMZN: number,
  targetCurrency: CurrencyCode,
  rates: Record<CurrencyCode, number> = DEFAULT_EXCHANGE_RATES
): number {
  if (targetCurrency === 'MZN') return priceInMZN;
  const rate = rates[targetCurrency] || DEFAULT_EXCHANGE_RATES[targetCurrency];
  return priceInMZN * rate;
}

/**
 * 格式化价格（含货币符号和千分位）
 * @param priceInMZN - MZN 为单位的价格
 * @param currency - 显示货币
 * @param rates - 汇率表
 * @returns 格式化后的价格字符串
 */
export function formatCurrencyPrice(
  priceInMZN: number | string,
  currency: CurrencyCode,
  rates: Record<CurrencyCode, number> = DEFAULT_EXCHANGE_RATES
): string {
  const num = typeof priceInMZN === 'string' ? parseFloat(priceInMZN) : priceInMZN;
  if (isNaN(num)) return '0.00';

  const converted = convertPrice(num, currency, rates);
  const info = CURRENCY_INFO[currency];

  // 使用对应 locale 格式化
  try {
    return new Intl.NumberFormat(info.locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(converted) + ' ' + info.symbol;
  } catch {
    return `${converted.toFixed(2)} ${info.symbol}`;
  }
}

/**
 * 获取汇率显示文字
 * 如 "1 USD = 64.10 MZN"
 */
export function getRateDisplay(
  targetCurrency: CurrencyCode,
  rates: Record<CurrencyCode, number> = DEFAULT_EXCHANGE_RATES
): string {
  if (targetCurrency === 'MZN') return '1 MZN = 1.00 MZN';
  const rate = rates[targetCurrency] || DEFAULT_EXCHANGE_RATES[targetCurrency];
  const reverseRate = 1 / rate;
  return `1 ${targetCurrency} = ${reverseRate.toFixed(2)} MZN`;
}
