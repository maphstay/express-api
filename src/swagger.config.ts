import { AuthLoginDto } from '@modules/auth/dto/auth.login.dto';
import { CreateResourceDto } from '@modules/resource/dto/createResource.dto';
import { CreateTopicDto } from '@modules/topic/dto/createTopic.dto';
import { CreateUserDto } from '@modules/user/dto/createUser.dto';
import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import { z } from 'zod';
import { createDocument } from 'zod-openapi';
import { UnauthorizedResponse } from './bases/unauthorized';
import { ConflictResponse } from './bases/conflict';
import { NotFoundResponse } from './bases/notFound';
import { UpdateUserDto } from '@modules/user/dto/updateUser.dto';
import { User } from '@modules/user/user.entity';
import { Resource } from '@modules/resource/resource.entity';
import { TopicVersion } from '@modules/topic/topic.entity';
import { ForbiddenResponse } from './bases/forbidden';
import { PaginatedResponse } from '@bases/paginated';
import { BadRequestResponse } from '@bases/badRequest';

export const setupSwagger = (app: Express) => {
  const port = process.env.PORT || 3000;

  const document = createDocument({
    openapi: '3.1.0',
    info: {
      title: 'Express-API',
      version: '1.0.0',
      description: 'API documentation for Express-API',
    },
    servers: [{ url: `http://localhost:${port}/api` }],
    externalDocs: {
      url: `/docs.json`,
      description: 'Postman Collection',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using the Bearer scheme. Example: "Bearer {token}"',
        },
      },
      schemas: {
        AuthLoginDto,
        CreateUserDto,
        CreateTopicDto,
        CreateResourceDto,
      },
    },
    paths: {
      '/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'User login',
          requestBody: {
            content: {
              'application/json': { schema: AuthLoginDto },
            },
          },
          responses: {
            200: {
              description: 'JWT token generated successfully',
              content: {
                'application/json': {
                  schema: z.object({
                    accessToken: z.string().meta({ description: 'JWT access token', example: 'eyJ...' }),
                  }),
                },
              },
            },
            400: BadRequestResponse,
            401: UnauthorizedResponse,
          },
        },
      },

      '/users': {
        post: {
          tags: ['Users'],
          summary: 'Create a new user',
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              'application/json': { schema: CreateUserDto },
            },
          },
          responses: {
            201: {
              description: 'User created successfully',
              content: { 'application/json': { schema: User } },
            },
            400: BadRequestResponse,
            409: ConflictResponse('User with email: example@contoso.com already exists'),
          },
        },
        get: {
          tags: ['Users'],
          summary: 'Get paginated list of users',
          security: [{ bearerAuth: [] }],
          parameters: [
            z
              .string()
              .default('1')
              .meta({ param: { name: 'page', in: 'query', description: 'Page number' } }),
            z
              .string()
              .default('10')
              .meta({ param: { name: 'limit', in: 'query', description: 'Page size' } }),
          ],
          responses: {
            200: {
              description: 'Paginated users response',
              content: { 'application/json': { schema: PaginatedResponse(User, 'User') } },
            },
            400: BadRequestResponse,
            401: UnauthorizedResponse,
            403: ForbiddenResponse(`User role 'example' does not have permission to access this resource`),
          },
        },
      },
      '/users/{id}': {
        get: {
          tags: ['Users'],
          summary: 'Get user by ID',
          security: [{ bearerAuth: [] }],
          parameters: [z.string().meta({ param: { name: 'id', in: 'path', description: 'User ID' } })],
          responses: {
            200: { description: 'User details', content: { 'application/json': { schema: User } } },
            400: BadRequestResponse,
            401: UnauthorizedResponse,
            403: ForbiddenResponse(`User role 'example' does not have permission to access this resource`),
            404: NotFoundResponse('User with ID: 00000000-0000-0000-0000-000000000000 not found'),
          },
        },
        patch: {
          tags: ['Users'],
          summary: 'Update user by ID',
          security: [{ bearerAuth: [] }],
          parameters: [z.string().meta({ param: { name: 'id', in: 'path', description: 'User ID' } })],
          requestBody: {
            content: { 'application/json': { schema: UpdateUserDto } },
          },
          responses: {
            200: { description: 'Updated user', content: { 'application/json': { schema: User } } },
            401: UnauthorizedResponse,
            400: BadRequestResponse,
            403: ForbiddenResponse(`User role 'example' does not have permission to access this resource`),
          },
        },
        delete: {
          tags: ['Users'],
          summary: 'Delete user by ID',
          security: [{ bearerAuth: [] }],
          parameters: [z.string().meta({ param: { name: 'id', in: 'path', description: 'User ID' } })],
          responses: {
            200: {
              description: 'User removed successfully',
              content: { 'application/json': { schema: User } },
            },
            400: BadRequestResponse,
            401: UnauthorizedResponse,
            403: ForbiddenResponse(`User role 'example' does not have permission to access this resource`),
            404: NotFoundResponse(`User with ID: 00000000-0000-0000-0000-000000000000 not found`),
          },
        },
      },

      '/topics': {
        post: {
          tags: ['Topics'],
          summary: 'Create topic',
          security: [{ bearerAuth: [] }],
          requestBody: { content: { 'application/json': { schema: CreateTopicDto } } },
          responses: {
            201: { description: 'Topic created', content: { 'application/json': { schema: TopicVersion } } },
            400: BadRequestResponse,
            401: UnauthorizedResponse,
            403: ForbiddenResponse(`User role 'example' does not have permission to access this resource`),
            404: NotFoundResponse(`Topic with ID: 00000000-0000-0000-0000-000000000000 not found`),
          },
        },
        get: {
          tags: ['Topics'],
          summary: 'Get paginated topics',
          security: [{ bearerAuth: [] }],
          parameters: [
            z
              .string()
              .default('1')
              .meta({ param: { name: 'page', in: 'query', description: 'Page number' } }),
            z
              .string()
              .default('10')
              .meta({ param: { name: 'limit', in: 'query', description: 'Page size' } }),
          ],
          responses: {
            200: {
              description: 'List of topics',
              content: { 'application/json': { schema: PaginatedResponse(TopicVersion, 'TopicVersion') } },
            },
            400: BadRequestResponse,
            401: UnauthorizedResponse,
            403: ForbiddenResponse(`User role 'example' does not have permission to access this resource`),
          },
        },
      },
      '/topics/{id}': {
        get: {
          tags: ['Topics'],
          summary: 'Get topic by ID',
          security: [{ bearerAuth: [] }],
          parameters: [z.string().meta({ param: { name: 'id', in: 'path', description: 'Topic ID' } })],
          responses: {
            200: { description: 'Topic details', content: { 'application/json': { schema: TopicVersion } } },
            400: BadRequestResponse,
            401: UnauthorizedResponse,
            403: ForbiddenResponse(`User role 'example' does not have permission to access this resource`),
          },
        },
        put: {
          tags: ['Topics'],
          summary: 'Update topic by ID',
          security: [{ bearerAuth: [] }],
          parameters: [z.string().meta({ param: { name: 'id', in: 'path', description: 'Topic ID' } })],
          requestBody: { content: { 'application/json': { schema: CreateTopicDto } } },
          responses: {
            200: { description: 'Updated topic', content: { 'application/json': { schema: TopicVersion } } },
            400: BadRequestResponse,
            401: UnauthorizedResponse,
            403: ForbiddenResponse(`User role 'example' does not have permission to access this resource`),
          },
        },
        delete: {
          tags: ['Topics'],
          summary: 'Delete topic by ID',
          security: [{ bearerAuth: [] }],
          parameters: [z.string().meta({ param: { name: 'id', in: 'path', description: 'Topic ID' } })],
          responses: {
            204: { description: 'Topic deleted successfully' },
            400: BadRequestResponse,
            401: UnauthorizedResponse,
            403: ForbiddenResponse(`User role 'example' does not have permission to access this resource`),
          },
        },
      },
      '/topics/{id}/versions': {
        get: {
          tags: ['Topics'],
          summary: 'List all versions of a topic by ID',
          security: [{ bearerAuth: [] }],
          parameters: [z.string().meta({ param: { name: 'id', in: 'path', description: 'Topic ID' } })],
          responses: {
            200: {
              description: 'List of topic versions',
              content: {
                'application/json': {
                  schema: z.array(TopicVersion),
                },
              },
            },
            400: BadRequestResponse,
            401: UnauthorizedResponse,
            403: ForbiddenResponse(`User role 'example' does not have permission to access this resource`),
          },
        },
      },
      '/topics/shortest/path': {
        get: {
          tags: ['Topics'],
          summary: 'Get the shortest path between topics',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'List of topic versions',
              content: {
                'application/json': {
                  schema: z.array(
                    z.uuid().meta({
                      description: 'Array of topic version IDs',
                      example: ['550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440111'],
                    }),
                  ),
                },
              },
            },
            400: BadRequestResponse,
            401: UnauthorizedResponse,
          },
        },
      },

      '/resources': {
        post: {
          tags: ['Resources'],
          summary: 'Create resource',
          security: [{ bearerAuth: [] }],
          requestBody: { content: { 'application/json': { schema: CreateResourceDto } } },
          responses: {
            201: { description: 'Resource created', content: { 'application/json': { schema: Resource } } },
            400: BadRequestResponse,
            401: UnauthorizedResponse,
            403: ForbiddenResponse(`User role 'example' does not have permission to access this resource`),
            404: NotFoundResponse(`Resource with ID: 00000000-0000-0000-0000-000000000000 not found`),
          },
        },
        get: {
          tags: ['Resources'],
          summary: 'Get paginated resources',
          security: [{ bearerAuth: [] }],
          parameters: [
            z
              .string()
              .default('1')
              .meta({ param: { name: 'page', in: 'query', description: 'Page number' } }),
            z
              .string()
              .default('10')
              .meta({ param: { name: 'limit', in: 'query', description: 'Page size' } }),
          ],
          responses: {
            200: {
              description: 'List of resources',
              content: { 'application/json': { schema: PaginatedResponse(Resource, 'Resource') } },
            },
            400: BadRequestResponse,
            401: UnauthorizedResponse,
            403: ForbiddenResponse(`User role 'example' does not have permission to access this resource`),
          },
        },
      },
      '/resources/{id}': {
        get: {
          tags: ['Resources'],
          summary: 'Get resource by ID',
          security: [{ bearerAuth: [] }],
          parameters: [z.string().meta({ param: { name: 'id', in: 'path', description: 'Resource ID' } })],
          responses: {
            200: { description: 'Resource details', content: { 'application/json': { schema: Resource } } },
            400: BadRequestResponse,
            401: UnauthorizedResponse,
            403: ForbiddenResponse(`User role 'example' does not have permission to access this resource`),
          },
        },
        patch: {
          tags: ['Resources'],
          summary: 'Update resource by ID',
          security: [{ bearerAuth: [] }],
          parameters: [z.string().meta({ param: { name: 'id', in: 'path', description: 'Resource ID' } })],
          requestBody: { content: { 'application/json': { schema: CreateResourceDto } } },
          responses: {
            200: { description: 'Updated resource', content: { 'application/json': { schema: Resource } } },
            400: BadRequestResponse,
            401: UnauthorizedResponse,
            403: ForbiddenResponse(`User role 'example' does not have permission to access this resource`),
          },
        },
        delete: {
          tags: ['Resources'],
          summary: 'Delete resource by ID',
          security: [{ bearerAuth: [] }],
          parameters: [z.string().meta({ param: { name: 'id', in: 'path', description: 'Resource ID' } })],
          responses: {
            204: { description: 'Resource deleted successfully' },
            400: BadRequestResponse,
            401: UnauthorizedResponse,
            403: ForbiddenResponse(`User role 'example' does not have permission to access this resource`),
          },
        },
      },
    },
  });

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(document));
  app.get('/docs.json', (_, res) => {
    res.header('Content-Type', 'application/json');
    res.send(document);
  });
};
