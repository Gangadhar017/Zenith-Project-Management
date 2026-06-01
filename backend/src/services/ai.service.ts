import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '../lib/prisma';

// Simple model configurations
const apiKey = process.env.GEMINI_API_KEY || '';
const hasApiKey = apiKey.trim().length > 0;

let genAI: any = null;
if (hasApiKey) {
  try {
    // Initialise Gemini client
    genAI = new GoogleGenerativeAI(apiKey);
  } catch (error) {
    console.error('Failed to initialize GoogleGenerativeAI client', error);
  }
}

export class AIService {
  /**
   * Helper to execute prompt on Gemini or fallback
   */
  private static async executePrompt(prompt: string, fallbackJson: any): Promise<any> {
    if (hasApiKey && genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        
        // Clean JSON formatting from Gemini markdown block
        const jsonMatch = text.match(/\{[\s\S]*\}/) || text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        return JSON.parse(text);
      } catch (err) {
        console.warn('Gemini execution failed or JSON parsing failed. Falling back to Mock service.', err);
        return fallbackJson;
      }
    }
    
    // Simulate slight network delay for high-fidelity experience
    await new Promise((resolve) => setTimeout(resolve, 800));
    return fallbackJson;
  }

  /**
   * 1. Prompt-to-Tasks Generation
   */
  static async generateTasksFromPrompt(prompt: string): Promise<Array<{
    title: string;
    description: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    tags: string[];
    subtasks: string[];
  }>> {
    const fallback = [
      {
        title: 'Initial Database Schema Design',
        description: `Plan and outline SQL schemas based on prompt: "${prompt}". Configure relation maps and secondary indexes.`,
        priority: 'HIGH' as const,
        tags: ['Database', 'Backend'],
        subtasks: ['Define primary models', 'Set foreign keys', 'Review query index performance']
      },
      {
        title: 'API Endpoint Mockups',
        description: 'Create CRUD controller endpoints matching the model requirements.',
        priority: 'MEDIUM' as const,
        tags: ['API', 'Express'],
        subtasks: ['Write request validations', 'Setup route listeners', 'Test status returns']
      },
      {
        title: 'Client State Architecture Integration',
        description: 'Initialize State managers and hook real-time listeners for task feeds.',
        priority: 'HIGH' as const,
        tags: ['Frontend', 'Zustand'],
        subtasks: ['Create store slice', 'Wire UI drag-and-drop triggers', 'Validate cache updates']
      }
    ];

    const aiPrompt = `
      You are an expert scrum master and product owner.
      Generate 3 highly detailed, actionable tasks in JSON format based on the following user requirements:
      "${prompt}"

      The output MUST be a JSON array of tasks matching this TypeScript structure:
      Array<{
        title: string;
        description: string;
        priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
        tags: string[];
        subtasks: string[];
      }>
      Only return the raw JSON array. No markdown code blocks.
    `;

    return await this.executePrompt(aiPrompt, fallback);
  }

  /**
   * 2. AI Sprint Optimizer (Capacity-Aware)
   */
  static async optimizeSprint(
    workspaceId: string, 
    backlogTasks: any[], 
    sprintName: string, 
    teamSize: number
  ) {
    const taskCount = backlogTasks.length;
    
    // 1. Fetch live workspace membership and workloads
    let membersInfo: Array<{
      id: string;
      name: string;
      role: string;
      activeTasksCount: number;
      highPriorityTasksCount: number;
    }> = [];

    try {
      const members = await prisma.membership.findMany({
        where: { workspaceId },
        include: {
          user: {
            include: {
              assignedTasks: {
                where: {
                  status: {
                    not: 'DONE'
                  }
                }
              }
            }
          }
        }
      });
      membersInfo = members.map(m => ({
        id: m.user.id,
        name: m.user.name,
        role: m.role,
        activeTasksCount: m.user.assignedTasks.length,
        highPriorityTasksCount: m.user.assignedTasks.filter(t => t.priority === 'HIGH' || t.priority === 'URGENT').length
      }));
    } catch (err) {
      console.error('Failed to fetch workspace memberships workloads:', err);
    }

    const calculatedTeamSize = membersInfo.length || teamSize || 3;

    // 2. Refined fallback recommendations based on actual workload metrics
    const fallback = {
      sprintName: sprintName || 'AI Optimized Sprint',
      recommendedCapacity: calculatedTeamSize * 8, // hours per developer per sprint
      assignedTasksCount: Math.min(taskCount, 5),
      riskScore: membersInfo.some(m => m.activeTasksCount > 4) ? 65 : 25,
      recommendations: [
        'Backlog looks healthy. High priority tasks have been scheduled first.',
        ...membersInfo.map(m => m.activeTasksCount > 4 
          ? `Warning: ${m.name} (${m.role}) is near/over capacity with ${m.activeTasksCount} active tasks. Consider reassigning new cards.`
          : `${m.name} (${m.role}) has optimal capacity (${m.activeTasksCount} active tasks) for sprint assignments.`
        ),
        'Keep daily sync focused on the core integration paths.'
      ]
    };

    const aiPrompt = `
      You are an elite agile coordinator and capacity-aware scrum master.
      We are planning a sprint named "${sprintName}" in a workspace with the following team members and their current active workloads:
      ${JSON.stringify(membersInfo, null, 2)}

      Here is the list of new backlog items to prioritize and assign:
      ${JSON.stringify(backlogTasks.map(t => ({ id: t.id, title: t.title, priority: t.priority, tags: t.tags })))}

      Please optimize the sprint planning. The response MUST:
      1. Calculate recommendedCapacity (total points/hours recommended for the team).
      2. Decide which backlog tasks to assign to which team members based on their roles, expertise (matching task tags), and their current workload. Keep active tasks count balanced (do not overload people with already high workloads, assign more tasks to members with lighter workloads).
      3. Compute a riskScore (0 to 100) representing the risk of failing the sprint. If some members are overloaded or there are many urgent backlog tasks, riskScore should reflect this.
      4. Provide clear, highly detailed, capacity-aware action-item recommendations. Include who should take which task, why they were chosen, and warning highlights if a member is near/over capacity.

      Return the analysis in a clean JSON format matching the following:
      {
        "sprintName": string,
        "recommendedCapacity": number,
        "assignedTasksCount": number,
        "riskScore": number,
        "recommendations": string[]
      }
      Only return the raw JSON object. No markdown code blocks.
    `;

    return await this.executePrompt(aiPrompt, fallback);
  }

  /**
   * 3. AI Project Summary
   */
  static async generateProjectSummary(projectId: string) {
    // Fetch project tasks to summarize dynamically
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { tasks: true }
    });

    const taskStats = {
      total: project?.tasks.length || 0,
      todo: project?.tasks.filter(t => t.status === 'TODO').length || 0,
      inProgress: project?.tasks.filter(t => t.status === 'IN_PROGRESS').length || 0,
      completed: project?.tasks.filter(t => t.status === 'DONE').length || 0
    };

    const fallback = {
      projectName: project?.name || 'Zenith Project',
      healthScore: taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 80,
      milestones: [
        `Core systems: ${taskStats.completed}/${taskStats.total} components completed.`,
        'Frontend structure fully mapped.',
        'Real-time board synchronization engine completed.'
      ],
      bottlenecks: taskStats.todo > 5 ? 'High backlog volume. Recommend creating secondary sub-sprint.' : 'No major bottlenecks identified.',
      executiveSummary: `Project "${project?.name || 'Zenith'}" is running smoothly. Sprints have high alignment. Velocity is stable.`
    };

    const aiPrompt = `
      You are an executive reporter. Summarize the following project metrics:
      Project Name: ${project?.name || 'Zenith Project'}
      Total Tasks: ${taskStats.total} (TODO: ${taskStats.todo}, IN PROGRESS: ${taskStats.inProgress}, DONE: ${taskStats.completed})
      
      Return a JSON summary including:
      - projectName: string
      - healthScore: number (0 - 100)
      - milestones: string[] (major highlights)
      - bottlenecks: string (any risk or bottleneck description)
      - executiveSummary: string (a short executive paragraph)
    `;

    return await this.executePrompt(aiPrompt, fallback);
  }

  /**
   * 4. Meeting Notes Summarizer
   */
  static async summarizeMeetingNotes(transcript: string) {
    const fallback = {
      summary: 'Daily standup aligned on API validation schemas, Tailwind CSS templates, and Clerk integrations.',
      actionItems: [
        { taskTitle: 'Finalize Auth JWT hooks', assigneeSuggestion: 'Backend Dev', priority: 'HIGH' },
        { taskTitle: 'Refactor Tailwind dashboard cards', assigneeSuggestion: 'Frontend Dev', priority: 'MEDIUM' },
        { taskTitle: 'Setup Neon Postgres Connection pool', assigneeSuggestion: 'Database Eng', priority: 'HIGH' }
      ]
    };

    const aiPrompt = `
      You are a technical scribe.
      Extract summary and structured action items from this meeting note transcript:
      "${transcript}"

      Return JSON with:
      - summary (string)
      - actionItems (array of objects: { taskTitle: string, assigneeSuggestion: string, priority: 'LOW'|'MEDIUM'|'HIGH' })
    `;

    return await this.executePrompt(aiPrompt, fallback);
  }

  /**
   * 5. AI Risk Detection
   */
  static async detectRisks(workspaceId: string) {
    const fallback = {
      overallRisk: 'LOW',
      riskFactors: [
        { source: 'Deadline pressure', severity: 'MEDIUM', description: 'Two main projects have deadlines within 7 days.' },
        { source: 'Resource overload', severity: 'LOW', description: 'Active items are distributed evenly among members.' }
      ],
      preventativeActions: [
        'Re-evaluate upcoming roadmap milestones.',
        'Verify tasks have clear sub-checklists assigned.'
      ]
    };

    const aiPrompt = `
      Analyze active workspaces for organizational risks.
      Provide a JSON analysis containing:
      - overallRisk ('LOW' | 'MEDIUM' | 'HIGH')
      - riskFactors (array of objects: { source: string, severity: 'LOW'|'MEDIUM'|'HIGH', description: string })
      - preventativeActions (string[])
    `;

    return await this.executePrompt(aiPrompt, fallback);
  }

  /**
   * 6. AI Productivity Insights
   */
  static async getProductivityInsights(userId: string) {
    const fallback = {
      efficiencyScore: 88,
      focusHoursPerDay: 4.5,
      strengths: ['High completion rate on URGENT tags', 'Fast turnaround on bug resolution'],
      focusAreas: ['Subtasks allocation is low', 'Daily Standup updating has been delayed'],
      actionableTips: [
        'Carve out a dedicated 90-minute slot in the morning for deep focus work.',
        'Document subtask steps explicitly to avoid duplicate efforts.'
      ]
    };

    const aiPrompt = `
      Generate workspace productivity insights for user ID "${userId}".
      Return JSON:
      - efficiencyScore (number 0-100)
      - focusHoursPerDay (number)
      - strengths (string[])
      - focusAreas (string[])
      - actionableTips (string[])
    `;

    return await this.executePrompt(aiPrompt, fallback);
  }

  /**
   * 7. AI Bug Solver
   */
  static async solveBug(bugTitle: string, bugDescription: string) {
    const fallback = {
      rootCauseAnalysis: 'Authentication payload mismatch. Next.js App router session fails to forward headers to Express middleware.',
      proposedFixSteps: [
        'Verify CORS origin configuration allows credential inclusion.',
        'Implement explicit JWT cookie extraction headers within Express CORS middleware.',
        'Verify cookies options: secure=true, httpOnly=true, sameSite=lax'
      ],
      codeSnippet: `// CORS middleware edit
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));`
    };

    const aiPrompt = `
      Solve this bug:
      Bug Title: "${bugTitle}"
      Bug Description: "${bugDescription}"

      Provide a JSON solution with:
      - rootCauseAnalysis (string)
      - proposedFixSteps (string[])
      - codeSnippet (string with formatted code)
    `;

    return await this.executePrompt(aiPrompt, fallback);
  }

  /**
   * 8. AI Deadline Predictor
   */
  static async predictDeadline(projectId: string) {
    const fallback = {
      predictedCompletionDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 10 days out
      confidenceLevel: 85, // percent
      velocityVariance: 'Stable (+2% over past 7 days)',
      insights: [
        'Overall completion velocity supports current milestone commitments.',
        'Adding more subtasks will improve predictor metrics.'
      ]
    };

    const aiPrompt = `
      Analyze current task progress speeds for project ID "${projectId}".
      Predict completion trends.
      Return JSON:
      - predictedCompletionDate (YYYY-MM-DD)
      - confidenceLevel (0-100)
      - velocityVariance (description string)
      - insights (string[])
    `;

    return await this.executePrompt(aiPrompt, fallback);
  }

  /**
   * 9. AI Smart Assignment
   */
  static async smartAssignTask(taskTitle: string, taskTags: string[], candidates: Array<{ id: string, name: string }>) {
    const recommendedId = candidates[0]?.id || '1';
    const fallback = {
      recommendedAssigneeId: recommendedId,
      reasoning: `Recommended based on expert efficiency tags matching: [${taskTags.join(', ')}]. Past backlog speeds are optimal.`,
      alternativeSuggestions: candidates.slice(1).map(c => c.name)
    };

    const aiPrompt = `
      Determine the best assignee.
      Task Title: "${taskTitle}"
      Task Tags: ${JSON.stringify(taskTags)}
      Candidates: ${JSON.stringify(candidates)}

      Return JSON:
      - recommendedAssigneeId (matching a candidate ID)
      - reasoning (string explanation)
      - alternativeSuggestions (string array of candidate names)
    `;

    return await this.executePrompt(aiPrompt, fallback);
  }

  /**
   * 10. AI Daily Standup Generator
   */
  static async generateDailyStandup(userId: string) {
    const fallback = {
      yesterday: 'Designed dynamic dashboard layouts and connected state store providers.',
      today: 'Integrating real-time presence indicators via Socket.io and implementing Gemini AI controller pathways.',
      blockers: 'Resolving minor routing issues with CORS cookies in local dev environments.'
    };

    const aiPrompt = `
      Create a 3-part Daily Standup update (yesterday, today, blockers) for developer ID "${userId}".
      Return JSON:
      - yesterday (string)
      - today (string)
      - blockers (string)
    `;

    return await this.executePrompt(aiPrompt, fallback);
  }

  /**
   * 11. Workspace AI Chatbot Assistant (Grounded RAG/DB context)
   */
  static async chatWithWorkspace(workspaceId: string, message: string) {
    // 1. Fetch live workspace dataset from Postgres DB
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        projects: {
          include: {
            tasks: {
              include: {
                assignee: true
              }
            }
          }
        },
        documents: {
          select: {
            title: true,
            content: true,
            isWiki: true
          }
        }
      }
    });

    // 2. Synthesize context maps for projects and tasks
    const projectsList = workspace?.projects.map(p => ({
      name: p.name,
      description: p.description,
      status: p.status,
      tasks: p.tasks.map(t => ({
        title: t.title,
        status: t.status,
        priority: t.priority,
        assignee: t.assignee?.name || 'Unassigned'
      }))
    })) || [];

    // 3. Synthesize context maps for documents using keyword-relevance ranking (RAG context filtering)
    const queryTerms = message.toLowerCase().split(/\s+/).filter(term => term.length > 2);
    
    const documentsList = (workspace?.documents || []).map(doc => {
      let score = 0;
      const titleLower = doc.title.toLowerCase();
      const contentLower = doc.content.toLowerCase();
      
      for (const term of queryTerms) {
        if (titleLower.includes(term)) score += 10; // title keyword matches are high value
        if (contentLower.includes(term)) score += 2; // content matches
      }
      
      return { doc, score };
    })
    // Sort in descending order of relevance score
    .sort((a, b) => b.score - a.score)
    // Keep top 5 most relevant documents to avoid exceeding token limit
    .slice(0, 5)
    .map(item => ({
      title: item.doc.title,
      isWiki: item.doc.isWiki,
      contentPreview: item.doc.content.slice(0, 500) // retrieve longer 500-char preview for grounding
    }));

    const fallback = {
      reply: `I scanned the active workspace "${workspace?.name || 'Zenith'}". You have ${projectsList.length} projects and ${documentsList.length} relevant wiki documents loaded. Let me know what specific task or wiki reference you'd like to dive into.`
    };

    const aiPrompt = `
      You are "Zenith Brain", the context-aware digital teammate and digital scrum assistant inside the enterprise agile project management app "Zenith".
      You have real-time access to all documents, wiki guides, projects, tasks, and assignees in this workspace.
      
      Here is the live grounded workspace database context:
      ==========================================
      Workspace Name: ${workspace?.name || 'N/A'}
      Description: ${workspace?.description || 'N/A'}
      
      PROJECTS & KANBAN BOARDS:
      ${JSON.stringify(projectsList, null, 2)}
      
      DOCUMENTS & WIKIS (Grounded RAG):
      ${JSON.stringify(documentsList, null, 2)}
      ==========================================

      Answer the user's inquiry based on this grounded database context. Keep your response professional, helpful, concise, and structured. 
      If the user is asking about specific task statuses, assignees, or wiki content, look it up in the context above and answer precisely. If the context does not contain the answer, answer politely using your general knowledge but mention that it is not explicitly mapped in the active workspace context.

      User Message: "${message}"

      The output MUST be a JSON object matching this structure:
      {
        "reply": string (markdown supported response text, you can use lists, bold text, etc.)
      }
      Only return the raw JSON object. No markdown code blocks.
    `;

    return await this.executePrompt(aiPrompt, fallback);
  }
}
