import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

type ModuleCompletion = {
  name: string;
  completion: number;
  remaining: number;
  change: number;
};

type ProjectCompletionProps = {
  data: {
    overall: {
      completion: number;
      remaining: number;
      change: number;
    };
    modules: ModuleCompletion[];
  };
};

export default function ProjectCompletion({ data }: ProjectCompletionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Overall Completion Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Overall Completion</h3>
              <p className="text-muted-foreground text-sm">Project progress</p>
            </div>
            <div className="relative h-16 w-16">
              <svg className="h-16 w-16 transform -rotate-90">
                <circle 
                  className="text-muted" 
                  strokeWidth="5" 
                  stroke="currentColor" 
                  fill="transparent" 
                  r="28" 
                  cx="32" 
                  cy="32" 
                />
                <circle 
                  className="text-primary" 
                  strokeWidth="5" 
                  stroke="currentColor" 
                  strokeLinecap="round" 
                  fill="transparent" 
                  r="28" 
                  cx="32" 
                  cy="32" 
                  strokeDasharray="175.9" 
                  strokeDashoffset={175.9 - (175.9 * data.overall.completion / 100)}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-foreground">{data.overall.completion}%</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{data.overall.remaining}% tasks remaining</span>
            <span className="text-green-600 font-medium">↑ {data.overall.change}% this month</span>
          </div>
        </CardContent>
      </Card>
      
      {/* Module Cards */}
      {data.modules.map((module, index) => (
        <Card key={index}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">{module.name}</h3>
                <p className="text-muted-foreground text-sm">
                  {module.name === 'Core Platform' ? 'Platform foundation' : 
                   module.name === 'Payment System' ? 'Transaction features' : 
                   module.name === 'Voice/Video RFQ' ? 'Audio & video features' : 
                   'Analytics tools'}
                </p>
              </div>
              <div className="relative h-16 w-16">
                <svg className="h-16 w-16 transform -rotate-90">
                  <circle 
                    className="text-muted" 
                    strokeWidth="5" 
                    stroke="currentColor" 
                    fill="transparent" 
                    r="28" 
                    cx="32" 
                    cy="32" 
                  />
                  <circle 
                    className={`${
                      module.completion >= 90 ? 'text-green-500' : 
                      module.completion >= 70 ? 'text-primary' : 
                      'text-amber-500'
                    }`}
                    strokeWidth="5" 
                    stroke="currentColor" 
                    strokeLinecap="round" 
                    fill="transparent" 
                    r="28" 
                    cx="32" 
                    cy="32" 
                    strokeDasharray="175.9" 
                    strokeDashoffset={175.9 - (175.9 * module.completion / 100)}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-foreground">{module.completion}%</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{module.remaining} task{module.remaining !== 1 ? 's' : ''} remaining</span>
              <span className="text-green-600 font-medium">↑ {module.change}% this month</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
