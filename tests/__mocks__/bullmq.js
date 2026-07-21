export class Queue {
  constructor(name, opts) {
    this.name = name;
    this.opts = opts;
    this.add = jest.fn().mockResolvedValue({ id: 'mock-job-id' });
    this.close = jest.fn().mockResolvedValue();
  }
}

export const Worker = jest.fn().mockImplementation((name, processor, opts) => {
  return {
    name,
    processor,
    opts,
    on: jest.fn(),
    close: jest.fn().mockResolvedValue(),
  };
});
