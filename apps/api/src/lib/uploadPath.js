import { mkdirSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

/** Local: UPLOAD_DIR o ./uploads. En Vercel: /tmp (FS efímero). */
export function getUploadRoot() {
  if (process.env.VERCEL) {
    return path.join(os.tmpdir(), 'nomina-jarudo-uploads');
  }
  return path.resolve(process.env.UPLOAD_DIR || './uploads');
}

export function ensureUploadRoot() {
  const root = getUploadRoot();
  mkdirSync(root, { recursive: true });
  return root;
}
