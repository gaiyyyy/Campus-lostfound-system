function getTime() {
  return new Date().toISOString()
}

function stringifyLog(payload) {
  return JSON.stringify(payload)
}

function buildPayload(level, message, data, error) {
  const payload = {
    time: getTime(),
    level,
    message,
  }

  if (data !== undefined && data !== null) {
    if (typeof data === 'object' && !Array.isArray(data)) {
      Object.assign(payload, data)
    } else {
      payload.data = data
    }
  }

  if (error instanceof Error) {
    payload.errorName = error.name
    payload.stack = error.stack
  }

  return payload
}

const logger = {
  info(message, data) {
    const payload = buildPayload('info', message, data)
    console.info(stringifyLog(payload))
  },
  warn(message, data) {
    const payload = buildPayload('warn', message, data)
    console.warn(stringifyLog(payload))
  },
  error(message, errorOrData, maybeData) {
    const hasError = errorOrData instanceof Error
    const error = hasError ? errorOrData : undefined
    const data = hasError ? maybeData : errorOrData
    const payload = buildPayload('error', message, data, error)
    console.error(stringifyLog(payload))
  },
}

export default logger
