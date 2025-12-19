const DELAY = 3000;
const MAX_DELAY = 30000;

export class Resilience {
  constructor() {
    this.attempts = 1;
    this.failures = [];
    this.failing = false;
    this.retryDelayMs = DELAY;

    this.detectFailure = this._detectFailure.bind(this);
  }

  trackFailure(timestamp) {
    this.failures.push(timestamp);
    return this.determineConsistentFailing();
  }

  determineConsistentFailing() {
    if (this.failures.length < 3) return false;

    const last = this.failures[this.failures.length - 1];
    const prev = this.failures[this.failures.length - 3];

    const isFailing = (last - prev) / 1000 <= 30;

    this.updateFailStatus(isFailing);

    return this.failing;
  }

  updateFailStatus(isFailing) {
    if (isFailing && this.failing) {
      this.attempts++;
      this.increaseRetryDelay();
    }

    this.failing = isFailing;
  }

  increaseRetryDelay() {
    this.retryDelayMs = Math.min(DELAY * 2 ** this.attempts / 4, MAX_DELAY);
  }

  shouldRetry() {
    const lastFailure = this.failures[this.failures.length - 1];
    return Date.now() - lastFailure >= this.retryDelayMs;
  }

  _detectFailure(response) {
    if (response.status === 503) {
      this.trackFailure(Date.now());
    } else if (response.status === 200) {
      this.reset();
    }

    return response;
  }

  reset() {
    this.failing = false;
    this.failures = [];
    this.attempts = 1;
    this.retryDelayMs = DELAY;
  }
}
