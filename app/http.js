const HTTP_STATUS_PREAMBLE = "HTTP/1.1"
const END = "\r\n"

const HTTP_STATUS_CODE = {
  200: "200 OK",
  404: "404 Not Found",
  500: "500 Internal Server Error"
}

const httpStatus = (status) => {
  return `${HTTP_STATUS_PREAMBLE} ${HTTP_STATUS_CODE[status]}${END}`
}

/**
 * 
 * @param {string} request 
 * @return {{ requestLine: {method:string, requestUri:string, httpVersion:string, valid:boolean}, headers: [name:string]:string}}
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
  return headerLines.reduce((headers, line) => {
    const parsedHeader = parseHeader(line)
    headers[parsedHeader.name] = parsedHeader.value;
    return headers
  }, {})

}

/**
 * @param {string} text
 */
function parseHeader (text) {
  const [name, value] = text.split(": ");
  return {name, value};
}

function httpHeader(name, value) {
  return `${name}: ${value}`
}

function end(text) {
  return `${text}${END}`
}

/**
 * 
 * @param {string|number} status 
 * @param {string} content 
 * @returns 
 */
function httpResponse(status, content) {
  // TODO: The issue is that `httpStatus` includes END already
  return [httpStatus(status)].concat([
    httpHeader('Content-Type', 'text/plain'),
    httpHeader('Content-Length', content.length),
    '',
    content
  ].join(END)).join("")
}

module.exports = {
  httpStatus,
  parseHttpRequest,
  httpResponse,
  END
}
