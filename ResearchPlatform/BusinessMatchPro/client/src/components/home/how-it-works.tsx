export default function HowItWorks() {
  const buyerSteps = [
    {
      step: 1,
      title: "Register Account",
      description: "Create your account and complete your profile.",
    },
    {
      step: 2,
      title: "Submit RFQ",
      description: "Describe what you need in detail for better matches.",
    },
    {
      step: 3,
      title: "Review Matches",
      description: "Review AI-recommended supplier matches.",
    },
    {
      step: 4,
      title: "Finalize Deal",
      description: "Communicate and complete the transaction securely.",
    },
  ];

  const supplierSteps = [
    {
      step: 1,
      title: "Create Profile",
      description: "Register and showcase your capabilities.",
    },
    {
      step: 2,
      title: "Verify GST",
      description: "Complete GST verification (for Indian suppliers).",
    },
    {
      step: 3,
      title: "Receive RFQs",
      description: "Get matched with relevant buyer requests.",
    },
    {
      step: 4,
      title: "Fulfill Orders",
      description: "Deliver products/services and receive secure payment.",
    },
  ];

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-primary font-semibold tracking-wide uppercase">
            Process
          </h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            How Bell24h Works
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Follow these simple steps to start finding the perfect business matches.
          </p>
        </div>

        <div className="mt-10">
          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-gray-50 text-lg font-medium text-gray-900">
                For Buyers
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-4">
            {buyerSteps.map((step) => (
              <div key={step.step} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                      <span className="text-primary-700 text-xl font-bold">{step.step}</span>
                    </div>
                    <div className="ml-5">
                      <h3 className="text-lg font-medium text-gray-900">{step.title}</h3>
                      <p className="mt-2 text-sm text-gray-500">{step.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="relative mt-10">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-gray-50 text-lg font-medium text-gray-900">
                For Suppliers
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-4">
            {supplierSteps.map((step) => (
              <div key={step.step} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-orange-100 rounded-md p-3">
                      <span className="text-orange-700 text-xl font-bold">{step.step}</span>
                    </div>
                    <div className="ml-5">
                      <h3 className="text-lg font-medium text-gray-900">{step.title}</h3>
                      <p className="mt-2 text-sm text-gray-500">{step.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
