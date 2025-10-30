/**
 * Template system for Mermaid diagrams
 * Based on analysis of mermaid examples package
 */

import { MCPToolRequest, MCPToolResponse, DiagramTemplate } from '../types/index.js';

/**
 * Pre-built diagram templates based on mermaid examples
 */
const DIAGRAM_TEMPLATES: DiagramTemplate[] = [
  // Flowchart Templates
  {
    id: 'flowchart-basic',
    name: 'Basic Flowchart',
    type: 'flowchart',
    description: 'Simple top-down flowchart with decision points',
    category: 'flowchart',
    tags: ['basic', 'decision', 'process'],
    code: `flowchart TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Keep going]
    B -->|No| D[Fix it]
    D --> B
    C --> E[End]`
  },
  {
    id: 'flowchart-complex',
    name: 'Complex Process Flow',
    type: 'flowchart',
    description: 'Complex flowchart with multiple decision points and subprocesses',
    category: 'flowchart',
    tags: ['complex', 'subprocess', 'multiple-decisions'],
    code: `flowchart TD
    A[User Request] --> B{Valid Input?}
    B -->|No| C[Show Error]
    C --> A
    B -->|Yes| D[Process Request]
    D --> E{Success?}
    E -->|No| F[Log Error]
    F --> G[Return Error Response]
    E -->|Yes| H[Update Database]
    H --> I{Database Updated?}
    I -->|No| J[Rollback]
    J --> F
    I -->|Yes| K[Send Success Response]
    K --> L[End]
    G --> L`
  },

  // Sequence Diagram Templates
  {
    id: 'sequence-api',
    name: 'API Call Sequence',
    type: 'sequence',
    description: 'Typical API request-response sequence',
    category: 'sequence',
    tags: ['api', 'request', 'response', 'authentication'],
    code: `sequenceDiagram
    participant C as Client
    participant A as API Gateway
    participant S as Service
    participant D as Database
    
    C->>A: Request with Token
    A->>A: Validate Token
    A->>S: Forward Request
    S->>D: Query Data
    D-->>S: Return Data
    S-->>A: Process Response
    A-->>C: Return Response`
  },
  {
    id: 'sequence-user-auth',
    name: 'User Authentication Flow',
    type: 'sequence',
    description: 'Complete user authentication sequence',
    category: 'sequence',
    tags: ['authentication', 'login', 'security'],
    code: `sequenceDiagram
    participant U as User
    participant B as Browser
    participant S as Auth Server
    participant D as Database
    
    U->>B: Enter Credentials
    B->>S: Login Request
    S->>D: Validate Credentials
    D-->>S: User Found
    S->>S: Generate JWT
    S-->>B: Return Token
    B-->>U: Login Success
    
    Note over U,D: User is now authenticated`
  },

  // Class Diagram Templates
  {
    id: 'class-basic',
    name: 'Basic Class Structure',
    type: 'class',
    description: 'Simple class diagram with inheritance',
    category: 'class',
    tags: ['inheritance', 'methods', 'properties'],
    code: `classDiagram
    class Animal {
        +String name
        +int age
        +eat()
        +sleep()
    }
    
    class Dog {
        +String breed
        +bark()
        +fetch()
    }
    
    class Cat {
        +String color
        +meow()
        +purr()
    }
    
    Animal <|-- Dog
    Animal <|-- Cat`
  },

  // State Diagram Templates
  {
    id: 'state-order',
    name: 'Order Processing States',
    type: 'state',
    description: 'Order lifecycle state transitions',
    category: 'state',
    tags: ['order', 'lifecycle', 'business-process'],
    code: `stateDiagram-v2
    [*] --> Pending
    Pending --> Processing : Payment Confirmed
    Pending --> Cancelled : Payment Failed
    Processing --> Shipped : Items Ready
    Processing --> Cancelled : Out of Stock
    Shipped --> Delivered : Package Received
    Shipped --> Returned : Package Rejected
    Delivered --> [*]
    Cancelled --> [*]
    Returned --> Processing : Restock`
  },

  // ER Diagram Templates
  {
    id: 'er-ecommerce',
    name: 'E-commerce Database',
    type: 'er',
    description: 'Basic e-commerce database relationships',
    category: 'er',
    tags: ['database', 'ecommerce', 'relationships'],
    code: `erDiagram
    CUSTOMER {
        int customer_id PK
        string first_name
        string last_name
        string email
        string phone
    }
    
    ORDER {
        int order_id PK
        int customer_id FK
        date order_date
        decimal total_amount
        string status
    }
    
    PRODUCT {
        int product_id PK
        string name
        string description
        decimal price
        int stock_quantity
    }
    
    ORDER_ITEM {
        int order_id FK
        int product_id FK
        int quantity
        decimal unit_price
    }
    
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--o{ ORDER_ITEM : contains
    PRODUCT ||--o{ ORDER_ITEM : ordered`
  },

  // Gantt Chart Template
  {
    id: 'gantt-project',
    name: 'Project Timeline',
    type: 'gantt',
    description: 'Software development project timeline',
    category: 'gantt',
    tags: ['project', 'timeline', 'development'],
    code: `gantt
    title Software Development Project
    dateFormat YYYY-MM-DD
    section Planning
    Requirements Gathering    :req, 2024-01-01, 2024-01-15
    System Design           :design, after req, 2024-01-30
    section Development
    Backend Development     :backend, 2024-02-01, 2024-03-15
    Frontend Development    :frontend, 2024-02-15, 2024-03-30
    Integration            :integration, after backend, 2024-04-05
    section Testing
    Unit Testing           :unit-test, 2024-03-01, 2024-03-20
    System Testing         :sys-test, after integration, 2024-04-15
    User Acceptance Testing :uat, after sys-test, 2024-04-25
    section Deployment
    Production Deployment   :deployment, after uat, 2024-05-01`
  },

  // Git Graph Template
  {
    id: 'gitgraph-workflow',
    name: 'Git Workflow',
    type: 'gitgraph',
    description: 'Feature branch git workflow',
    category: 'gitgraph',
    tags: ['git', 'workflow', 'branching'],
    code: `gitgraph
    commit id: "Initial commit"
    branch develop
    checkout develop
    commit id: "Add basic structure"
    branch feature/auth
    checkout feature/auth
    commit id: "Add authentication"
    commit id: "Add user management"
    checkout develop
    merge feature/auth
    commit id: "Update dependencies"
    checkout main
    merge develop
    commit id: "Release v1.0"`
  },

  // Mindmap Template
  {
    id: 'mindmap-project',
    name: 'Project Planning Mindmap',
    type: 'mindmap',
    description: 'Project planning and organization mindmap',
    category: 'mindmap',
    tags: ['planning', 'organization', 'brainstorming'],
    code: `mindmap
  root((Project))
    Planning
      Requirements
      Timeline
      Budget
      Resources
    Development
      Backend
        API Design
        Database
        Security
      Frontend
        UI/UX
        Components
        Testing
    Deployment
      Environment
      CI/CD
      Monitoring
    Team
      Developers
      Designers
      Project Manager`
  },

  // Timeline Template
  {
    id: 'timeline-company',
    name: 'Company Milestones',
    type: 'timeline',
    description: 'Company growth timeline',
    category: 'timeline',
    tags: ['milestones', 'history', 'growth'],
    code: `timeline
    title Company Growth Timeline
    
    2020 : Company Founded
         : First Employee
    
    2021 : Product Launch
         : Seed Funding
         : 10 Employees
    
    2022 : Series A
         : International Expansion
         : 50 Employees
    
    2023 : Major Partnership
         : Series B
         : 100 Employees
    
    2024 : IPO Preparation
         : Market Leader
         : 250 Employees`
  }
];

/**
 * Get all available templates
 */
export async function listDiagramTemplates(request: MCPToolRequest): Promise<MCPToolResponse> {
  try {
    const { category, type } = request.arguments as { category?: string; type?: string };
    
    let templates = DIAGRAM_TEMPLATES;
    
    // Filter by category if specified
    if (category) {
      templates = templates.filter(t => t.category === category);
    }
    
    // Filter by type if specified
    if (type) {
      templates = templates.filter(t => t.type === type);
    }
    
    const templateList = templates.map(template => 
      `### ${template.name} (\`${template.id}\`)\n` +
      `**Type:** ${template.type} | **Category:** ${template.category}\n` +
      `**Description:** ${template.description}\n` +
      `**Tags:** ${template.tags?.join(', ')}\n`
    ).join('\n');
    
    const categories = [...new Set(DIAGRAM_TEMPLATES.map(t => t.category))];
    const types = [...new Set(DIAGRAM_TEMPLATES.map(t => t.type))];
    
    return {
      content: [{
        type: 'text',
        text: `📋 **Available Templates** (${templates.length} found)\n\n` +
              `**Categories:** ${categories.join(', ')}\n` +
              `**Types:** ${types.join(', ')}\n\n` +
              `${templateList}\n` +
              `💡 Use \`getTemplate\` with the template ID to get the code!`
      }]
    };
  } catch (error: any) {
    return {
      content: [{
        type: 'text',
        text: `❌ Error listing templates: ${error.message}`
      }],
      isError: true
    };
  }
}

/**
 * Get a specific template by ID
 */
export async function getTemplate(request: MCPToolRequest): Promise<MCPToolResponse> {
  try {
    const { templateId } = request.arguments as { templateId: string };
    
    if (!templateId) {
      return {
        content: [{
          type: 'text',
          text: 'Error: templateId is required'
        }],
        isError: true
      };
    }
    
    const template = DIAGRAM_TEMPLATES.find(t => t.id === templateId);
    
    if (!template) {
      const availableIds = DIAGRAM_TEMPLATES.map(t => t.id);
      return {
        content: [{
          type: 'text',
          text: `❌ Template '${templateId}' not found.\n\nAvailable templates:\n${availableIds.map(id => `• ${id}`).join('\n')}`
        }],
        isError: true
      };
    }
    
    return {
      content: [{
        type: 'text',
        text: `📋 **${template.name}** Template\n\n` +
              `**Type:** ${template.type}\n` +
              `**Category:** ${template.category}\n` +
              `**Description:** ${template.description}\n` +
              `**Tags:** ${template.tags?.join(', ')}\n\n` +
              `**Code:**\n\`\`\`mermaid\n${template.code}\n\`\`\`\n\n` +
              `💡 Copy this code to generate the diagram!`
      }]
    };
  } catch (error: any) {
    return {
      content: [{
        type: 'text',
        text: `❌ Error getting template: ${error.message}`
      }],
      isError: true
    };
  }
}

/**
 * Create a custom template from diagram code
 */
export async function createCustomTemplate(request: MCPToolRequest): Promise<MCPToolResponse> {
  try {
    const { 
      name, 
      description, 
      code, 
      category = 'custom',
      tags = [] 
    } = request.arguments as {
      name: string;
      description: string;
      code: string;
      category?: string;
      tags?: string[];
    };
    
    if (!name || !description || !code) {
      return {
        content: [{
          type: 'text',
          text: 'Error: name, description, and code are required'
        }],
        isError: true
      };
    }
    
    // Generate ID from name
    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    
    // Detect diagram type from code
    const type = code.trim().split('\n')[0].split(' ')[0].toLowerCase();
    
    const customTemplate: DiagramTemplate = {
      id: `custom-${id}`,
      name,
      type,
      description,
      category,
      tags: ['custom', ...tags],
      code: code.trim()
    };
    
    return {
      content: [{
        type: 'text',
        text: `✅ **Custom Template Created!**\n\n` +
              `**ID:** \`${customTemplate.id}\`\n` +
              `**Name:** ${customTemplate.name}\n` +
              `**Type:** ${customTemplate.type}\n` +
              `**Category:** ${customTemplate.category}\n` +
              `**Tags:** ${customTemplate.tags?.join(', ') || 'none'}\n\n` +
              `**Preview:**\n\`\`\`mermaid\n${customTemplate.code}\n\`\`\`\n\n` +
              `💾 Note: This template is available for this session only. For persistence, save the template definition.`
      }]
    };
  } catch (error: any) {
    return {
      content: [{
        type: 'text',
        text: `❌ Error creating custom template: ${error.message}`
      }],
      isError: true
    };
  }
}

/**
 * Search templates by keyword
 */
export async function searchTemplates(request: MCPToolRequest): Promise<MCPToolResponse> {
  try {
    const { query } = request.arguments as { query: string };
    
    if (!query) {
      return {
        content: [{
          type: 'text',
          text: 'Error: search query is required'
        }],
        isError: true
      };
    }
    
    const searchTerm = query.toLowerCase();
    const matches = DIAGRAM_TEMPLATES.filter(template => 
      template.name.toLowerCase().includes(searchTerm) ||
      template.description.toLowerCase().includes(searchTerm) ||
      template.type.toLowerCase().includes(searchTerm) ||
      (template.category?.toLowerCase().includes(searchTerm) || false) ||
      template.tags?.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      template.code.toLowerCase().includes(searchTerm)
    );
    
    if (matches.length === 0) {
      return {
        content: [{
          type: 'text',
          text: `🔍 No templates found matching "${query}"`
        }]
      };
    }
    
    const resultList = matches.map(template => 
      `### ${template.name} (\`${template.id}\`)\n` +
      `**Type:** ${template.type} | **Category:** ${template.category}\n` +
      `**Description:** ${template.description}\n`
    ).join('\n');
    
    return {
      content: [{
        type: 'text',
        text: `🔍 **Search Results for "${query}"** (${matches.length} found)\n\n${resultList}`
      }]
    };
  } catch (error: any) {
    return {
      content: [{
        type: 'text',
        text: `❌ Error searching templates: ${error.message}`
      }],
      isError: true
    };
  }
}