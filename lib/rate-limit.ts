type RateLimitRecord = {
  count: number;
  resetTime: number;
};

const trackers = new Map<string, RateLimitRecord>();

/**
 * In-memory rate limiter with sliding window / expiry
 * @param key unique identifier (e.g. IP + endpoint)
 * @param limit maximum allowed attempts within window
 * @param windowMs time window in milliseconds (default: 60,000ms = 1 minute)
 */
export function checkRateLimit(
  key: string,
  limit: number = 10,
  windowMs: number = 60000
): { success: boolean; remaining: number; resetInSeconds: number } {
  const now = Date.now();
  const record = trackers.get(key);

  if (!record || now > record.resetTime) {
    trackers.set(key, { count: 1, resetTime: now + windowMs });
    return {
      success: true,
      remaining: limit - 1,
      resetInSeconds: Math.ceil(windowMs / 1000),
    };
  }

  if (record.count >= limit) {
    return {
      success: false,
      remaining: 0,
      resetInSeconds: Math.ceil((record.resetTime - now) / 1000),
    };
  }

  record.count += 1;
  return {
    success: true,
    remaining: limit - record.count,
    resetInSeconds: Math.ceil((record.resetTime - now) / 1000),
  };
}

// Clean up expired entries every 5 minutes to prevent memory leak
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of trackers.entries()) {
      if (now > value.resetTime) {
        trackers.delete(key);
      }
    }
  }, 300000);
}
