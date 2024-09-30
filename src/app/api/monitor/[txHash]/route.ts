import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(
     req: Request,
     { params }: { params: { txHash: string } }
) {
     const { txHash } = params;
     try {
          const response = await axios.get(
               `https://mock-node-wgqbnxruha-as.a.run.app/check/${txHash}`,
               {
                    headers: {
                         "Content-Type": "application/json",
                    },
               }
          );
          return NextResponse.json(response.data); // Return the transaction status
     } catch (error: any) {
          return NextResponse.json(
               {
                    message: "Failed to check transaction status.",
                    error: error.message,
               },
               { status: 500 }
          );
     }
}
