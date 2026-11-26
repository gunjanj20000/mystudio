import type { RenderJobRequest, RenderJobProgress } from '../../types';

export class ServerRenderer {
  private activeJobId: string | null = null;
  private pollInterval: any = null;

  public async startRender(
    request: RenderJobRequest,
    onProgress: (progress: RenderJobProgress) => void
  ): Promise<string> {
    const res = await fetch('/api/render', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });

    if (!res.ok) {
      throw new Error(`Failed to start render: ${res.statusText}`);
    }

    const initData = await res.json();
    this.activeJobId = initData.jobId;

    return new Promise((resolve, reject) => {
      this.pollInterval = setInterval(async () => {
        if (!this.activeJobId) {
          clearInterval(this.pollInterval);
          return;
        }

        try {
          const statusRes = await fetch(`/api/render/status/${this.activeJobId}`);
          if (!statusRes.ok) return;

          const job: RenderJobProgress = await statusRes.json();
          onProgress(job);

          if (job.status === 'completed' && job.outputVideoUrl) {
            clearInterval(this.pollInterval);
            this.activeJobId = null;
            resolve(job.outputVideoUrl);
          } else if (job.status === 'error' || job.status === 'cancelled') {
            clearInterval(this.pollInterval);
            this.activeJobId = null;
            reject(new Error(job.errorMessage || job.message || 'Render failed'));
          }
        } catch (err) {
          console.error('Error polling render status:', err);
        }
      }, 1000);
    });
  }

  public async cancelRender(): Promise<void> {
    if (!this.activeJobId) return;
    try {
      await fetch(`/api/render/cancel/${this.activeJobId}`, { method: 'POST' });
    } catch (_) {}
    if (this.pollInterval) clearInterval(this.pollInterval);
    this.activeJobId = null;
  }
}

export const serverRenderer = new ServerRenderer();
