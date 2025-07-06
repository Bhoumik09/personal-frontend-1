'use server'
import { backend_url } from "@/lib/backend";
import { Budget } from "@/types/finance";
import axios from "axios";
export async function addBudgetToDB({
  budgetData,
}: {
  budgetData: Omit<Budget, "id">;
}): Promise<{ msg: string,budgetDetail:Budget  }> {
  const response = await axios.post(
    `${backend_url}/budget/postBudgets`,
    {
      ...budgetData,
    }
  );
  return response.data as { msg: string, budgetDetail:Budget };
}
export async function deleteBudgetFromDB({
 id
}: {
  id:string;
}): Promise<{ msg: string  }> {
  console.log(id);
  const response = await axios.delete(
    `${backend_url}/budget/${id}`
  );
  return response.data as { msg: string };
}
export async function getAllBudgets(): Promise<{
  msg: string;
  BudgetData: Budget[];
}> {
  const response = await axios.get(`${backend_url}/budget/allBudgets`);
  return response.data as { msg: string; BudgetData: Budget[] };
}