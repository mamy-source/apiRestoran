import AuthService from "../services/auth.service.js";
import { registerSchema, loginSchema, refreshTokenSchema, upgradeToClientSchema, validate } from "../validations/auth.validators.js";
import { sendSuccess, sendCreated } from "../utils/response.js";
import { asyncHandler } from "../middlewares/error.middleware.js";


//Register
export const register = asyncHandler(async (req, res)=>{
    const { valid, errors, data } = validate(registerSchema, req.body);
    if (!valid) {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors,
        });
    }
    const result = await AuthService.register(data);
    return sendCreated(res, result, 'User registered successfully');
});

//Login
export const login = asyncHandler(async (req, res)=>{
    const { valid, errors, data } = validate(loginSchema, req.body);
    if (!valid) {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors,
        });
    }
    const result = await AuthService.login(data.email, data.password);
    return sendSuccess(res, result, 'User logged in successfully');
});

//Refresh token
export const refreshToken = asyncHandler(async (req, res)=>{
    const { valid, errors, data } = validate(refreshTokenSchema, req.body);
    if (!valid) {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors,
        });
    }
    const result = await AuthService.refreshToken(data.refreshToken);
    return sendSuccess(res, result, 'Token refreshed successfully');
});

//logout
export const logout = asyncHandler(async (req, res)=>{
    await AuthService.logout(req.user.id);
    return sendSuccess(res, null, 'User logged out successfully');
});

//get profile
export const getProfile = asyncHandler(async (req, res)=>{
    const result = await AuthService.getProfile(req.user.id);
    return sendSuccess(res, result, 'User profile retrieved successfully');
});

//Upgrade guest to customer
export const upgradeToClient = asyncHandler(async (req, res)=>{
    const { valid, errors, data } = validate(upgradeToClientSchema, req.body);
    if (!valid) {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors,
        });
    }
    const result = await AuthService.upgradeToClient(
        req.guest?.id || req.user?.id,
        data.email,
        data.password,
        data.fullName
    );
    return sendSuccess(res, result, 'Account upgraded successfully');
});