"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import prisma from "@repo/db/client";

export async function onRampTxn(amount : number, provider : string){
    const session = await getServerSession(authOptions);
    const userId = session.user.id;
    if(!userId){
        return { 
            message : "user not logged in"
        }
    }

    const token = Math.random().toString();
    await prisma.onRampTransaction.create({
        data : {
            status : "Processing",
            token,
            provider,
            amount,
            startTime : new Date(),
            userId : Number(userId)
        }
    })

    return {
        message : "on ramp transcation created"
    }
}