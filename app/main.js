const net = require("net");
const fs = require("fs");
const path = require("path");

const { httpStatus, httpResponse, parseHttpRequest, contentHeaders, httpHeader, HTTP_EOL } = require("./http")

const getArgs = () => {
  return process.argv
}

/**
 * 
 * @param {string[]} args 
 * @returns {{directory?:string}}
 */
const getOptions = (args) => {
  if (args && args.length >= 2) {
    const parameters = args.slice(2)

    let options = {}
    while (parameters.length != 0 && (parameters.length % 2) == 0) {
      const name = parameters.shift().replace("--", "")
      const value = parameters.shift()
      options[name] = value; 
    }

    return options;
  }

  return {}
}

const options = getOptions(getArgs());
const isServingFiles = options.directory ? true : false;

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

/**
 * 
 * @param {string} uri 
 * @returns 
 */
const isEchoRequest = (uri) => {
  return uri.startsWith("/echo/")
}

const isAgentRequest = (uri) => {
  return uri == "/user-agent"
}

const fileExists = (path) => {
  return fs.existsSync(path)
}

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {

  const writeSocket = (socket, data) => {
    socket.write(data, 'utf-8', (err) => {
        if (err) {
          console.log(err)
        }
      })
    socket.end();
  }

  socket.on("close", () => {
    socket.end();
    server.close();
  });

  socket.on("data", (data) => {
    const decodedBuffer = data.toString()

    const request = parseHttpRequest(decodedBuffer)

    if (request.requestLine.valid) {
      const requestUri = request.requestLine.requestUri;

      if (requestUri == "/") {
        // writeSocket(socket, `${httpStatus(200)}${HTTP_EOL}`);
        writeSocket(socket, httpResponse(200));
      }
      else if (isEchoRequest(requestUri)) {
        const content = requestUri.substring(
          "/echo/".length
        )
        writeSocket(socket, httpResponse(200, contentHeaders(content), content))
      }
      else if (isAgentRequest(requestUri)) {
        const content = request.headers['User-Agent']
        writeSocket(socket, httpResponse(200, contentHeaders(content), content));
      } 
      else if (isServingFiles && requestUri.startsWith('/files/')) {
        console.log("serving files")
        const directory = options.directory ? options.directory : process.cwd
        const fileName = requestUri.substring("/files/".length)
        const filePath = path.join(directory, fileName)
        const exists = fileExists(filePath) 
        console.log(directory, fileName, filePath, exists)

        if (exists) {
          const buffer = fs.readFileSync(filePath)
          const content = buffer.toString()
          const headers = [
            httpHeader("Content-Type", "application/octet-stream"),
            httpHeader("Content-Length", content.length)
          ]

          writeSocket(socket, httpResponse(200, headers, content))
        } else {
          writeSocket(socket, httpResponse(404));
        }
      }
      else {
        writeSocket(socket, httpResponse(404));
      }
    } else {
      writeSocket(socket, `${httpStatus(500)}${HTTP_EOL}`);
    }

  })
});

server.listen(4221, "localhost");
