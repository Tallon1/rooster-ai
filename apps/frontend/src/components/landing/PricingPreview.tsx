import Link from "next/link";
import { CheckIcon } from "@heroicons/react/24/solid";

const pricingTiers = [
  {
    name: "Starter",
    price: "€2",
    period: "per user/month",
    description: "Perfect for small teams getting started with AI scheduling",
    features: [
      "Up to 10 users",
      "AI-powered scheduling",
      "Basic analytics",
      "Email support",
      "Mobile app access",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Professional",
    price: "€2",
    period: "per user/month",
    description: "Advanced features for growing hospitality businesses",
    features: [
      "Up to 50 users",
      "Advanced AI scheduling",
      "Real-time collaboration",
      "Custom reports",
      "Priority support",
      "Calendar integrations",
      "Advanced analytics",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "pricing",
    description: "Tailored solutions for large organizations",
    features: [
      "Unlimited users",
      "Custom AI training",
      "Multi-location support",
      "Dedicated support",
      "Custom integrations",
      "Advanced security",
      "SLA guarantee",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export default function PricingPreview() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent
            <span className="text-[#f11d1c]"> Pricing</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the plan that fits your business. All plans include our core
            AI scheduling features.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingTiers.map((tier, index) => (
            <div
              key={index}
              className={`relative rounded-2xl border-2 p-8 ${
                tier.popular
                  ? "border-[#f11d1c] shadow-lg scale-105"
                  : "border-gray-200 hover:border-[#f11d1c] hover:shadow-lg"
              } transition-all duration-300`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-[#f11d1c] text-white px-4 py-2 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {tier.name}
                </h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">
                    {tier.price}
                  </span>
                  {tier.price !== "Custom" && (
                    <span className="text-gray-600 ml-2">{tier.period}</span>
                  )}
                </div>
                <p className="text-gray-600">{tier.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {tier.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <CheckIcon className="w-5 h-5 text-[#f11d1c] mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={tier.name === "Enterprise" ? "/contact" : "/demo"}
                className={`block w-full text-center py-3 px-6 rounded-lg font-semibold transition-colors duration-200 ${
                  tier.popular
                    ? "bg-[#f11d1c] text-white hover:bg-red-600"
                    : "border-2 border-[#f11d1c] text-[#f11d1c] hover:bg-[#f11d1c] hover:text-white"
                }`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            All plans include a 14-day free trial. No credit card required.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center text-[#f11d1c] hover:text-red-600 font-semibold"
          >
            View detailed pricing comparison
            <svg
              className="w-4 h-4 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
