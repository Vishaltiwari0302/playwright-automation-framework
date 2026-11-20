import { ApiClient } from '../core/ApiClient';
import { PetsApi } from './PetsApi';
import { OrdersApi } from './OrdersApi';
import { StoreApi } from './StoreApi';
import { UserApi } from './UserApi';

/**
 * Api — facade exposing the full API surface of the app under test.
 *
 * Usage:
 *   const api   = new Api(buildClient(request));
 *   const pet   = await api.pets.create({ name: 'Rex', status: 'available' });
 *   await api.orders.getByStatus('placed');
 */
export class Api {
  public readonly pets: PetsApi;
  public readonly orders: OrdersApi;
  public readonly store: StoreApi;
  public readonly user: UserApi;

  private readonly root: ApiClient;

  constructor(root: ApiClient) {
    this.root = root;
    this.pets = new PetsApi(root);
    this.orders = new OrdersApi(root);
    this.store = new StoreApi(root);
    this.user = new UserApi(root);
  }

  /** Convenience pass-through to the underlying raw client (advanced use). */
  raw(): ApiClient {
    return this.root;
  }
}

export default Api;
