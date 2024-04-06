const HTTP_STATUS_PREAMBLE = "HTTP/1.1"
const END = "\r\n"

const HTTP_STATUS_CODE = {
  200: "200 OK",
  404: "404 NOT FOUND"
}

const httpStatus = (status) => {
  return `${HTTP_STATUS_PREAMBLE} ${HTTP_STATUS_CODE[status]}${END}`
}

/**
 * 
 * @param {string} request 
 */
const parseHttpRequest = (request) => {
  const lines = request.split(END)
  const requestLine = lines.shift()
  const headerLines = lines.filter(l => l !== '')

  return { 
    requestLine: parseRequestLine(requestLine), 
    headers: parseHeaders(headerLines) 
  }
}

const isValidToken = (text) => {
  return (text !== undefined && text !== END && text !== null && text !== "")
}

/**
 * 
 * @param {string} text 
 */
function parseRequestLine(text) {
  const [method, requestUri, httpVersion] = text.split(" ");
  const isValidRequest =  [method, requestUri, httpVersion].every(isValidToken)

  return isValidRequest 
   ? { method, requestUri, httpVersion, valid: true }
   : { method, requestUri, httpVersion, valid: false }
}

function parseHeaders(headerLines) {
  return headerLines.map(parseHeader)
}

/**
 * @param {string} text
 */
function parseHeader (text) {
  const [name, value] = text.split(": ");
  return {name, value};
}

module.exports = {
  httpStatus,
  parseHttpRequest,
  END
}
