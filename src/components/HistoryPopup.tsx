import React, { useState, useEffect, useCallback } from 'react';
import { X, BarChart3, Calendar, Trash2, Eye, Clock, Bot, Layers, TrendingUp, Activity, Zap, Sparkles, Filter, Search, Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
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
  Tooltip,
  Area,
  AreaChart
} from 'recharts';
import { promptHistoryService, type PromptHistoryEntry, type PromptHistoryStats } from '@/lib/promptHistoryService';
import { useToast } from '@/hooks/use-toast';

interface HistoryPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#84cc16', '#f97316'];

// Custom DialogContent without close button
const CustomDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
CustomDialogContent.displayName = DialogPrimitive.Content.displayName;

export const HistoryPopup: React.FC<HistoryPopupProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');
  const [history, setHistory] = useState<PromptHistoryEntry[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<PromptHistoryEntry[]>([]);
  const [stats, setStats] = useState<PromptHistoryStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<PromptHistoryEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const { toast } = useToast();

  const loadData = useCallback(async () => {
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
  }, [toast]);

  const filterHistory = useCallback(() => {
    let filtered = history;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(entry => 
        entry.user_input.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.ai_response.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.framework_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.model.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(entry => entry.status === selectedFilter);
    }

    setFilteredHistory(filtered);
  }, [history, searchTerm, selectedFilter]);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, loadData]);

  useEffect(() => {
    filterHistory();
  }, [filterHistory]);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'generating': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'failed': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
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
      <CustomDialogContent className="max-w-7xl max-h-[95vh] overflow-hidden p-0 bg-gradient-to-br from-background via-background to-card/50 border-0 shadow-2xl">
        <div className="relative">
          {/* Gradient Header */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 rounded-t-lg" />
          
          <DialogHeader className="relative z-10 p-6 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-xl shadow-lg">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Prompt Analytics Hub
          </DialogTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Track your AI interactions and insights
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-10 w-10 rounded-xl hover:bg-muted/50"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
        </DialogHeader>
        </div>

        <div className="flex-1 overflow-hidden px-6 pb-6">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'overview' | 'history')}>
            <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/30 rounded-xl border border-border/50">
              <TabsTrigger 
                value="overview" 
                className="flex items-center gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-accent/20 data-[state=active]:text-primary data-[state=active]:shadow-lg transition-all duration-300"
              >
                <BarChart3 className="w-4 h-4" />
                Analytics Overview
              </TabsTrigger>
              <TabsTrigger 
                value="history" 
                className="flex items-center gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-accent/20 data-[state=active]:text-primary data-[state=active]:shadow-lg transition-all duration-300"
              >
                <Clock className="w-4 h-4" />
                Prompt History
              </TabsTrigger>
            </TabsList>

                        <TabsContent value="overview" className="mt-6">
              <ScrollArea className="h-[700px] pr-4">
                <div className="space-y-8">
                  {loading ? (
                    <div className="flex items-center justify-center py-20">
                      <div className="text-center">
                        <div className="relative">
                          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-6"></div>
                          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-accent rounded-full animate-spin mx-auto" style={{ animationDelay: '0.5s' }}></div>
                        </div>
                        <p className="text-muted-foreground font-medium">Loading your analytics...</p>
                      </div>
                    </div>
                  ) : stats ? (
                    <>
                      {/* Enhanced Summary Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-primary/5 to-primary/10 backdrop-blur-sm">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-sm font-semibold text-primary">Total Prompts</CardTitle>
                              <div className="p-2 bg-primary/10 rounded-lg group-hover:scale-110 transition-transform">
                                <Activity className="w-4 h-4 text-primary" />
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="text-3xl font-bold text-primary mb-1">{stats.totalPrompts.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Lifetime interactions</p>
                          </CardContent>
                        </Card>

                        <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-secondary/5 to-secondary/10 backdrop-blur-sm">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-sm font-semibold text-secondary">Frameworks</CardTitle>
                              <div className="p-2 bg-secondary/10 rounded-lg group-hover:scale-110 transition-transform">
                                <Layers className="w-4 h-4 text-secondary" />
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="text-3xl font-bold text-secondary mb-1">{Object.keys(stats.frameworksUsed).length}</div>
                            <p className="text-xs text-muted-foreground">Different frameworks</p>
                          </CardContent>
                        </Card>

                        <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-accent/5 to-accent/10 backdrop-blur-sm">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-sm font-semibold text-accent">AI Models</CardTitle>
                              <div className="p-2 bg-accent/10 rounded-lg group-hover:scale-110 transition-transform">
                                <Bot className="w-4 h-4 text-accent" />
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="text-3xl font-bold text-accent mb-1">{Object.keys(stats.modelsUsed).length}</div>
                            <p className="text-xs text-muted-foreground">Different AI models</p>
                          </CardContent>
                        </Card>

                        <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 backdrop-blur-sm">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-sm font-semibold text-emerald-500">Avg Response</CardTitle>
                              <div className="p-2 bg-emerald-500/10 rounded-lg group-hover:scale-110 transition-transform">
                                <TrendingUp className="w-4 h-4 text-emerald-500" />
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="text-3xl font-bold text-emerald-500 mb-1">{stats.averageResponseLength.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Characters per response</p>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Enhanced Charts */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Daily Usage Chart */}
                        <Card className="border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm shadow-lg">
                          <CardHeader>
                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-primary/10 rounded-lg">
                                <TrendingUp className="w-4 h-4 text-primary" />
                              </div>
                              <div>
                                <CardTitle className="text-lg">Daily Usage Trends</CardTitle>
                                <CardDescription>Your prompt generation activity over time</CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                              <AreaChart data={dailyUsageData}>
                                <defs>
                                  <linearGradient id="usageGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05}/>
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                                <YAxis stroke="hsl(var(--muted-foreground))" />
                                <Tooltip 
                                  contentStyle={{
                                    backgroundColor: 'hsl(var(--card))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '8px'
                                  }}
                                />
                                <Area 
                                  type="monotone" 
                                  dataKey="count" 
                                  stroke="hsl(var(--primary))" 
                                  strokeWidth={3}
                                  fill="url(#usageGradient)"
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>

                        {/* Framework Usage Chart */}
                        <Card className="border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm shadow-lg">
                          <CardHeader>
                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-secondary/10 rounded-lg">
                                <Layers className="w-4 h-4 text-secondary" />
                              </div>
                              <div>
                                <CardTitle className="text-lg">Framework Usage</CardTitle>
                                <CardDescription>Most popular frameworks</CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                              <BarChart data={frameworkChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                                <YAxis stroke="hsl(var(--muted-foreground))" />
                                <Tooltip 
                                  contentStyle={{
                                    backgroundColor: 'hsl(var(--card))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '8px'
                                  }}
                                />
                                <Bar 
                                  dataKey="value" 
                                  fill="url(#barGradient)"
                                  radius={[4, 4, 0, 0]}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>

                        {/* Model Usage Chart */}
                        <Card className="border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm shadow-lg">
                          <CardHeader>
                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-accent/10 rounded-lg">
                                <Bot className="w-4 h-4 text-accent" />
                              </div>
                              <div>
                                <CardTitle className="text-lg">AI Model Distribution</CardTitle>
                                <CardDescription>Usage across different AI models</CardDescription>
                              </div>
                            </div>
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
                                  outerRadius={100}
                                  fill="#8884d8"
                                  dataKey="value"
                                >
                                  {modelChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip 
                                  contentStyle={{
                                    backgroundColor: 'hsl(var(--card))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '8px'
                                  }}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>

                        {/* Framework Distribution */}
                        <Card className="border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm shadow-lg">
                          <CardHeader>
                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-emerald-500/10 rounded-lg">
                                <Sparkles className="w-4 h-4 text-emerald-500" />
                              </div>
                              <div>
                                <CardTitle className="text-lg">Framework Breakdown</CardTitle>
                                <CardDescription>Detailed framework usage</CardDescription>
                              </div>
                            </div>
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
                                  outerRadius={100}
                                  fill="#8884d8"
                                  dataKey="value"
                                >
                                  {frameworkChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip 
                                  contentStyle={{
                                    backgroundColor: 'hsl(var(--card))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '8px'
                                  }}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-20">
                      <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <BarChart3 className="w-12 h-12 text-muted-foreground" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">No Analytics Data</h3>
                      <p className="text-muted-foreground">Start generating prompts to see your analytics</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <div className="space-y-6">
                {/* Enhanced Header with Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                      {filteredHistory.length} entries
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search prompts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64 bg-muted/30 border-border/50 focus:border-primary"
                      />
                    </div>
                    
                    <select
                      value={selectedFilter}
                      onChange={(e) => setSelectedFilter(e.target.value)}
                      className="px-3 py-2 bg-muted/30 border border-border/50 rounded-lg text-sm focus:border-primary focus:outline-none"
                    >
                      <option value="all">All Status</option>
                      <option value="completed">Completed</option>
                      <option value="generating">Generating</option>
                      <option value="failed">Failed</option>
                    </select>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={loadData}
                      className="border-border/50 hover:bg-muted/50"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                    
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearAll}
                      className="text-destructive border-destructive/20 hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
                  </div>
              </div>

              {loading ? (
                  <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-6"></div>
                        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-accent rounded-full animate-spin mx-auto" style={{ animationDelay: '0.5s' }}></div>
                      </div>
                      <p className="text-muted-foreground font-medium">Loading history...</p>
                  </div>
                </div>
                ) : filteredHistory.length > 0 ? (
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-4 pr-4">
                      {filteredHistory.map((entry, index) => (
                        <Card 
                          key={entry.id} 
                          className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm hover:from-card/80 hover:to-card/60"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-4">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-medium">
                                  {getModelIcon(entry.model)} {getModelDisplayName(entry.model)}
                                </Badge>
                                    <Badge variant="secondary" className="bg-secondary/10 text-secondary border-secondary/20 font-medium">
                                  {entry.framework_name}
                                </Badge>
                                                                 {entry.vibe_coding && (
                                      <Badge variant="default" className="bg-accent/10 text-accent border-accent/20 font-medium">
                                        <Sparkles className="w-3 h-3 mr-1" />
                                     Vibe Coding
                                   </Badge>
                                 )}
                                  </div>
                                  
                                 <Badge 
                                    variant="outline"
                                    className={`${getStatusColor(entry.status)} font-medium`}
                                 >
                                   {entry.status === 'completed' ? '✅ Completed' :
                                    entry.status === 'generating' ? '⏳ Generating' : '❌ Failed'}
                                 </Badge>
                                  
                                  <span className="text-sm text-muted-foreground ml-auto flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                  {formatDate(entry.created_at)}
                                </span>
                              </div>
                              
                                <div className="space-y-3">
                                <div>
                                    <p className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                                      <Bot className="w-3 h-3" />
                                      User Input:
                                    </p>
                                    <div className="bg-muted/30 p-3 rounded-lg border border-border/30">
                                      <p className="text-sm leading-relaxed">{truncateText(entry.user_input, 200)}</p>
                                    </div>
                                </div>
                                
                                <div>
                                    <p className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                                      <Zap className="w-3 h-3" />
                                      AI Response:
                                    </p>
                                    <div className="bg-muted/30 p-3 rounded-lg border border-border/30">
                                      <p className="text-sm leading-relaxed">{truncateText(entry.ai_response, 250)}</p>
                                    </div>
                                </div>
                              </div>

                              {entry.tone && entry.length && (
                                  <div className="flex gap-2 mt-4">
                                    <Badge variant="outline" className="bg-muted/30 border-border/30">
                                    Tone: {entry.tone}
                                  </Badge>
                                    <Badge variant="outline" className="bg-muted/30 border-border/30">
                                    Length: {entry.length}
                                  </Badge>
                                </div>
                              )}
                            </div>

                              <div className="flex gap-2 ml-6">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedEntry(entry)}
                                  className="h-10 w-10 p-0 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteEntry(entry.id)}
                                  className="h-10 w-10 p-0 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-colors"
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
                  <div className="text-center py-20">
                    <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Clock className="w-12 h-12 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No Prompt History</h3>
                    <p className="text-muted-foreground mb-4">Generate some prompts to see them here</p>
                    {searchTerm && (
                      <p className="text-sm text-muted-foreground">
                        No results found for "{searchTerm}"
                      </p>
                    )}
                </div>
              )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Enhanced Detail View Dialog */}
        {selectedEntry && (
          <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
            <DialogContent className="max-w-5xl max-h-[90vh] border-0 bg-gradient-to-br from-background via-background to-card/50 shadow-2xl">
              <DialogHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-xl shadow-lg">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Prompt Details
                </DialogTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Complete information about this prompt interaction
                    </p>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="space-y-6">
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    {getModelIcon(selectedEntry.model)} {getModelDisplayName(selectedEntry.model)}
                  </Badge>
                  <Badge variant="secondary" className="bg-secondary/10 text-secondary border-secondary/20">
                    {selectedEntry.framework_name}
                  </Badge>
                  {selectedEntry.vibe_coding && (
                    <Badge variant="default" className="bg-accent/10 text-accent border-accent/20">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Vibe Coding
                    </Badge>
                  )}
                  <Badge 
                    variant="outline"
                    className={`${getStatusColor(selectedEntry.status)}`}
                  >
                    {selectedEntry.status === 'completed' ? '✅ Completed' :
                     selectedEntry.status === 'generating' ? '⏳ Generating' : '❌ Failed'}
                  </Badge>
                  <span className="text-sm text-muted-foreground ml-auto flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(selectedEntry.created_at)}
                  </span>
                </div>

                <Separator className="bg-border/50" />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2 text-primary">
                      <Bot className="w-4 h-4" />
                      User Input
                    </h4>
                    <div className="bg-muted/30 p-4 rounded-xl border border-border/30">
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{selectedEntry.user_input}</p>
                  </div>
                </div>

                <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2 text-accent">
                      <Zap className="w-4 h-4" />
                      AI Response
                    </h4>
                    <div className="bg-muted/30 p-4 rounded-xl border border-border/30">
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{selectedEntry.ai_response}</p>
                    </div>
                  </div>
                </div>

                {selectedEntry.tone && selectedEntry.length && (
                  <div className="flex gap-3">
                    <Badge variant="outline" className="bg-muted/30 border-border/30">
                      Tone: {selectedEntry.tone}
                    </Badge>
                    <Badge variant="outline" className="bg-muted/30 border-border/30">
                      Length: {selectedEntry.length}
                    </Badge>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
        {/* Footer */}
        <div className="px-6 pb-6 pt-2 text-xs text-muted-foreground flex justify-end">
          <span>uday</span>
        </div>
      </CustomDialogContent>
    </Dialog>
  );
};
