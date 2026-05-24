import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Zenith Enterprise database...');

  // 1. Delete existing data to ensure idempotent run
  await prisma.comment.deleteMany({});
  await prisma.subtask.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.sprint.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.membership.deleteMany({});
  await prisma.document.deleteMany({});
  await prisma.workspace.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Create Default Users
  const passwordHash = await bcrypt.hash('password123', 10);
  
  const lead = await prisma.user.create({
    data: {
      email: 'lead@zenith.com',
      passwordHash,
      name: 'Gangadhar',
      image: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Gangadhar'
    }
  });

  const member = await prisma.user.create({
    data: {
      email: 'developer@zenith.com',
      passwordHash,
      name: 'Sarah Chen',
      image: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Sarah'
    }
  });

  console.log('Provisioned Users:', lead.name, '&', member.name);

  // 3. Create Workspace
  const workspace = await prisma.workspace.create({
    data: {
      name: 'Zenith Tech Group',
      slug: 'zenith-tech-group',
      description: 'Central engineering hub for product milestones.',
      memberships: {
        createMany: {
          data: [
            { userId: lead.id, role: 'OWNER' },
            { userId: member.id, role: 'MEMBER' }
          ]
        }
      }
    }
  });

  console.log('Provisioned Workspace:', workspace.name);

  // 4. Create Project
  const project = await prisma.project.create({
    data: {
      name: 'Next.js 15 Migration Suite',
      description: 'Refactoring master interfaces to Next 15 App router, React 19, and Tailwind.',
      coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60',
      status: 'ACTIVE',
      priority: 'HIGH',
      deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days out
      tags: ['Engineering', 'Frontend'],
      workspaceId: workspace.id,
      isStarred: true
    }
  });

  console.log('Provisioned Project:', project.name);

  // 5. Create Sprints
  const sprint = await prisma.sprint.create({
    data: {
      name: 'Sprint v1.0 - Foundations',
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'ACTIVE',
      projectId: project.id
    }
  });

  console.log('Provisioned Sprint:', sprint.name);

  // 6. Create Tasks
  const task1 = await prisma.task.create({
    data: {
      title: 'Design Prisma PostgreSQL schema layers',
      description: 'Define relational map fields for Workspace, Sprints, Subtasks, and AIHistory tracking.',
      status: 'DONE',
      priority: 'HIGH',
      dueDate: new Date(),
      order: 100,
      tags: ['Database', 'Prisma'],
      projectId: project.id,
      sprintId: sprint.id,
      assigneeId: lead.id,
      reporterId: lead.id,
      subtasks: {
        createMany: {
          data: [
            { title: 'Write Prisma DSL models', isCompleted: true },
            { title: 'Add schema foreign cascade mappings', isCompleted: true }
          ]
        }
      },
      comments: {
        create: {
          content: 'Prisma model mappings completed. Performance indexes review is pending database migrations.',
          userId: lead.id
        }
      }
    }
  });

  const task2 = await prisma.task.create({
    data: {
      title: 'Integrate real-time Socket.io board synchronization',
      description: 'Establish Socket rooms and wire card drag movements and cursor updates.',
      status: 'IN_PROGRESS',
      priority: 'URGENT',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      order: 200,
      tags: ['Realtime', 'Sockets'],
      projectId: project.id,
      sprintId: sprint.id,
      assigneeId: member.id,
      reporterId: lead.id,
      subtasks: {
        createMany: {
          data: [
            { title: 'Setup Express server Socket bindings', isCompleted: true },
            { title: 'Add active typing state listeners', isCompleted: false }
          ]
        }
      }
    }
  });

  const task3 = await prisma.task.create({
    data: {
      title: 'Build executive Recharts velocity analytics graphs',
      description: 'Hook up completed sprint done counts to responsive burn-down lines.',
      status: 'TODO',
      priority: 'MEDIUM',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      order: 300,
      tags: ['Analytics', 'Frontend'],
      projectId: project.id,
      sprintId: sprint.id,
      assigneeId: member.id,
      reporterId: lead.id
    }
  });

  const task4 = await prisma.task.create({
    data: {
      title: 'Evaluate Gemini AI riskey bottlenecks analyzer',
      description: 'Add safety capacity checks and date predictions filters.',
      status: 'BACKLOG',
      priority: 'LOW',
      order: 400,
      tags: ['AI', 'Gemini'],
      projectId: project.id
    }
  });

  console.log('Provisioned Tasks successfully.');

  // 7. Create Documents
  await prisma.document.create({
    data: {
      title: 'Zenith Engineering Guide',
      content: '# Zenith Agile System\n\nWelcome to Zenith, the next-generation enterprise AI Project Management platform.\n\n## Technology Architecture\n- **Frontend**: Next.js 15, React 19, Recharts, Framer Motion\n- **Backend**: Node Express, Socket.io for presence cursors\n- **Database**: PostgreSQL with Prisma ORM\n\n## Collaborative standards\nEnsure tasks have clear tags and associated checklists to allow the smart assignment predictor to make accurate velocity estimates.',
      isWiki: true,
      userId: lead.id,
      workspaceId: workspace.id
    }
  });

  console.log('Provisioned Document Wikis.');
  console.log('Zenith Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
