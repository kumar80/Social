//VALIDATORS to check cre dentials 
var validator = require("email-validator");
var passwordValidator = require('password-validator');
var schema = new passwordValidator();
schema
.is().min(8)                // Minimum length 8
.has().not().spaces()       // Should not have spaces; 


exports.validateSignup = (data) =>{
      //checking inputs
      let errors = {};
  
      if(!validator.validate(data.email))  errors.email =  'Enter a valid email id';
      if(!schema.validate(data.password)){
          errors.password = 'Minimum length 8 && Should not have spaces not have spaces';
          if(data.password!==data.confirmPassword)
           errors.confirmPassword = 'Passwords Must Match';
        }
      if(data.handle.trim()==='')  errors.handle = 'handle must not be empty';
      valid = true;

      if(Object.keys(errors).length>0) valid = false;
          return {
              errors,
              valid
        }
}


exports.validateLogin = (data) =>{
    let errors= {};
    if(data.email.trim()==='')  errors.email =  'Enter your mail id';
    if(data.password.trim()===''){
      errors.password = 'Password field is Empty';
    }
    valid = true;
    if(Object.keys(errors).length>0) valid = false;

    return{ 
        errors,
        valid
    }
}

exports.reduceUserDetails = (data) => {
    let userDetails = {};

   // if(!isEmpty(data.bio.trim()))
         userDetails.bio = data.bio;
  //  if(!isEmpty(data.website.trim())){
        if(data.website.trim().substring(0,4) !== 'http')
            userDetails.website = `http://${data.website.trim()}`;
        else userDetails.website = data.website;
   // }
   // if(!isEmpty(data.location.trim())) 
        userDetails.location = data.location;

        return userDetails;
}

