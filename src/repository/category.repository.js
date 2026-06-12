import { _nativeEnum } from "zod/v4/core";
import prisma from "../config/prisma.js";

class CategoryRepository {
    async findCategoryById(id){
        return await prisma.category.findUnique({
            where: {id, deletedAt: null},
            include: {menus: true},
        });
    }

    async getAllCategory(){
        return await prisma.category.findMany({
            where: { deletedAt: null },
            include:{
                menus: {
                    where: { deletedAt: null },
                    take: 5,
                }
            },
            select: {
                id: true,
                name: true,
                image: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: { _nativeEnum: 'asc' },
        });
    }

     // Find category by name
    async findByName(name) {
        return prisma.category.findFirst({
        where: { 
            name: { equals: name, mode: 'insensitive' },
            deletedAt: null,
        },
        });
    }

    async createCategory(data){
        return await prisma.category.create({
            data,
        });
    }

    async updateCategory(id, data){
        return await prisma.update({
            where: {id},
            data,
            select: {
                id: true,
                name: true,
                image: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    async softDelete(id){
        return await prisma.update({
            where: {id},
            data: { deletedAt: new Date() },
        });
    }

    async CategoryCount(){
        return await prisma.category.count({where: { deletedAt: null }});   
    }
}

export default new CategoryRepository();