import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import RfqForm from "@/components/rfq/rfq-form";

export default function RfqPage() {
  return (
    <>
      <Navbar />
      <div className="py-6 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Request for Quote</h1>
          <p className="mb-8 text-lg text-gray-600">
            Fill out the form below to submit your RFQ. Our AI will match you with suitable suppliers.
          </p>
          <RfqForm />
        </div>
      </div>
      <Footer />
    </>
  );
}
