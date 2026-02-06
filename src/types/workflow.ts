export interface ProcessDetailProps<T = any> {
  data: T | null;
  task: FlowableTask;
  loading?: boolean;
}

export type FlowableTask = {
  id: string;
  name: string;
  assignee: string;
  createTime: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  processInstanceId: string;
  processDefinitionName: string;
  description?: string;
  variables?: Record<string, any>;
  comments: FlowableComments[];
};

export type FlowableComments = {
  approverUsername: string;
  timestamp: string;
  commentText: string;
  taskName: string;
  taskId: string;
};
