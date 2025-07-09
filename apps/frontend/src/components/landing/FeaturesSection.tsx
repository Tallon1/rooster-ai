import {
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ClockIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

const features = [
  {
    icon: CalendarDaysIcon,
    title: "AI-Powered Scheduling",
    description:
      "Automatically generate optimal rosters based on staff availability, preferences, and business requirements.",
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: "Natural Language Editing",
    description:
      'Edit schedules using simple commands like "Give John a day off tomorrow" or "Swap Mary and Tom on Friday".',
  },
  {
    icon: ChartBarIcon,
    title: "Advanced Analytics",
    description:
      "Track labor costs, staff performance, and scheduling efficiency with comprehensive reporting.",
  },
  {
    icon: ShieldCheckIcon,
    title: "GDPR Compliant",
    description:
      "Built with privacy by design. Full compliance with Irish and EU data protection regulations.",
  },
  {
    icon: ClockIcon,
    title: "Real-Time Updates",
    description:
      "Instant notifications for schedule changes, shift swaps, and time-off requests.",
  },
  {
    icon: UsersIcon,
    title: "Multi-Location Support",
    description:
      "Manage staff across multiple locations with centralized control and location-specific scheduling.",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need for
            <span className="text-[#f11d1c]"> Smart Scheduling</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Rooster AI combines artificial intelligence with intuitive design to
            solve your biggest scheduling challenges.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 rounded-xl border border-gray-200 hover:border-[#f11d1c] hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-[#f11d1c] bg-opacity-10 rounded-lg flex items-center justify-center group-hover:bg-[#f11d1c] group-hover:bg-opacity-100 transition-colors duration-300">
                  <feature.icon className="w-6 h-6 text-[#f11d1c] group-hover:text-white transition-colors duration-300" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
