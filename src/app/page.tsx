// src/app/electricity/page.tsx
import ElectricityTable from "../components/ElectricityTable";

export default function ElectricityPage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1 className="text-xl font-semibold mb-4">Electricity statistics</h1>
      <ElectricityTable />
    </main>
  );
}
