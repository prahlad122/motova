import type { Request , Response , NextFunction } from "express";
import { UserRole } from "../generated/prisma/client.js";
import { success } from "zod";
interface AuthenticatedRequest extends Request {
    user ? : {
        userId:string;
        role:UserRole;
    }
}

export function authorizeAdmin(
    req:AuthenticatedRequest ,
    res:Response,
    next : NextFunction
){
    if(!req.user){
        return res.status(401).json({
            success:false,
            message:"Authentication required!"
        });
    }
    if(req.user.role !==UserRole.ADMIN){
        return res.status(403).json({
            success : false ,
            message:"Access denied. Admin privileges required."
        })
    }
    next();
}