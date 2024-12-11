import { a, defineData, type ClientSchema } from '@aws-amplify/backend';

const schema = a.schema({
  
  // Conversation AI route
  chat: a.conversation({
    aiModel: a.ai.model('Claude 3.5 Sonnet'),
    systemPrompt: '貴方は私の秘書です。日本語に対しては日本語で対応してください。',
  })
  .authorization((allow) => allow.owner()),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});