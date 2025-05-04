import React, { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/components/ui/card';
import { 
  AlertCircleIcon, 
  InfoIcon, 
  PieChartIcon, 
  CheckCircleIcon,
  LoaderIcon,
  SearchIcon,
  SparklesIcon,
  TrendingUpIcon
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  useSupplierRecommendations, 
  type SupplierRecommendation 
} from '@/hooks/useSupplierRecommendations';
import { SupplierRecommendationCard } from '@/components/supplier/SupplierRecommendationCard';
import { 
  animationClasses, 
  getDelayClass, 
  getDurationClass,
  getAnimationByElementType,
  getMatchScoreAnimationClass,
  getStaggerDelay
} from '@/lib/animations';

export default function RfqRecommendationsPage() {
  // Use router to get RFQ ID from URL
  const [, params] = useRoute('/rfq/:id/recommendations');
  const rfqId = params?.id ? parseInt(params.id) : null;
  
  // State for selected suppliers
  const [selectedSuppliers, setSelectedSuppliers] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [submitted, setSubmitted] = useState(false);
  
  // Fetch supplier recommendations
  const { 
    data, 
    isLoading, 
    isError, 
    error 
  } = useSupplierRecommendations(rfqId);
  
  // Handle supplier selection
  const toggleSupplier = (supplierId: number) => {
    if (submitted) return;
    
    const newSelectedSuppliers = new Set(selectedSuppliers);
    if (newSelectedSuppliers.has(supplierId)) {
      newSelectedSuppliers.delete(supplierId);
    } else {
      newSelectedSuppliers.add(supplierId);
    }
    setSelectedSuppliers(newSelectedSuppliers);
  };
  
  // Filter recommendations based on search
  const filteredRecommendations = data?.recommendations.filter(rec => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    const supplier = rec.supplier;
    
    return (
      supplier.name.toLowerCase().includes(query) ||
      supplier.industry.toLowerCase().includes(query) ||
      supplier.description?.toLowerCase().includes(query) ||
      rec.matchExplanation.some(exp => 
        exp.featureName.toLowerCase().includes(query) || 
        exp.explanation.toLowerCase().includes(query)
      )
    );
  });
  
  // Handle form submission
  const handleSubmit = async () => {
    if (selectedSuppliers.size === 0) return;
    
    try {
      // In a real implementation, this would call an API to submit the RFQ to selected suppliers
      console.log('Submitting RFQ to suppliers:', Array.from(selectedSuppliers));
      
      // Show success message
      setSubmitted(true);
      
      // In a real implementation, this would navigate to a confirmation page
    } catch (error) {
      console.error('Error submitting RFQ to suppliers:', error);
    }
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <LoaderIcon className="mr-2 animate-spin" size={20} />
              Loading Supplier Recommendations
            </CardTitle>
            <CardDescription>
              Our AI is analyzing potential suppliers for your RFQ...
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Progress value={60} className="w-full max-w-md mb-4" />
            <p className="text-gray-500 text-sm">
              We're matching your requirements with the best suppliers in our network.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="container mx-auto py-6 px-4">
        <Alert variant="destructive" className="mb-4">
          <AlertCircleIcon className="h-4 w-4 mr-2" />
          <AlertDescription>
            Error loading supplier recommendations: {(error as Error)?.message || 'Unknown error'}
          </AlertDescription>
        </Alert>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }
  
  if (!data || data.recommendations.length === 0) {
    return (
      <div className="container mx-auto py-6 px-4">
        <Card>
          <CardHeader>
            <CardTitle>No Supplier Recommendations</CardTitle>
            <CardDescription>
              We couldn't find any suppliers that match your RFQ requirements.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <InfoIcon className="h-4 w-4 mr-2" />
              <AlertDescription>
                Try broadening your RFQ description or changing the industry category.
              </AlertDescription>
            </Alert>
            <Button variant="outline" onClick={() => window.history.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Animation states 
  const [animatedElements, setAnimatedElements] = useState({
    header: false,
    summary: false,
    cards: false
  });
  
  // Trigger animations on data load
  useEffect(() => {
    if (data && !isLoading) {
      // Stagger the animations for a more polished feel
      setTimeout(() => setAnimatedElements(prev => ({ ...prev, header: true })), 100);
      setTimeout(() => setAnimatedElements(prev => ({ ...prev, summary: true })), 400);
      setTimeout(() => setAnimatedElements(prev => ({ ...prev, cards: true })), 800);
    }
  }, [data, isLoading]);
  
  // Get sorted recommendations for better visual emphasis
  const sortedRecommendations = React.useMemo(() => {
    if (!filteredRecommendations) return [];
    return [...filteredRecommendations].sort((a, b) => b.matchScore - a.matchScore);
  }, [filteredRecommendations]);

  return (
    <div className="container mx-auto py-6 px-4">
      <Card className={`mb-6 ${animatedElements.header ? animationClasses.fadeInScale : 'opacity-0'}`}>
        <CardHeader>
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <CardTitle className={getAnimationByElementType('title', 0.8)}>
                {data.rfq.title}
              </CardTitle>
              <CardDescription className={`mt-1 ${animatedElements.header ? animationClasses.slideInLeft : 'opacity-0'} ${getDelayClass(200)}`}>
                <Badge variant="outline" className="mr-2">
                  {data.rfq.industry}
                </Badge>
                <span className="text-sm text-gray-500">
                  ID: {data.rfq.id}
                </span>
              </CardDescription>
            </div>
            <div className={`flex items-center space-x-2 ${animatedElements.header ? animationClasses.slideInRight : 'opacity-0'} ${getDelayClass(300)}`}>
              <Badge className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200">
                <SparklesIcon size={14} className={animationClasses.pulse} />
                <span className={getMatchScoreAnimationClass(90)}>
                  {data.recommendations.length} Suppliers Found
                </span>
              </Badge>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <PieChartIcon size={14} className="mr-1" /> AI-Powered
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className={`mb-4 ${animatedElements.summary ? animationClasses.fadeIn : 'opacity-0'} ${getDelayClass(400)}`}>
            <p className="text-sm text-gray-700 mb-2 relative">
              <span className={animationClasses.revealText}>{data.rfq.description}</span>
            </p>
          </div>
          
          {submitted ? (
            <Alert className={`bg-green-50 text-green-700 border-green-200 ${animationClasses.zoomIn}`}>
              <CheckCircleIcon className={`h-4 w-4 mr-2 ${animationClasses.pulse}`} />
              <AlertDescription>
                RFQ successfully submitted to {selectedSuppliers.size} suppliers!
              </AlertDescription>
            </Alert>
          ) : (
            <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4 ${animatedElements.summary ? animationClasses.slideInUp : 'opacity-0'} ${getDelayClass(500)}`}>
              <div className="flex-1 w-full">
                <div className="relative">
                  <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search suppliers by name, industry, or features..."
                    className="pl-8 w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className={`text-sm font-medium mr-2 ${selectedSuppliers.size > 0 ? 'text-green-600 font-bold' : ''} transition-all`}>
                  {selectedSuppliers.size > 0 ? (
                    <span className={animationClasses.pulse}>
                      {selectedSuppliers.size} Selected
                    </span>
                  ) : (
                    "0 Selected"
                  )}
                </span>
                <Button 
                  onClick={handleSubmit}
                  disabled={selectedSuppliers.size === 0}
                  className={`w-full sm:w-auto ${selectedSuppliers.size > 0 ? animationClasses.pulse : ''}`}
                >
                  Submit to Selected Suppliers
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {animatedElements.cards && !submitted && (
        <div className="flex items-center justify-between mb-4 px-1">
          <div className={`flex items-center gap-2 ${animationClasses.fadeIn} ${getDelayClass(700)}`}>
            <TrendingUpIcon size={18} className="text-blue-500" />
            <span className="text-sm font-medium">
              Sorted by match quality
            </span>
          </div>
          <div className={`text-sm text-gray-600 ${animationClasses.fadeIn} ${getDelayClass(800)}`}>
            <span className="font-medium text-blue-600">
              {selectedSuppliers.size}/{data.recommendations.length}
            </span> suppliers selected
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedRecommendations.map((recommendation: SupplierRecommendation, index: number) => (
          <div 
            key={recommendation.supplier.id}
            className={animatedElements.cards ? getAnimationByElementType('card') : 'opacity-0'}
            style={{ 
              animationDelay: `${getStaggerDelay(index, 100, 0.4)}ms`,
              transitionDelay: `${getStaggerDelay(index, 100, 0.4)}ms`
            }}
          >
            <SupplierRecommendationCard
              recommendation={recommendation}
              selected={selectedSuppliers.has(recommendation.supplier.id)}
              onSelect={() => toggleSupplier(recommendation.supplier.id)}
              rfqSubmitted={submitted}
              rank={index + 1}
            />
          </div>
        ))}
        
        {filteredRecommendations?.length === 0 && (
          <div className={`col-span-full py-10 text-center ${animationClasses.fadeInScale}`}>
            <SearchIcon size={40} className="mx-auto text-gray-300 mb-2" />
            <h3 className="text-lg font-medium mb-1">No results found</h3>
            <p className="text-gray-500">
              Try adjusting your search or clear filters to see more results
            </p>
            <Button 
              variant="outline" 
              onClick={() => setSearchQuery('')}
              className="mt-4"
            >
              Clear Search
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}