export interface Task {
  id: string;
  url: string;
  taskName: string;
  score: string;
  statement: string;
  constraints: string;
  input: string;
  output: string;
  samples: Sample[];
}

export interface Sample {
  input: string;
  output: string;
}
