import { ApiClient } from '../core/ApiClient';

export interface Order {
  id: number;
  petId: number;
  quantity: number;
  status: 'placed' | 'approved' | 'delivered';
  shipDate?: Date;
}

export class OrdersApi {
  private readonly api: ApiClient;
  constructor(api: ApiClient) {
    this.api = api;
  }

  async getById(id: number): Promise<Order> {
    const { status: code, body } = await this.api.get<Order>(`order/${id}`);
    if (code !== 200) throw new Error(`order.getById(${id}) failed: ${code}`);
    return body;
  }

  async getByStatus(status: Order['status']): Promise<Order[]> {
    const { status: code, body } = await this.api.get<Order[]>(`order/status/${status}`);
    if (code !== 200) throw new Error(`order.getByStatus(${status}) failed: ${code}`);
    return body;
  }

  async create(order: Omit<Order, 'id'>): Promise<Order> {
    const { status: code, body } = await this.api.post<Order>('order', order);
    if (code !== 200 && code !== 201) throw new Error(`order.create failed: ${code}`);
    return body;
  }

  async cancel(id: number): Promise<void> {
    const { status: code, body } = await this.api.del(`order/${id}`);
    if (code !== 200) throw new Error(`order.cancel(${id}) failed: ${code} ${JSON.stringify(body)}`);
  }
}
