export type Entry = {
  id: number;
  kind: 'console' | 'network' | 'element';
  level: string;
  label: string;
  detail: string;
  time: string;
};
