import { RFQ, Supplier, Document } from '../../types/rfq';

interface DocumentAnalysis {
  type: string;
  confidence: number;
  metadata: {
    [key: string]: any;
  };
  extractedData: {
    [key: string]: any;
  };
}

interface ContractAnalysis {
  riskLevel: 'low' | 'medium' | 'high';
  keyTerms: {
    term: string;
    value: string;
    importance: number;
  }[];
  complianceIssues: string[];
  recommendations: string[];
}

interface CertificateVerification {
  isValid: boolean;
  issuer: string;
  issueDate: Date;
  expiryDate: Date;
  verificationDetails: {
    [key: string]: any;
  };
}

interface InvoiceAnalysis {
  totalAmount: number;
  lineItems: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  taxDetails: {
    rate: number;
    amount: number;
  };
  paymentTerms: string;
}

export class DocumentProcessingService {
  async classifyDocument(document: Document): Promise<DocumentAnalysis> {
    const content = await this.extractText(document);
    const type = await this.determineDocumentType(content);
    const metadata = await this.extractMetadata(document);
    const extractedData = await this.extractRelevantData(content, type);

    return {
      type,
      confidence: this.calculateConfidence(content, type),
      metadata,
      extractedData
    };
  }

  async analyzeContract(document: Document): Promise<ContractAnalysis> {
    const content = await this.extractText(document);
    const keyTerms = await this.extractKeyTerms(content);
    const complianceIssues = await this.checkCompliance(content);
    const riskLevel = await this.assessRisk(content, complianceIssues);

    return {
      riskLevel,
      keyTerms,
      complianceIssues,
      recommendations: this.generateRecommendations(riskLevel, complianceIssues)
    };
  }

  async verifyCertificate(document: Document): Promise<CertificateVerification> {
    const content = await this.extractText(document);
    const issuer = await this.extractIssuer(content);
    const dates = await this.extractDates(content);
    const isValid = await this.validateCertificate(content);

    return {
      isValid,
      issuer,
      issueDate: dates.issueDate,
      expiryDate: dates.expiryDate,
      verificationDetails: await this.getVerificationDetails(content)
    };
  }

  async processInvoice(document: Document): Promise<InvoiceAnalysis> {
    const content = await this.extractText(document);
    const lineItems = await this.extractLineItems(content);
    const taxDetails = await this.extractTaxDetails(content);
    const paymentTerms = await this.extractPaymentTerms(content);

    return {
      totalAmount: this.calculateTotal(lineItems, taxDetails),
      lineItems,
      taxDetails,
      paymentTerms
    };
  }

  private async extractText(document: Document): Promise<string> {
    // Implement text extraction based on document type
    return document.content;
  }

  private async determineDocumentType(content: string): Promise<string> {
    const typeIndicators = {
      contract: ['agreement', 'terms', 'conditions', 'parties'],
      invoice: ['invoice', 'bill', 'payment', 'amount'],
      certificate: ['certificate', 'certified', 'issued by', 'valid until'],
      rfq: ['request for quote', 'specifications', 'requirements']
    };

    let maxMatches = 0;
    let detectedType = 'unknown';

    Object.entries(typeIndicators).forEach(([type, indicators]) => {
      const matches = indicators.filter(indicator => 
        content.toLowerCase().includes(indicator.toLowerCase())
      ).length;

      if (matches > maxMatches) {
        maxMatches = matches;
        detectedType = type;
      }
    });

    return detectedType;
  }

  private async extractMetadata(document: Document): Promise<{ [key: string]: any }> {
    return {
      filename: document.filename,
      size: document.size,
      uploadDate: document.uploadDate,
      mimeType: document.mimeType
    };
  }

  private async extractRelevantData(content: string, type: string): Promise<{ [key: string]: any }> {
    const extractors = {
      contract: this.extractContractData,
      invoice: this.extractInvoiceData,
      certificate: this.extractCertificateData,
      rfq: this.extractRFQData
    };

    return extractors[type] ? await extractors[type](content) : {};
  }

  private async extractContractData(content: string): Promise<{ [key: string]: any }> {
    return {
      parties: await this.extractParties(content),
      effectiveDate: await this.extractDate(content, 'effective'),
      terminationDate: await this.extractDate(content, 'termination'),
      obligations: await this.extractObligations(content)
    };
  }

  private async extractInvoiceData(content: string): Promise<{ [key: string]: any }> {
    return {
      invoiceNumber: await this.extractInvoiceNumber(content),
      date: await this.extractDate(content, 'invoice'),
      dueDate: await this.extractDate(content, 'due'),
      items: await this.extractLineItems(content)
    };
  }

  private async extractCertificateData(content: string): Promise<{ [key: string]: any }> {
    return {
      issuer: await this.extractIssuer(content),
      issueDate: await this.extractDate(content, 'issue'),
      expiryDate: await this.extractDate(content, 'expiry'),
      scope: await this.extractScope(content)
    };
  }

  private async extractRFQData(content: string): Promise<{ [key: string]: any }> {
    return {
      requirements: await this.extractRequirements(content),
      deadline: await this.extractDate(content, 'deadline'),
      budget: await this.extractBudget(content),
      specifications: await this.extractSpecifications(content)
    };
  }

  private calculateConfidence(content: string, type: string): number {
    // Implement confidence calculation based on content analysis
    return 0.85;
  }

  private async extractKeyTerms(content: string): Promise<{ term: string; value: string; importance: number }[]> {
    const terms = [
      { term: 'payment terms', regex: /payment terms:?\s*([^\n]+)/i },
      { term: 'delivery date', regex: /delivery date:?\s*([^\n]+)/i },
      { term: 'price', regex: /price:?\s*([^\n]+)/i }
    ];

    return terms.map(({ term, regex }) => {
      const match = content.match(regex);
      return {
        term,
        value: match ? match[1].trim() : 'Not specified',
        importance: this.calculateTermImportance(term, content)
      };
    });
  }

  private async checkCompliance(content: string): Promise<string[]> {
    const complianceRules = [
      { rule: 'payment terms', check: (text: string) => text.includes('payment terms') },
      { rule: 'delivery terms', check: (text: string) => text.includes('delivery terms') },
      { rule: 'warranty', check: (text: string) => text.includes('warranty') }
    ];

    return complianceRules
      .filter(rule => !rule.check(content))
      .map(rule => `Missing ${rule.rule}`);
  }

  private async assessRisk(content: string, complianceIssues: string[]): Promise<'low' | 'medium' | 'high'> {
    const riskFactors = {
      missingTerms: complianceIssues.length,
      ambiguousLanguage: this.countAmbiguousTerms(content),
      unusualClauses: this.countUnusualClauses(content)
    };

    const riskScore = 
      riskFactors.missingTerms * 0.4 +
      riskFactors.ambiguousLanguage * 0.3 +
      riskFactors.unusualClauses * 0.3;

    if (riskScore > 0.7) return 'high';
    if (riskScore > 0.4) return 'medium';
    return 'low';
  }

  private generateRecommendations(riskLevel: string, complianceIssues: string[]): string[] {
    const recommendations = [];

    if (riskLevel === 'high') {
      recommendations.push('Consider legal review');
      recommendations.push('Request clarification on ambiguous terms');
    }

    complianceIssues.forEach(issue => {
      recommendations.push(`Add ${issue.toLowerCase()}`);
    });

    return recommendations;
  }

  private async extractIssuer(content: string): Promise<string> {
    const issuerMatch = content.match(/issued by:?\s*([^\n]+)/i);
    return issuerMatch ? issuerMatch[1].trim() : 'Unknown';
  }

  private async extractDates(content: string): Promise<{ issueDate: Date; expiryDate: Date }> {
    return {
      issueDate: await this.extractDate(content, 'issue'),
      expiryDate: await this.extractDate(content, 'expiry')
    };
  }

  private async validateCertificate(content: string): Promise<boolean> {
    // Implement certificate validation logic
    return true;
  }

  private async getVerificationDetails(content: string): Promise<{ [key: string]: any }> {
    return {
      verificationMethod: 'digital',
      verificationDate: new Date(),
      verificationAuthority: await this.extractIssuer(content)
    };
  }

  private async extractLineItems(content: string): Promise<{ description: string; quantity: number; unitPrice: number; total: number }[]> {
    // Implement line item extraction
    return [];
  }

  private async extractTaxDetails(content: string): Promise<{ rate: number; amount: number }> {
    // Implement tax details extraction
    return { rate: 0, amount: 0 };
  }

  private async extractPaymentTerms(content: string): Promise<string> {
    const termsMatch = content.match(/payment terms:?\s*([^\n]+)/i);
    return termsMatch ? termsMatch[1].trim() : 'Not specified';
  }

  private calculateTotal(lineItems: any[], taxDetails: { rate: number; amount: number }): number {
    const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    return subtotal + taxDetails.amount;
  }

  private calculateTermImportance(term: string, content: string): number {
    // Implement term importance calculation
    return 0.8;
  }

  private countAmbiguousTerms(content: string): number {
    const ambiguousTerms = ['reasonable', 'appropriate', 'satisfactory'];
    return ambiguousTerms.filter(term => content.toLowerCase().includes(term)).length;
  }

  private countUnusualClauses(content: string): number {
    const unusualClauses = ['unlimited liability', 'exclusive rights', 'non-compete'];
    return unusualClauses.filter(clause => content.toLowerCase().includes(clause)).length;
  }

  private async extractDate(content: string, type: string): Promise<Date> {
    const dateMatch = content.match(new RegExp(`${type} date:?\\s*(\\d{1,2}/\\d{1,2}/\\d{4})`, 'i'));
    return dateMatch ? new Date(dateMatch[1]) : new Date();
  }
}

export const documentProcessingService = new DocumentProcessingService(); 