import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { Parser } from "json2csv";

export async function GET() {
    const { userId } = await auth();

    if (!userId)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.user.findUnique({
        where: { clerkUserId: userId },
    });

    if (!user)
        return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Fetch all expenses and incomes
    const transactions = await db.transaction.findMany({
        where: { userId: user.id },
    });

    const serializedTransactions = transactions.map((txn) => ({
        ...txn,
        amount: txn.amount.toNumber(), // important for Decimal
    }));

    const fields = [
        { label: "Date", value: "createdAt" },
        { label: "Description", value: "description" },
        { label: "Amount", value: "amount" },
        { label: "Type", value: "type" }, // income or expense
        { label: "Category", value: "category" },
        { label: "Recurring", value: "isRecurring" },
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(serializedTransactions);

    return new Response(csv, {
        status: 200,
        headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": "attachment; filename=transactions.csv",
        },
    });
}