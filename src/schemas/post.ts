import { z } from 'zod'

export const PostSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  content: z.string(),
  created_at: z.string(),
  like_count: z.number().optional(),
  save_count: z.number().optional(),
})

export const PostUserSchema = PostSchema.extend({
  users: z.object({
    id: z.string(),
    username: z.string().nullable(),
  }),
})
