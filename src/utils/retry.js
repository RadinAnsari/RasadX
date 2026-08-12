export async function retry(
  operation,
  options = {}
) {
  const {
    retries = 3,
    delay = 2000,
    shouldRetry = () => true,
  } = options;

  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (
        attempt === retries ||
        !shouldRetry(error)
      ) {
        break;
      }

      const waitTime =
        delay * Math.pow(2, attempt);

      console.log(
        `Retry ${attempt + 1}/${retries} in ${waitTime}ms...`
      );

      await sleep(waitTime);
    }
  }

  throw lastError;
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}