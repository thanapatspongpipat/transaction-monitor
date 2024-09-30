// src/utils/TransactionClient.ts

import axios from "axios";

class TransactionClient {
     async broadcastTransaction(
          symbol: string,
          price: number,
          timestamp: number
     ): Promise<string> {
          const payload = {
               symbol,
               price,
               timestamp,
          };

          try {
               const response = await axios.post("/api/transaction", payload);
               return response.data.tx_hash; // Return the transaction hash
          } catch (error) {
               console.error("Error broadcasting transaction:", error);
               throw new Error("Failed to broadcast transaction.");
          }
     }

     async monitorTransaction(
          txHash: string,
          interval: number = 5000,
          maxAttempts: number = 10,
          onStatusUpdate: (status: string) => void
     ): Promise<string> {
          let attempts = 0;

          return new Promise((resolve, reject) => {
               const timer = setInterval(async () => {
                    attempts += 1;
                    console.log(
                         `Checking transaction status... Attempt ${attempts}`
                    );

                    try {
                        const response = await axios.get(`/api/monitor/${txHash}`);
                        const status = response.data.tx_status;
                        onStatusUpdate(status); // Call the callback with the new status
        
                        // Check for final status to resolve the promise
                        if (status === "CONFIRMED" || status === "FAILED" || status === "DNE") {
                            clearInterval(timer);
                            resolve(status); // Resolve once the transaction status is confirmed or failed
                        }
                    } catch (error) {
                         console.error(
                              "Error checking transaction status:",
                              error
                         );
                         clearInterval(timer); // Clear the interval on error
                         reject(
                              new Error("Failed to check transaction status.")
                         );
                    }

                    if (attempts >= maxAttempts) {
                         clearInterval(timer);
                         reject(
                              new Error(
                                   "Max attempts reached, transaction status could not be confirmed."
                              )
                         );
                    }
               }, interval); // Set the interval to the specified duration
          });
     }
}

export default TransactionClient;
