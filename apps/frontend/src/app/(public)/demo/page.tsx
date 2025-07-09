import { Metadata } from "next";
import DemoRequestForm from "@/components/forms/DemoRequestForm";

export const metadata: Metadata = {
  title: "Request Demo - Rooster AI",
  description:
    "Schedule a personalized demo of Rooster AI and see how it can transform your staff scheduling process.",
};

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-[#fafbfd] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Request a<span className="text-[#f11d1c]"> Free Demo</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See how Rooster AI can transform your staff scheduling process. Book
            a personalized demo with our team.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-0">
            {/* Form */}
            <div className="p-8">
              <DemoRequestForm />
            </div>

            {/* Benefits */}
            <div className="p-8 bg-gradient-to-br from-[#f11d1c] to-red-600 text-white">
              <h3 className="text-2xl font-semibold mb-6">What You'll Learn</h3>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">
                      AI-Powered Scheduling
                    </h4>
                    <p className="text-sm opacity-90">
                      See how our AI creates optimal schedules in seconds
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">
                      Natural Language Editing
                    </h4>
                    <p className="text-sm opacity-90">
                      Edit schedules using simple voice commands
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">
                      Real-Time Collaboration
                    </h4>
                    <p className="text-sm opacity-90">
                      Multiple managers can work together seamlessly
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Advanced Analytics</h4>
                    <p className="text-sm opacity-90">
                      Track costs, efficiency, and staff performance
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">GDPR Compliance</h4>
                    <p className="text-sm opacity-90">
                      Built-in privacy protection and data security
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-white bg-opacity-20 rounded-lg">
                <h4 className="font-semibold mb-2">Demo Duration</h4>
                <p className="text-sm opacity-90">
                  30 minutes personalized walkthrough
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
