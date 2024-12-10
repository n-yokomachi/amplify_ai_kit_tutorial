import { util } from '@aws-appsync/utils';

export function request(ctx) {
  ctx.stash.metadata.index = 'gsi-Conversation.typename.updatedAt';
  ctx.stash.modelQueryExpression = {
      expression: '#typename = :typename',
      expressionNames: {
        '#typename': '__typename',
      },
      expressionValues: util.dynamodb.toMapValues({
        ':typename': 'ConversationChat',
      }),
    };
  ctx.args.sortDirection = 'DESC';
  return {};
}

export function response(ctx) {
  return {};
}
