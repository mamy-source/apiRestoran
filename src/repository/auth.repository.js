import { ro } from "zod/locales";
import prisma from "../config/prisma.js";


class AuthRepository {
    async findUserByEmail(email){
        return await prisma.user.findUnique({
            where: { email },
        });
    }

    async findUserById(id){
        return await prisma.user.findUnique({
            where: { id },
        });
    }

    async findGuestBySessionId(sessionId){
        return await prisma.user.findFirst({
            where: { guestSessionId: sessionId , role: 'GUEST'},
        });
    }

    async createUser(data){
        return await prisma.user.create({
            data,
        });
    }

    async updateUser(id, data){
        return await prisma.user.update({
            where: { id },
            data,
        });
    }

    async updateRefreshToken(userId, refreshToken){
        return await prisma.user.update({
            where: { id: userId },
            data: { refreshToken },
        });
    }

    async getUserWithOrders(userId){
        return await prisma.user.findUnique({
            where: { id: userId },
            include: {
                orders: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
            },
        });
    }

    async usersCout(){
        return await prisma.user.count();
    }
}

export default new AuthRepository();