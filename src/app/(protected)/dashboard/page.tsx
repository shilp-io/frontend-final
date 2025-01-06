'use client';

import { useState } from 'react';
import { MonospaceTable } from '@/components/private/skeleton/base/MonospaceTable';
import { AsciiTable } from '@/components/private/skeleton/base/AsciiTable';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Settings } from 'lucide-react';
import type { ChangeEvent } from 'react';

// Temporary UI components until we set up shadcn/ui
const Tabs = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={className}>{children}</div>
);
const TabsList = ({ children }: { children: React.ReactNode }) => <div className="flex gap-2 mb-4">{children}</div>;
const TabsTrigger = ({ children, value, className }: { children: React.ReactNode; value: string; className?: string }) => (
  <Button variant="outline" size="sm" className={className}>{children}</Button>
);
const TabsContent = ({ children, value, className }: { children: React.ReactNode; value: string; className?: string }) => (
  <div className={className}>{children}</div>
);
const Textarea = ({ value, onChange, placeholder, className }: { 
  value: string; 
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void; 
  placeholder?: string;
  className?: string;
}) => (
  <textarea 
    value={value} 
    onChange={onChange} 
    placeholder={placeholder}
    className={`w-full p-2 border rounded-md ${className}`}
  />
);

// Custom types for our dashboard
interface SystemMetric {
  id: number;
  metric: string;
  value: string;
  status: string;
}

interface DashboardRequirement {
  id: number;
  title: string;
  status: string;
  priority: string;
  assignee: string;
  type: 'requirement';
  description: string;
  created_at: string;
  updated_at: string;
}

export default function DashboardPage() {
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([]);

  // Mock data for demonstration
  const requirements: DashboardRequirement[] = [
    { 
      id: 1, 
      title: 'User Authentication', 
      status: 'In Progress', 
      priority: 'High', 
      assignee: 'John Doe',
      type: 'requirement',
      description: 'Implement user authentication system',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    { 
      id: 2, 
      title: 'Data Encryption', 
      status: 'Completed', 
      priority: 'Critical', 
      assignee: 'Jane Smith',
      type: 'requirement',
      description: 'Implement end-to-end encryption',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
  ];

  const systemMetrics: SystemMetric[] = [
    { id: 1, metric: 'CPU Usage', value: '45%', status: 'Normal' },
    { id: 2, metric: 'Memory', value: '6.2GB/16GB', status: 'Warning' },
    { id: 3, metric: 'Network I/O', value: '2.3MB/s', status: 'Normal' },
  ];

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return;
    
    setChatMessages(prev => [...prev, { role: 'user', content: chatInput }]);
    
    // TODO: Integrate with actual AI chat endpoint
    setTimeout(() => {
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'This is a mock response. Replace with actual AI integration.' 
      }]);
    }, 1000);
    
    setChatInput('');
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Systems Engineering Dashboard</h1>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </div>

      <div className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
          <TabsTrigger value="terminal">Terminal</TabsTrigger>
          <TabsTrigger value="chat">AI Assistant</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <div className="p-4">
                <h3 className="text-lg font-semibold">System Metrics</h3>
                <p className="text-sm text-gray-500">Real-time system performance</p>
              </div>
              <div className="p-4">
                <AsciiTable
                  data={systemMetrics}
                  columns={[
                    { header: 'Metric', width: 20, accessor: (item) => item.metric },
                    { header: 'Value', width: 15, accessor: (item) => item.value },
                    { header: 'Status', width: 10, accessor: (item) => item.status },
                  ]}
                />
              </div>
            </Card>

            <Card>
              <div className="p-4">
                <h3 className="text-lg font-semibold">Recent Activity</h3>
                <p className="text-sm text-gray-500">Latest system changes and updates</p>
              </div>
              <div className="p-4">
                <div className="font-mono text-sm">
                  <pre className="whitespace-pre-wrap">
                    [INFO] System check completed
                    [WARN] Memory usage above 80%
                    [INFO] New requirement added
                    [INFO] Backup completed
                  </pre>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="requirements">
          <Card>
            <div className="p-6">
              <div className="font-mono">
                {requirements.map(req => (
                  <div key={req.id} className="mb-4 p-4 border rounded">
                    <div className="flex justify-between">
                      <span>#{req.id} {req.title}</span>
                      <span>{req.status}</span>
                    </div>
                    <div className="text-sm text-gray-500 mt-2">
                      <div>Priority: {req.priority}</div>
                      <div>Assignee: {req.assignee}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="terminal">
          <Card>
            <div className="p-4">
              <div className="font-mono bg-black text-green-400 p-4 rounded-lg h-[400px] overflow-auto">
                <pre className="whitespace-pre-wrap">
                  $ system-check
                  Running diagnostics...
                  All systems operational.
                  
                  $ view-logs
                  Fetching recent logs...
                  [2024-02-20 10:15] System initialized
                  [2024-02-20 10:16] Services started
                  [2024-02-20 10:17] Monitoring active
                </pre>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="chat">
          <Card>
            <div className="p-6">
              <div className="flex flex-col h-[500px]">
                <ScrollArea className="flex-grow mb-4 p-4 border rounded-lg">
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`mb-4 ${
                        msg.role === 'user' ? 'text-blue-600' : 'text-green-600'
                      }`}
                    >
                      <span className="font-bold">{msg.role === 'user' ? 'You' : 'AI'}:</span>
                      <pre className="font-mono whitespace-pre-wrap">{msg.content}</pre>
                    </div>
                  ))}
                </ScrollArea>
                <div className="flex gap-2">
                  <Textarea
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask me anything about the system..."
                    className="font-mono"
                  />
                  <Button onClick={handleChatSubmit}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </div>
    </div>
  );
}
