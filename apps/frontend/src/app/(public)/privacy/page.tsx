import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Rooster AI",
  description:
    "Learn how Rooster AI protects your privacy and handles your personal data in compliance with GDPR.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#fafbfd] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Privacy Policy
          </h1>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Last updated:</strong>{" "}
              {new Date().toLocaleDateString("en-GB")}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                1. Introduction
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Rooster AI ("we," "our," or "us") is committed to protecting
                your privacy. This Privacy Policy explains how we collect, use,
                disclose, and safeguard your information when you use our
                AI-powered staff scheduling service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                2. Information We Collect
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Personal Information
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Name, email address, and phone number</li>
                    <li>Company information and job title</li>
                    <li>Account credentials and authentication data</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Usage Information
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>How you interact with our service</li>
                    <li>Features you use and time spent</li>
                    <li>Device information and IP address</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                3. How We Use Your Information
              </h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Provide and maintain our scheduling service</li>
                <li>Process your requests and transactions</li>
                <li>Send you technical notices and support messages</li>
                <li>Improve our service and develop new features</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                4. GDPR Compliance
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                As a service operating in the European Union, we comply with the
                General Data Protection Regulation (GDPR). You have the
                following rights:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>
                  <strong>Right to Access:</strong> Request copies of your
                  personal data
                </li>
                <li>
                  <strong>Right to Rectification:</strong> Request correction of
                  inaccurate data
                </li>
                <li>
                  <strong>Right to Erasure:</strong> Request deletion of your
                  personal data
                </li>
                <li>
                  <strong>Right to Restrict Processing:</strong> Request
                  limitation of data processing
                </li>
                <li>
                  <strong>Right to Data Portability:</strong> Request transfer
                  of your data
                </li>
                <li>
                  <strong>Right to Object:</strong> Object to processing of your
                  personal data
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                5. Data Security
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We implement appropriate technical and organizational measures
                to protect your personal information against unauthorized
                access, alteration, disclosure, or destruction. This includes
                encryption, secure servers, and regular security assessments.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                6. Contact Us
              </h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about this Privacy Policy or wish to
                exercise your rights, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> privacy@roosterai.ie
                  <br />
                  <strong>Address:</strong> Rooster AI, Dublin, Ireland
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
