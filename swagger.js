const swaggerAutogen = require('swagger-autogen')();

const doc = {
    info : {
        title: "Contacts API",
        description: "Get, Post, Push, Delete contacts to Mongo DB"
    },
    host: 'https://cse-342-project-1.onrender.com'
};

const outputFile = './swagger-output.json';
const routes = ['./server.js'];


swaggerAutogen(outputFile, routes, doc);