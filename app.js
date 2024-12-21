const express = require('express')
// import { demo } from './Utils/babel_Utils.js';

const app = express();
const { autoComment } = require('../Auto_commenter/Utils/babel_Utils');  // Import the function

const code = `
  function API_call(req , res) {
   const axios = require('axios');

let config = {
  method: 'get',
  maxBodyLength: Infinity,
  url: 'GET ',
};
let result ;
axios.request(config)
.then((response) => {
    result = response.data;
  console.log(JSON.stringify(response.data));
})
.catch((error) => {
  console.log(error);
});

  return result;
  }
  
`;

const modifiedCode = autoComment(code);  // Call the function
console.log(modifiedCode);


app.listen(3000, () => {
    console.log('App listening at port 3000');
})