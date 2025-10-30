#!/usr/bin/env node

/**
 * Generate Sample Architecture SVG Files
 * Uses Puppeteer for browser-based rendering (workaround for DOMPurify issues)
 */

import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';

// Sample architecture diagrams
const samples = [
  {
    name: 'microservices-architecture',
    title: 'Microservices Architecture',
    code: `graph TB
    subgraph "Client Layer"
        Web[Web Application]
        Mobile[Mobile App]
    end
    
    subgraph "API Gateway"
        Gateway[API Gateway<br/>Load Balancer]
    end
    
    subgraph "Microservices"
        Auth[Authentication<br/>Service]
        User[User<br/>Service]
        Order[Order<br/>Service]
        Payment[Payment<br/>Service]
        Notification[Notification<br/>Service]
    end
    
    subgraph "Data Layer"
        AuthDB[(Auth DB)]
        UserDB[(User DB)]
        OrderDB[(Order DB)]
        PaymentDB[(Payment DB)]
    end
    
    subgraph "Infrastructure"
        Cache[Redis Cache]
        Queue[Message Queue]
        Storage[Object Storage]
    end
    
    Web --> Gateway
    Mobile --> Gateway
    
    Gateway --> Auth
    Gateway --> User
    Gateway --> Order
    Gateway --> Payment
    
    Auth --> AuthDB
    User --> UserDB
    Order --> OrderDB
    Payment --> PaymentDB
    
    Order --> Queue
    Payment --> Queue
    Queue --> Notification
    
    User --> Cache
    Order --> Cache
    
    Payment --> Storage
    
    style Gateway fill:#e1f5fe
    style Auth fill:#fff3e0
    style User fill:#fff3e0
    style Order fill:#fff3e0
    style Payment fill:#fff3e0
    style Notification fill:#fff3e0`
  },
  {
    name: 'cloud-infrastructure',
    title: 'Cloud Infrastructure',
    code: `flowchart TB
    subgraph Users_Layer["Users"]
        Users[End Users]
    end
    
    subgraph CDN_Layer["CDN & DNS"]
        CDN[CDN<br/>CloudFront]
        DNS[Route 53<br/>DNS]
    end
    
    subgraph LB_Layer["Load Balancing"]
        ALB[Application<br/>Load Balancer]
    end
    
    subgraph AZ1["Compute - Availability Zone 1"]
        EC2_1A[EC2 Instance]
        EC2_1B[EC2 Instance]
    end
    
    subgraph AZ2["Compute - Availability Zone 2"]
        EC2_2A[EC2 Instance]
        EC2_2B[EC2 Instance]
    end
    
    subgraph DB_Layer["Database"]
        RDS_Primary[(RDS Primary)]
        RDS_Standby[(RDS Standby)]
    end
    
    subgraph Storage_Layer["Storage"]
        S3[S3 Bucket]
        EBS[EBS Volumes]
    end
    
    subgraph Monitor_Layer["Monitoring"]
        CloudWatch[CloudWatch]
        CloudTrail[CloudTrail]
    end
    
    Users --> DNS
    DNS --> CDN
    CDN --> ALB
    
    ALB --> EC2_1A
    ALB --> EC2_1B
    ALB --> EC2_2A
    ALB --> EC2_2B
    
    EC2_1A --> RDS_Primary
    EC2_1B --> RDS_Primary
    EC2_2A --> RDS_Primary
    EC2_2B --> RDS_Primary
    
    RDS_Primary -.->|Replication| RDS_Standby
    
    EC2_1A --> S3
    EC2_2A --> S3
    
    EC2_1A --> EBS
    EC2_2A --> EBS
    
    EC2_1A --> CloudWatch
    EC2_2A --> CloudWatch
    ALB --> CloudWatch
    RDS_Primary --> CloudWatch
    
    style CDN fill:#e1f5fe
    style ALB fill:#c8e6c9
    style RDS_Primary fill:#fff3e0
    style S3 fill:#f3e5f5`
  },
  {
    name: 'cicd-pipeline',
    title: 'CI/CD Pipeline',
    code: `graph LR
    subgraph "Source Control"
        Git[Git Repository<br/>GitHub]
    end
    
    subgraph "CI Pipeline"
        Trigger[Webhook Trigger]
        Build[Build<br/>Compile Code]
        Test[Run Tests<br/>Unit & Integration]
        Security[Security Scan<br/>SAST/DAST]
        Quality[Code Quality<br/>SonarQube]
    end
    
    subgraph "Artifact Management"
        Registry[Container Registry<br/>Docker Hub/ECR]
    end
    
    subgraph "CD Pipeline"
        Deploy_Dev[Deploy to Dev]
        Test_Dev[Test Dev]
        Deploy_Staging[Deploy to Staging]
        Test_Staging[Test Staging]
        Approval[Manual Approval]
        Deploy_Prod[Deploy to Production]
    end
    
    subgraph "Monitoring"
        Monitor[Application<br/>Monitoring]
        Alerts[Alerts &<br/>Notifications]
    end
    
    Git -->|Push/PR| Trigger
    Trigger --> Build
    Build --> Test
    Test --> Security
    Security --> Quality
    Quality -->|Pass| Registry
    
    Registry --> Deploy_Dev
    Deploy_Dev --> Test_Dev
    Test_Dev -->|Pass| Deploy_Staging
    Deploy_Staging --> Test_Staging
    Test_Staging -->|Pass| Approval
    Approval -->|Approved| Deploy_Prod
    
    Deploy_Prod --> Monitor
    Monitor --> Alerts
    
    Quality -->|Fail| Git
    Test_Dev -->|Fail| Git
    Test_Staging -->|Fail| Git
    
    style Build fill:#e1f5fe
    style Test fill:#c8e6c9
    style Security fill:#ffebee
    style Deploy_Prod fill:#fff3e0
    style Approval fill:#f3e5f5`
  },
  {
    name: 'data-pipeline',
    title: 'Data Pipeline Architecture',
    code: `graph LR
    subgraph "Data Sources"
        API[External APIs]
        DB[Databases]
        Files[File Systems]
        Stream[Event Streams]
    end
    
    subgraph "Data Ingestion"
        Kafka[Apache Kafka]
        Kinesis[AWS Kinesis]
    end
    
    subgraph "Data Processing"
        Spark[Apache Spark<br/>Batch Processing]
        Flink[Apache Flink<br/>Stream Processing]
    end
    
    subgraph "Data Storage"
        Lake[Data Lake<br/>S3]
        Warehouse[Data Warehouse<br/>Redshift]
        Cache[Redis Cache]
    end
    
    subgraph "Analytics & ML"
        BI[BI Tools<br/>Tableau/PowerBI]
        ML[ML Models<br/>SageMaker]
        Analytics[Analytics Engine<br/>Athena]
    end
    
    API --> Kafka
    DB --> Kafka
    Files --> Kafka
    Stream --> Kinesis
    
    Kafka --> Spark
    Kinesis --> Flink
    
    Spark --> Lake
    Flink --> Warehouse
    Spark --> Warehouse
    
    Lake --> Analytics
    Warehouse --> BI
    Warehouse --> ML
    
    ML --> Cache
    Analytics --> Cache
    
    style Kafka fill:#e1f5fe
    style Spark fill:#c8e6c9
    style Lake fill:#fff3e0
    style Warehouse fill:#f3e5f5
    style ML fill:#ffebee`
  },
  {
    name: 'serverless-architecture',
    title: 'Serverless Architecture',
    code: `flowchart TB
    subgraph Client_Layer["Client"]
        Client[Web/Mobile Client]
    end
    
    subgraph API_Layer["API & Auth"]
        API[API Gateway]
        Cognito[AWS Cognito<br/>Authentication]
    end
    
    subgraph Lambda_Layer["Lambda Functions"]
        Auth_Lambda[Auth Lambda]
        User_Lambda[User Lambda]
        Data_Lambda[Data Lambda]
        Process_Lambda[Process Lambda]
    end
    
    subgraph Data_Layer["Data Storage"]
        DynamoDB[(DynamoDB)]
        S3[S3 Storage]
        RDS[(RDS Aurora<br/>Serverless)]
    end
    
    subgraph Async_Layer["Async Processing"]
        SQS[SQS Queue]
        SNS[SNS Topics]
        EventBridge[EventBridge]
    end
    
    subgraph Monitor_Layer["Monitoring"]
        CloudWatch[CloudWatch<br/>Logs & Metrics]
        XRay[X-Ray<br/>Tracing]
    end
    
    Client --> API
    API --> Cognito
    Cognito --> Auth_Lambda
    
    API --> User_Lambda
    API --> Data_Lambda
    
    User_Lambda --> DynamoDB
    Data_Lambda --> S3
    Data_Lambda --> RDS
    
    Data_Lambda --> SQS
    SQS --> Process_Lambda
    Process_Lambda --> SNS
    
    User_Lambda --> EventBridge
    EventBridge --> Process_Lambda
    
    Auth_Lambda --> CloudWatch
    User_Lambda --> CloudWatch
    Data_Lambda --> CloudWatch
    Process_Lambda --> CloudWatch
    
    API --> XRay
    User_Lambda --> XRay
    
    style API fill:#e1f5fe
    style Auth_Lambda fill:#fff3e0
    style User_Lambda fill:#fff3e0
    style Data_Lambda fill:#fff3e0
    style Process_Lambda fill:#fff3e0
    style DynamoDB fill:#c8e6c9`
  }
];

async function generateSVG(diagram) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // Create HTML with Mermaid using script tag (not module)
    const html = `
<!DOCTYPE html>
<html>
<head>
    <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
    <style>
        body {
            margin: 0;
            padding: 20px;
            background: white;
        }
    </style>
</head>
<body>
    <pre class="mermaid">
${diagram.code}
    </pre>
    <script>
        mermaid.initialize({ 
            startOnLoad: true,
            theme: 'default',
            securityLevel: 'loose',
            logLevel: 'debug'
        });
    </script>
</body>
</html>
`;

    await page.setContent(html);
    
    // Wait for Mermaid to fully render
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Get the SVG content
    const svgContent = await page.evaluate(() => {
      const svg = document.querySelector('svg');
      if (!svg) return null;
      
      // Get computed dimensions
      const bbox = svg.getBoundingClientRect();
      
      // Set proper dimensions
      if (!svg.hasAttribute('width') || svg.getAttribute('width') === '100%') {
        svg.setAttribute('width', Math.ceil(bbox.width));
      }
      if (!svg.hasAttribute('height') || svg.getAttribute('height') === '100%') {
        svg.setAttribute('height', Math.ceil(bbox.height));
      }
      
      // Add viewBox if missing
      if (!svg.hasAttribute('viewBox')) {
        svg.setAttribute('viewBox', `0 0 ${Math.ceil(bbox.width)} ${Math.ceil(bbox.height)}`);
      }
      
      return svg.outerHTML;
    });

    if (!svgContent || svgContent.length < 200) {
      throw new Error('SVG generation failed or produced empty result');
    }

    // Clean up the SVG:
    // 1. Fix self-closing br tags (Mermaid outputs <br> instead of <br/>)
    // 2. Remove any trailing whitespace
    let cleanedSvg = svgContent
      .replace(/<br>/g, '<br/>')  // Fix HTML br tags to XML self-closing format
      .trim();
    
    return cleanedSvg;
  } finally {
    await browser.close();
  }
}

async function main() {
  console.log('🎨 Generating Sample Architecture SVG Files...\n');

  // Create output directory
  const outputDir = path.join(process.cwd(), 'examples', 'architectures');
  await fs.mkdir(outputDir, { recursive: true });

  let successCount = 0;
  let failCount = 0;

  for (const sample of samples) {
    try {
      console.log(`📊 Generating: ${sample.title}...`);
      
      const svg = await generateSVG(sample);
      const filename = `${sample.name}.svg`;
      const filepath = path.join(outputDir, filename);
      
      await fs.writeFile(filepath, svg, 'utf-8');
      
      console.log(`✅ Created: ${filename}`);
      console.log(`   Path: ${filepath}\n`);
      successCount++;
      
    } catch (error) {
      console.error(`❌ Failed: ${sample.title}`);
      console.error(`   Error: ${error.message}\n`);
      failCount++;
    }
  }

  console.log('═'.repeat(60));
  console.log('📈 Generation Summary:');
  console.log(`   ✅ Successful: ${successCount}/${samples.length}`);
  console.log(`   ❌ Failed: ${failCount}/${samples.length}`);
  console.log(`   📁 Output: ${outputDir}`);
  console.log('═'.repeat(60));

  if (successCount > 0) {
    console.log('\n🎉 SVG files generated successfully!');
    console.log('📂 Check the examples/architectures/ folder');
  }
}

main().catch(console.error);