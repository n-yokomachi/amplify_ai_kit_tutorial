"use strict";
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// node_modules/@aws-amplify/graphql-api-construct/node_modules/@aws-amplify/ai-constructs/lib/conversation/runtime/graphql_request_executor.js
var require_graphql_request_executor = __commonJS({
  "node_modules/@aws-amplify/graphql-api-construct/node_modules/@aws-amplify/ai-constructs/lib/conversation/runtime/graphql_request_executor.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.GraphqlRequestExecutor = void 0;
    var GraphqlRequestExecutor = class {
      /**
       * Creates GraphQL request executor.
       */
      constructor(graphQlEndpoint, accessToken, userAgentProvider, _fetch = fetch) {
        this.graphQlEndpoint = graphQlEndpoint;
        this.accessToken = accessToken;
        this.userAgentProvider = userAgentProvider;
        this._fetch = _fetch;
        this.executeGraphql = async (request, options) => {
          var _a;
          const httpRequest = new Request(this.graphQlEndpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/graphql",
              Authorization: this.accessToken,
              "x-amz-user-agent": (_a = options === null || options === void 0 ? void 0 : options.userAgent) !== null && _a !== void 0 ? _a : this.userAgentProvider.getUserAgent()
            },
            body: JSON.stringify({
              query: request.query,
              variables: request.variables
            })
          });
          const res = await this._fetch(httpRequest);
          const responseHeaders = {};
          res.headers.forEach((value, key) => responseHeaders[key] = value);
          if (!res.ok) {
            const body2 = await res.text();
            throw new Error(`GraphQL request failed, response headers=${JSON.stringify(responseHeaders)}, body=${body2}`);
          }
          const body = await res.json();
          if (body && typeof body === "object" && "errors" in body) {
            throw new Error(`GraphQL request failed, response headers=${JSON.stringify(responseHeaders)}, body=${JSON.stringify(body)}`);
          }
          return body;
        };
      }
    };
    exports2.GraphqlRequestExecutor = GraphqlRequestExecutor;
  }
});

// node_modules/@aws-amplify/graphql-api-construct/node_modules/@aws-amplify/ai-constructs/package.json
var require_package = __commonJS({
  "node_modules/@aws-amplify/graphql-api-construct/node_modules/@aws-amplify/ai-constructs/package.json"(exports2, module2) {
    module2.exports = {
      name: "@aws-amplify/ai-constructs",
      version: "1.0.0",
      type: "commonjs",
      publishConfig: {
        access: "public"
      },
      exports: {
        ".": {
          types: "./lib/index.d.ts",
          default: "./lib/index.js"
        },
        "./conversation": {
          types: "./lib/conversation/index.d.ts",
          default: "./lib/conversation/index.js"
        },
        "./conversation/runtime": {
          types: "./lib/conversation/runtime/index.d.ts",
          default: "./lib/conversation/runtime/index.js"
        }
      },
      main: "lib/index.js",
      types: "lib/index.d.ts",
      scripts: {
        "update:api": "api-extractor run --local"
      },
      license: "Apache-2.0",
      dependencies: {
        "@aws-amplify/backend-output-schemas": "^1.4.0",
        "@aws-amplify/platform-core": "^1.2.0",
        "@aws-amplify/plugin-types": "^1.3.1",
        "@aws-sdk/client-bedrock-runtime": "^3.622.0",
        "@smithy/types": "^3.3.0",
        "json-schema-to-ts": "^3.1.1"
      },
      devDependencies: {
        "@aws-amplify/backend-output-storage": "^1.1.3",
        typescript: "^5.0.0"
      },
      peerDependencies: {
        "aws-cdk-lib": "^2.158.0",
        constructs: "^10.0.0"
      }
    };
  }
});

// node_modules/@aws-amplify/graphql-api-construct/node_modules/@aws-amplify/ai-constructs/lib/conversation/runtime/user_agent_provider.js
var require_user_agent_provider = __commonJS({
  "node_modules/@aws-amplify/graphql-api-construct/node_modules/@aws-amplify/ai-constructs/lib/conversation/runtime/user_agent_provider.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.UserAgentProvider = void 0;
    var packageVersion = require_package().version;
    var packageName = "amplify-ai-constructs";
    var UserAgentProvider = class {
      /**
       * Creates user agent provider instance.
       */
      constructor(event) {
        this.event = event;
        this.getUserAgent = (additionalMetadata) => {
          let userAgent = this.event.request.headers["x-amz-user-agent"];
          if (userAgent) {
            userAgent = `${userAgent} md/${packageName}#${packageVersion}`;
          } else {
            userAgent = `lib/${packageName}#${packageVersion}`;
          }
          if (additionalMetadata) {
            Object.entries(additionalMetadata).forEach(([key, value]) => {
              userAgent = `${userAgent} md/${key}#${value}`;
            });
          }
          return userAgent;
        };
      }
    };
    exports2.UserAgentProvider = UserAgentProvider;
  }
});

// node_modules/@aws-amplify/graphql-api-construct/node_modules/@aws-amplify/ai-constructs/lib/conversation/runtime/conversation_turn_response_sender.js
var require_conversation_turn_response_sender = __commonJS({
  "node_modules/@aws-amplify/graphql-api-construct/node_modules/@aws-amplify/ai-constructs/lib/conversation/runtime/conversation_turn_response_sender.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ConversationTurnResponseSender = void 0;
    var graphql_request_executor_1 = require_graphql_request_executor();
    var user_agent_provider_1 = require_user_agent_provider();
    var ConversationTurnResponseSender = class {
      /**
       * Creates conversation turn response sender.
       */
      constructor(event, userAgentProvider = new user_agent_provider_1.UserAgentProvider(event), graphqlRequestExecutor = new graphql_request_executor_1.GraphqlRequestExecutor(event.graphqlApiEndpoint, event.request.headers.authorization, userAgentProvider), logger = console) {
        this.event = event;
        this.userAgentProvider = userAgentProvider;
        this.graphqlRequestExecutor = graphqlRequestExecutor;
        this.logger = logger;
        this.sendResponse = async (message) => {
          const responseMutationRequest = this.createMutationRequest(message);
          this.logger.debug("Sending response mutation:", responseMutationRequest);
          await this.graphqlRequestExecutor.executeGraphql(responseMutationRequest, {
            userAgent: this.userAgentProvider.getUserAgent({
              "turn-response-type": "single"
            })
          });
        };
        this.sendResponseChunk = async (chunk) => {
          const responseMutationRequest = this.createStreamingMutationRequest(chunk);
          this.logger.debug("Sending response mutation:", responseMutationRequest);
          await this.graphqlRequestExecutor.executeGraphql(responseMutationRequest, {
            userAgent: this.userAgentProvider.getUserAgent({
              "turn-response-type": "streaming"
            })
          });
        };
        this.sendErrors = async (errors) => {
          const responseMutationRequest = this.createMutationErrorsRequest(errors);
          this.logger.debug("Sending errors response mutation:", responseMutationRequest);
          await this.graphqlRequestExecutor.executeGraphql(responseMutationRequest, {
            userAgent: this.userAgentProvider.getUserAgent({
              "turn-response-type": "error"
            })
          });
        };
        this.createMutationErrorsRequest = (errors) => {
          const query = `
        mutation PublishModelResponse($input: ${this.event.responseMutation.inputTypeName}!) {
            ${this.event.responseMutation.name}(input: $input) {
                ${this.event.responseMutation.selectionSet}
            }
        }
    `;
          const variables = {
            input: {
              conversationId: this.event.conversationId,
              errors,
              associatedUserMessageId: this.event.currentMessageId
            }
          };
          return { query, variables };
        };
        this.createMutationRequest = (content) => {
          const query = `
        mutation PublishModelResponse($input: ${this.event.responseMutation.inputTypeName}!) {
            ${this.event.responseMutation.name}(input: $input) {
                ${this.event.responseMutation.selectionSet}
            }
        }
    `;
          content = this.serializeContent(content);
          const variables = {
            input: {
              conversationId: this.event.conversationId,
              content,
              associatedUserMessageId: this.event.currentMessageId
            }
          };
          return { query, variables };
        };
        this.createStreamingMutationRequest = (chunk) => {
          const query = `
        mutation PublishModelResponse($input: ${this.event.responseMutation.inputTypeName}!) {
            ${this.event.responseMutation.name}(input: $input) {
                ${this.event.responseMutation.selectionSet}
            }
        }
    `;
          chunk = {
            ...chunk,
            accumulatedTurnContent: this.serializeContent(chunk.accumulatedTurnContent)
          };
          const variables = {
            input: chunk
          };
          return { query, variables };
        };
        this.serializeContent = (content) => {
          return content.map((block) => {
            if (block.toolUse) {
              const input = JSON.stringify(block.toolUse.input);
              return { toolUse: { ...block.toolUse, input } };
            }
            return block;
          });
        };
      }
    };
    exports2.ConversationTurnResponseSender = ConversationTurnResponseSender;
  }
});

// node_modules/@aws-amplify/graphql-api-construct/node_modules/@aws-amplify/ai-constructs/lib/conversation/runtime/event-tools-provider/graphql_tool.js
var require_graphql_tool = __commonJS({
  "node_modules/@aws-amplify/graphql-api-construct/node_modules/@aws-amplify/ai-constructs/lib/conversation/runtime/event-tools-provider/graphql_tool.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.GraphQlTool = void 0;
    var graphql_request_executor_1 = require_graphql_request_executor();
    var GraphQlTool = class {
      /**
       * Creates GraphQl Tool
       */
      constructor(name, description, inputSchema, graphQlEndpoint, query, accessToken, userAgentProvider, graphqlRequestExecutor = new graphql_request_executor_1.GraphqlRequestExecutor(graphQlEndpoint, accessToken, userAgentProvider)) {
        this.name = name;
        this.description = description;
        this.inputSchema = inputSchema;
        this.graphQlEndpoint = graphQlEndpoint;
        this.query = query;
        this.accessToken = accessToken;
        this.userAgentProvider = userAgentProvider;
        this.graphqlRequestExecutor = graphqlRequestExecutor;
        this.execute = async (input) => {
          if (!input) {
            throw Error(`GraphQl tool '${this.name}' requires input to execute.`);
          }
          const response = await this.graphqlRequestExecutor.executeGraphql({
            query: this.query,
            variables: input
          });
          return { json: response };
        };
      }
    };
    exports2.GraphQlTool = GraphQlTool;
  }
});

// node_modules/@aws-amplify/graphql-api-construct/node_modules/@aws-amplify/ai-constructs/lib/conversation/runtime/event-tools-provider/graphql_query_factory.js
var require_graphql_query_factory = __commonJS({
  "node_modules/@aws-amplify/graphql-api-construct/node_modules/@aws-amplify/ai-constructs/lib/conversation/runtime/event-tools-provider/graphql_query_factory.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.GraphQlQueryFactory = void 0;
    var GraphQlQueryFactory = class {
      constructor() {
        this.createQuery = (toolDefinition) => {
          const { graphqlRequestInputDescriptor } = toolDefinition;
          const { selectionSet, queryName } = graphqlRequestInputDescriptor;
          const [topLevelQueryArgs, queryArgs] = this.createQueryArgs(toolDefinition);
          const fieldSelection = selectionSet.length > 0 ? ` { ${selectionSet} }` : "";
          const query = `
    query ToolQuery${topLevelQueryArgs} {
      ${queryName}${queryArgs}${fieldSelection}
    }
  `;
          return query;
        };
        this.createQueryArgs = (toolDefinition) => {
          const { inputSchema } = toolDefinition;
          if (!(inputSchema === null || inputSchema === void 0 ? void 0 : inputSchema.json)) {
            return ["", ""];
          }
          const { properties } = inputSchema.json;
          if (!properties || Object.keys(properties).length === 0) {
            return ["", ""];
          }
          const { propertyTypes } = toolDefinition.graphqlRequestInputDescriptor;
          const propertyNames = Object.keys(properties);
          const topLevelQueryArgs = propertyNames.map((name) => `$${name}: ${propertyTypes[name]}`).join(", ");
          const queryArgs = propertyNames.map((name) => `${name}: $${name}`).join(", ");
          return [`(${topLevelQueryArgs})`, `(${queryArgs})`];
        };
      }
    };
    exports2.GraphQlQueryFactory = GraphQlQueryFactory;
  }
});

// node_modules/@aws-amplify/graphql-api-construct/node_modules/@aws-amplify/ai-constructs/lib/conversation/runtime/event-tools-provider/event_tools_provider.js
var require_event_tools_provider = __commonJS({
  "node_modules/@aws-amplify/graphql-api-construct/node_modules/@aws-amplify/ai-constructs/lib/conversation/runtime/event-tools-provider/event_tools_provider.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ConversationTurnEventToolsProvider = void 0;
    var graphql_tool_1 = require_graphql_tool();
    var graphql_query_factory_1 = require_graphql_query_factory();
    var user_agent_provider_1 = require_user_agent_provider();
    var ConversationTurnEventToolsProvider = class {
      /**
       * Creates conversation turn event tools provider.
       */
      constructor(event, graphQlQueryFactory = new graphql_query_factory_1.GraphQlQueryFactory()) {
        this.event = event;
        this.graphQlQueryFactory = graphQlQueryFactory;
        this.getEventTools = () => {
          var _a;
          const { toolsConfiguration, graphqlApiEndpoint } = this.event;
          if (!toolsConfiguration || !toolsConfiguration.dataTools) {
            return [];
          }
          const tools = (_a = toolsConfiguration.dataTools) === null || _a === void 0 ? void 0 : _a.map((tool) => {
            const { name, description, inputSchema } = tool;
            const query = this.graphQlQueryFactory.createQuery(tool);
            return new graphql_tool_1.GraphQlTool(name, description, inputSchema, graphqlApiEndpoint, query, this.event.request.headers.authorization, new user_agent_provider_1.UserAgentProvider(this.event));
          });
          return tools !== null && tools !== void 0 ? tools : [];
        };
      }
    };
    exports2.ConversationTurnEventToolsProvider = ConversationTurnEventToolsProvider;
  }
});

// node_modules/@aws-amplify/graphql-api-construct/node_modules/@aws-amplify/ai-constructs/lib/conversation/runtime/event-tools-provider/index.js
var require_event_tools_provider2 = __commonJS({
  "node_modules/@aws-amplify/graphql-api-construct/node_modules/@aws-amplify/ai-constructs/lib/conversation/runtime/event-tools-provider/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ConversationTurnEventToolsProvider = void 0;
    var event_tools_provider_js_1 = require_event_tools_provider();
    Object.defineProperty(exports2, "ConversationTurnEventToolsProvider", { enumerable: true, get: function() {
      return event_tools_provider_js_1.ConversationTurnEventToolsProvider;
    } });
  }
});

// node_modules/@aws-amplify/graphql-api-construct/node_modules/@aws-amplify/ai-constructs/lib/conversation/runtime/conversation_message_history_retriever.js
var require_conversation_message_history_retriever = __commonJS({
  "node_modules/@aws-amplify/graphql-api-construct/node_modules/@aws-amplify/ai-constructs/lib/conversation/runtime/conversation_message_history_retriever.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ConversationMessageHistoryRetriever = void 0;
    var graphql_request_executor_1 = require_graphql_request_executor();
    var user_agent_provider_1 = require_user_agent_provider();
    var messageItemSelectionSet = `
                id
                conversationId
                associatedUserMessageId
                aiContext
                role
                content {
                  text
                  document {
                    source {
                      bytes
                    }
                    format
                    name
                  }
                  image {
                    format
                    source {
                      bytes
                    }
                  }
                  toolResult {
                    content {
                      document {
                        format
                        name
                        source {
                          bytes
                        }
                      }
                      image {
                        format
                        source {
                          bytes
                        }
                      }
                      json
                      text
                    }
                    status
                    toolUseId
                  }
                  toolUse {
                    input
                    name
                    toolUseId
                  }
                }
`;
    var ConversationMessageHistoryRetriever = class {
      /**
       * Creates conversation message history retriever.
       */
      constructor(event, graphqlRequestExecutor = new graphql_request_executor_1.GraphqlRequestExecutor(event.graphqlApiEndpoint, event.request.headers.authorization, new user_agent_provider_1.UserAgentProvider(event))) {
        this.event = event;
        this.graphqlRequestExecutor = graphqlRequestExecutor;
        this.getMessageHistory = async () => {
          const messages = await this.listMessages();
          let currentMessage = messages.find((m) => m.id === this.event.currentMessageId);
          if (!currentMessage) {
            currentMessage = await this.getCurrentMessage();
            messages.push(currentMessage);
          }
          const assistantMessageByUserMessageId = /* @__PURE__ */ new Map();
          messages.forEach((message) => {
            if (message.role === "assistant" && message.associatedUserMessageId) {
              assistantMessageByUserMessageId.set(message.associatedUserMessageId, message);
            }
          });
          const orderedMessages = messages.reduce((acc, current) => {
            if (current.role === "assistant") {
              return acc;
            }
            if (current.role === "user" && !assistantMessageByUserMessageId.has(current.id) && current.id !== this.event.currentMessageId) {
              return acc;
            }
            const aiContext = current.aiContext;
            const content = aiContext ? [...current.content, { text: JSON.stringify(aiContext) }] : current.content;
            acc.push({ role: current.role, content });
            const correspondingAssistantMessage = assistantMessageByUserMessageId.get(current.id);
            if (correspondingAssistantMessage) {
              acc.push({
                role: correspondingAssistantMessage.role,
                content: correspondingAssistantMessage.content
              });
            }
            return acc;
          }, []);
          return this.squashNonCurrentTurns(orderedMessages);
        };
        this.squashNonCurrentTurns = (messages) => {
          const isNonToolBlockPredicate = (contentBlock) => !contentBlock.toolUse && !contentBlock.toolResult;
          const lastNonToolUseUserMessageIndex = messages.findLastIndex((message) => {
            return message.role === "user" && message.content.find(isNonToolBlockPredicate);
          });
          if (lastNonToolUseUserMessageIndex <= 0) {
            return messages;
          }
          const squashedMessages = [];
          let currentSquashedMessage = void 0;
          for (let i = 0; i < lastNonToolUseUserMessageIndex; i++) {
            const currentMessage = messages[i];
            const currentMessageRole = currentMessage.role;
            const currentMessageNonToolContent = currentMessage.content.filter(isNonToolBlockPredicate);
            if (currentMessageNonToolContent.length === 0) {
              continue;
            }
            if (!currentSquashedMessage) {
              currentSquashedMessage = {
                role: currentMessageRole,
                content: currentMessageNonToolContent
              };
            } else if (currentSquashedMessage.role === currentMessageRole) {
              currentSquashedMessage.content.push(...currentMessageNonToolContent);
            } else {
              squashedMessages.push(currentSquashedMessage);
              currentSquashedMessage = {
                role: currentMessageRole,
                content: currentMessageNonToolContent
              };
            }
          }
          if (currentSquashedMessage) {
            squashedMessages.push(currentSquashedMessage);
          }
          squashedMessages.push(...messages.slice(lastNonToolUseUserMessageIndex));
          return squashedMessages;
        };
        this.getCurrentMessage = async () => {
          const query = `
        query GetMessage($id: ${this.event.messageHistoryQuery.getQueryInputTypeName}!) {
            ${this.event.messageHistoryQuery.getQueryName}(id: $id) {
              ${messageItemSelectionSet}
            }
        }
    `;
          const variables = {
            id: this.event.currentMessageId
          };
          const response = await this.graphqlRequestExecutor.executeGraphql({
            query,
            variables
          });
          return response.data[this.event.messageHistoryQuery.getQueryName];
        };
        this.listMessages = async () => {
          var _a;
          const query = `
        query ListMessages($filter: ${this.event.messageHistoryQuery.listQueryInputTypeName}!, $limit: Int) {
            ${this.event.messageHistoryQuery.listQueryName}(filter: $filter, limit: $limit) {
              items {
                ${messageItemSelectionSet}
              }
            }
        }
    `;
          const variables = {
            filter: {
              conversationId: {
                eq: this.event.conversationId
              }
            },
            limit: (_a = this.event.messageHistoryQuery.listQueryLimit) !== null && _a !== void 0 ? _a : 1e3
          };
          const response = await this.graphqlRequestExecutor.executeGraphql({
            query,
            variables
          });
          const items = response.data[this.event.messageHistoryQuery.listQueryName].items;
          items.forEach((item) => {
            var _a2;
            (_a2 = item.content) === null || _a2 === void 0 ? void 0 : _a2.forEach((contentBlock) => {
              var _a3, _b;
              let property;
              for (property in contentBlock) {
                if (contentBlock[property] === null) {
                  contentBlock[property] = void 0;
                }
              }
              if (typeof ((_a3 = contentBlock.toolUse) === null || _a3 === void 0 ? void 0 : _a3.input) === "string") {
                contentBlock.toolUse.input = JSON.parse(contentBlock.toolUse.input);
              }
              if ((_b = contentBlock.toolResult) === null || _b === void 0 ? void 0 : _b.content) {
                contentBlock.toolResult.content.forEach((toolResultContentBlock) => {
                  if (typeof toolResultContentBlock.json === "string") {
                    toolResultContentBlock.json = JSON.parse(toolResultContentBlock.json);
                  }
                });
              }
            });
          });
          return items;
        };
      }
    };
    exports2.ConversationMessageHistoryRetriever = ConversationMessageHistoryRetriever;
  }
});

// node_modules/@aws-amplify/graphql-api-construct/node_modules/@aws-amplify/ai-constructs/lib/conversation/runtime/errors.js
var require_errors = __commonJS({
  "node_modules/@aws-amplify/graphql-api-construct/node_modules/@aws-amplify/ai-constructs/lib/conversation/runtime/errors.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ValidationError = void 0;
    var ValidationError = class extends Error {
      /**
       * Creates validation error instance.
       */
      constructor(message) {
        super(message);
        this.name = "ValidationError";
      }
    };
    exports2.ValidationError = ValidationError;
  }
});

// node_modules/@aws-amplify/graphql-api-construct/node_modules/@aws-amplify/ai-constructs/lib/conversation/runtime/bedrock_converse_adapter.js
var require_bedrock_converse_adapter = __commonJS({
  "node_modules/@aws-amplify/graphql-api-construct/node_modules/@aws-amplify/ai-constructs/lib/conversation/runtime/bedrock_converse_adapter.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.BedrockConverseAdapter = void 0;
    var client_bedrock_runtime_1 = require("@aws-sdk/client-bedrock-runtime");
    var event_tools_provider_1 = require_event_tools_provider2();
    var conversation_message_history_retriever_1 = require_conversation_message_history_retriever();
    var errors_1 = require_errors();
    var user_agent_provider_1 = require_user_agent_provider();
    var BedrockConverseAdapter = class {
      /**
       * Creates Bedrock Converse Adapter.
       */
      constructor(event, additionalTools, bedrockClient = new client_bedrock_runtime_1.BedrockRuntimeClient({ region: event.modelConfiguration.region }), eventToolsProvider = new event_tools_provider_1.ConversationTurnEventToolsProvider(event), messageHistoryRetriever = new conversation_message_history_retriever_1.ConversationMessageHistoryRetriever(event), userAgentProvider = new user_agent_provider_1.UserAgentProvider(event), logger = console) {
        var _a, _b;
        this.event = event;
        this.bedrockClient = bedrockClient;
        this.messageHistoryRetriever = messageHistoryRetriever;
        this.logger = logger;
        this.executableToolByName = /* @__PURE__ */ new Map();
        this.clientToolByName = /* @__PURE__ */ new Map();
        this.askBedrock = async () => {
          var _a2, _b2, _c, _d, _e, _f, _g, _h;
          const { modelId, systemPrompt, inferenceConfiguration } = this.event.modelConfiguration;
          const messages = await this.getEventMessagesAsBedrockMessages();
          let bedrockResponse;
          do {
            const toolConfig = this.createToolConfiguration();
            const converseCommandInput = {
              modelId,
              messages: [...messages],
              system: [{ text: systemPrompt }],
              inferenceConfig: inferenceConfiguration,
              toolConfig
            };
            this.logger.info("Sending Bedrock Converse request");
            this.logger.debug("Bedrock Converse request:", converseCommandInput);
            bedrockResponse = await this.bedrockClient.send(new client_bedrock_runtime_1.ConverseCommand(converseCommandInput));
            this.logger.info(`Received Bedrock Converse response, requestId=${bedrockResponse.$metadata.requestId}`, bedrockResponse.usage);
            this.logger.debug("Bedrock Converse response:", bedrockResponse);
            if ((_a2 = bedrockResponse.output) === null || _a2 === void 0 ? void 0 : _a2.message) {
              messages.push((_b2 = bedrockResponse.output) === null || _b2 === void 0 ? void 0 : _b2.message);
            }
            if (bedrockResponse.stopReason === "tool_use") {
              const responseContentBlocks = (_e = (_d = (_c = bedrockResponse.output) === null || _c === void 0 ? void 0 : _c.message) === null || _d === void 0 ? void 0 : _d.content) !== null && _e !== void 0 ? _e : [];
              const toolUseBlocks = responseContentBlocks.filter((block) => "toolUse" in block);
              const clientToolUseBlocks = responseContentBlocks.filter((block) => {
                var _a3, _b3;
                return ((_a3 = block.toolUse) === null || _a3 === void 0 ? void 0 : _a3.name) && this.clientToolByName.has((_b3 = block.toolUse) === null || _b3 === void 0 ? void 0 : _b3.name);
              });
              if (clientToolUseBlocks.length > 0) {
                return clientToolUseBlocks;
              }
              const toolResponseContentBlocks = [];
              for (const responseContentBlock of toolUseBlocks) {
                const toolUseBlock = responseContentBlock;
                const toolResultContentBlock = await this.executeTool(toolUseBlock);
                toolResponseContentBlocks.push(toolResultContentBlock);
              }
              messages.push({
                role: "user",
                content: toolResponseContentBlocks
              });
            }
          } while (bedrockResponse.stopReason === "tool_use");
          return (_h = (_g = (_f = bedrockResponse.output) === null || _f === void 0 ? void 0 : _f.message) === null || _g === void 0 ? void 0 : _g.content) !== null && _h !== void 0 ? _h : [];
        };
        this.getEventMessagesAsBedrockMessages = async () => {
          var _a2, _b2;
          const messages = [];
          const eventMessages = await this.messageHistoryRetriever.getMessageHistory();
          for (const message of eventMessages) {
            const messageContent = [];
            for (const contentElement of message.content) {
              if (typeof ((_b2 = (_a2 = contentElement.image) === null || _a2 === void 0 ? void 0 : _a2.source) === null || _b2 === void 0 ? void 0 : _b2.bytes) === "string") {
                messageContent.push({
                  image: {
                    format: contentElement.image.format,
                    source: {
                      bytes: Buffer.from(contentElement.image.source.bytes, "base64")
                    }
                  }
                });
              } else {
                messageContent.push(contentElement);
              }
            }
            messages.push({
              role: message.role,
              content: messageContent
            });
          }
          return messages;
        };
        this.createToolConfiguration = () => {
          if (this.allTools.length === 0) {
            return void 0;
          }
          return {
            tools: this.allTools.map((t) => {
              return {
                toolSpec: {
                  name: t.name,
                  description: t.description,
                  // We have to cast to bedrock type as we're using different types to describe JSON schema in our API.
                  // These types are runtime compatible.
                  inputSchema: t.inputSchema
                }
              };
            })
          };
        };
        this.executeTool = async (toolUseBlock) => {
          if (!toolUseBlock.toolUse.name) {
            throw Error("Bedrock tool use response is missing a tool name");
          }
          const tool = this.executableToolByName.get(toolUseBlock.toolUse.name);
          if (!tool) {
            throw Error(`Bedrock tool use response contains unknown tool '${toolUseBlock.toolUse.name}'`);
          }
          try {
            this.logger.info(`Invoking tool ${tool.name}`);
            this.logger.debug("Tool input:", toolUseBlock.toolUse.input);
            const toolResponse = await tool.execute(toolUseBlock.toolUse.input);
            this.logger.info(`Received response from ${tool.name} tool`);
            this.logger.debug(toolResponse);
            return {
              toolResult: {
                toolUseId: toolUseBlock.toolUse.toolUseId,
                content: [toolResponse],
                status: "success"
              }
            };
          } catch (e) {
            if (e instanceof Error) {
              return {
                toolResult: {
                  toolUseId: toolUseBlock.toolUse.toolUseId,
                  content: [{ text: e.toString() }],
                  status: "error"
                }
              };
            }
            return {
              toolResult: {
                toolUseId: toolUseBlock.toolUse.toolUseId,
                content: [{ text: "unknown error occurred" }],
                status: "error"
              }
            };
          }
        };
        this.bedrockClient.middlewareStack.add((next) => (args) => {
          args.request.headers["x-amz-user-agent"] = userAgentProvider.getUserAgent();
          return next(args);
        }, {
          step: "build",
          name: "amplify-user-agent-injector"
        });
        this.executableTools = [
          ...eventToolsProvider.getEventTools(),
          ...additionalTools
        ];
        this.clientTools = (_b = (_a = this.event.toolsConfiguration) === null || _a === void 0 ? void 0 : _a.clientTools) !== null && _b !== void 0 ? _b : [];
        this.allTools = [...this.executableTools, ...this.clientTools];
        const duplicateTools = /* @__PURE__ */ new Set();
        this.executableTools.forEach((t) => {
          if (this.executableToolByName.has(t.name)) {
            duplicateTools.add(t.name);
          }
          this.executableToolByName.set(t.name, t);
        });
        this.clientTools.forEach((t) => {
          if (this.executableToolByName.has(t.name)) {
            duplicateTools.add(t.name);
          }
          if (this.clientToolByName.has(t.name)) {
            duplicateTools.add(t.name);
          }
          this.clientToolByName.set(t.name, t);
        });
        if (duplicateTools.size > 0) {
          throw new errors_1.ValidationError(`Tools must have unique names. Duplicate tools: ${[
            ...duplicateTools
          ].join(", ")}.`);
        }
      }
      /**
       * Asks Bedrock for response using streaming version of Converse API.
       */
      async *askBedrockStreaming() {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const { modelId, systemPrompt, inferenceConfiguration } = this.event.modelConfiguration;
        const messages = await this.getEventMessagesAsBedrockMessages();
        let bedrockResponse;
        let blockIndex = 0;
        let lastBlockIndex = 0;
        let stopReason = "";
        const accumulatedTurnContent = [];
        do {
          const toolConfig = this.createToolConfiguration();
          const converseCommandInput = {
            modelId,
            messages: [...messages],
            system: [{ text: systemPrompt }],
            inferenceConfig: inferenceConfiguration,
            toolConfig
          };
          this.logger.info("Sending Bedrock Converse Stream request");
          this.logger.debug("Bedrock Converse Stream request:", converseCommandInput);
          bedrockResponse = await this.bedrockClient.send(new client_bedrock_runtime_1.ConverseStreamCommand(converseCommandInput));
          this.logger.info(`Received Bedrock Converse Stream response, requestId=${bedrockResponse.$metadata.requestId}`);
          if (!bedrockResponse.stream) {
            throw new Error("Bedrock response is missing stream");
          }
          let toolUseBlock;
          let clientToolsRequested = false;
          let text = "";
          let toolUseInput = "";
          let blockDeltaIndex = 0;
          let lastBlockDeltaIndex = 0;
          const accumulatedAssistantMessage = {
            role: void 0,
            content: []
          };
          for await (const chunk of bedrockResponse.stream) {
            this.logger.debug("Bedrock Converse Stream response chunk:", chunk);
            if (chunk.messageStart) {
              accumulatedAssistantMessage.role = chunk.messageStart.role;
            } else if (chunk.contentBlockStart) {
              blockDeltaIndex = 0;
              lastBlockDeltaIndex = 0;
              if ((_a = chunk.contentBlockStart.start) === null || _a === void 0 ? void 0 : _a.toolUse) {
                toolUseBlock = {
                  toolUse: {
                    ...(_b = chunk.contentBlockStart.start) === null || _b === void 0 ? void 0 : _b.toolUse,
                    input: void 0
                  }
                };
              }
            } else if (chunk.contentBlockDelta) {
              if ((_c = chunk.contentBlockDelta.delta) === null || _c === void 0 ? void 0 : _c.toolUse) {
                if (!chunk.contentBlockDelta.delta.toolUse.input) {
                  toolUseInput = "";
                } else {
                  toolUseInput += chunk.contentBlockDelta.delta.toolUse.input;
                }
              } else if ((_d = chunk.contentBlockDelta.delta) === null || _d === void 0 ? void 0 : _d.text) {
                text += chunk.contentBlockDelta.delta.text;
                yield {
                  accumulatedTurnContent: [...accumulatedTurnContent, { text }],
                  conversationId: this.event.conversationId,
                  associatedUserMessageId: this.event.currentMessageId,
                  contentBlockText: chunk.contentBlockDelta.delta.text,
                  contentBlockIndex: blockIndex,
                  contentBlockDeltaIndex: blockDeltaIndex
                };
                lastBlockDeltaIndex = blockDeltaIndex;
                blockDeltaIndex++;
              }
            } else if (chunk.contentBlockStop) {
              if (toolUseBlock) {
                if (toolUseInput) {
                  toolUseBlock.toolUse.input = JSON.parse(toolUseInput);
                } else {
                  toolUseBlock.toolUse.input = {};
                }
                (_e = accumulatedAssistantMessage.content) === null || _e === void 0 ? void 0 : _e.push(toolUseBlock);
                if (toolUseBlock.toolUse.name && this.clientToolByName.has(toolUseBlock.toolUse.name)) {
                  clientToolsRequested = true;
                  accumulatedTurnContent.push(toolUseBlock);
                  yield {
                    accumulatedTurnContent: [...accumulatedTurnContent],
                    conversationId: this.event.conversationId,
                    associatedUserMessageId: this.event.currentMessageId,
                    contentBlockIndex: blockIndex,
                    contentBlockToolUse: JSON.stringify(toolUseBlock)
                  };
                  lastBlockIndex = blockIndex;
                  blockIndex++;
                }
                toolUseBlock = void 0;
                toolUseInput = "";
              } else {
                (_f = accumulatedAssistantMessage.content) === null || _f === void 0 ? void 0 : _f.push({
                  text
                });
                accumulatedTurnContent.push({ text });
                yield {
                  accumulatedTurnContent: [...accumulatedTurnContent],
                  conversationId: this.event.conversationId,
                  associatedUserMessageId: this.event.currentMessageId,
                  contentBlockIndex: blockIndex,
                  contentBlockDoneAtIndex: lastBlockDeltaIndex
                };
                text = "";
                lastBlockIndex = blockIndex;
                blockIndex++;
              }
            } else if (chunk.messageStop) {
              stopReason = (_g = chunk.messageStop.stopReason) !== null && _g !== void 0 ? _g : "";
            }
          }
          this.logger.debug("Accumulated Bedrock Converse Stream response:", accumulatedAssistantMessage);
          if (clientToolsRequested) {
            yield {
              accumulatedTurnContent: [...accumulatedTurnContent],
              conversationId: this.event.conversationId,
              associatedUserMessageId: this.event.currentMessageId,
              contentBlockIndex: lastBlockIndex,
              stopReason
            };
            return;
          }
          messages.push(accumulatedAssistantMessage);
          if (stopReason === "tool_use") {
            const responseContentBlocks = (_h = accumulatedAssistantMessage.content) !== null && _h !== void 0 ? _h : [];
            const toolUseBlocks = responseContentBlocks.filter((block) => "toolUse" in block);
            const toolResponseContentBlocks = [];
            for (const responseContentBlock of toolUseBlocks) {
              const toolUseBlock2 = responseContentBlock;
              const toolResultContentBlock = await this.executeTool(toolUseBlock2);
              toolResponseContentBlocks.push(toolResultContentBlock);
            }
            messages.push({
              role: "user",
              content: toolResponseContentBlocks
            });
          }
        } while (stopReason === "tool_use");
        yield {
          accumulatedTurnContent: [...accumulatedTurnContent],
          conversationId: this.event.conversationId,
          associatedUserMessageId: this.event.currentMessageId,
          contentBlockIndex: lastBlockIndex,
          stopReason
        };
      }
    };
    exports2.BedrockConverseAdapter = BedrockConverseAdapter;
  }
});

// node_modules/@aws-amplify/graphql-api-construct/node_modules/@aws-amplify/ai-constructs/lib/conversation/runtime/lazy.js
var require_lazy = __commonJS({
  "node_modules/@aws-amplify/graphql-api-construct/node_modules/@aws-amplify/ai-constructs/lib/conversation/runtime/lazy.js"(exports2) {
    "use strict";
    var __classPrivateFieldGet = exports2 && exports2.__classPrivateFieldGet || function(receiver, state, kind, f) {
      if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
      if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
      return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
    };
    var __classPrivateFieldSet = exports2 && exports2.__classPrivateFieldSet || function(receiver, state, value, kind, f) {
      if (kind === "m") throw new TypeError("Private method is not writable");
      if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
      if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
      return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
    };
    var _Lazy_value;
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Lazy = void 0;
    var Lazy = class {
      /**
       * Creates lazy instance.
       */
      constructor(valueFactory) {
        this.valueFactory = valueFactory;
        _Lazy_value.set(this, void 0);
      }
      /**
       * Gets a value. Value is create at first access.
       */
      get value() {
        var _a;
        return __classPrivateFieldSet(this, _Lazy_value, (_a = __classPrivateFieldGet(this, _Lazy_value, "f")) !== null && _a !== void 0 ? _a : this.valueFactory(), "f");
      }
    };
    exports2.Lazy = Lazy;
    _Lazy_value = /* @__PURE__ */ new WeakMap();
  }
});

// node_modules/@aws-amplify/graphql-api-construct/node_modules/@aws-amplify/ai-constructs/lib/conversation/runtime/conversation_turn_executor.js
var require_conversation_turn_executor = __commonJS({
  "node_modules/@aws-amplify/graphql-api-construct/node_modules/@aws-amplify/ai-constructs/lib/conversation/runtime/conversation_turn_executor.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.handleConversationTurnEvent = exports2.ConversationTurnExecutor = void 0;
    var conversation_turn_response_sender_js_1 = require_conversation_turn_response_sender();
    var bedrock_converse_adapter_js_1 = require_bedrock_converse_adapter();
    var lazy_1 = require_lazy();
    var ConversationTurnExecutor = class {
      /**
       * Creates conversation turn executor.
       */
      constructor(event, additionalTools, responseSender = new lazy_1.Lazy(() => new conversation_turn_response_sender_js_1.ConversationTurnResponseSender(event)), bedrockConverseAdapter = new lazy_1.Lazy(() => new bedrock_converse_adapter_js_1.BedrockConverseAdapter(event, additionalTools)), logger = console) {
        this.event = event;
        this.responseSender = responseSender;
        this.bedrockConverseAdapter = bedrockConverseAdapter;
        this.logger = logger;
        this.execute = async () => {
          try {
            this.logger.log(`Handling conversation turn event, currentMessageId=${this.event.currentMessageId}, conversationId=${this.event.conversationId}`);
            this.logger.debug("Event received:", this.event);
            if (this.event.streamResponse) {
              const chunks = this.bedrockConverseAdapter.value.askBedrockStreaming();
              for await (const chunk of chunks) {
                await this.responseSender.value.sendResponseChunk(chunk);
              }
            } else {
              const assistantResponse = await this.bedrockConverseAdapter.value.askBedrock();
              await this.responseSender.value.sendResponse(assistantResponse);
            }
            this.logger.log(`Conversation turn event handled successfully, currentMessageId=${this.event.currentMessageId}, conversationId=${this.event.conversationId}`);
          } catch (e) {
            this.logger.error(`Failed to handle conversation turn event, currentMessageId=${this.event.currentMessageId}, conversationId=${this.event.conversationId}`, e);
            await this.tryForwardError(e);
            throw e;
          }
        };
        this.tryForwardError = async (e) => {
          try {
            let errorType = "UnknownError";
            let message;
            if (e instanceof Error) {
              errorType = e.name;
              message = e.message;
            } else {
              message = JSON.stringify(e);
            }
            await this.responseSender.value.sendErrors([{ errorType, message }]);
          } catch (e2) {
            this.logger.warn("Failed to send error mutation", e2);
          }
        };
      }
    };
    exports2.ConversationTurnExecutor = ConversationTurnExecutor;
    var handleConversationTurnEvent = async (event, props) => {
      var _a;
      await new ConversationTurnExecutor(event, (_a = props === null || props === void 0 ? void 0 : props.tools) !== null && _a !== void 0 ? _a : []).execute();
    };
    exports2.handleConversationTurnEvent = handleConversationTurnEvent;
  }
});

// node_modules/@aws-amplify/graphql-api-construct/node_modules/@aws-amplify/ai-constructs/lib/conversation/runtime/default_handler.js
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
var conversation_turn_executor_js_1 = require_conversation_turn_executor();
exports.handler = conversation_turn_executor_js_1.handleConversationTurnEvent;
