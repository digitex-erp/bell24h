import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export default function RegistrationCta() {
  const { user } = useAuth();

  return (
    <section className="bg-primary-700">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          <span className="block">Ready to transform your business?</span>
          <span className="block text-primary-300">Join Bell24h today and discover global opportunities.</span>
        </h2>
        <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
          {user ? (
            <div className="inline-flex rounded-md shadow">
              <Link href="/dashboard">
                <Button variant="default" className="bg-white text-primary-600 hover:bg-gray-50" size="lg" asChild>
                  <a>Go to Dashboard</a>
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="inline-flex rounded-md shadow">
                <Link href="/auth">
                  <Button variant="default" className="bg-white text-primary-600 hover:bg-gray-50" size="lg" asChild>
                    <a>Register Now</a>
                  </Button>
                </Link>
              </div>
              <div className="ml-3 inline-flex rounded-md shadow">
                <Link href="/about">
                  <Button variant="default" className="bg-primary-600 text-white hover:bg-primary-500" size="lg" asChild>
                    <a>Learn More</a>
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
