export const roundDecimals = (
  value: number,
  decimals: number,
  fn: (v: number) => number = Math.round,
): number => {
  const factor = Math.pow(10, decimals);
  return fn((value + Number.EPSILON) * factor) / factor;
};
