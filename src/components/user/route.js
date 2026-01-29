import {
    registerController,
    loginController,
    getProfileController,
    updateProfileController,
    uploadFile,
    handleTokenRefresh,
    logoutUser,
} from "./controller/authController.js";

import { registerValidation, loginValidation } from "./validation.js";

export default [
    {
    path: "/register",
    method: "post",
    validation: registerValidation,
    controller: registerController,
    isPublic: true,
    },
    {
    path: "/login",
    method: "post",
    validation: loginValidation,
    controller: loginController,
    isPublic: true,
    },
    {
    path: "/logout",
    method: "post",
    controller: logoutUser,
    },
    {
    path: "/profile",
    method: "get",
    controller: getProfileController,
    },
    {
    path: "/update",
    method: "put",
    controller: updateProfileController,
    },
    {
    path: "/refresh-token",
    method: "get",
    controller: handleTokenRefresh,
    isPublic: true,
    },
    {
    path: "/upload",
    method: "post",
    controller: uploadFile,
    isPublic: false,
    isUpload: true,
    uploadField: "image",
    },
];
