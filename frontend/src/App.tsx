import { useState } from "react";
import {
  ChartNoAxesCombined,
  ArrowUpFromLine,
  ShieldCheck,
} from "lucide-react";
import RateConverter from "./components/RateConverter";
import PressureConverter from "./components/PressureConverter";
import CompletionConverter from "./components/CompletionConverter";

type TabType = "rate" | "pressure" | "completion";

function App() {
  const [activeTab, setActiveTab] = useState<TabType>("rate");

  const tabs = [
    {
      id: "rate" as TabType,
      label: "Rate Conversion",
      icon: ChartNoAxesCombined,
    },
    {
      id: "pressure" as TabType,
      label: "Pressure Conversion",
      icon: ArrowUpFromLine,
    },
    {
      id: "completion" as TabType,
      label: "Completion Conversion",
      icon: ShieldCheck,
    },
  ];

  return (
    <>
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          {/* Title */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Petrel Input Converter
            </h1>
            <p className="text-gray-500">
              Convert your reservoir data with ease and fast!
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg">
            <nav className="flex">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex flex-1 items-center justify-center gap-2 px-6 py-4 text-sm font-medium border-b-2 cursor-pointer transition-colors ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-500"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
                  </button>
                );
              })}
            </nav>

            <div className="p-8">
              {activeTab === "rate" && <RateConverter />}
              {activeTab === "pressure" && <PressureConverter />}
              {activeTab === "completion" && <CompletionConverter />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
