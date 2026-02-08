export class JwtConfig {
  public readonly access: Uint8Array;
  public readonly refresh: Uint8Array;

  constructor() {
    if (!process.env.JWT_ACCESS_SECRET) {
      throw new Error('JWT_ACCESS_SECRET is not defined');
    }
    if (!process.env.JWT_REFRESH_SECRET) {
      throw new Error('JWT_REFRESH_SECRET is not defined');
    }

    const encoder = new TextEncoder();
    this.access = encoder.encode(process.env.JWT_ACCESS_SECRET);
    this.refresh = encoder.encode(process.env.JWT_REFRESH_SECRET);
  }
}
