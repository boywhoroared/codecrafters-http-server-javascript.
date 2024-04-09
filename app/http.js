const HTTP_STATUS_PREAMBLE = "HTTP/1.1"
const HTTP_EOL = "\r\n"

const HTTP_STATUS_CODE = {
  200: "200 OK",
  201: "201 Created",
  404: "404 Not Found",
  500: "500 Internal Server Error"
}

const httpStatus = (status) => {
  return `${HTTP_STATUS_PREAMBLE} ${HTTP_STATUS_CODE[status]}${HTTP_EOL}`
}

const httpStatusLine = (status) => {
  return `${HTTP_STATUS_PREAMBLE} ${HTTP_STATUS_CODE[status]}`
}

/**
 * 
 * @param {string} request 
 * @return {{ requestLine: {method:string, requestUri:string, httpVersion:string, valid:boolean}, headers:{[name:string]:string}}}
 */
const parseHttpRequest = (request) => {
  // TODO This would have to be adjusted to handle larger requests
  const lines = request.split(HTTP_EOL)

  // First line is the request control data
  const requestLine = lines.slice(0,1)[0]

  // The lines immediately after this are the headers until we reach a blank line
  const frameSeparatorIndex = lines.findIndex((line) => line == '')
  const headerLines = lines.slice(1, frameSeparatorIndex).filter(l => l !== '')

  // After the headers, is blank line followed by the request body
  const bodyLines = lines.slice(frameSeparatorIndex + 1)
  const body = (bodyLines.length >= 1) ? bodyLines.join("") : "";

  return { 
    requestLine: parseRequestLine(requestLine), 
    headers: parseHeaders(headerLines),
    body 
  }
}

const isValidToken = (text) => {
  return (text !== undefined && text !== HTTP_EOL && text !== null && text !== "")
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
  return `${text}${HTTP_EOL}`
}

/**
 * 
 * @param {string|number} status 
 * @param {string} content 
 * @returns 
 */
function httpResponse(status, headers, content) {
  const response = [httpStatusLine(status)]
  .concat(
    headers ? headers : [],
    // insert blank line between headers and content
    content ? ['', content] : ['']
  )
  .map(end)
  .join("")

  return response
}

function contentHeaders(content) {
  return [
    httpHeader('Content-Type', 'text/plain'),
    httpHeader('Content-Length', content.length)
  ]
}

module.exports = {
  httpStatus,
  parseHttpRequest,
  httpResponse,
  contentHeaders,
  httpHeader,
  HTTP_EOL
}
