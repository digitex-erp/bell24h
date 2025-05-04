import { Helmet } from "react-helmet";
import GSTValidation from "@/components/gst/GSTValidation";

export default function GSTValidationPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>GST Validation | Bell24h</title>
      </Helmet>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">GST Validation System</h1>
        <p className="text-muted-foreground mt-2">
          Validate GST identification numbers, verify invoices, and perform bulk validations
        </p>
      </div>
      
      <GSTValidation />
    </div>
  );
}
