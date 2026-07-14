import { test as base, expect, type APIRequestContext } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../TODO_MVC/.env') });

const BASE_URL = process.env.DIDAXIS_URL ?? 'https://test.didaxis.studio';

async function resolveBearerToken(request: APIRequestContext): Promise<string | null> {
  const envToken = process.env.DIDAXIS_API_TOKEN;
  if (envToken) {
    const probe = await request.get(`${BASE_URL}/api/programs`, {
      headers: { Authorization: `Bearer ${envToken}` },
    });
    if (probe.ok()) {
      return envToken;
    }
  }

  const email = process.env.DIDAXIS_EMAIL;
  const password = process.env.DIDAXIS_PASSWORD;
  if (!email || !password) {
    return null;
  }

  const loginRes = await request.post(`${BASE_URL}/api/auth/login`, {
    data: { email, password },
  });
  if (!loginRes.ok()) {
    return null;
  }

  const body = await loginRes.json();
  return (
    body.token ??
    body.data?.token ??
    body.data?.access_token ??
    body.accessToken ??
    body.data?.accessToken ??
    null
  );
}

type TrackProgram = (uuid: string) => void;

export const test = base.extend<{ trackProgram: TrackProgram }>({
  trackProgram: async ({}, use, testInfo) => {
    const programIds: string[] = [];

    const trackProgram: TrackProgram = (uuid) => {
      if (uuid && !programIds.includes(uuid)) {
        programIds.push(uuid);
      }
    };

    await use(trackProgram);

    if (programIds.length === 0) {
      return;
    }

    const request = await base.request.newContext({ baseURL: BASE_URL });
    try {
      const token = await resolveBearerToken(request);
      if (!token) {
        console.warn(
          `[cleanup] ${testInfo.title}: no API token; skipped deleting ${programIds.length} program(s)`,
        );
        return;
      }

      for (const id of programIds) {
        const res = await request.delete(`/api/programs/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok()) {
          console.warn(
            `[cleanup] ${testInfo.title}: failed to delete program ${id} (${res.status()})`,
          );
        } else {
          console.log(`[cleanup] ${testInfo.title}: deleted program ${id}`);
        }
      }
    } finally {
      await request.dispose();
    }
  },
});

export { expect };
export type { Page } from '@playwright/test';
