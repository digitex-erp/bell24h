import { useEffect, useState } from "react";
import { useRecommendations } from "@/hooks/use-recommendations";
import { useUserPreferences } from "@/hooks/use-user-preferences";
import { Loader2, ArrowLeft, ArrowRight, Star, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";

interface RecommendationCarouselProps {
  userId: number;
  limit?: number;
  className?: string;
}

export function RecommendationCarousel({ userId, limit = 5, className = "" }: RecommendationCarouselProps) {
  const [showPreferencesMessage, setShowPreferencesMessage] = useState(false);
  
  // Get user preferences
  const { 
    preferences,
    isLoadingPreferences,
    errorMessage: preferencesError
  } = useUserPreferences(userId);
  
  // Get recommendations
  const {
    recommendations,
    isLoading,
    error,
    refetch
  } = useRecommendations(userId, limit);

  // Check if preferences exist but are minimal/empty
  useEffect(() => {
    if (preferences && !isLoadingPreferences) {
      // Check if preferences are minimal (just default values or almost empty)
      const hasMinimalPreferences = 
        (!preferences.preferredCategories || preferences.preferredCategories.length === 0) &&
        (!preferences.preferredSupplierTypes || preferences.preferredSupplierTypes.length === 0) &&
        !preferences.preferredBusinessScale;
      
      setShowPreferencesMessage(hasMinimalPreferences);
    }
  }, [preferences, isLoadingPreferences]);

  // Helper to format date
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return "recently";
    }
  };

  if (isLoading || isLoadingPreferences) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-sm text-muted-foreground">Loading personalized recommendations...</p>
      </div>
    );
  }

  if (error || preferencesError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading recommendations</p>
        <Button onClick={() => refetch()} variant="outline" className="mt-2">
          Try Again
        </Button>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Personalized Recommendations</CardTitle>
          <CardDescription>
            We don't have any recommendations for you yet
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <p className="text-muted-foreground text-center mb-4">
            Start by exploring RFQs or update your preferences to get personalized recommendations
          </p>
          <Link href="/settings">
            <Button>Update Preferences</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center">
              Personalized Recommendations 
              <Sparkles className="h-5 w-5 ml-2 text-yellow-500" />
            </CardTitle>
            <CardDescription>
              RFQs tailored to your preferences and history
            </CardDescription>
          </div>
          {showPreferencesMessage && (
            <Link href="/settings">
              <Button variant="outline" size="sm">
                Improve Recommendations
              </Button>
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Carousel className="w-full">
          <CarouselContent>
            {recommendations.map((recommendation) => (
              <CarouselItem key={recommendation.id} className="md:basis-1/2 lg:basis-1/3">
                <Link href={`/rfqs/${recommendation.id}`}>
                  <div className="p-1">
                    <Card className="hover:border-primary cursor-pointer transition-all h-full">
                      <CardHeader className="p-4">
                        <CardTitle className="text-base truncate">{recommendation.title}</CardTitle>
                        <div className="flex justify-between items-center">
                          <Badge variant="outline">{recommendation.category}</Badge>
                          {recommendation.relevanceScore && (
                            <div className="flex items-center">
                              <Star className="h-3 w-3 fill-yellow-500 text-yellow-500 mr-1" />
                              <span className="text-xs">{Math.round(recommendation.relevanceScore)}% match</span>
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-sm text-muted-foreground line-clamp-3">{recommendation.description}</p>
                      </CardContent>
                      <CardFooter className="p-4 pt-0 flex justify-between text-xs text-muted-foreground">
                        <span>Posted {formatDate(recommendation.createdAt)}</span>
                        {recommendation.matchReason && (
                          <span className="font-medium text-right">{recommendation.matchReason}</span>
                        )}
                      </CardFooter>
                    </Card>
                  </div>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="hidden md:block">
            <CarouselPrevious />
            <CarouselNext />
          </div>
        </Carousel>
        <div className="md:hidden mt-4 flex justify-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
      {showPreferencesMessage && (
        <CardFooter className="px-6 py-4 border-t">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-primary">Tip:</span> Update your preferences to get more accurate recommendations.
          </p>
        </CardFooter>
      )}
    </Card>
  );
}