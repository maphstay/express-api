export interface TopicVersion {
  id: string;
  topicId: string;
  name: string;
  content: string;
  version: number;
  parentTopicId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface TreeNode extends TopicVersion {
  children: TreeNode[];
}
