import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ReportTemplate, ReportTemplateConfiguration } from "./types";
import { Edit, Trash2, Plus, FileCheck, Star, Copy } from "lucide-react";

const defaultConfiguration: ReportTemplateConfiguration = {
  includedSections: ["summary", "keyTrends", "marketSizeData", "topPlayers", "emergingTechnologies", "regionalInsights", "challenges", "opportunities"],
  chartTypes: {
    marketSize: "bar",
    growth: "line",
    players: "pie",
    technologies: "radar",
  },
  exportOptions: {
    includeTableOfContents: true,
    includeCoverPage: true,
    includeExecSummary: true,
    includeAppendix: false,
  },
  displayPreferences: {
    chartStyle: "detailed",
    dataVisualization: "both",
    colorScheme: "default",
  }
};

export function TemplateManager() {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [configuration, setConfiguration] = useState<ReportTemplateConfiguration>(defaultConfiguration);
  const [isDefault, setIsDefault] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for fetching templates
  const templatesQuery = useQuery({
    queryKey: ['/api/industry-trends/templates'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/industry-trends/templates");
      return response.json();
    }
  });

  // Mutation for saving a template
  const saveTemplateMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      description: string;
      configuration: ReportTemplateConfiguration;
      isDefault: boolean;
      isPublic: boolean;
      templateId?: number;
    }) => {
      const response = await apiRequest("POST", "/api/industry-trends/templates", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Template Saved",
        description: selectedTemplate 
          ? "Template updated successfully." 
          : "New template created successfully.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/industry-trends/templates'] });
      resetForm();
      setIsCreateDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Save Template",
        description: error.message || "An error occurred while saving the template.",
        variant: "destructive",
      });
    }
  });

  // Update templates when query data changes
  useEffect(() => {
    if (templatesQuery.data?.templates) {
      setTemplates(templatesQuery.data.templates);
    }
  }, [templatesQuery.data]);

  const resetForm = () => {
    setSelectedTemplate(null);
    setTemplateName("");
    setTemplateDescription("");
    setConfiguration({ ...defaultConfiguration });
    setIsDefault(false);
    setIsPublic(false);
  };

  const handleEditTemplate = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setTemplateName(template.name);
    setTemplateDescription(template.description);
    setConfiguration(template.configuration);
    setIsDefault(template.isDefault);
    setIsPublic(template.isPublic);
    setIsCreateDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!templateName.trim()) {
      toast({
        title: "Validation Error",
        description: "Template name is required.",
        variant: "destructive",
      });
      return;
    }
    
    saveTemplateMutation.mutate({
      name: templateName.trim(),
      description: templateDescription.trim(),
      configuration,
      isDefault,
      isPublic,
      templateId: selectedTemplate?.id,
    });
  };

  const handleSectionToggle = (section: string) => {
    setConfiguration(prev => {
      const includedSections = prev.includedSections.includes(section)
        ? prev.includedSections.filter(s => s !== section)
        : [...prev.includedSections, section];
      
      return {
        ...prev,
        includedSections,
      };
    });
  };

  const updateChartType = (key: string, value: string) => {
    setConfiguration(prev => ({
      ...prev,
      chartTypes: {
        ...prev.chartTypes,
        [key]: value,
      }
    }));
  };

  const updateExportOption = (key: string, value: boolean) => {
    setConfiguration(prev => ({
      ...prev,
      exportOptions: {
        ...prev.exportOptions,
        [key]: value,
      }
    }));
  };

  const updateDisplayPreference = (key: string, value: string) => {
    setConfiguration(prev => ({
      ...prev,
      displayPreferences: {
        ...prev.displayPreferences,
        [key]: value,
      }
    }));
  };

  return (
    <div className="w-full">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Report Templates</CardTitle>
            <CardDescription>
              Create and manage your report templates
            </CardDescription>
          </div>
          <Button onClick={() => {
            resetForm();
            setIsCreateDialogOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" /> New Template
          </Button>
        </CardHeader>
        <CardContent>
          {templatesQuery.isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No templates available. Create your first template to customize your reports.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-center w-[100px]">Default</TableHead>
                  <TableHead className="text-center w-[100px]">Public</TableHead>
                  <TableHead className="text-right w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell>{template.description}</TableCell>
                    <TableCell className="text-center">
                      {template.isDefault && <Star className="h-4 w-4 mx-auto text-amber-500" />}
                    </TableCell>
                    <TableCell className="text-center">
                      {template.isPublic && <FileCheck className="h-4 w-4 mx-auto text-green-500" />}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEditTemplate(template)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>
              {selectedTemplate ? `Edit Template: ${selectedTemplate.name}` : 'Create New Template'}
            </DialogTitle>
            <DialogDescription>
              Customize how your industry trend snapshots are displayed and exported.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="col-span-3"
                  placeholder="E.g., Executive Summary Template"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Input
                  id="description"
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  className="col-span-3"
                  placeholder="Brief description of this template's purpose"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="text-right">
                  <Label>Options</Label>
                </div>
                <div className="col-span-3 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={isDefault}
                      onCheckedChange={setIsDefault}
                      id="default"
                    />
                    <Label htmlFor="default">Set as default template</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={isPublic}
                      onCheckedChange={setIsPublic}
                      id="public"
                    />
                    <Label htmlFor="public">Make template available to all users</Label>
                  </div>
                </div>
              </div>
              
              <div className="col-span-4 pt-4">
                <Tabs defaultValue="sections">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="sections">Sections</TabsTrigger>
                    <TabsTrigger value="charts">Chart Types</TabsTrigger>
                    <TabsTrigger value="export">Export Options</TabsTrigger>
                    <TabsTrigger value="display">Display</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="sections" className="p-4 border rounded-md mt-2">
                    <h3 className="font-medium mb-3">Select sections to include</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="summary" 
                          checked={configuration.includedSections.includes('summary')}
                          onCheckedChange={() => handleSectionToggle('summary')}
                        />
                        <Label htmlFor="summary">Executive Summary</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="keyTrends" 
                          checked={configuration.includedSections.includes('keyTrends')}
                          onCheckedChange={() => handleSectionToggle('keyTrends')}
                        />
                        <Label htmlFor="keyTrends">Key Trends</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="marketSizeData" 
                          checked={configuration.includedSections.includes('marketSizeData')}
                          onCheckedChange={() => handleSectionToggle('marketSizeData')}
                        />
                        <Label htmlFor="marketSizeData">Market Size Data</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="topPlayers" 
                          checked={configuration.includedSections.includes('topPlayers')}
                          onCheckedChange={() => handleSectionToggle('topPlayers')}
                        />
                        <Label htmlFor="topPlayers">Top Players</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="emergingTechnologies" 
                          checked={configuration.includedSections.includes('emergingTechnologies')}
                          onCheckedChange={() => handleSectionToggle('emergingTechnologies')}
                        />
                        <Label htmlFor="emergingTechnologies">Emerging Technologies</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="regionalInsights" 
                          checked={configuration.includedSections.includes('regionalInsights')}
                          onCheckedChange={() => handleSectionToggle('regionalInsights')}
                        />
                        <Label htmlFor="regionalInsights">Regional Insights</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="challenges" 
                          checked={configuration.includedSections.includes('challenges')}
                          onCheckedChange={() => handleSectionToggle('challenges')}
                        />
                        <Label htmlFor="challenges">Challenges</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="opportunities" 
                          checked={configuration.includedSections.includes('opportunities')}
                          onCheckedChange={() => handleSectionToggle('opportunities')}
                        />
                        <Label htmlFor="opportunities">Opportunities</Label>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="charts" className="p-4 border rounded-md mt-2">
                    <h3 className="font-medium mb-3">Chart Types</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="marketSizeChart" className="text-right">
                          Market Size
                        </Label>
                        <Select 
                          value={configuration.chartTypes.marketSize}
                          onValueChange={(value) => updateChartType('marketSize', value)}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select chart type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bar">Bar Chart</SelectItem>
                            <SelectItem value="pie">Pie Chart</SelectItem>
                            <SelectItem value="line">Line Chart</SelectItem>
                            <SelectItem value="area">Area Chart</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="growthChart" className="text-right">
                          Growth Rate
                        </Label>
                        <Select 
                          value={configuration.chartTypes.growth}
                          onValueChange={(value) => updateChartType('growth', value)}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select chart type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="line">Line Chart</SelectItem>
                            <SelectItem value="bar">Bar Chart</SelectItem>
                            <SelectItem value="area">Area Chart</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="playersChart" className="text-right">
                          Top Players
                        </Label>
                        <Select 
                          value={configuration.chartTypes.players}
                          onValueChange={(value) => updateChartType('players', value)}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select chart type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pie">Pie Chart</SelectItem>
                            <SelectItem value="bar">Bar Chart</SelectItem>
                            <SelectItem value="treemap">Treemap</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="techChart" className="text-right">
                          Technologies
                        </Label>
                        <Select 
                          value={configuration.chartTypes.technologies}
                          onValueChange={(value) => updateChartType('technologies', value)}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select chart type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="radar">Radar Chart</SelectItem>
                            <SelectItem value="bubble">Bubble Chart</SelectItem>
                            <SelectItem value="bar">Bar Chart</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="export" className="p-4 border rounded-md mt-2">
                    <h3 className="font-medium mb-3">PDF Export Options</h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="tableOfContents" 
                          checked={configuration.exportOptions.includeTableOfContents}
                          onCheckedChange={(checked) => 
                            updateExportOption('includeTableOfContents', checked === true)
                          }
                        />
                        <Label htmlFor="tableOfContents">Include table of contents</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="coverPage" 
                          checked={configuration.exportOptions.includeCoverPage}
                          onCheckedChange={(checked) => 
                            updateExportOption('includeCoverPage', checked === true)
                          }
                        />
                        <Label htmlFor="coverPage">Include cover page</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="execSummary" 
                          checked={configuration.exportOptions.includeExecSummary}
                          onCheckedChange={(checked) => 
                            updateExportOption('includeExecSummary', checked === true)
                          }
                        />
                        <Label htmlFor="execSummary">Include executive summary</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="appendix" 
                          checked={configuration.exportOptions.includeAppendix}
                          onCheckedChange={(checked) => 
                            updateExportOption('includeAppendix', checked === true)
                          }
                        />
                        <Label htmlFor="appendix">Include appendix</Label>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="display" className="p-4 border rounded-md mt-2">
                    <h3 className="font-medium mb-3">Display Preferences</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="chartStyle" className="text-right">
                          Chart Style
                        </Label>
                        <Select 
                          value={configuration.displayPreferences.chartStyle}
                          onValueChange={(value) => 
                            updateDisplayPreference('chartStyle', value)
                          }
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select chart style" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="minimal">Minimal</SelectItem>
                            <SelectItem value="detailed">Detailed</SelectItem>
                            <SelectItem value="interactive">Interactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="dataVisualization" className="text-right">
                          Data Display
                        </Label>
                        <Select 
                          value={configuration.displayPreferences.dataVisualization}
                          onValueChange={(value) => 
                            updateDisplayPreference('dataVisualization', value)
                          }
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select data visualization" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="charts">Charts Only</SelectItem>
                            <SelectItem value="tables">Tables Only</SelectItem>
                            <SelectItem value="both">Charts & Tables</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="colorScheme" className="text-right">
                          Color Scheme
                        </Label>
                        <Select 
                          value={configuration.displayPreferences.colorScheme}
                          onValueChange={(value) => 
                            updateDisplayPreference('colorScheme', value)
                          }
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select color scheme" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="default">Default</SelectItem>
                            <SelectItem value="high-contrast">High Contrast</SelectItem>
                            <SelectItem value="print-friendly">Print Friendly</SelectItem>
                            <SelectItem value="brand">Brand Colors</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="submit" 
                disabled={saveTemplateMutation.isPending}
              >
                {saveTemplateMutation.isPending ? "Saving..." : "Save Template"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}