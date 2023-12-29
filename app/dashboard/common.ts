export type DateRange = {from?: Date, to?: Date}

export type BaseParam = {range: DateRange}

export const usdValueFormatter = (v: number) => `$ ${new Intl.NumberFormat("us", { currency: 'USD', compactDisplay: 'short', notation: 'compact' }).format(v).toString()}`;