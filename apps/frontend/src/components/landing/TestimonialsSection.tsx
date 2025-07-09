import { StarIcon } from "@heroicons/react/24/solid";

const testimonials = [
  {
    name: "Sarah Murphy",
    role: "General Manager",
    company: "The Brazen Head",
    location: "Dublin",
    image: "/images/placeholder-avatar.png",
    rating: 5,
    content:
      "Rooster AI has completely transformed how we handle scheduling. What used to take me 3 hours every week now takes 15 minutes. The AI suggestions are incredibly accurate.",
  },
  {
    name: "James O'Connor",
    role: "Operations Director",
    company: "Café Central",
    location: "Cork",
    image: "/images/placeholder-avatar.png",
    rating: 5,
    content:
      "The conflict resolution feature is a game-changer. No more double-bookings or understaffing. Our team loves how easy it is to request shift changes.",
  },
  {
    name: "Emma Walsh",
    role: "Store Manager",
    company: "Vintage & Co.",
    location: "Galway",
    image: "/images/placeholder-avatar.png",
    rating: 5,
    content:
      "Managing schedules across our three locations was a nightmare before Rooster AI. Now everything is centralized and automated. Brilliant solution!",
  },
];

const stats = [
  { value: "5 hours", label: "Average time saved per week" },
  { value: "94%", label: "Reduction in scheduling conflicts" },
  { value: "200+", label: "Businesses using Rooster AI" },
  { value: "99.9%", label: "Uptime reliability" },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-[#fafbfd] to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Trusted by
            <span className="text-[#f11d1c]"> Hospitality Leaders</span>
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Join hundreds of businesses that have revolutionized their
            scheduling process
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#f11d1c] mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 text-sm md:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
            >
              {/* Rating */}
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <StarIcon key={i} className="w-5 h-5 text-yellow-400" />
                ))}
              </div>

              {/* Content */}
              <blockquote className="text-gray-700 mb-6 leading-relaxed">
                "{testimonial.content}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                  <span className="text-gray-600 font-semibold text-lg">
                    {testimonial.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {testimonial.role}
                  </div>
                  <div className="text-sm text-[#f11d1c]">
                    {testimonial.company}, {testimonial.location}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-8">
            Trusted by leading hospitality brands across Ireland
          </p>
          <div className="flex justify-center items-center space-x-12 opacity-60">
            {/* Placeholder for company logos */}
            <div className="h-12 w-32 bg-gray-300 rounded flex items-center justify-center">
              <span className="text-gray-600 text-sm">Partner Logo</span>
            </div>
            <div className="h-12 w-32 bg-gray-300 rounded flex items-center justify-center">
              <span className="text-gray-600 text-sm">Partner Logo</span>
            </div>
            <div className="h-12 w-32 bg-gray-300 rounded flex items-center justify-center">
              <span className="text-gray-600 text-sm">Partner Logo</span>
            </div>
            <div className="h-12 w-32 bg-gray-300 rounded flex items-center justify-center">
              <span className="text-gray-600 text-sm">Partner Logo</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
