const net = require("net");
const fs = require("fs");
const path = require("path");

const {
  httpStatus,
  httpResponse,
  parseHttpRequest,
  contentHeaders,
  httpHeader,
  HTTP_EOL,
} = require("./http");

const getArgs = () => {
  return process.argv;
};

/**
 *
 * @param {string[]} args
 * @returns {{directory?:string}}
 */
const getOptions = (args) => {
  if (args && args.length >= 2) {
    const parameters = args.slice(2);

    let options = {};
    while (parameters.length != 0 && parameters.length % 2 == 0) {
      const name = parameters.shift().replace("--", "");
      const value = parameters.shift();
      options[name] = value;
    }

    return options;
  }

  return {};
};

const options = Object.assign(
  { directory: process.cwd() },
  getOptions(getArgs())
);
const isServingFiles = options.directory ? true : false;

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

/**
 *
 * @param {string} uri
 * @returns
 */
const isEchoRequest = (uri) => {
  return uri.startsWith("/echo/");
};

const isAgentRequest = (uri) => {
  return uri == "/user-agent";
};

const fileExists = (path) => {
  return fs.existsSync(path);
};

const writeSocket = (socket, data) => {
  socket.write(data, "utf-8", (err) => {
    if (err) {
      console.log(err);
    }
  });
  socket.end();
};

const handleHttpRequest = (socket, request) => {
  if (request.requestLine.valid) {
    const method = request.requestLine.method.toLowerCase();
    const requestUri = request.requestLine.requestUri;
    const requestHeaders = request.headers;

    if (method == "post") {
      if (requestUri.startsWith("/files/")) {
        
      }
    } else if (requestUri == "/") {
      // writeSocket(socket, `${httpStatus(200)}${HTTP_EOL}`);
      writeSocket(socket, httpResponse(200));
    } else if (isEchoRequest(requestUri)) {
      const content = requestUri.substring("/echo/".length);
      writeSocket(socket, httpResponse(200, contentHeaders(content), content));
    } else if (isAgentRequest(requestUri)) {
      const content = request.headers["User-Agent"];
      writeSocket(socket, httpResponse(200, contentHeaders(content), content));
    } else if (isServingFiles && requestUri.startsWith("/files/")) {
      const directory = options.directory ? options.directory : process.cwd;
      const fileName = requestUri.substring("/files/".length);
      const filePath = path.join(directory, fileName);
      const exists = fileExists(filePath);
      console.log(directory, fileName, filePath, exists);

      if (exists) {
        const buffer = fs.readFileSync(filePath);
        const content = buffer.toString();
        const headers = [
          httpHeader("Content-Type", "application/octet-stream"),
          httpHeader("Content-Length", content.length),
        ];

        writeSocket(socket, httpResponse(200, headers, content));
      } else {
        writeSocket(socket, httpResponse(404));
      }
    } else {
      writeSocket(socket, httpResponse(404));
    }
  } else {
    writeSocket(socket, `${httpStatus(500)}${HTTP_EOL}`);
  }
};

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
  const handleRequestState = {

  }

  socket.on("close", () => {
    console.log("[close]");
    socket.end();
    server.close();
  });

  socket.on("end", () => {
    console.log("[end]");
  });

  socket.on("data", (data) => {
    const decodedBuffer = data.toString();

    // TODO: Data needs to be handled properly.
    // The socket doesn't neccessarily receive all of the data in on one event
    // That is, for an HTTP request, the data even can fire multiple times.
    console.log("[on data]", data, decodedBuffer);
    const request = parseHttpRequest(decodedBuffer);

    handleHttpRequest(socket, request);
  });
});

server.listen(4221, "localhost");
