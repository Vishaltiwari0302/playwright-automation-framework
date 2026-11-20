import { CreatePetDTO, Pet } from '../models/pet';
import { ApiClient } from '../core/ApiClient';
import log from '../utils/logger';

/**
 * PetsApi — resource-oriented operations for the Petstore `/pet` endpoints.
 *
 * This class is intentionally a thin, *readable* layer over `ApiClient`:
 * each method maps to exactly one REST operation and returns typed data.
 */
export class PetsApi {
  private readonly api: ApiClient;
  constructor(api: ApiClient) {
    this.api = api;
  }

  /** GET /pet/findByStatus?status=available */
  async findByStatus(status: Pet['status']): Promise<Pet[]> {
    const { status: code, body } = await this.api.get<Pet[]>(`pet/findByStatus?status=${status}`);
    log.debug('PetsApi.findByStatus', { status, code });
    if (code !== 200) throw new Error(`findByStatus failed: ${code} ${JSON.stringify(body)}`);
    return body;
  }

  /** GET /pet/{id} */
  async getById(id: string | number): Promise<Pet> {
    const { status: code, body } = await this.api.get<Pet>(`pet/${id}`);
    if (code !== 200) throw new Error(`getById(${id}) failed: ${code} ${JSON.stringify(body)}`);
    return body;
  }

  /** POST /pet — create a pet, returns the created entity (with server id). */
  async create(dto: CreatePetDTO): Promise<Pet> {
    const { status: code, body } = await this.api.post<Pet>('pet', dto);
    log.info('PetsApi.create', { name: dto.name, code });
    if (code !== 200 && code !== 201) throw new Error(`create failed: ${code} ${JSON.stringify(body)}`);
    return body;
  }

  /** PUT /pet — update an existing pet. */
  async update(pet: Pet): Promise<void> {
    const { status: code, body } = await this.api.put('pet', pet);
    if (code !== 200) throw new Error(`update failed: ${code} ${JSON.stringify(body)}`);
  }

  /** DELETE /pet/{id}?apiKey=... */
  async delete(id: string | number): Promise<void> {
    const { status: code, body } = await this.api.del(`pet/${id}?apiKey=12345`);
    log.info('PetsApi.delete', { id, code });
    if (code !== 200) throw new Error(`delete(${id}) failed: ${code} ${JSON.stringify(body)}`);
  }
}
