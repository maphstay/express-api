import { TopicVersion, TreeNode } from './topic.entity';

describe('TopicVersion schema', () => {
  it('should parse a valid topic version', () => {
    const validData = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      topicId: '660e8400-e29b-41d4-a716-446655440111',
      name: 'Introduction to Algebra',
      content: 'This chapter covers basic algebra concepts...',
      version: 1,
      createdAt: '2025-09-24T12:00:00Z',
      updatedAt: '2025-09-25T12:00:00Z',
      parentTopicId: '770e8400-e29b-41d4-a716-446655440222',
    };

    expect(() => TopicVersion.parse(validData)).not.toThrow();
  });

  it('should throw if required fields are missing', () => {
    const invalidData = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      topicId: '660e8400-e29b-41d4-a716-446655440111',
    };

    expect(() => TopicVersion.parse(invalidData)).toThrow();
  });
});

describe('TreeNode schema', () => {
  it('should parse a valid tree node with children and resource', () => {
    const validTreeNode = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      topicId: '660e8400-e29b-41d4-a716-446655440111',
      name: 'Introduction to Algebra',
      content: 'This chapter covers basic algebra concepts...',
      version: 1,
      createdAt: '2025-09-24T12:00:00Z',
      children: [],
      resource: null,
    };

    expect(() => TreeNode.parse(validTreeNode)).not.toThrow();
  });

  it('should parse nested children recursively', () => {
    const nestedTreeNode = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      topicId: '660e8400-e29b-41d4-a716-446655440111',
      name: 'Root Topic',
      content: 'Root content',
      version: 1,
      createdAt: '2025-09-24T12:00:00Z',
      children: [
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          topicId: '660e8400-e29b-41d4-a716-446655440111',
          name: 'Child Topic',
          content: 'Child content',
          version: 1,
          createdAt: '2025-09-24T12:00:00Z',
          children: [],
          resource: null,
        },
      ],
      resource: null,
    };

    expect(() => TreeNode.parse(nestedTreeNode)).not.toThrow();
  });

  it('should throw if children structure is invalid', () => {
    const invalidTreeNode = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      topicId: '660e8400-e29b-41d4-a716-446655440111',
      name: 'Root Topic',
      content: 'Root content',
      version: 1,
      createdAt: '2025-09-24T12:00:00Z',
      children: [{}],
      resource: null,
    };

    expect(() => TreeNode.parse(invalidTreeNode)).toThrow();
  });
});
