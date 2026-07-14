import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../../../..');

dotenv.config({ path: path.join(projectRoot, '.env') });
dotenv.config({ path: path.join(projectRoot, 'TODO_MVC/.env') });

const BASE_URL = process.env.DIDAXIS_URL ?? 'https://test.didaxis.studio';
const dryRun = process.argv.includes('--dry-run');

async function resolveBearerToken() {
  const envToken = process.env.DIDAXIS_API_TOKEN;
  if (envToken) {
    const probe = await fetch(`${BASE_URL}/api/programs`, {
      headers: { Authorization: `Bearer ${envToken}` },
    });
    if (probe.ok) {
      return envToken;
    }
  }

  const email = process.env.DIDAXIS_EMAIL;
  const password = process.env.DIDAXIS_PASSWORD;
  if (!email || !password) {
    return null;
  }

  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!loginRes.ok) {
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

function extractPrograms(body) {
  const candidates = [body.data, body.programs, body];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }
  return [];
}

async function main() {
  console.log(`[bulk-cleanup] Environment: ${BASE_URL}`);

  const token = await resolveBearerToken();
  if (!token) {
    console.error(
      '[bulk-cleanup] No valid auth. Set DIDAXIS_API_TOKEN or DIDAXIS_EMAIL + DIDAXIS_PASSWORD.',
    );
    process.exit(1);
  }

  const listRes = await fetch(`${BASE_URL}/api/programs`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!listRes.ok) {
    console.error(`[bulk-cleanup] GET /api/programs failed (${listRes.status})`);
    process.exit(1);
  }

  const programs = extractPrograms(await listRes.json());
  if (programs.length === 0) {
    console.log('[bulk-cleanup] No programs found — environment is already clean.');
    return;
  }

  if (dryRun) {
    console.log(`[bulk-cleanup] Dry run — ${programs.length} program(s) would be deleted:`);
    for (const program of programs) {
      console.log(`  - ${program.id}  ${program.name ?? '(unnamed)'}`);
    }
    return;
  }

  console.log(`[bulk-cleanup] Found ${programs.length} program(s)`);

  let deleted = 0;
  let failed = 0;

  for (const program of programs) {
    const id = program.id;
    if (!id) {
      console.warn('[bulk-cleanup] Skipping entry without id:', program);
      failed++;
      continue;
    }

    const delRes = await fetch(`${BASE_URL}/api/programs/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (delRes.ok) {
      deleted++;
      console.log(`[bulk-cleanup] Deleted ${id} (${program.name ?? 'unnamed'})`);
    } else {
      failed++;
      console.warn(`[bulk-cleanup] Failed to delete ${id} (${delRes.status})`);
    }
  }

  console.log(`[bulk-cleanup] Done: ${deleted} deleted, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('[bulk-cleanup] Unexpected error:', err);
  process.exit(1);
});
