import { ApiClient } from '../core/ApiClient';

export interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
}

export class UserApi {
  private readonly api: ApiClient;
  constructor(api: ApiClient) {
    this.api = api;
  }

  async create(user: Omit<User, 'id'>): Promise<User> {
    const { status: code, body } = await this.api.post<User>('user', user);
    if (code !== 200 && code !== 201) throw new Error(`user.create failed: ${code}`);
    return body;
  }

  async getByName(username: string): Promise<User> {
    const { status: code, body } = await this.api.get<User>(`user/${username}`);
    if (code !== 200) throw new Error(`user.getByName(${username}) failed: ${code}`);
    return body;
  }

  async deleteByUsername(username: string): Promise<void> {
    const { status: code, body } = await this.api.del(`user/${username}`);
    if (code !== 200) throw new Error(`user.delete(${username}) failed: ${code}`);
  }
}
