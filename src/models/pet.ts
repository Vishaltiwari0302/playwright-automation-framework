/**
 * Pet domain models (Petstore) used by both the UI and the API tests.
 * Keeping a single source of truth avoids drift between data classes.
 */
export interface Pet {
  /**
   * Kept as a string: Petstore mints 64-bit ids (e.g. 9223372016900105011)
   * that exceed Number.MAX_SAFE_INTEGER, so JS number coercion silently
   * corrupts them and round-trips a wrong id to the server (404s).
   */
  id: string | number;
  name: string;
  status: 'available' | 'pending' | 'sold';
  photoUrls: string[];
}

export interface CreatePetDTO {
  name: string;
  status: Pet['status'];
}

export interface ApiResponse<T = unknown> {
  status: number;
  headers: Record<string, string | undefined>;
  body: T;
  ok: boolean;
  durationMs: number;
}
