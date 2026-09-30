"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    await prisma.user.updateMany({
        where: { role: "ADMIN" },
        data: { pinCode: "1234" },
    });
    await prisma.user.updateMany({
        where: { role: "STAFF" },
        data: { pinCode: "5678" },
    });
    const users = await prisma.user.findMany({ select: { name: true, role: true, pinCode: true, email: true } });
    console.log("Users updated with PINs:", JSON.stringify(users, null, 2));
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
