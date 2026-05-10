const CircuitBreaker = require("opossum");

// Retry wrapper for fetch
const fetchWithRetry = async (url, options = {}, retries = 3, backoff = 500) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok && response.status >= 500) {
        throw new Error(`Server error: ${response.status}`);
      }
      return response; 
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(res => setTimeout(res, backoff * Math.pow(2, i)));
    }
  }
};

const createHttpCircuitBreaker = () => {
  const options = {
    timeout: 10000, // 10 seconds
    errorThresholdPercentage: 50, // Open circuit when 50% fail
    resetTimeout: 30000 // Retry after 30 seconds
  };
  
  const breaker = new CircuitBreaker(fetchWithRetry, options);
  
  breaker.on("open", () => console.warn(`Circuit Breaker OPENED`));
  breaker.on("halfOpen", () => console.warn(`Circuit Breaker HALF-OPENED`));
  breaker.on("close", () => console.info(`Circuit Breaker CLOSED`));
  
  return breaker;
};

module.exports = {
  fetchWithRetry,
  createHttpCircuitBreaker
};
