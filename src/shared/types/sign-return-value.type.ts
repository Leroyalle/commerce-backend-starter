import { timeMap } from '../constants/tokens-time-map.constants';

export type SignReturnValue<T extends keyof typeof timeMap> = {
  token: string;
} & SignReturnMap[T];

export type SignReturnMap = {
  refresh: { jti: string; expAt: Date };
  access: {
    expAt: Date;
  };
};
