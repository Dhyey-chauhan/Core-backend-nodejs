import multer from "multer";
import Validator from 'validatorjs';
import authenticateUser from "../middlewares/authMiddleware.js";

//filefilter only include the given file types.
const fileFilter = (req, file, cb) => {
    const allowedMimetypes = [
        'image/png',
        'image/jpeg',
        'application/pdf'
    ];
    
    if (allowedMimetypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only png, jpg, jpeg, and pdf files are allowed!'), false);
    }
};

//stored at this particaluar destunation.
const upload = multer({ 
    dest: "src/uploads/user/",
    fileFilter: fileFilter
});

// Multer error handler middleware
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_TYPE') {
            return sendFailure(res, 'Only png, jpeg, and pdf files are allowed!', 400);
        }
        return sendFailure(res, err.message, 400);
    } else if (err) {
        return sendFailure(res, err.message, 400);
    }
    next();
};

// Format validation errors
export const formattedErrors = (errors) => {
    const formatted = {};
    for (const key in errors) {
        formatted[key] = errors[key][0];
    }
    return formatted;
};

// ValidatorJS utility with callback support
export const validatorUtilWithCallback = (rules, customMessages, req, res, next) => {
    // Set validation language from request header (default: en)
    Validator.useLang(req.headers.lang ?? 'en');

    // Create validator instance using request body
    const validation = new Validator(req.body, rules, customMessages || {});

    // If validation passes, move to next middleware/controller
    validation.passes(() => next());

    // If validation fails, return formatted error response
    validation.fails(() =>
        sendFailure(res, formattedErrors(validation.errors.errors), 400)
    );
};

// route array function.
const routeArray = (routes, router) => {
  routes.forEach((route) => {
    const middlewares = [];

    // Auth
    if (!route.isPublic) {
      middlewares.push(authenticateUser);
    }

    // Upload
    if (route.isUpload) {
      middlewares.push(upload.single(route.uploadField));
      middlewares.push(handleMulterError);
    }

    //  Validation
    if (route.validation) {
      if (Array.isArray(route.validation)) {
        middlewares.push(...route.validation);
      } else {
        middlewares.push(route.validation);
      }
    }

    // Controller
    middlewares.push(route.controller);

    router[route.method](route.path, ...middlewares);
  });

  return router;
};

export default {
  routeArray,
};

// send succes function.
export const sendSuccess = (res, message, data = {}) => {
    res.status(200).json({ status: 1, message, ...data });
}

// send failure function.
export const sendFailure = (res, message, statusCode = 400) => {
    res.status(statusCode).json({ status: 0, message });
}
// asyncwrap for error handeling. (replacement of the try catch block)
export const asyncWrap = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

