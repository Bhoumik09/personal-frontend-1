"use server";
import axios from "axios";
import { Budget, Transaction } from "@/types/finance";
import { backend_url } from "@/lib/backend";
export async function getAllTransactions(): Promise<{
  msg: string;
  transactionData: Transaction[];
}> {
  const response = await axios.get(
    `${backend_url}/transaction/allTransactions`
  );
  return response.data as { msg: string; transactionData: Transaction[] };
}

export async function getCategories(): Promise<{
  msg: string;
  categoryData: { id: string; name: string }[];
}> {
  const response = await axios.get(`${backend_url}/category/allCategories`);
  return response.data as {
    msg: string;
    categoryData: { id: string; name: string }[];
  };
}
export async function addTransactionToDB({
  transactionData,
}: {
  transactionData: Omit<Transaction, "id">;
}): Promise<{ msg: string,transactionDetail:Transaction  }> {
  const response = await axios.post(
    `${backend_url}/transaction/postTransaction`,
    {
      ...transactionData,
    }
  );
  return response.data as { msg: string, transactionDetail:Transaction };
}
