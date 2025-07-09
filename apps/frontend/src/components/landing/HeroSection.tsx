"use client";

import { useState } from "react";
import Link from "next/link";
import { PlayIcon } from "@heroicons/react/24/solid";

export default function HeroSection() {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <section className="relative bg-gradient-to-br from-[#fafbfd] to-gray-50 pt-20 pb-16 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Eliminate
                <span className="text-[#f11d1c]"> Manual Scheduling</span>
                Chaos
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Replace spreadsheets and guesswork with intelligent AI
                automation. Perfect for cafes, bars, venues, and retail
                businesses across Ireland and Europe.
              </p>
            </div>

            {/* Key Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-[#f11d1c] rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">
                  Save 5+ hours weekly
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-[#f11d1c] rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">
                  Reduce scheduling conflicts
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-[#f11d1c] rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">
                  GDPR compliant
                </span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/demo"
                className="inline-flex items-center justify-center px-8 py-4 bg-[#f11d1c] text-white font-semibold rounded-lg hover:bg-red-600 transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                Request Free Demo
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-[#f11d1c] hover:text-[#f11d1c] transition-colors duration-200"
              >
                View Pricing
              </Link>
            </div>

            {/* Social Proof */}
            <div className="pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-4">
                Trusted by hospitality businesses across Ireland
              </p>
              <div className="flex items-center space-x-8 opacity-60">
                {/* Placeholder for company logos */}
                <div className="h-8 w-24 bg-gray-300 rounded"></div>
                <div className="h-8 w-24 bg-gray-300 rounded"></div>
                <div className="h-8 w-24 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>

          {/* Right Column - Demo Video/Image */}
          <div className="relative">
            <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
              {!showVideo ? (
                <div className="relative">
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <button
                      onClick={() => setShowVideo(true)}
                      className="flex items-center justify-center w-20 h-20 bg-[#f11d1c] rounded-full hover:bg-red-600 transition-colors duration-200 shadow-lg"
                    >
                      <PlayIcon className="w-8 h-8 text-white ml-1" />
                    </button>
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                    <div className="text-center text-white">
                      <h3 className="text-lg font-semibold mb-2">
                        See Rooster AI in Action
                      </h3>
                      <p className="text-sm opacity-90">
                        2-minute product demo
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-gray-900 flex items-center justify-center">
                  <p className="text-white">
                    Demo video would be embedded here
                  </p>
                </div>
              )}
            </div>

            {/* Floating Stats */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-lg shadow-lg p-4 border">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold text-lg">5h</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Time Saved
                  </p>
                  <p className="text-xs text-gray-500">Per week average</p>
                </div>
              </div>
            </div>

            <div className="absolute -top-6 -right-6 bg-white rounded-lg shadow-lg p-4 border">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-lg">AI</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Smart Scheduling
                  </p>
                  <p className="text-xs text-gray-500">Powered by GPT-4</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
