import React, { useState, useEffect } from 'react';
import { X, BarChart3, Calendar, Trash2, Eye, Clock, Bot, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { promptHistoryService, type PromptHistoryEntry, type PromptHistoryStats } from '@/lib/promptHistoryService';
import { useToast } from '@/hooks/use-toast';

interface HistoryPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

export const HistoryPopup: React.FC<HistoryPopupProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');
  const [history, setHistory] = useState<PromptHistoryEntry[]>([]);
  const [stats, setStats] = useState<PromptHistoryStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<PromptHistoryEntry | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [historyData, statsData] = await Promise.all([
        promptHistoryService.getPromptHistory(),
        promptHistoryService.getPromptHistoryStats()
      ]);
      setHistory(historyData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading history data:', error);
      toast({
        title: "Error",
        description: "Failed to load history data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      const success = await promptHistoryService.deletePromptHistory(id);
      if (success) {
        setHistory(prev => prev.filter(entry => entry.id !== id));
        toast({
          title: "Success",
          description: "History entry deleted",
        });
        // Reload stats after deletion
        const newStats = await promptHistoryService.getPromptHistoryStats();
        setStats(newStats);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete history entry",
        variant: "destructive",
      });
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all history? This action cannot be undone.')) {
      try {
        const success = await promptHistoryService.clearAllPromptHistory();
        if (success) {
          setHistory([]);
          setStats({
            totalPrompts: 0,
            frameworksUsed: {},
            modelsUsed: {},
            dailyUsage: {},
            averageResponseLength: 0
          });
          toast({
            title: "Success",
            description: "All history cleared",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to clear history",
          variant: "destructive",
        });
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getModelIcon = (model: string) => {
    switch (model) {
      case 'openai': return '🤖';
      case 'gemini': return '🌟';
      case 'anthropic': return '🧠';
      default: return '🤖';
    }
  };

  const getModelDisplayName = (model: string) => {
    switch (model) {
      case 'openai': return 'OpenAI';
      case 'gemini': return 'Gemini';
      case 'anthropic': return 'Claude';
      default: return model;
    }
  };

  // Prepare chart data
  const frameworkChartData = stats ? Object.entries(stats.frameworksUsed).map(([name, value]) => ({
    name,
    value
  })) : [];

  const modelChartData = stats ? Object.entries(stats.modelsUsed).map(([name, value]) => ({
    name: getModelDisplayName(name),
    value
  })) : [];

  const dailyUsageData = stats ? Object.entries(stats.dailyUsage)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([date, count]) => ({
      date,
      count
    })) : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Prompt History & Analytics
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'overview' | 'history')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                History
              </TabsTrigger>
            </TabsList>

                        <TabsContent value="overview" className="mt-6">
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-6">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading analytics...</p>
                      </div>
                    </div>
                  ) : stats ? (
                    <>
                      {/* Summary Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Prompts</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{stats.totalPrompts}</div>
                            <p className="text-xs text-muted-foreground">Last 7 days</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Frameworks Used</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{Object.keys(stats.frameworksUsed).length}</div>
                            <p className="text-xs text-muted-foreground">Different frameworks</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Models Used</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{Object.keys(stats.modelsUsed).length}</div>
                            <p className="text-xs text-muted-foreground">Different AI models</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{stats.averageResponseLength.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Characters</p>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Charts */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Daily Usage Chart */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Daily Usage</CardTitle>
                            <CardDescription>Number of prompts generated per day</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                              <LineChart data={dailyUsageData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
                              </LineChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>

                        {/* Framework Usage Chart */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Framework Usage</CardTitle>
                            <CardDescription>Most used frameworks</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                              <BarChart data={frameworkChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#3b82f6" />
                              </BarChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>

                        {/* Model Usage Chart */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Model Usage</CardTitle>
                            <CardDescription>AI models used</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                              <PieChart>
                                <Pie
                                  data={modelChartData}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="value"
                                >
                                  {modelChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip />
                              </PieChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>

                        {/* Framework Distribution */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Framework Distribution</CardTitle>
                            <CardDescription>Framework usage breakdown</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                              <PieChart>
                                <Pie
                                  data={frameworkChartData}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="value"
                                >
                                  {frameworkChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip />
                              </PieChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>No data available</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Recent Prompts</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearAll}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading history...</p>
                  </div>
                </div>
              ) : history.length > 0 ? (
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3">
                    {history.map((entry) => (
                      <Card key={entry.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="text-xs">
                                  {getModelIcon(entry.model)} {getModelDisplayName(entry.model)}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {entry.framework_name}
                                </Badge>
                                                                 {entry.vibe_coding && (
                                   <Badge variant="default" className="text-xs bg-primary/10 text-primary">
                                     Vibe Coding
                                   </Badge>
                                 )}
                                 <Badge 
                                   variant={entry.status === 'completed' ? 'default' : 
                                          entry.status === 'generating' ? 'secondary' : 'destructive'}
                                   className="text-xs"
                                 >
                                   {entry.status === 'completed' ? '✅ Completed' :
                                    entry.status === 'generating' ? '⏳ Generating' : '❌ Failed'}
                                 </Badge>
                                <span className="text-xs text-muted-foreground ml-auto">
                                  {formatDate(entry.created_at)}
                                </span>
                              </div>
                              
                              <div className="space-y-2">
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground mb-1">Input:</p>
                                  <p className="text-sm">{truncateText(entry.user_input, 150)}</p>
                                </div>
                                
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground mb-1">Response:</p>
                                  <p className="text-sm">{truncateText(entry.ai_response, 200)}</p>
                                </div>
                              </div>

                              {entry.tone && entry.length && (
                                <div className="flex gap-2 mt-2">
                                  <Badge variant="outline" className="text-xs">
                                    Tone: {entry.tone}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    Length: {entry.length}
                                  </Badge>
                                </div>
                              )}
                            </div>

                            <div className="flex gap-2 ml-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedEntry(entry)}
                                className="h-8 w-8 p-0"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteEntry(entry.id)}
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No prompt history yet</p>
                  <p className="text-sm">Generate some prompts to see them here</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Detail View Dialog */}
        {selectedEntry && (
          <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
            <DialogContent className="max-w-4xl max-h-[80vh]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  Prompt Details
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {getModelIcon(selectedEntry.model)} {getModelDisplayName(selectedEntry.model)}
                  </Badge>
                  <Badge variant="secondary">
                    {selectedEntry.framework_name}
                  </Badge>
                  {selectedEntry.vibe_coding && (
                    <Badge variant="default" className="bg-primary/10 text-primary">
                      Vibe Coding
                    </Badge>
                  )}
                  <Badge 
                    variant={selectedEntry.status === 'completed' ? 'default' : 
                           selectedEntry.status === 'generating' ? 'secondary' : 'destructive'}
                    className="text-xs"
                  >
                    {selectedEntry.status === 'completed' ? '✅ Completed' :
                     selectedEntry.status === 'generating' ? '⏳ Generating' : '❌ Failed'}
                  </Badge>
                  <span className="text-sm text-muted-foreground ml-auto">
                    {formatDate(selectedEntry.created_at)}
                  </span>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">User Input:</h4>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{selectedEntry.user_input}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">AI Response:</h4>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{selectedEntry.ai_response}</p>
                  </div>
                </div>

                {selectedEntry.tone && selectedEntry.length && (
                  <div className="flex gap-2">
                    <Badge variant="outline">Tone: {selectedEntry.tone}</Badge>
                    <Badge variant="outline">Length: {selectedEntry.length}</Badge>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
};
