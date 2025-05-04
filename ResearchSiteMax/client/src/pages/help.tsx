import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { HelpCircle, Mail, MessageSquare, Phone } from "lucide-react";

export default function Help() {
  const faqs = [
    {
      question: "How do I submit a Request for Quotation (RFQ)?",
      answer: "To submit an RFQ, navigate to the RFQs page from the sidebar, click the 'Create RFQ' button, fill out the form with your requirements, and submit. You can attach files, add voice descriptions, or even submit a video RFQ."
    },
    {
      question: "How does the blockchain verification work?",
      answer: "Bell24h.com uses Polygon blockchain technology to create immutable records of RFQs and transactions. This ensures transparency and prevents tampering. Each verified RFQ or transaction will display a verification badge and a link to view the transaction on the blockchain explorer."
    },
    {
      question: "What is invoice discounting and how can I use it?",
      answer: "Invoice discounting allows suppliers to get early payment on their invoices at a small discount. To use this feature, go to the Wallet section, select 'Invoice Discounting', and follow the steps to submit your invoice for financing through our KredX integration."
    },
    {
      question: "How do I track my shipments?",
      answer: "To track shipments, go to the Logistics page where you can view all your shipments. Click on any shipment to see detailed tracking information in real-time, including location, estimated delivery date, and status updates."
    },
    {
      question: "Can I use voice or video to describe my procurement needs?",
      answer: "Yes, Bell24h supports both voice and video RFQ submissions. When creating an RFQ, you'll see options to record a voice description or upload a video explaining your requirements. Our AI system will analyze and categorize these inputs automatically."
    },
    {
      question: "How do I communicate with suppliers or buyers?",
      answer: "Use the Messages section to communicate with other users. You can start new conversations, respond to inquiries, share files, and track your message history. All communications related to specific RFQs or bids are automatically organized for easy reference."
    },
    {
      question: "Is my business information secure on the platform?",
      answer: "Yes, Bell24h implements robust security measures including end-to-end encryption for communications, secure payment processing, and optional identity masking features for buyers. Your business credentials can also be verified through our decentralized verification system."
    },
    {
      question: "How does the escrow payment system work?",
      answer: "Our escrow system holds payment funds securely until all parties fulfill their obligations. When a deal is finalized, the buyer places funds in escrow. Upon successful delivery and confirmation, the funds are released to the supplier. This protects both parties and can be set up with milestone-based releases."
    }
  ];

  return (
    <div className="container max-w-6xl mx-auto px-6 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Help Center</h1>
          <p className="mt-1 text-sm text-gray-500">Find answers to common questions or contact our support team</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contact Support</CardTitle>
            <MessageSquare className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">Our support team is available 24/7 to assist you with any questions or issues</p>
            <Button className="w-full mt-4" variant="outline" size="sm">
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat with Support
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email Us</CardTitle>
            <Mail className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">Send us an email and we'll get back to you within 24 hours</p>
            <Button className="w-full mt-4" variant="outline" size="sm">
              <Mail className="h-4 w-4 mr-2" />
              support@bell24h.com
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Call Us</CardTitle>
            <Phone className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">Speak directly with a customer service representative</p>
            <Button className="w-full mt-4" variant="outline" size="sm">
              <Phone className="h-4 w-4 mr-2" />
              +91 1800-123-4567
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Browse common questions about using Bell24h.com</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  <div className="flex items-center">
                    <HelpCircle className="h-4 w-4 mr-2 text-primary" />
                    {faq.question}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pl-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <div className="mt-8 text-center">
        <h3 className="text-lg font-medium mb-2">Can't find what you're looking for?</h3>
        <p className="text-gray-500 mb-4">Our comprehensive support documentation covers all aspects of the platform</p>
        <Button>
          <HelpCircle className="h-4 w-4 mr-2" />
          Browse Documentation
        </Button>
      </div>
    </div>
  );
}
