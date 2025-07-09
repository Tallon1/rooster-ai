"use client";

import { useState, useEffect } from "react";
import { CalculatorIcon } from "@heroicons/react/24/outline";

interface CalculatorState {
  employees: number;
  hourlyRate: number;
  hoursPerWeek: number;
  currentMethod: "manual" | "spreadsheet" | "other";
}

export default function PricingCalculator() {
  const [calc, setCalc] = useState<CalculatorState>({
    employees: 10,
    hourlyRate: 12,
    hoursPerWeek: 2,
    currentMethod: "manual",
  });

  const [savings, setSavings] = useState({
    weekly: 0,
    monthly: 0,
    yearly: 0,
    roiPercentage: 0,
  });

  // Calculate savings based on time saved
  useEffect(() => {
    const timeSavedPerWeek = calc.hoursPerWeek;
    const costPerHour = calc.hourlyRate;
    const weeklySavings = timeSavedPerWeek * costPerHour;
    const monthlySavings = weeklySavings * 4.33; // Average weeks per month
    const yearlySavings = monthlySavings * 12;

    // Rooster AI cost estimation (€2 per user per month)
    const monthlyRoosterCost = calc.employees * 2;
    const yearlyRoosterCost = monthlyRoosterCost * 12;

    const netYearlySavings = yearlySavings - yearlyRoosterCost;
    const roiPercentage =
      yearlyRoosterCost > 0 ? (netYearlySavings / yearlyRoosterCost) * 100 : 0;

    setSavings({
      weekly: weeklySavings,
      monthly: monthlySavings - monthlyRoosterCost,
      yearly: netYearlySavings,
      roiPercentage: Math.max(0, roiPercentage),
    });
  }, [calc]);

  return (
    <section className="py-20 bg-gradient-to-br from-[#fafbfd] to-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#f11d1c] bg-opacity-10 rounded-full mb-4">
            <CalculatorIcon className="w-8 h-8 text-[#f11d1c]" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Calculate Your
            <span className="text-[#f11d1c]"> Potential Savings</span>
          </h2>
          <p className="text-xl text-gray-600">
            See how much time and money Rooster AI can save your business
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-0">
            {/* Calculator Inputs */}
            <div className="p-8 space-y-6">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                Your Business Details
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Employees
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={calc.employees}
                    onChange={(e) =>
                      setCalc({ ...calc, employees: parseInt(e.target.value) })
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>1</span>
                    <span className="font-semibold text-[#f11d1c]">
                      {calc.employees}
                    </span>
                    <span>100+</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Manager Hourly Rate (€)
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    value={calc.hourlyRate}
                    onChange={(e) =>
                      setCalc({ ...calc, hourlyRate: parseInt(e.target.value) })
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>€10</span>
                    <span className="font-semibold text-[#f11d1c]">
                      €{calc.hourlyRate}
                    </span>
                    <span>€50+</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hours Spent on Scheduling (per week)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={calc.hoursPerWeek}
                    onChange={(e) =>
                      setCalc({
                        ...calc,
                        hoursPerWeek: parseInt(e.target.value),
                      })
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>1h</span>
                    <span className="font-semibold text-[#f11d1c]">
                      {calc.hoursPerWeek}h
                    </span>
                    <span>10h+</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Scheduling Method
                  </label>
                  <select
                    value={calc.currentMethod}
                    onChange={(e) =>
                      setCalc({ ...calc, currentMethod: e.target.value as any })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f11d1c] focus:border-transparent"
                  >
                    <option value="manual">Manual/Paper</option>
                    <option value="spreadsheet">Excel/Google Sheets</option>
                    <option value="other">Other Software</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="p-8 bg-gradient-to-br from-[#f11d1c] to-red-600 text-white">
              <h3 className="text-2xl font-semibold mb-6">
                Your Potential Savings
              </h3>

              <div className="space-y-6">
                <div className="bg-white bg-opacity-20 rounded-lg p-4">
                  <div className="text-3xl font-bold mb-1">
                    €{savings.weekly.toFixed(0)}
                  </div>
                  <div className="text-sm opacity-90">Saved per week</div>
                </div>

                <div className="bg-white bg-opacity-20 rounded-lg p-4">
                  <div className="text-3xl font-bold mb-1">
                    €{savings.monthly.toFixed(0)}
                  </div>
                  <div className="text-sm opacity-90">
                    Net savings per month
                  </div>
                </div>

                <div className="bg-white bg-opacity-20 rounded-lg p-4">
                  <div className="text-3xl font-bold mb-1">
                    €{savings.yearly.toFixed(0)}
                  </div>
                  <div className="text-sm opacity-90">Net savings per year</div>
                </div>

                <div className="bg-white bg-opacity-20 rounded-lg p-4">
                  <div className="text-3xl font-bold mb-1">
                    {savings.roiPercentage.toFixed(0)}%
                  </div>
                  <div className="text-sm opacity-90">Return on Investment</div>
                </div>

                <div className="pt-4 border-t border-white border-opacity-30">
                  <p className="text-sm opacity-90 mb-4">
                    Based on €2 per user per month pricing
                  </p>
                  <button className="w-full bg-white text-[#f11d1c] font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                    Get Started Today
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
