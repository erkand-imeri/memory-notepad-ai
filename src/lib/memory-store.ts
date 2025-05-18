type MemoryEntry = {
  text: string;
  vector: number[];
};

const memory: MemoryEntry[] = [];

export function store(text: string, vector: number[]) {
  memory.push({ text, vector });
}

export function getAll(): MemoryEntry[] {
  return memory;
}
