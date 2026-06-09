import { hashPassword, verifyPassword } from "../libs/argon2.lib.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../libs/jwt.lib.js";
import AuthRepository from "../repository/auth.repository.js";
import logger from "../libs/logger.lib.js";
import { AppError } from "../middlewares/error.middleware.js";



class AuthService {
    async register(userData) {
        const { email, password, fullName, phoneNumber } = userData;

        //check if user already exists
        const existingUser = await AuthRepository.findUserByEmail(email);
        if (existingUser) {
            throw new AppError('Email already used', 400);
        }

        //hash password
        const hashedPassword = await hashPassword(password);

        //role
        let role;
        const count = await AuthRepository.usersCout();
        if(count === 0){
            role = 'ADMIN';
        }else{
            role = 'CLIENT';
        }

        //create user
        const user =  await AuthRepository.createUser({
            email,
            password: hashedPassword,
            fullName,
            phoneNumber,
            role: role,
        });

        //Generate tokens
        const accessToken = generateAccessToken({id: user.id, email: user.email, role: user.role});
        const refreshToken = generateRefreshToken({id: user.id, email: user.email, role: user.role});

        //Save refresh token
        await AuthRepository.updateRefreshToken(user.id, refreshToken);
        logger.logEvent('USER_REGISTERED', user.id, {email: user.email});

        return {
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                phoneNumber: user.phoneNumber,
                role: user.role,
            },
            accessToken,
            refreshToken,
        };
    }

    //login
    async login(email, password){
        //find user
        const user =  await AuthRepository.findUserByEmail(email);

        if (!user) {
            throw new AppError('Invalid email or password', 401);
        }

        //check password
        const isValid = await verifyPassword(password, user.password);
        if (!isValid) {
            throw new AppError('Invalid email or password', 401);
        }

        //Generate tokens
        const accessToken = generateAccessToken({id: user.id, email: user.email, role: user.role});
        const refreshToken = generateRefreshToken({id: user.id, email: user.email, role: user.role});

        //Save refresh token
        await AuthRepository.updateRefreshToken(user.id, refreshToken);
        logger.logEvent('USER_LOGIN', user.id, {email: user.email});

        return {
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                phoneNumber: user.phoneNumber,
                role: user.role,
            },
            accessToken,
            refreshToken,
        };
    }

    //refresh tokens
    async refreshToken(oldRefreshToken){
        const decoded = verifyRefreshToken(oldRefreshToken);
        if (!decoded) {
            throw new AppError('Invalid refresh token', 401);
        }

        const user = await AuthRepository.findUserById(decoded.id);
        if (!user || user.refreshToken !== oldRefreshToken) {
            throw new AppError('Invalid refresh token', 401);
        }

        //Generate new tokens
        const accessToken = generateAccessToken({id: user.id, email: user.email, role: user.role});
        const refreshToken = generateRefreshToken({id: user.id, email: user.email, role: user.role});

        //Update refresh token
        await AuthRepository.updateRefreshToken(user.id, refreshToken);
        return { accessToken, refreshToken };

    }

    //logout
    async logout(userId){
        await AuthRepository.updateRefreshToken(userId, null);
        logger.logEvent('USER_LOGOUT', userId);
        return true;
    }

    //get user profile
    async getProfile(userId){
        const user = await AuthRepository.getUserWithOrders(userId);
        if (!user) {
            throw new AppError('User not found', 404);
        }

        return {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            phoneNumber: user.phoneNumber,
            role: user.role,
            loyaltyPoints: user.loyaltyPoints,
            totalSpent: user.totalSpent,
            orderCount: user.orderCount,
            recentOrders: user.orders
        };
    }

    //upgrade guest to customer
    async upgradeGuestToClient(guestId, email, password, fullName) {

        // check if email already exists
        const existingUser = await AuthRepository.findUserByEmail(email);
        if (existingUser) {
            throw new AppError('Email already used', 400);
        }

        // find guest
        const guest =  await AuthRepository.findUserById(guestId);
        if (!guest || guest.role !== 'GUEST') {
            throw new AppError('Guest not found', 404);
        }

        // hash password
        const hashedPassword = await hashPassword(password);

        // update guest to customer
        const user = await AuthRepository.updateUser(guestId, {
            email,
            password: hashedPassword,
            fullName,
            role: 'CLIENT',
            loyaltyPoints: 0,
            totalSpent: 0,
            orderCount: 0,
        });

        // Generate tokens
        const accessToken = generateAccessToken({id: user.id, email: user.email, role: user.role});
        const refreshToken = generateRefreshToken({id: user.id, email: user.email, role: user.role});

        await AuthRepository.updateRefreshToken(user.id, refreshToken);
        logger.logEvent('GUEST_UPGRADED', user.id, {email: user.email});

        return {
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                phoneNumber: user.phoneNumber,
                role: user.role,
            },
            accessToken,
            refreshToken,
        };
    }

    
}

export default new AuthService();