"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "../auth";
import prisma from "@repo/db/client";
import { error } from "console";

export async function p2pTransfer(to:string , amount : number) {
    const session = await getServerSession(authOptions);
    const userId = session.user.id;
    if (!session || !session.user.id){
        return {
            message : "user not loogged in"
        }
    }

    const toUser = await prisma.user.findFirst({
        where : {
            number : to
        }
    })
    
    if(!toUser){
        return {
            message : "user not found"
        }
    }

    await prisma.$transaction(async(tx)=>{
        await tx.$queryRaw`SELECT * FROM "Balance" WHERE "userId" = ${Number(userId)} FOR UPDATE`;
        const senderBalance = await tx.balance.findFirst({
            where : {
                userId : Number(userId)
            }
        })

        if(!senderBalance || senderBalance.amount<amount){
            throw new Error('insufficient funds')
        }
        await tx.balance.update({
            where : {
                userId : Number(userId)
            },
            data : {
                amount : {
                    decrement : amount
                }
            }
        })
    
        await tx.balance.update({
            where : {
                userId : toUser.id
            },
            data : {
                amount : {
                    increment : amount
                }
            }
        })

        
    })
    return {
        message : "successful"
    }
}