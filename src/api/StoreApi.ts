import { ApiClient } from '../core/ApiClient';

export class StoreApi {
  private readonly api: ApiClient;
  constructor(api: ApiClient) {
    this.api = api;
  }

  /** GET /store/inventory */
  async inventory(): Promise<Record<string, number>> {
    const { status: code, body } = await this.api.get<Record<string, number>>('store/inventory');
    if (code !== 200) throw new Error(`store.inventory failed: ${code}`);
    return body;
  }
}
