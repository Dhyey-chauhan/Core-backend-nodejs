import Validator from 'validatorjs';
import { appString } from '../utils/appString.js';
import { validatorUtilWithCallback } from '../utils/commonUtils.js';

const { usernameRequired, usernameMinLength, usernameLettersOnly, emailRequired, invalidEmailFormat, passwordMinLength, passwordRequired } = appString;

// Reusable validation helper
const createValidation = (rules, messages) => (req, res, next) => 
    validatorUtilWithCallback(rules, messages, req, res, next);

// Validation rules and messages
const registerRules = {
    userName: 'required|string|min:2|regex:/^[A-Za-z]+$/',
    email: 'required|string|email',
    password: 'required|min:6'
};

const registerMessages = {
    'userName.required': usernameRequired,
    'userName.min': usernameMinLength,
    'userName.regex': usernameLettersOnly,
    'email.required': emailRequired,
    'email.email': invalidEmailFormat,
    'password.required': passwordRequired,
    'password.min': passwordMinLength
};

const loginRules = {
    email: 'required|string|email',
    password: 'required|min:6'
};

const loginMessages = {
    'email.required': emailRequired,
    'email.email': invalidEmailFormat,
    'password.required': passwordRequired,
    'password.min': passwordMinLength
};

// Export validation functions
export const registerValidation = createValidation(registerRules, registerMessages);
export const loginValidation = createValidation(loginRules, loginMessages);

