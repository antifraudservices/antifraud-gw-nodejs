import { QueueAdapter } from "./queue";

export class QueueAdapterMem implements QueueAdapter {
    private queue: { name: string; data: any; priority: number }[] = [];
  
    async addJob(name: string, data: any, priority: number): Promise<void> {
      this.queue.push({ name, data, priority });
      // Sort by priority (less value = hightest priority)
      this.queue.sort((a, b) => a.priority - b.priority);
    }
  
    async processJobs(): Promise<void> {
      while (this.queue.length > 0) {
        const job = this.queue.shift();
        if (job) {
          console.log(`Processing job: ${job.name}, Data: ${JSON.stringify(job.data)}, Priority: ${job.priority}`);
          await ChainCodeProcessor.process(job.data);
          console.log(`Finished processing job: ${job.name}`);
        }
      }
    }
  }
  