import { a, defineData, type ClientSchema } from '@aws-amplify/backend';

const schema = a.schema({
  
  // Conversation AI route
  chat: a.conversation({
    aiModel: a.ai.model('Claude 3.5 Sonnet'),
    systemPrompt: '�M���͎��̔鏑�ł��B���{��ɑ΂��Ă͓��{��őΉ����Ă��������B',
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