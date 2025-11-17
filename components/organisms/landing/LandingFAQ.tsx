'use client'

interface FAQItem {
  question: string
  answer: string
}

interface LandingFAQProps {
  items: FAQItem[]
}

export function LandingFAQ({ items }: LandingFAQProps) {
  return (
    <>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-light text-white">Frequently Asked Questions</h2>
        <p className="mt-2 text-text-secondary">Everything you need to know</p>
      </div>
      <div className="max-w-3xl mx-auto space-y-4">
        {items.map((item, index) => (
          <details
            key={index}
            className="group rounded-2xl border border-stroke-subtle/40 bg-background-card/40 p-6 backdrop-blur-light"
          >
            <summary className="cursor-pointer font-medium text-white list-none flex items-center justify-between">
              <span>{item.question}</span>
              <svg
                className="h-5 w-5 text-text-secondary group-open:rotate-180 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </summary>
            <p className="mt-4 text-text-secondary">{item.answer}</p>
          </details>
        ))}
      </div>
    </>
  )
}
