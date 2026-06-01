import { z } from 'zod';

export const createWorkspaceSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Workspace name is required.').min(2, 'Workspace name must be at least 2 characters.'),
    description: z.string().optional(),
  }),
});

export const inviteMemberSchema = z.object({
  body: z.object({
    email: z.string().min(1, 'Member email is required.').email('Invalid email address.'),
    role: z.enum(['MEMBER', 'ADMIN', 'VIEWER']).default('MEMBER'),
  }),
});
export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
