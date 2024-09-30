"use client";

import Image from "next/image";
import { Button, Chip, Input, Select, SelectItem } from "@nextui-org/react";
import { useState } from "react";
import TransactionClient from "@/utils/transactionClient";
import { ITransaction } from "@/assets/interface/transaction";
import axios from "axios";

const symbolList = [
     { key: 1, label: "BTC", value: "btc" },
     { key: 2, label: "ETH", value: "eth" },
     { key: 3, label: "USDT", value: "usdt" },
];

type TransactionStatus = "CONFIRMED" | "FAILED" | "PENDING" | "DNE";

export default function Home() {
     const [symbol, setSymbol] = useState<string>("");
     const [price, setPrice] = useState<number>();
     const [txHash, setTxHash] = useState<string | null>(null);
     const [status, setStatus] = useState<string>("DNE");
     const transactionClient = new TransactionClient();

     const statusColorMap = (
          status: string
     ): "success" | "danger" | "warning" | "default" | undefined => {
          switch (status) {
               case "CONFIRMED":
                    return "success"; // green
               case "FAILED":
                    return "danger"; // red
               case "PENDING":
                    return "warning"; // yellow
               case "DNE":
                    return "default"; // gray
               default:
                    return "default"; // Handle unknown status
          }
     };

     const handleAddTransaction = async () => {
          if (!symbol || !price) {
               alert("Please select a symbol and enter a price.");
               return;
          }

          const timestamp = Math.floor(Date.now() / 1000);

          try {
               const tx_hash = await transactionClient.broadcastTransaction(
                    symbol,
                    price,
                    timestamp
               );
               setTxHash(tx_hash);
               console.log("Transaction Hash:", tx_hash);
               const interval = 5000; // 5 seconds
               const maxAttempts = 10; // 10 attempts
               await transactionClient.monitorTransaction(
                    tx_hash,
                    interval,
                    maxAttempts,
                    (status) => {
                         setStatus(status); // Update status in state for re-render
                         console.log("Current Transaction Status:", status);
                    }
               );
               //  setStatus(result);
               //  console.log("Final Transaction Status:", result);
          } catch (error) {
               console.error("Error during transaction:", error);
               alert("Failed to broadcast the transaction.");
          }
     };

     const handleReset = () => {
          setSymbol("");
          setPrice(undefined);
          setTxHash(null);
          setStatus("DNE");
     };

     return (
          <div className="flex w-full h-screen justify-center items-center">
               <div className="flex w-2/6 h-full items-center justify-center">
                    <div className="flex flex-col gap-y-6 items-center w-full">
                         <Image
                              src="/image/Metamask-icon.png"
                              alt="Metamask Icon"
                              width={200}
                              height={200}
                         />

                         <div className="text-white text-xl font-bold">
                              {!txHash ? (
                                   <span>Broadcast Transaction here!</span>
                              ) : (
                                   <span>
                                        We're monitoring your transaction...
                                   </span>
                              )}
                         </div>

                         {!txHash && (
                              <div className="w-full space-y-6">
                                   <Select
                                        placeholder={symbol}
                                        label="Select a symbol"
                                        value={symbol}
                                        onChange={(e) =>
                                             setSymbol(e.target.value)
                                        }
                                   >
                                        {symbolList.map((symbol) => (
                                             <SelectItem
                                                  key={symbol.label}
                                                  value={symbol.value}
                                             >
                                                  {symbol.label}
                                             </SelectItem>
                                        ))}
                                   </Select>
                                   <Input
                                        value={String(price)}
                                        className="w-full"
                                        type="number"
                                        label="Price"
                                        placeholder="0.00"
                                        labelPlacement="inside"
                                        startContent={
                                             <div className="pointer-events-none flex items-center">
                                                  <span className="text-default-400 text-small">
                                                       $
                                                  </span>
                                             </div>
                                        }
                                        onChange={(e) =>
                                             setPrice(Number(e.target.value))
                                        }
                                   />
                                   <div className="flex gap-x-4 w-full">
                                        <Button
                                             color="default"
                                             variant="bordered"
                                             className="w-1/3"
                                             onClick={handleReset}
                                        >
                                             Reset
                                        </Button>
                                        <Button
                                             color="success"
                                             variant="shadow"
                                             className="w-full"
                                             onClick={handleAddTransaction}
                                        >
                                             Add
                                        </Button>
                                   </div>
                              </div>
                         )}

                         {txHash && (
                              <div className="flex flex-col items-center text-white">
                                   <div className="flex space-x-4 border p-5 rounded-3xl">
                                        <div>{txHash}</div>
                                        <Chip
                                             color={statusColorMap(
                                                  String(status)
                                             )}
                                        >
                                             {status || "DNE"}
                                        </Chip>
                                   </div>

                                   <Button
                                        color="default"
                                        variant="solid"
                                        className="mt-4 w-1/3"
                                        onClick={handleReset}
                                   >
                                        Back
                                   </Button>
                              </div>
                         )}
                    </div>
               </div>
          </div>
     );
}
