export interface Scenario {
  id: string;
  title: string;
  category: string;
  severity: 'P1 - Critical' | 'P2 - High' | 'P3 - Medium';
  description: string;
  incidentBrief: string;
  symptoms: string[];
  initialState: {
    service: string;
    alert: string;
    metrics: string;
    recentChanges: string;
  };
  investigationSteps: string[];
  diagnosticCommands: string[];
  expectedResolution: string;
  postMortemFocus: string[];
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'scen-website-down',
    title: 'Website Unavailable Immediately After Deployment (502 Bad Gateway)',
    category: 'Production Troubleshooting',
    severity: 'P1 - Critical',
    description: 'Following a Friday evening rollout of v2.4.0, users report an HTTP 502 Bad Gateway error on the checkout page. The NGINX reverse proxy is throwing 111: Connection refused.',
    incidentBrief: 'At 18:02 UTC, the CD pipeline deployed version 2.4.0 of the payment service. 90 seconds later, Datadog alert "Checkout API 5xx rate > 15%" fired. Traffic is dropping sharply.',
    symptoms: [
      'NGINX error.log shows: connect() failed (111: Connection refused) while connecting to upstream 127.0.0.1:5000',
      'Systemctl status payment.service reports: Active: activating (auto-restart) since Fri 18:03:12 UTC',
      'Recent git diff shows a new mandatory environment variable DB_ENCRYPTION_KEY was introduced'
    ],
    initialState: {
      service: 'payment-service.service (Node.js/TypeScript)',
      alert: 'PagerDuty P1: High 5xx Error Rate on /checkout',
      metrics: 'HTTP 502 rate: 84%, CPU: 2%, Latency: N/A',
      recentChanges: 'Release v2.4.0 pushed via GitHub Actions 5 minutes ago'
    },
    investigationSteps: [
      'Check reverse proxy status and inspect NGINX access/error logs to isolate upstream vs proxy failure.',
      'Check systemd unit / container status: `systemctl status payment.service` or `kubectl get pods`.',
      'Inspect application crash logs: `journalctl -u payment.service -n 50 --no-pager`.',
      'Identify root failure cause (e.g. fatal unhandled exception due to missing environment variable).',
      'Formulate immediate mitigation: Roll back to release v2.3.9 or hotfix config injection.',
      'Validate service recovery and establish post-incident prevention (e.g. CI config schema validation).'
    ],
    diagnosticCommands: [
      'sudo journalctl -u payment.service -n 100 -e --no-pager',
      'sudo nginx -t && sudo tail -n 50 /var/log/nginx/error.log',
      'curl -Iv http://127.0.0.1:5000/healthz',
      'systemctl status payment.service'
    ],
    expectedResolution: 'The candidate should identify that the upstream application service crashed immediately on startup because a new required environment variable `DB_ENCRYPTION_KEY` was missing from the deployment secrets. Immediate recovery: execute an immediate rollback (`kubectl rollout undo` or redeploy v2.3.9) to restore customer checkout, followed by updating the secret store and implementing a CI pre-flight environment validator.',
    postMortemFocus: [
      'Why did the CD pipeline proceed if health checks were failing?',
      'Implement deployment readiness gates and smoke tests before shifting production traffic.',
      'Implement configuration validation at container startup with clear exit diagnostics.'
    ]
  },
  {
    id: 'scen-pod-crashloop',
    title: 'Kubernetes Pod in Repeated CrashLoopBackOff with Exit Code 137',
    category: 'Kubernetes Orchestration',
    severity: 'P1 - Critical',
    description: 'A key batch processing microservice in the production Kubernetes cluster repeatedly dies with CrashLoopBackOff every 3 minutes after processing heavy payloads.',
    incidentBrief: 'Users report background document exports are failing. Grafana shows worker pods restarting with 42 restarts in the past hour. The pod status alternates between Running and CrashLoopBackOff.',
    symptoms: [
      'kubectl get pods shows: worker-7b89d-x92zk 0/1 CrashLoopBackOff 42 restarts',
      'kubectl describe pod indicates: Last State: Terminated, Reason: OOMKilled, Exit Code: 137',
      'Pod spec resource limits: memory: 512Mi, cpu: 500m'
    ],
    initialState: {
      service: 'worker-deployment (Python Celery)',
      alert: 'KubernetesPodCrashLooping alert triggered',
      metrics: 'Container memory ramps from 80MB to 512MB in 90 seconds, then drops to 0MB',
      recentChanges: 'A batch export feature was enabled for enterprise customers with large datasets'
    },
    investigationSteps: [
      'Examine pod status and event stream using `kubectl describe pod worker-7b89d-x92zk`.',
      'Verify container termination state and Exit Code (137 = 128 + 9 SIGKILL by Linux kernel OOM Killer).',
      'Inspect previous container logs before the crash using `kubectl logs <pod> --previous`.',
      'Correlate pod memory limits with the application memory profile and payload size.',
      'Implement tactical fix: Adjust resource limits / requests in Deployment manifest and scale replicas.',
      'Design strategic fix: Refactor Celery worker to stream large documents in chunks instead of loading entire files into memory.'
    ],
    diagnosticCommands: [
      'kubectl describe pod worker-7b89d-x92zk | grep -A 10 "Last State:"',
      'kubectl logs worker-7b89d-x92zk --previous --tail=100',
      'kubectl top pod worker-7b89d-x92zk',
      'kubectl get events --sort-by=.metadata.creationTimestamp'
    ],
    expectedResolution: 'The candidate should identify Exit Code 137 as an OOMKilled event triggered by the kernel cgroup enforcer when the memory exceeded 512Mi. Immediate remediation is updating the deployment memory limit/request (e.g., to 2Gi) or setting up HPA/VPA. Root cause resolution requires application code review to stream files instead of buffering whole payloads in memory.',
    postMortemFocus: [
      'Implement Vertical Pod Autoscaler (VPA) recommendations in staging.',
      'Load testing with maximum payload boundaries.',
      'Alerting on container memory usage approaching 85% of limit before OOM occurs.'
    ]
  },
  {
    id: 'scen-ec2-ssh-down',
    title: 'EC2 Instance Inaccessible Over SSH (Connection Timed Out)',
    category: 'AWS Cloud Infrastructure',
    severity: 'P2 - High',
    description: 'An on-call DevOps engineer attempts to SSH into a production EC2 bastion host and receives: "ssh: connect to host 54.210.12.34 port 22: Connection timed out".',
    incidentBrief: 'Access to the production bastion host is blocked. No engineers can execute administrative operations. AWS console shows 2/2 status checks passing.',
    symptoms: [
      'ssh -vvv user@54.210.12.34 hangs on "Connecting to 54.210.12.34 port 22..."',
      'AWS EC2 Management Console indicates System Status Check: Passed, Instance Status Check: Passed',
      'A junior engineer pushed an update to the VPC security groups and route tables earlier this afternoon'
    ],
    initialState: {
      service: 'bastion-host-ec2 (Amazon Linux 2023)',
      alert: 'Bastion unreachable notification',
      metrics: 'CPU: 1%, Network In/Out: normal baseline',
      recentChanges: 'Terraform PR merged updating VPC security groups and subnets'
    },
    investigationSteps: [
      'Differentiate "Connection refused" (port closed / daemon down) from "Connection timed out" (packets dropped by firewall or routing).',
      'Verify Security Group inbound rules for Port 22: check if client public IP is allowed.',
      'Verify Subnet Network ACLs (NACL): check both inbound port 22 and outbound ephemeral ports (1024-65535).',
      'Check Subnet Route Table: ensure route 0.0.0.0/0 targets the Internet Gateway (igw-xxxx), not a private NAT GW.',
      'Check Elastic IP assignment and EC2 public IPv4 address.',
      'Use AWS EC2 Instance Connect or AWS Systems Manager (SSM) Session Manager to bypass SSH and inspect the host internally.'
    ],
    diagnosticCommands: [
      'aws ec2 describe-security-groups --group-ids sg-xxxx --query "SecurityGroups[].IpPermissions"',
      'aws ec2 describe-network-acls --filters "Name=association.subnet-id,Values=subnet-xxxx"',
      'aws ssm start-session --target i-0123456789abcdef0',
      'nc -zvw 5 54.210.12.34 22'
    ],
    expectedResolution: 'The candidate must recognize that "Connection timed out" indicates packet dropping at the network boundary (Security Group, NACL, or Route Table) rather than an sshd process failure. They should demonstrate using AWS SSM Session Manager as a secure zero-SSH alternative, check SG inbound rules, inspect NACL ephemeral outbound return ports, and fix the Terraform configuration.',
    postMortemFocus: [
      'Deprecate direct SSH access and port 22 entirely in favor of AWS Systems Manager (SSM) Session Manager with IAM & MFA.',
      'Enforce security group automated linting (e.g. tfsec or Checkov) in CI/CD.'
    ]
  },
  {
    id: 'scen-server-high-cpu',
    title: 'Linux Production Database Server at 100% CPU and High Load Average',
    category: 'Linux Administration',
    severity: 'P1 - Critical',
    description: 'A database host reports a 1-minute load average of 64.0 on a 16-core system. User queries are timing out, and application connection pools are exhausting.',
    incidentBrief: 'At 14:15 UTC, the e-commerce database host CPU spiked to 100%. Web frontend transactions are stacking up with 504 Gateway Timeouts.',
    symptoms: [
      'top shows: %Cpu(s): 98.4 us, 1.2 sy, 0.0 ni, 0.0 id, 0.2 wa',
      'Load average: 62.4, 55.1, 38.0 on a 16 vCPU instance',
      'Multiple postgres processes consuming 100% of individual cores executing identical query patterns'
    ],
    initialState: {
      service: 'PostgreSQL 15 on Ubuntu 22.04 LTS',
      alert: 'HostHighCpuLoad: >95% for 5 minutes',
      metrics: 'Active connections: 450/500, IOPS: 1200, Free RAM: 18GB',
      recentChanges: 'New marketing campaign launched targeting mobile users with search filters'
    },
    investigationSteps: [
      'Check top / htop to determine if CPU time is User Space (%us), System Kernel (%sy), or IO Wait (%wa).',
      'Identify offending PIDs and execute `ps aux --sort=-%cpu | head -n 10`.',
      'Query the database active sessions view: `SELECT pid, query_start, state, query FROM pg_stat_activity WHERE state != \'idle\';`.',
      'Detect unindexed sequential scans or runaway queries locking tables.',
      'Terminate rogue queries: `SELECT pg_cancel_backend(pid);` or `pg_terminate_backend(pid);`.',
      'Implement indexing or query rewriting, and configure query timeout limits (`statement_timeout = 5000`).'
    ],
    diagnosticCommands: [
      'top -b -n 1 | head -n 25',
      'vmstat 1 5',
      'ps aux --sort=-%cpu | head -n 10',
      'sudo -u postgres psql -c "SELECT pid, now() - query_start AS duration, query FROM pg_stat_activity WHERE state = \'active\' ORDER BY duration DESC LIMIT 5;"'
    ],
    expectedResolution: 'The candidate should analyze that high `%us` indicates user-space application/database processing rather than hardware I/O wait (`%wa`). They inspect `pg_stat_activity` to find long-running unindexed queries generated by the new campaign, cancel the rogue queries to restore service availability immediately, and follow up with query optimization (`EXPLAIN ANALYZE`) and `statement_timeout` safety thresholds.',
    postMortemFocus: [
      'Enforce `statement_timeout` on all web client database connections.',
      'Require `EXPLAIN ANALYZE` reviews for new search endpoint queries in PRs.',
      'Implement read-replicas for heavy analytic/search queries.'
    ]
  },
  {
    id: 'scen-terraform-state-lock',
    title: 'Terraform State Lock Error: "Error acquiring the state lock"',
    category: 'Terraform & IaC',
    severity: 'P2 - High',
    description: 'During a release deployment, a GitHub Actions runner fails with: "Error acquiring the state lock: ConditionalCheckFailedException: The conditional request failed... Lock Info: ID: 7c4e-xxxx".',
    incidentBrief: 'A previous CI build was abruptly cancelled by a developer while terraform apply was halfway through creating an RDS cluster. Subsequent pipeline runs are completely blocked.',
    symptoms: [
      'Terraform output: Error: Error acquiring the state lock',
      'Lock Info shows Created by: runner-12 at 2026-10-27T10:14:02Z, Path: my-app/terraform.tfstate',
      'All automated deployments across staging and production are halted'
    ],
    initialState: {
      service: 'Terraform v1.9 with AWS S3 backend and DynamoDB lock table',
      alert: 'CI/CD Pipeline Build Failure',
      metrics: 'Queue buildup: 6 pending deployments',
      recentChanges: 'Developer clicked "Cancel Workflow" during a live apply'
    },
    investigationSteps: [
      'Carefully inspect the Lock ID provided in the error message.',
      'Verify if any active runner or engineer is genuinely executing terraform apply right now (NEVER unlock state while a process is actively writing!).',
      'Inspect DynamoDB lock table or previous CI runner job status to confirm the job terminated.',
      'Execute `terraform force-unlock <Lock-ID>` with proper verification.',
      'Run `terraform plan -refresh-only` to reconcile any partially created resources left orphaned by the cancelled run.',
      'Resume pipeline and implement CI workflow protection (prevent cancelling jobs mid-apply).'
    ],
    diagnosticCommands: [
      'terraform force-unlock <LOCK-ID>',
      'aws dynamodb get-item --table-name terraform-locks --key \'{"LockID":{"S":"my-app/terraform.tfstate-md5"}}\'',
      'terraform plan -refresh-only'
    ],
    expectedResolution: 'The candidate must emphasize safety: never force-unlock blindly without verifying that no active process is executing against the state. Once confirmed orphaned, unlock with `terraform force-unlock <LOCK-ID>`, run `terraform plan -refresh-only` to sync real cloud resources with state, and configure CI timeouts / graceful SIGINT handling.',
    postMortemFocus: [
      'Configure CI pipeline rules to trap abort signals and allow terraform to release locks cleanly.',
      'Educate team on risks of manual job cancellation during IaC apply operations.'
    ]
  }
];
