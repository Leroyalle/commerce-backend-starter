export interface ICartRepository {
  create(userId: string): Promise<void>;
}
