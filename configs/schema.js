import { pgTable, text, integer, serial, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const chats = pgTable('chats', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.clerk_id),
  message: text('message'),
  response: text('response'), 
  createdAt: integer('created_at'),
});

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name'),
  email: text('email'),
  clerk_id: text('clerk_id').unique(),
  createdAt: timestamp('created_at').defaultNow()
});

export const chatsRelations = relations(chats, ({ one }) => ({
  user: one(users, {
    fields: [chats.userId],
    references: [users.clerk_id],
  }),
}));
