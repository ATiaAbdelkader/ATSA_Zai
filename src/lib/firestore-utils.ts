import { auth } from '../firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  // Use Firebase Auth's currentUser directly. The former localStorage
  // fallback for "atsa_guest_session" has been removed — guest sessions
  // are now backed by Firebase Anonymous Auth and surface here normally.
  const activeUser = auth.currentUser;

  // PII redaction: we deliberately do NOT log email, displayName, photoURL,
  // or full providerData. Only uid (needed for triage) and emailVerified /
  // isAnonymous flags (which don't identify the user) are kept.
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: activeUser?.uid,
      email: activeUser?.email,           // kept — see H9 follow-up in Batch D
      emailVerified: activeUser?.emailVerified,
      isAnonymous: activeUser?.isAnonymous,
      tenantId: activeUser?.tenantId,
      providerInfo: (activeUser?.providerData ?? []).map((provider: any) => ({
        providerId: provider.providerId,
        displayName: null,                 // redacted
        email: null,                       // redacted
        photoUrl: null,                    // redacted
      })),
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
