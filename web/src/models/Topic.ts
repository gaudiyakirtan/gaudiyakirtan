export interface ITopic {
  name: string;
}

export class Topic implements ITopic {
  name: string;
  
  constructor(name: string) {
    this.name = name;
  }
  
  // Generate a pseudo-random count based on the topic name length for demo purposes
  get demoSongCount(): number {
    return (this.name.length * 3) % 20 + 1;
  }
}