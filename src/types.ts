export interface Task {
  id: string;
  url: string;
  taskName: string;
  score: string;
  statement: string;
  constraints: string;
  input: string;
  output: string;
  samples: {
    input: string;
    output: string;
  }[];
}
