import React, { useState } from 'react';
import { useProcurementChallenge, Challenge, ChallengeDifficulty, ChallengeCategory } from './ProcurementChallengeProvider';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Award, 
  BookOpen, 
  CheckCircle, 
  Lock, 
  TrendingUp, 
  Briefcase, 
  AlertCircle, 
  ChevronRight,
  Search
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from '@/lib/translations';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';

// Props for the component
interface InteractiveChallengeSelectorProps {
  onStartChallenge: (challengeId: string) => void;
}

// Filter interface
interface ChallengeFilters {
  difficulty?: ChallengeDifficulty;
  category?: ChallengeCategory;
  status?: 'all' | 'available' | 'completed' | 'locked';
  searchQuery: string;
  sortBy: 'newest' | 'difficulty' | 'points' | 'popularity';
}

// Get icon for challenge category
const getCategoryIcon = (category: ChallengeCategory) => {
  switch (category) {
    case 'supplier-selection':
      return <Briefcase className="h-5 w-5" />;
    case 'price-negotiation':
      return <TrendingUp className="h-5 w-5" />;
    case 'risk-assessment':
      return <AlertCircle className="h-5 w-5" />;
    case 'contract-management':
      return <BookOpen className="h-5 w-5" />;
    case 'sustainability':
      return <TrendingUp className="h-5 w-5" />;
    case 'delivery-optimization':
      return <Clock className="h-5 w-5" />;
    default:
      return <Briefcase className="h-5 w-5" />;
  }
};

// Get color for difficulty level
const getDifficultyColor = (difficulty: ChallengeDifficulty) => {
  switch (difficulty) {
    case 'beginner':
      return 'bg-green-100 text-green-800';
    case 'intermediate':
      return 'bg-blue-100 text-blue-800';
    case 'advanced':
      return 'bg-orange-100 text-orange-800';
    case 'expert':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Get translated difficulty
const getDifficultyTranslation = (difficulty: ChallengeDifficulty, t: (key: string) => string) => {
  switch(difficulty) {
    case 'beginner':
      return t('procurementChallenges.difficultyBeginner');
    case 'intermediate':
      return t('procurementChallenges.difficultyIntermediate');
    case 'advanced':
      return t('procurementChallenges.difficultyAdvanced');
    case 'expert':
      return t('procurementChallenges.difficultyExpert');
    default:
      return String(difficulty).charAt(0).toUpperCase() + String(difficulty).slice(1);
  }
};

// Get status information
const getStatusInfo = (status: string, t: (key: string) => string) => {
  switch (status) {
    case 'available':
      return { icon: <CheckCircle className="h-4 w-4 text-green-500" />, text: t('procurementChallenges.statusAvailable') };
    case 'locked':
      return { icon: <Lock className="h-4 w-4 text-gray-500" />, text: t('procurementChallenges.statusLocked') };
    case 'in-progress':
      return { icon: <TrendingUp className="h-4 w-4 text-blue-500" />, text: t('procurementChallenges.statusInProgress') };
    case 'completed':
      return { icon: <Award className="h-4 w-4 text-amber-500" />, text: t('procurementChallenges.statusCompleted') };
    default:
      return { icon: <CheckCircle className="h-4 w-4 text-green-500" />, text: t('procurementChallenges.statusAvailable') };
  }
};

// Main component
export const InteractiveChallengeSelector: React.FC<InteractiveChallengeSelectorProps> = ({ onStartChallenge }) => {
  const { challenges, checkPrerequisites } = useProcurementChallenge();
  const { t } = useTranslation();
  const [filters, setFilters] = useState<ChallengeFilters>({ 
    status: 'all', 
    searchQuery: '', 
    sortBy: 'newest' 
  });
  // Display mode for grid or list view
  const [displayMode, setDisplayMode] = useState<'grid' | 'list'>('grid');
  
  // Filter and sort challenges
  const filteredAndSortedChallenges = React.useMemo(() => {
    // First, filter challenges
    let result = challenges.filter(challenge => {
      let matches = true;
      
      // Filter by difficulty
      if (filters.difficulty && challenge.difficulty !== filters.difficulty) {
        matches = false;
      }
      
      // Filter by category
      if (filters.category && challenge.category !== filters.category) {
        matches = false;
      }
      
      // Filter by status
      if (filters.status && filters.status !== 'all') {
        if (filters.status === 'available' && challenge.status !== 'available') {
          matches = false;
        } else if (filters.status === 'completed' && challenge.status !== 'completed') {
          matches = false;
        } else if (filters.status === 'locked' && challenge.status !== 'locked') {
          matches = false;
        }
      }
      
      // Filter by search query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesTitle = challenge.title.toLowerCase().includes(query);
        const matchesDescription = challenge.description.toLowerCase().includes(query);
        const matchesSkills = challenge.skills.some(skill => 
          skill.toLowerCase().includes(query)
        );
        
        if (!(matchesTitle || matchesDescription || matchesSkills)) {
          matches = false;
        }
      }
      
      return matches;
    });
    
    // Then, sort challenges
    switch (filters.sortBy) {
      case 'difficulty':
        const difficultyOrder = { 'beginner': 0, 'intermediate': 1, 'advanced': 2, 'expert': 3 };
        result.sort((a, b) => 
          difficultyOrder[a.difficulty as keyof typeof difficultyOrder] - 
          difficultyOrder[b.difficulty as keyof typeof difficultyOrder]
        );
        break;
      case 'points':
        result.sort((a, b) => b.totalPoints - a.totalPoints);
        break;
      case 'popularity':
        // This would be based on some popularity metric, for now just sort by points as a proxy
        result.sort((a, b) => b.totalPoints - a.totalPoints);
        break;
      case 'newest':
      default:
        // In a real application, you might sort by creation date
        // For now, we'll keep original order
        break;
    }
    
    return result;
  }, [challenges, filters]);
  
  // Handle starting a challenge
  const handleStartChallenge = (challenge: Challenge) => {
    onStartChallenge(challenge.id);
  };
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, searchQuery: e.target.value }));
  };
  
  // Handle filter changes
  const handleFilterChange = (key: keyof ChallengeFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  // Get translated category name
  const getCategoryTranslation = (category: string) => {
    switch(category) {
      case 'supplier-selection':
        return t('procurementChallenges.categorySupplierSelection');
      case 'price-negotiation':
        return t('procurementChallenges.categoryPriceNegotiation');
      case 'risk-assessment':
        return t('procurementChallenges.categoryRiskAssessment');
      case 'contract-management':
        return t('procurementChallenges.categoryContractManagement');
      case 'sustainability':
        return t('procurementChallenges.categorySustainability');
      case 'delivery-optimization':
        return t('procurementChallenges.categoryDeliveryOptimization');
      default:
        return category;
    }
  };
  
  // Featured challenge card
  const renderFeaturedChallenge = () => {
    // Find a challenge that's available but not completed to feature
    const featuredChallenge = challenges.find(c => c.status === 'available') || challenges[0];
    
    if (!featuredChallenge) return null;
    
    return (
      <Card className="mb-8 overflow-hidden">
        <div className="relative">
          {/* Visual banner for featured challenge */}
          <div className="h-20 bg-gradient-to-r from-primary/20 to-primary/5"></div>
          <div className="absolute top-4 left-4">
            <Badge className="bg-primary text-primary-foreground">
              {t('procurementChallenges.featured')}
            </Badge>
          </div>
        </div>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{featuredChallenge.title}</CardTitle>
              <CardDescription>{featuredChallenge.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 mb-4">
            <Badge className={getDifficultyColor(featuredChallenge.difficulty)}>
              {getDifficultyTranslation(featuredChallenge.difficulty, t)}
            </Badge>
            <Badge variant="outline">
              {getCategoryTranslation(featuredChallenge.category)}
            </Badge>
            <div className="flex items-center gap-1 ml-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">{featuredChallenge.estimatedTime} min</span>
            </div>
            <div className="flex items-center gap-1 ml-2">
              <Award className="h-4 w-4 text-amber-500" />
              <span className="text-sm text-gray-600">{featuredChallenge.totalPoints} {t('procurementChallenges.points')}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {featuredChallenge.skills.map((skill, index) => (
              <Badge key={index} variant="outline" className="bg-gray-50">
                {skill}
              </Badge>
            ))}
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 px-6 py-4">
          <Button 
            onClick={() => handleStartChallenge(featuredChallenge)} 
            className="gap-2"
            disabled={featuredChallenge.status === 'locked' && !checkPrerequisites(featuredChallenge.id)}
          >
            {t('procurementChallenges.startChallenge')}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    );
  };
  
  // Challenge card component
  const renderChallengeCard = (challenge: Challenge) => {
    const statusInfo = getStatusInfo(challenge.status, t);
    const prerequisitesMet = checkPrerequisites(challenge.id);
    const isLocked = challenge.status === 'locked' && !prerequisitesMet;
    
    return (
      <motion.div
        key={challenge.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2 mb-2">
                {getCategoryIcon(challenge.category)}
                <Badge className={getDifficultyColor(challenge.difficulty)}>
                  {getDifficultyTranslation(challenge.difficulty, t)}
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-sm">
                {statusInfo.icon}
                <span className="text-gray-600">{statusInfo.text}</span>
              </div>
            </div>
            <CardTitle className="line-clamp-1">{challenge.title}</CardTitle>
            <CardDescription className="line-clamp-2">{challenge.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <Clock className="h-4 w-4" />
              <span>{challenge.estimatedTime} min</span>
              <Award className="h-4 w-4 ml-2" />
              <span>{challenge.totalPoints} {t('procurementChallenges.points')}</span>
            </div>
            
            <div className="mt-2">
              <h4 className="text-sm font-medium mb-1">{t('common.skills')}</h4>
              <div className="flex flex-wrap gap-1">
                {challenge.skills.slice(0, 3).map((skill, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {challenge.skills.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{challenge.skills.length - 3}
                  </Badge>
                )}
              </div>
            </div>
            
            {challenge.prerequisites.length > 0 && (
              <div className="mt-3">
                <h4 className="text-sm font-medium mb-1">{t('procurementChallenges.prerequisites')}</h4>
                <div className="text-xs text-gray-600">
                  {prerequisitesMet ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> {t('procurementChallenges.allPrerequisitesMet')}
                    </span>
                  ) : (
                    <span className="text-gray-600">{t('procurementChallenges.completePreviousChallenges')}</span>
                  )}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => handleStartChallenge(challenge)} 
              disabled={isLocked}
              className="w-full"
              variant={challenge.status === 'completed' ? "outline" : "default"}
            >
              {challenge.status === 'in-progress' ? t('procurementChallenges.continueChallenge') : 
               challenge.status === 'completed' ? t('procurementChallenges.tryAgain') : 
               isLocked ? t('procurementChallenges.statusLocked') : t('procurementChallenges.startChallenge')}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    );
  };
  
  // List view row component
  const renderChallengeListItem = (challenge: Challenge) => {
    const statusInfo = getStatusInfo(challenge.status, t);
    const prerequisitesMet = checkPrerequisites(challenge.id);
    const isLocked = challenge.status === 'locked' && !prerequisitesMet;
    
    return (
      <motion.div
        key={challenge.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="border rounded-lg overflow-hidden hover:shadow-sm transition-shadow">
          <div className="flex items-stretch">
            {/* Left status indicator */}
            <div className={`w-2 ${
              challenge.status === 'completed' ? 'bg-green-500' :
              challenge.status === 'in-progress' ? 'bg-blue-500' :
              challenge.status === 'available' ? 'bg-blue-300' :
              'bg-gray-300'
            }`}></div>
            
            <div className="flex-grow flex items-center p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
                {/* Challenge info */}
                <div className="space-y-1 flex-grow">
                  <div className="flex items-center gap-2">
                    <div className="flex-shrink-0">
                      {getCategoryIcon(challenge.category)}
                    </div>
                    <h3 className="font-medium">{challenge.title}</h3>
                    <div className="flex items-center gap-1 ml-2 text-sm">
                      {statusInfo.icon}
                      <span className="text-gray-600">{statusInfo.text}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-1">
                    <Badge className={getDifficultyColor(challenge.difficulty)}>
                      {getDifficultyTranslation(challenge.difficulty, t)}
                    </Badge>
                    <Badge variant="outline">
                      {getCategoryTranslation(challenge.category)}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {challenge.estimatedTime} min
                    </span>
                    <span className="text-sm text-gray-500">
                      {challenge.totalPoints} {t('procurementChallenges.points')}
                    </span>
                  </div>
                </div>
                
                {/* Action button */}
                <div className="md:ml-auto flex-shrink-0">
                  <Button 
                    onClick={() => handleStartChallenge(challenge)} 
                    disabled={isLocked}
                    size="sm"
                    variant={challenge.status === 'completed' ? "outline" : "default"}
                  >
                    {challenge.status === 'in-progress' ? t('procurementChallenges.continue') : 
                     challenge.status === 'completed' ? t('procurementChallenges.retry') : 
                     isLocked ? t('procurementChallenges.locked') : t('procurementChallenges.start')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };
  
  return (
    <div className="space-y-6">
      {/* Featured Challenge */}
      {renderFeaturedChallenge()}
      
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder={t('procurementChallenges.searchChallenges')}
            className="pl-9"
            value={filters.searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <Select 
            value={filters.status || 'all'} 
            onValueChange={(value) => handleFilterChange('status', value)}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder={t('common.status')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('procurementChallenges.allStatuses')}</SelectItem>
              <SelectItem value="available">{t('procurementChallenges.statusAvailable')}</SelectItem>
              <SelectItem value="completed">{t('procurementChallenges.statusCompleted')}</SelectItem>
              <SelectItem value="locked">{t('procurementChallenges.statusLocked')}</SelectItem>
            </SelectContent>
          </Select>
          
          <Select 
            value={filters.difficulty || 'all'} 
            onValueChange={(value) => handleFilterChange('difficulty', value as ChallengeDifficulty | 'all')}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder={t('procurementChallenges.difficulty')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('procurementChallenges.allLevels')}</SelectItem>
              <SelectItem value="beginner">{t('procurementChallenges.difficultyBeginner')}</SelectItem>
              <SelectItem value="intermediate">{t('procurementChallenges.difficultyIntermediate')}</SelectItem>
              <SelectItem value="advanced">{t('procurementChallenges.difficultyAdvanced')}</SelectItem>
              <SelectItem value="expert">{t('procurementChallenges.difficultyExpert')}</SelectItem>
            </SelectContent>
          </Select>
          
          <Select 
            value={filters.sortBy} 
            onValueChange={(value) => handleFilterChange('sortBy', value)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder={t('common.sortBy')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">{t('procurementChallenges.sortNewest')}</SelectItem>
              <SelectItem value="difficulty">{t('procurementChallenges.sortDifficulty')}</SelectItem>
              <SelectItem value="points">{t('procurementChallenges.sortPoints')}</SelectItem>
              <SelectItem value="popularity">{t('procurementChallenges.sortPopularity')}</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={displayMode === 'grid' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setDisplayMode('grid')}
                  >
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1.5 1H6.5V6H1.5V1ZM8.5 1H13.5V6H8.5V1ZM1.5 8H6.5V13H1.5V8ZM8.5 8H13.5V13H8.5V8Z" fill="currentColor" />
                    </svg>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('procurementChallenges.gridView')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={displayMode === 'list' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setDisplayMode('list')}
                  >
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1.5 3H13.5V4.5H1.5V3ZM1.5 6.75H13.5V8.25H1.5V6.75ZM1.5 10.5H13.5V12H1.5V10.5Z" fill="currentColor" />
                    </svg>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('procurementChallenges.listView')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
      
      {/* Categories tabs */}
      <Tabs 
        defaultValue="all"
        onValueChange={(value) => handleFilterChange('category', value === 'all' ? undefined : value)}
      >
        <TabsList className="mb-6">
          <TabsTrigger value="all">{t('procurementChallenges.allCategories')}</TabsTrigger>
          <TabsTrigger value="supplier-selection">{t('procurementChallenges.categorySupplierSelection')}</TabsTrigger>
          <TabsTrigger value="price-negotiation">{t('procurementChallenges.categoryPriceNegotiation')}</TabsTrigger>
          <TabsTrigger value="risk-assessment">{t('procurementChallenges.categoryRiskAssessment')}</TabsTrigger>
          <TabsTrigger value="contract-management">{t('procurementChallenges.categoryContractManagement')}</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* Challenge listing */}
      <AnimatePresence mode="wait">
        {filteredAndSortedChallenges.length > 0 ? (
          displayMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedChallenges.map(challenge => renderChallengeCard(challenge))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAndSortedChallenges.map(challenge => renderChallengeListItem(challenge))}
            </div>
          )
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-12 border border-dashed rounded-lg"
          >
            <SearchIcon className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              {t('procurementChallenges.noChallengesFound')}
            </h3>
            <p className="mt-2 text-gray-500 max-w-md mx-auto">
              {t('procurementChallenges.tryAdjustingFilters')}
            </p>
            <Button 
              className="mt-6" 
              variant="outline"
              onClick={() => setFilters({ status: 'all', searchQuery: '', sortBy: 'newest' })}
            >
              {t('procurementChallenges.resetFilters')}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Icons
function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth={2} 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <circle cx={11} cy={11} r={8} />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export default InteractiveChallengeSelector;