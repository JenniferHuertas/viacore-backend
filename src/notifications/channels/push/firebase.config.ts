import * as admin from 'firebase-admin';

import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(
  readFileSync(
    process.env.FIREBASE_CONFIG_PATH!,
    'utf8',
  ),
);

export const firebaseApp =
  admin.initializeApp({
    credential:
      admin.credential.cert(
        serviceAccount,
      ),
  });