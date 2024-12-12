const fs = require('fs'); // File stytem module - to read and write files.
const http = require('http');
const url = require('url');
/////////////////////////////////////////////////////////////////////////
// const hello = 'Hello World';
// console.log(hello);
// // Output: Hello World
// // Blcoking Synchronous way
// const textInput = fs.readFileSync('./txt/input.txt', 'utf-8');

// const textOutput = `This is what we know about the avocado: ${textInput}.\nCreated on ${new Intl.DateTimeFormat(
//   'en-UK',
//   {
//     hour: 'numeric',
//     minute: 'numeric',
//     day: 'numeric',
//     month: 'numeric',
//     year: 'numeric',
//   }
// ).format(Date.now())}`;
// fs.writeFileSync('./txt/output.txt', textOutput);

// // Non-blocking Asynchronous way
// fs.readFile('./txt/start.txt', 'utf-8', (err, data) => {
//   // Usually error is the first argument in Node.js
//   console.log(data);
// }).then(() => {});

// const promisifiedFs = function (path) {
//   return new Promise((resolve, reject) => {
//     fs.readFile(path, 'utf-8', (err, data) => {
//       if (err) reject('File not found');
//       resolve(data);
//     });
//   });
// };

// promisifiedFs('./txt/start.txt')
//   .then(data => {
//     console.log('Content of start.txt:', data);
//     // Use the data from the first file to read the second file
//     return promisifiedFs(`./txt/${data}.txt`);
//   })
//   .then(data2 => {
//     console.log('Content of the second file:', data2);
//     // Read another file
//     return promisifiedFs('./txt/final.txt');
//   })
//   .then(data3 => {
//     console.log('Content of final.txt:', data3);
//   })
//   .catch(err => {
//     console.error('Error reading files:', err);
//   });
/////////////////////////////////////////////////////////////////////////

// SERVER

const replaceTemplate = (template, product) => {
  let output = template.replace(/{%PRODUCTNAME%}/g, product.productName); // using regular expression to replace all the occurences of the string, g = global
  output = output.replace(/{%IMAGE%}/g, product.image);
  output = output.replace(/{%PRICE%}/g, product.price);
  output = output.replace(/{%FROM%}/g, product.from);
  output = output.replace(/{%NUTRIENTS%}/g, product.nutrients);
  output = output.replace(/{%QUANTITY%}/g, product.quantity);
  output = output.replace(/{%DESCRIPTION%}/g, product.description);
  output = output.replace(/{%ID%}/g, product.id);
  if (!product.organic)
    output = output.replace(/{%NOT_ORGANIC%}/g, 'not-organic'); // remember its inside the element class - it would replace the class name
  return output;
};

const templateOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  'utf-8'
);
// __dirname is the directory name of the current module
const templateCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  'utf-8'
);

const templateProduct = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  'utf-8'
);

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
// we use readFileSync because we cannot read the data right away, so we want to first load the data.

const dataObj = JSON.parse(data);

const server = http.createServer((req, res) => {
  // req - request, res - response - two very fundamental arguments
  const { query, pathname } = url.parse(req.url, true);
  // Overview page
  if (pathname === '/' || pathname === '/overview') {
    res.writeHead(200, {
      'Content-type': 'text/html',
    });

    const cardsHtml = dataObj
      .map(el => replaceTemplate(templateCard, el))
      .join('');
    const output = templateOverview.replace('{%PRODUCT_CARDS%}', cardsHtml); // replace the placeholder with the actual data
    res.end(output);

    // Product page
  } else if (pathname === '/product') {
    const product = dataObj[query.id];
    const output = replaceTemplate(templateProduct, product);
    res.writeHead(200, {
      'Content-type': 'text/html',
    });
    res.end(output);

    // API
  } else if (pathname === '/api') {
    res.writeHead(200, {
      'Content-type': 'application/json',
    });
    res.end(data);

    // Not found
  } else {
    res.writeHead(404, {
      'Content-type': 'text/html',
      'my-own-header': 'hello-world',
    });
    res.end('<h1>Page not found</h1>');
  }
});

server.listen(8000, 'localhost', () => {
  console.log('Listening to requests on port 8000');
});
