// src/app/api/transaction/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: Request) {
    try {
        const payload = await req.json();

        const response = await axios.post(
            "https://mock-node-wgqbnxruha-as.a.run.app/broadcast",
            payload,
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        return NextResponse.json(response.data); // Return the response data
    } catch (error) {
        console.error("Error during transaction:", error);
        return NextResponse.json(
            { message: "Failed to broadcast the transaction." },
            { status: 500 }
        );
    }
}
