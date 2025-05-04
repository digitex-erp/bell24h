import React, { useState } from 'react';
import { useProcurementChallenges } from './ProcurementChallengeContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Trophy, Star, Lock, ArrowRight, CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ChallengeLibraryProps {
  onSelectChallenge: (challengeId: string) => void;
}

export default function ChallengeLibrary({ onSelectChallenge }: ChallengeLibraryProps) {
  const { challenges, checkPrerequisites, getUserAchievements, getLeaderboard } = useProcurementChallenges();
  const [category, setCategory] = useState<string | 'all'>('all');
  const [difficulty, setDifficulty] = useState<string | 'all'>('all');
  
  // Get unique categories and difficulties
  const categories = ['all', ...new Set(challenges.map(c => c.category))];
  const difficulties = ['all', 'beginner', 'intermediate', 'advanced'];
  
  // Filter challenges
  const filteredChallenges = challenges.filter(challenge => 
    (category === 'all' || challenge.category === category) &&
    (difficulty === 'all' || challenge.difficulty === difficulty)
  );
  
  // Group challenges by status for tabs
  const availableChallenges = filteredChallenges.filter(c => c.status === 'available');
  const inProgressChallenges = filteredChallenges.filter(c => c.status === 'in-progress');
  const completedChallenges = filteredChallenges.filter(c => c.status === 'completed');
  const lockedChallenges = filteredChallenges.filter(c => c.status === 'locked');
  
  const userAchievements = getUserAchievements();
  const leaderboard = getLeaderboard();
  
  // Render difficulty badge
  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Beginner</Badge>;
      case 'intermediate':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Intermediate</Badge>;
      case 'advanced':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Advanced</Badge>;
      default:
        return <Badge variant="outline">{difficulty}</Badge>;
    }
  };
  
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Procurement Challenge Library</h1>
          <p className="text-muted-foreground mt-1">Enhance your procurement skills through interactive challenges</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Trophy className="text-yellow-500 h-5 w-5" />
            <span className="font-medium">{userAchievements.totalPoints} Points</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="text-green-500 h-5 w-5" />
            <span className="font-medium">Level {userAchievements.level}</span>
          </div>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Your Rank</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">#{leaderboard.currentUser.rank}</div>
              <div className="text-muted-foreground text-sm">
                Top {Math.round((leaderboard.currentUser.rank / leaderboard.topUsers.length) * 100)}%
              </div>
            </div>
            <Progress value={(1 - leaderboard.currentUser.rank / leaderboard.topUsers.length) * 100} className="h-2 mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Completed Challenges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{userAchievements.completedChallenges}</div>
              <div className="text-muted-foreground text-sm">
                {Math.round((userAchievements.completedChallenges / challenges.length) * 100)}% Complete
              </div>
            </div>
            <Progress value={(userAchievements.completedChallenges / challenges.length) * 100} className="h-2 mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Earned Badges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{userAchievements.badges.length}</div>
              <div className="flex gap-1">
                {userAchievements.badges.slice(0, 3).map((badge, index) => (
                  <Badge key={index} variant="outline" className="bg-blue-50">
                    {badge}
                  </Badge>
                ))}
                {userAchievements.badges.length > 3 && (
                  <Badge variant="outline" className="bg-slate-50">
                    +{userAchievements.badges.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="text-sm font-medium block mb-1">Category</label>
          <select 
            className="border rounded-md px-3 py-1"
            value={category}
            onChange={e => setCategory(e.target.value as string | 'all')}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="text-sm font-medium block mb-1">Difficulty</label>
          <select 
            className="border rounded-md px-3 py-1"
            value={difficulty}
            onChange={e => setDifficulty(e.target.value as string | 'all')}
          >
            {difficulties.map(diff => (
              <option key={diff} value={diff}>
                {diff === 'all' ? 'All Difficulties' : diff.charAt(0).toUpperCase() + diff.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Challenge Tabs */}
      <Tabs defaultValue="available" className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-4">
          <TabsTrigger value="available" className="relative">
            Available
            {availableChallenges.length > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                {availableChallenges.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="in-progress" className="relative">
            In Progress
            {inProgressChallenges.length > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                {inProgressChallenges.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="relative">
            Completed
            {completedChallenges.length > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                {completedChallenges.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="locked" className="relative">
            Locked
            {lockedChallenges.length > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                {lockedChallenges.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="available" className="mt-6">
          {availableChallenges.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No available challenges match your filters
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableChallenges.map(challenge => (
                <Card key={challenge.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{challenge.title}</CardTitle>
                      {getDifficultyBadge(challenge.difficulty)}
                    </div>
                    <CardDescription>{challenge.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {challenge.skills.slice(0, 3).map((skill, i) => (
                        <Badge key={i} variant="secondary">{skill}</Badge>
                      ))}
                      {challenge.skills.length > 3 && (
                        <Badge variant="outline">+{challenge.skills.length - 3} more</Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        <span>{challenge.totalPoints} Points</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>~{challenge.estimatedTime} min</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button 
                      className="w-full" 
                      onClick={() => onSelectChallenge(challenge.id)}
                    >
                      Start Challenge <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="in-progress" className="mt-6">
          {inProgressChallenges.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              You don't have any challenges in progress
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Similar to Available but with Continue button and progress bar */}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="mt-6">
          {completedChallenges.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              You haven't completed any challenges yet
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Similar to Available but with stats and Retry button */}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="locked" className="mt-6">
          {lockedChallenges.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No locked challenges match your filters
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lockedChallenges.map(challenge => (
                <Card key={challenge.id} className="overflow-hidden bg-slate-50/50">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl text-muted-foreground">{challenge.title}</CardTitle>
                      {getDifficultyBadge(challenge.difficulty)}
                    </div>
                    <CardDescription className="text-muted-foreground/80">{challenge.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {challenge.prerequisites.map((prereq, i) => (
                        <Badge key={i} variant="outline" className="bg-slate-100">
                          Complete: {prereq}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button 
                      className="w-full" 
                      variant="outline"
                      disabled
                    >
                      <Lock className="mr-2 h-4 w-4" /> Locked
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}