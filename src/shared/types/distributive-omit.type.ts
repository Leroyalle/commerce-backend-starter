export type DistributiveOmit<T, K extends keyof any> = T extends unknown ? Omit<T, K> : never;
