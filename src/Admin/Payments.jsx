import { useState } from "react";
import { Wallet, TrendingUp, AlertCircle } from "lucide-react";
import { AT, Pill, StatCard, Card } from "./AdminUI.jsx";

const seedPayments = [
  { id: "S-1042", name: "Aarav Sharma", course: "B.Tech CSE", amount: "₹45,000", status: "paid", date: "Aug 2, 2026" },
  { id: "S-1043", name: "Priya Nair", course: "B.Tech ECE", amount: "₹42,000", status: "due", date: "—" },
  { id: "S-1044", name: "Rohan Mehta", course: "BBA", amount: "₹30,000", status: "overdue", date: "—" },
  { id: "S-1045", name: "Sneha Iyer", course: "B.Tech CSE", amount: "₹45,000", status: "paid", date: "Jul 28, 2026" },
  { id: "S-1046", name: "Karan Patel", course: "M.Sc IT", amount: "₹38,000", status: "paid", date: "Aug 10, 2026" },
];

export default function Payments() {
  const [records, setRecords] = useState(seedPayments);

  const markPaid = (id) =>
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "paid", date: "Just now" } : r))
    );

  const collected = records.filter((r) => r.status === "paid").length;
  const overdue = records.filter((r) => r.status === "overdue").length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Payments collected" value={collected} sub="this cycle" icon={Wallet} />
        <StatCard label="Overdue accounts" value={overdue} icon={AlertCircle} />
        <StatCard label="Collection rate" value={`${Math.round((collected / records.length) * 100)}%`} icon={TrendingUp} />
      </div>

      <Card title="Fee status by student">
        <div className="divide-y" style={{ borderColor: AT.line }}>
          {records.map((r) => (
            <div key={r.id} className="flex items-center justify-between px-5 py-3 text-sm">
              <div>
                <p style={{ color: AT.ink }}>{r.name}</p>
                <p className="text-xs" style={{ color: AT.sub }}>{r.course} · {r.amount}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs hidden sm:inline" style={{ color: AT.sub }}>{r.date}</span>
                <Pill tone={r.status} />
                {r.status !== "paid" && (
                  <button
                    onClick={() => markPaid(r.id)}
                    className="text-xs font-medium px-2.5 py-1 rounded-lg text-white"
                    style={{ background: AT.success }}
                  >
                    Mark as paid
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}