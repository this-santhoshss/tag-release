export const authMethods = ['systemAccessToken'] as const;

export type AuthMethod = (typeof authMethods)[number];

export interface TaskInputs {
  tagName: string;
  tagMessage?: string;
  failOnExistingTag: boolean;
  authMethod: AuthMethod;
  serviceConnection?: string;
}
