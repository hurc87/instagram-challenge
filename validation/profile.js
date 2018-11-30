const Validator = require('validator');
const isEmpty = require ('./is-empty');

module.exports = function validateProfileInput(data){
  let errors = {};

  data.username = !isEmpty(data.username) ? data.username : '';

  if(!Validator.isLength(data.username, { min: 2, max: 40})) {
    errors.username = 'Username needs to be between 2 and 40 Characters';
  }

  if(Validator.isEmpty(data.username)) {
    errors.username = 'Username is required';
  }

  return {
    errors,
    isValid: isEmpty(errors)
  }
}
