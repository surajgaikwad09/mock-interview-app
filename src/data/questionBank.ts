import { Question } from '../types';

export const QUESTION_BANK: Question[] = [
  // --- LINUX ADMINISTRATION ---
  {
    id: 'linux-1',
    topic: 'linux',
    difficulty: 'beginner',
    question: 'How do Linux file permissions work, and how would you grant read/write/execute permissions to the file owner, and read-only permissions to group and others using octal notation?',
    hints: [
      'Think about the r=4, w=2, x=1 numbering system.',
      'The owner gets 4+2+1, group gets 4, others get 4.',
      'The utility is chmod.'
    ],
    expectedKeywords: ['chmod', '744', 'rwx', 'read write execute', 'octal', 'chown'],
    referenceAnswer: 'In Linux, file permissions are divided into Owner (User), Group, and Others. Permissions have numeric values: Read (r)=4, Write (w)=2, Execute (x)=1. To give read/write/execute to owner (4+2+1=7) and read-only to group (4) and others (4), use octal notation 744: `chmod 744 filename`. If execute is also needed for directory traversal, 755 is standard.',
    practicalCommand: 'chmod 744 /path/to/deploy_script.sh && ls -la /path/to/deploy_script.sh'
  },
  {
    id: 'linux-2',
    topic: 'linux',
    difficulty: 'intermediate',
    question: 'You notice a server has 100% disk usage (`df -h` shows `/` at 100%), but after deleting a 20GB log file with `rm`, `df -h` still shows 100% full. Why is this happening, and how do you resolve it without rebooting?',
    hints: [
      'Deleting a file with rm removes directory inode references, but what happens if a running process holds the file descriptor open?',
      'Which Linux command lists open files and process IDs holding deleted files?',
      'How can you truncate the file descriptor via /proc or signal the process?'
    ],
    expectedKeywords: ['open file descriptor', 'lsof', 'deleted', 'truncate', 'inode', '/proc', 'kill -HUP'],
    referenceAnswer: 'When a running process holds an open file handle to a deleted file, Linux unlinks the directory entry but retains the disk blocks until the file descriptor closes. To diagnose, run `lsof +L1` or `lsof | grep deleted` to identify the PID and FD. You can safely free disk space immediately by truncating the file descriptor without terminating the service: `> /proc/<PID>/fd/<FD_NUM>` or by gracefully reloading/restarting the service using `systemctl reload <service>`.',
    practicalCommand: 'lsof +L1 | grep deleted && : > /proc/1234/fd/3'
  },
  {
    id: 'linux-3',
    topic: 'linux',
    difficulty: 'advanced',
    question: 'How does the Linux kernel OOM (Out Of Memory) Killer choose which process to terminate, how can you inspect recent OOM events, and how can you protect critical daemons like systemd or docker from being killed?',
    hints: [
      'Look into /proc/[pid]/oom_score and /proc/[pid]/oom_score_adj.',
      'Check kernel messages in dmesg or journalctl.',
      'Negative oom_score_adj protects processes (-1000 means never kill).'
    ],
    expectedKeywords: ['oom_score', 'oom_score_adj', 'dmesg', 'journalctl -k', 'badness', 'swap', 'cgroups'],
    referenceAnswer: 'The Linux kernel computes an `oom_score` (0-1000) for every process based on resident set size (RSS), swap usage, and an adjustment factor `oom_score_adj`. Processes consuming large percentages of RAM with minimal priority get terminated first. You inspect past OOM kills using `dmesg -T | grep -i oom` or `journalctl -k --grep="Out of memory"`. To protect critical processes, adjust `oom_score_adj` down to `-1000` (e.g., `echo -1000 > /proc/<PID>/oom_score_adj` or configure `OOMScoreAdjust=-1000` in the systemd unit file).',
    practicalCommand: 'journalctl -k -g "Out of memory" && echo -1000 > /proc/$(pgrep dockerd)/oom_score_adj'
  },

  // --- AWS CLOUD INFRASTRUCTURE ---
  {
    id: 'aws-1',
    topic: 'aws',
    difficulty: 'beginner',
    question: 'Explain the difference between AWS Security Groups and Network Access Control Lists (NACLs). When would you use each?',
    hints: [
      'Consider stateful vs stateless nature.',
      'Consider instance level vs subnet level.',
      'Consider allow vs deny rules.'
    ],
    expectedKeywords: ['stateful', 'stateless', 'instance level', 'subnet level', 'allow deny', 'security group', 'NACL'],
    referenceAnswer: 'Security Groups operate at the instance/ENI level, are stateful (inbound allowed traffic automatically allows outbound response), and support ALLOW rules only. NACLs operate at the subnet boundary, are stateless (must explicitly allow both inbound and outbound ports/ephemeral ranges), and support both ALLOW and DENY rules evaluated in numeric order. Security Groups are the primary perimeter for application instances, while NACLs act as a second defense line to block abusive IP ranges or subnet subnets.',
    practicalCommand: 'aws ec2 describe-security-groups --group-ids sg-0123456789abcdef0'
  },
  {
    id: 'aws-2',
    topic: 'aws',
    difficulty: 'intermediate',
    question: 'How do you design a secure, highly available architecture in AWS VPC for a web application requiring public access for users and private access for a database and workers?',
    hints: [
      'Divide into public and private subnets across at least 2 Availability Zones.',
      'Use Internet Gateway for public subnets and NAT Gateways for private outbound internet.',
      'Use Application Load Balancer in public subnets.'
    ],
    expectedKeywords: ['VPC', 'Availability Zones', 'Public Subnet', 'Private Subnet', 'Internet Gateway', 'NAT Gateway', 'Application Load Balancer', 'RDS multi-AZ'],
    referenceAnswer: 'Deploy across at least two Availability Zones (AZs) for high availability. Create public subnets attached to an Internet Gateway (IGW) hosting an Application Load Balancer (ALB). Place application EC2/ECS/EKS instances and private workers in private subnets with route tables pointing 0.0.0.0/0 to a NAT Gateway in the public subnet (one NAT GW per AZ for redundancy). Place databases (e.g. RDS Aurora Multi-AZ) in isolated database subnets with no internet route. Restrict DB security groups to accept traffic only from application security group IDs.',
    practicalCommand: 'aws ec2 describe-route-tables --filters "Name=vpc-id,Values=vpc-0a1b2c3d4e5f"'
  },
  {
    id: 'aws-3',
    topic: 'aws',
    difficulty: 'advanced',
    question: 'An EC2 instance in a private subnet cannot connect to S3 via the AWS CLI (`aws s3 ls` hangs). How do you resolve this securely without routing private subnet traffic through an expensive NAT Gateway?',
    hints: [
      'Look into VPC Endpoints.',
      'Which VPC Endpoint type is free for Amazon S3 and DynamoDB?',
      'What must be updated in the private subnet route table?'
    ],
    expectedKeywords: ['VPC Endpoint', 'Gateway Endpoint', 'S3', 'route table', 'prefix list', 'endpoint policy', 'NAT Gateway'],
    referenceAnswer: 'Create an AWS VPC Gateway Endpoint for S3. Gateway endpoints for S3 and DynamoDB are completely free and keep traffic within the AWS private backbone. When configuring the endpoint, attach it to the private subnet route table, which automatically injects a route for S3 prefix lists (pl-xxxxxxxx) targeting the `vpce-xxxxxxxx` endpoint. You can also attach an IAM Endpoint Policy to limit access exclusively to authorized company buckets.',
    practicalCommand: 'aws ec2 create-vpc-endpoint --vpc-id vpc-0a1b2c --service-name com.amazonaws.us-east-1.s3 --route-table-ids rtb-private123'
  },

  // --- GIT & VERSION CONTROL ---
  {
    id: 'git-1',
    topic: 'git',
    difficulty: 'beginner',
    question: 'What is the difference between `git merge` and `git rebase`? When is it preferable to use each in a collaborative team?',
    hints: [
      'Think about commit history linearity.',
      'Merging creates a merge commit preserving timestamps.',
      'Rebase rewrites commit history on top of the target branch.'
    ],
    expectedKeywords: ['rebase', 'merge', 'linear history', 'merge commit', 'rewrite history', 'shared branch'],
    referenceAnswer: '`git merge` combines branches by creating a new merge commit, preserving the complete branching history and exact commit order. `git rebase` replays local commits on top of another base branch, creating a clean linear history without merge bubbles. In teams, use `git rebase` on local feature branches to stay updated with `main` before submitting a PR. Never rebase shared/public branches because it rewrites commit SHAs and causes divergence for teammates.',
    practicalCommand: 'git checkout feature-branch && git fetch origin && git rebase origin/main'
  },
  {
    id: 'git-2',
    topic: 'git',
    difficulty: 'intermediate',
    question: 'You committed sensitive credentials (API key) into a Git repository 3 commits ago and pushed to origin. How do you completely purge this secret from commit history and invalidate it?',
    hints: [
      'Step 1: Always rotate/invalidate the credential immediately.',
      'What tools rewrite git history (git-filter-repo, BFG, or git filter-branch)?',
      'How do you force update the remote branch?'
    ],
    expectedKeywords: ['revoke/rotate', 'git-filter-repo', 'BFG Repo-Cleaner', 'force push', 'reflog', 'git filter-branch'],
    referenceAnswer: 'First and most importantly: IMMEDIATELY revoke and rotate the compromised credential in the target service—assume the key is compromised. Next, remove it from git history using modern `git-filter-repo` (or `bfg --replace-text`): `git filter-repo --invert-paths --path secret.env` or replace the secret string. Clear local reflog/cache (`git reflog expire --expire=now --all && git gc --prune=now`). Force push with lease (`git push origin --force-with-lease --all`). Notify teammates to clone fresh or reset their local branches.',
    practicalCommand: 'pip install git-filter-repo && git filter-repo --replace-text expressions.txt'
  },

  // --- JENKINS & CI/CD ---
  {
    id: 'cicd-1',
    topic: 'cicd',
    difficulty: 'beginner',
    question: 'Explain what a Declarative Jenkinsfile is and explain the role of stages, steps, agent, and post blocks.',
    hints: [
      'Declarative pipeline syntax has structured directives.',
      'Agent defines where the build executes.',
      'Post blocks execute based on build outcome (success, failure, always).'
    ],
    expectedKeywords: ['pipeline', 'agent', 'stages', 'steps', 'post', 'always', 'failure', 'declarative'],
    referenceAnswer: 'A Declarative Jenkinsfile is a structured DSL file committed to source control (Pipeline-as-Code). `pipeline {}` encapsulates the pipeline. `agent { docker { ... } }` or `agent any` defines the execution environment/node. `stages {}` contains distinct phases like Build, Test, Security Scan, and Deploy. `steps {}` contains the atomic commands (e.g. `sh "npm test"`). The `post {}` block handles notifications, artifact archiving, and cleanup triggered conditionally on `success`, `failure`, or `always`.',
    practicalCommand: 'pipeline { agent any; stages { stage("Test") { steps { sh "npm test" } } }; post { failure { mail to: "devs@co.com" } } }'
  },
  {
    id: 'cicd-2',
    topic: 'cicd',
    difficulty: 'intermediate',
    question: 'Compare Blue/Green deployments vs Canary deployments. What are the key differences in traffic routing, rollback speed, and resource costs?',
    hints: [
      'Blue/Green provisions an identical second environment.',
      'Canary sends a small percentage (e.g. 5%) of real traffic to the new version first.',
      'Consider the infrastructure cost of 100% duplicate infrastructure.'
    ],
    expectedKeywords: ['Blue/Green', 'Canary', 'traffic routing', 'instant rollback', 'resource cost', 'blast radius', 'weighted routing'],
    referenceAnswer: 'Blue/Green deployment maintains two identical production environments (Blue=live, Green=idle). New versions deploy to Green, undergo health checks, and traffic is instantly switched 100% via DNS or ALB router. Rollback is instant by flipping traffic back to Blue, but requires 2x resource overhead. Canary deployment releases new code to a small percentage of pods/traffic (e.g., 5% -> 25% -> 100%) while monitoring error rates and latency. It minimizes blast radius and uses fewer resources, but rollback takes longer and requires traffic weighting support (e.g., Istio or ALB).',
    practicalCommand: 'kubectl set image deployment/app app=app:v2 && kubectl rollout undo deployment/app'
  },

  // --- DOCKER & CONTAINERS ---
  {
    id: 'docker-1',
    topic: 'docker',
    difficulty: 'beginner',
    question: 'What is a multi-stage Dockerfile build, and why is it recommended for production container images?',
    hints: [
      'Think about separating the build environment (compilers, npm modules) from runtime.',
      'Look at using multiple FROM statements in one Dockerfile.',
      'Consider image size, security attack surface, and vulnerability scanners.'
    ],
    expectedKeywords: ['multi-stage', 'FROM ... AS build', 'image size', 'attack surface', 'compiler', 'scratch / alpine / distroless'],
    referenceAnswer: 'Multi-stage builds use multiple `FROM` instructions in a single Dockerfile. The first stage contains full compilers, SDKs, and build tooling to compile the application artifact. Subsequent stages (using minimal base images like Alpine or Distroless) copy only the compiled binary or dist files using `COPY --from=builder`. This drastically reduces container image size (e.g., from 1.2GB to 45MB), removes unnecessary binaries, and minimizes security vulnerabilities and CVE scan findings in production.',
    practicalCommand: 'docker build --target production -t myapp:1.0 .'
  },
  {
    id: 'docker-2',
    topic: 'docker',
    difficulty: 'intermediate',
    question: 'How do Linux cgroups and namespaces enable Docker container isolation? What happens when a container exceeds its memory limit?',
    hints: [
      'Namespaces provide isolation (what a process sees: PID, NET, MNT, IPC).',
      'cgroups enforce resource limits (how much a process can use: CPU, Memory).',
      'When memory limit is breached, the kernel OOM killer triggers.'
    ],
    expectedKeywords: ['namespaces', 'cgroups', 'PID', 'NET', 'MNT', 'OOMKilled', 'exit code 137', 'resource limits'],
    referenceAnswer: 'Docker relies on two core Linux kernel primitives: Namespaces isolate what a process can see (PID for processes, NET for interfaces and IP addresses, MNT for filesystem mount points, IPC, and UTS). Control Groups (cgroups) limit and account for what a process can use (CPU shares, memory limits, I/O bandwidth). When a container process exceeds its defined cgroup memory limit (`--memory=512m`), the Linux kernel OOM Killer immediately terminates the container process with Exit Code 137 (128 + 9 SIGKILL).',
    practicalCommand: 'docker inspect <container_id> --format="{{.State.OOMKilled}} {{.State.ExitCode}}"'
  },

  // --- KUBERNETES ---
  {
    id: 'k8s-1',
    topic: 'kubernetes',
    difficulty: 'intermediate',
    question: 'A Kubernetes Pod is stuck in `CrashLoopBackOff`. Walk through your exact step-by-step troubleshooting workflow to identify and fix the issue.',
    hints: [
      'Start with kubectl describe pod to inspect events and exit codes.',
      'Check current logs and previous container logs with -p.',
      'Check exit code meanings (137 = OOM, 1 = app error, 127 = command not found).'
    ],
    expectedKeywords: ['kubectl describe pod', 'kubectl logs -p', 'CrashLoopBackOff', 'exit code 137', 'Liveness probe', 'ConfigMap/Secret missing', 'OOMKilled'],
    referenceAnswer: 'Step 1: Run `kubectl describe pod <pod_name>` to inspect Events at the bottom and check Last State (Exit Code, Reason like OOMKilled or Error). Step 2: Check logs of the crashed container using `kubectl logs <pod_name> --previous` (-p flag retrieves logs before the restart). Step 3: Verify if required ConfigMaps, Secrets, or persistent volumes failed to mount. Step 4: Check if Liveness/Readiness probes are failing prematurely due to high startup latency (`initialDelaySeconds`). Step 5: Test running the container locally or inspect resource limits if Exit Code 137 is shown.',
    practicalCommand: 'kubectl describe pod api-78b9c-4f9k && kubectl logs api-78b9c-4f9k --previous'
  },
  {
    id: 'k8s-2',
    topic: 'kubernetes',
    difficulty: 'advanced',
    question: 'Explain the difference between Kubernetes Liveness, Readiness, and Startup probes. What happens if each fails, and what is the proper configuration for a slow-starting application?',
    hints: [
      'Liveness probe determines if the container needs to be restarted.',
      'Readiness probe determines if the container should receive Service traffic.',
      'Startup probe shields slow apps during initial boot.'
    ],
    expectedKeywords: ['Liveness probe', 'Readiness probe', 'Startup probe', 'restart container', 'remove from endpoints', 'initialDelaySeconds', 'failureThreshold'],
    referenceAnswer: '1. Liveness Probe: Checks if the application is running/healthy. If it fails, kubelet restarts the container. 2. Readiness Probe: Checks if the app is ready to serve traffic. If it fails, the pod IP is temporarily removed from Service Endpoints so no requests route to it (the container is NOT restarted). 3. Startup Probe: Disables Liveness and Readiness checks until the application has fully initialized. For slow-starting apps (e.g. JVM boots in 90s), configure a Startup probe with high `failureThreshold` (e.g. 30 * 5s = 150s) instead of an artificially large `initialDelaySeconds` on the Liveness probe.',
    practicalCommand: 'kubectl get endpoints <service-name> -o yaml'
  },

  // --- TERRAFORM ---
  {
    id: 'terraform-1',
    topic: 'terraform',
    difficulty: 'beginner',
    question: 'What is the purpose of the Terraform state file (`terraform.tfstate`), and why should it be stored remotely with state locking in a production environment?',
    hints: [
      'State maps declarative config to real cloud resource IDs.',
      'Storing locally risks concurrent applies overwriting each other.',
      'AWS S3 + DynamoDB is standard for remote state and locking.'
    ],
    expectedKeywords: ['state file', 'mapping real world resources', 'remote backend', 'S3', 'DynamoDB', 'state locking', 'prevent race conditions'],
    referenceAnswer: 'Terraform state records the mapping between your declarative configuration code and actual provisioned cloud resources (IDs, metadata, dependencies). In production, state must be stored in a remote backend (e.g. AWS S3 with encryption and versioning) so team members share a single source of truth. State locking (via DynamoDB table) prevents concurrent `terraform apply` operations from executing simultaneously, which would cause state corruption, race conditions, and duplicate cloud resources.',
    practicalCommand: 'terraform init -backend-config="bucket=my-tf-state" && terraform state list'
  },
  {
    id: 'terraform-2',
    topic: 'terraform',
    difficulty: 'intermediate',
    question: 'How do you handle configuration drift in Terraform when someone manually modifies a security group rule directly in the AWS Console?',
    hints: [
      'What does terraform plan do against real infrastructure?',
      'How does terraform refresh work?',
      'How do you reconcile or re-apply the desired state?'
    ],
    expectedKeywords: ['configuration drift', 'terraform plan', 'terraform refresh', 'reconcile', 'desired state', 'terraform apply'],
    referenceAnswer: 'Configuration drift occurs when real cloud state deviates from code. Running `terraform plan` refreshes the in-memory state against actual cloud APIs, compares it with code, and displays the exact diff (e.g., "~ aws_security_group_rule will be modified back"). Running `terraform apply` overwrites manual console changes and restores declared infrastructure code. If the manual change was valid and permanent, you update the Terraform HCL code to match it or import newly created resources via `terraform import`.',
    practicalCommand: 'terraform plan -refresh-only && terraform apply'
  },

  // --- ANSIBLE ---
  {
    id: 'ansible-1',
    topic: 'ansible',
    difficulty: 'intermediate',
    question: 'What does idempotency mean in Ansible, and how do you ensure an Ansible playbook task is idempotent when using shell or command modules?',
    hints: [
      'An idempotent task leaves the system in the exact same state no matter how many times it runs.',
      'Modules like apt, copy, file, systemd are naturally idempotent.',
      'command and shell modules run blindly unless given creates or removes arguments.'
    ],
    expectedKeywords: ['idempotency', 'same state', 'command/shell', 'creates', 'removes', 'changed_when', 'failed_when'],
    referenceAnswer: 'Idempotency means running a playbook multiple times results in the exact same system state with zero unintended changes on subsequent executions (`changed: 0`). Built-in modules (copy, file, service, apt) are idempotent by default. However, `command` and `shell` modules always return `changed` unless explicitly configured. To make shell tasks idempotent, use `args: creates: /path/to/flagfile` (skips task if file exists), `removes`, or use `changed_when: false` / `register` with conditional checks.',
    practicalCommand: '- name: Install app\n  shell: ./install.sh\n  args:\n    creates: /opt/app/bin/installed'
  },

  // --- PROMETHEUS & GRAFANA / MONITORING ---
  {
    id: 'monitoring-1',
    topic: 'monitoring',
    difficulty: 'intermediate',
    question: 'Explain the four core Prometheus metric types (Counter, Gauge, Histogram, Summary). Write a sample PromQL query to calculate the per-second HTTP request rate over a 5-minute window.',
    hints: [
      'Counters only go up (except on restart).',
      'Gauges fluctuate up and down (e.g. memory, temperature).',
      'Histograms sample observations into buckets for percentiles.',
      'PromQL rate() function requires a range vector like [5m].'
    ],
    expectedKeywords: ['Counter', 'Gauge', 'Histogram', 'Summary', 'rate()', 'irate()', 'range vector [5m]', 'PromQL'],
    referenceAnswer: '1. Counter: Cumulative metric that only increases or resets to 0 (e.g., http_requests_total, errors). 2. Gauge: Value that goes up and down (e.g., memory_usage_bytes, cpu_temp). 3. Histogram: Samples observations in configurable buckets (e.g., request latency), enabling `histogram_quantile()` for P95/P99. 4. Summary: Calculates percentiles client-side. To calculate per-second HTTP request rate over 5 minutes: `rate(http_requests_total{status=~"2.."}[5m])` or `sum by (status) (rate(http_requests_total[5m]))`.',
    practicalCommand: 'sum(rate(http_requests_total{job="api-server"}[5m])) by (status_code)'
  },
  {
    id: 'monitoring-2',
    topic: 'monitoring',
    difficulty: 'advanced',
    question: 'How do you detect and fix Alert Fatigue in an engineering on-call rotation? How do SLOs and Error Budget burn rate alerts solve this?',
    hints: [
      'Alert fatigue happens when alerts are too noisy or not actionable.',
      'Page only on user-facing symptoms, not individual CPU blips.',
      'Multi-window multi-burn-rate alerts page based on how fast the error budget is depleting.'
    ],
    expectedKeywords: ['Alert fatigue', 'actionable alerts', 'runbooks', 'Error Budget burn rate', 'multi-window', 'SLO', 'paging vs ticket'],
    referenceAnswer: 'Alert fatigue occurs when non-actionable, transient, or low-severity alerts wake up on-call engineers. Remediation: 1. Audit alerts: Every page must require urgent human action; if not, downgrade to Slack/ticket or delete. 2. Adopt Symptom-Based Paging: Alert when users experience errors or latency, not because single-server CPU hit 85%. 3. Implement Google SRE Multi-window Multi-burn-rate alerting: Alert when the 30-day Error Budget is burning at a rate that threatens the SLO (e.g., 14.4x burn rate over 1h threatens 2% of budget in 1 hour). 4. Ensure every alert links directly to a verified runbook.',
    practicalCommand: 'expr: (sum(rate(http_requests_errors[1h])) / sum(rate(http_requests_total[1h]))) > (1 - 0.999) * 14.4'
  },

  // --- SRE & INCIDENT MANAGEMENT ---
  {
    id: 'sre-1',
    topic: 'sre',
    difficulty: 'intermediate',
    question: 'What is an SLA, SLO, and SLI? Give a real-world concrete example of all three for an e-commerce checkout service.',
    hints: [
      'SLI is the metric you measure (Service Level Indicator).',
      'SLO is the target your team aims for internally (Service Level Objective).',
      'SLA is the contractual agreement with penalties (Service Level Agreement).'
    ],
    expectedKeywords: ['SLI (Indicator)', 'SLO (Objective)', 'SLA (Agreement)', 'Error budget', 'latency', 'contractual penalty'],
    referenceAnswer: '1. SLI (Service Level Indicator): The quantified measurement of service performance. Example: % of successful `/checkout` HTTP requests with response time < 500ms over 30 days (`successful_reqs / total_reqs * 100`). 2. SLO (Service Level Objective): The internal reliability target agreed upon by product and engineering. Example: 99.9% of `/checkout` requests must meet the SLI over any rolling 30-day period. 3. SLA (Service Level Agreement): The external contractual commitment with customers with business/financial consequences. Example: 99.5% availability, or customers receive a 10% credit.',
    practicalCommand: 'SLI = sum(rate(http_req_duration_seconds_bucket{le="0.5"}[30d])) / sum(rate(http_req_total[30d]))'
  },

  // --- NETWORKING ---
  {
    id: 'networking-1',
    topic: 'networking',
    difficulty: 'intermediate',
    question: 'A web service running on port 8080 is reachable from `localhost` using `curl localhost:8080`, but external clients cannot connect over the network. How do you troubleshoot this step-by-step?',
    hints: [
      'Check socket binding address (127.0.0.1 vs 0.0.0.0).',
      'Check host firewall (ufw, iptables, nftables).',
      'Check cloud security groups and routing.'
    ],
    expectedKeywords: ['bind address', '127.0.0.1 vs 0.0.0.0', 'netstat/ss -tlpn', 'iptables / ufw', 'security group', 'listening socket'],
    referenceAnswer: '1. Check binding address: Run `ss -tlpn | grep 8080`. If the app binds to `127.0.0.1:8080`, it rejects external network interfaces. Change the app config to bind to `0.0.0.0:8080` (all IPv4 interfaces). 2. Check local host firewall: Run `sudo iptables -L -n -v` or `sudo ufw status` to ensure port 8080 inbound traffic is permitted. 3. Check cloud security perimeter: Verify AWS Security Group or GCP firewall allows TCP 8080 from the client CIDR block. 4. Verify network route: Test with `nc -zv <server_ip> 8080` or `traceroute`.',
    practicalCommand: 'ss -tlpn | grep 8080 && sudo ufw status verbose'
  },

  // --- BASH SCRIPTING ---
  {
    id: 'bash-1',
    topic: 'bash',
    difficulty: 'intermediate',
    question: 'Why should every production Bash script start with `set -euo pipefail`? Explain what each flag does.',
    hints: [
      '-e stops on error.',
      '-u treats unset variables as errors.',
      '-o pipefail looks inside pipeline commands.'
    ],
    expectedKeywords: ['set -euo pipefail', 'exit immediately', 'nounset', 'pipefail', 'pipeline exit code', 'unassigned variable'],
    referenceAnswer: '`set -euo pipefail` is the Bash strict mode boilerplate: 1. `-e` (errexit): Causes the script to exit immediately if any command exits with a non-zero exit code, preventing cascading failures. 2. `-u` (nounset): Treats uninitialized or unset variables as an error and exits immediately (prevents catastrophic disasters like `rm -rf $DIR/` when $DIR is empty). 3. `-o pipefail`: By default, Bash pipeline exit code is that of the last command; `pipefail` ensures the pipeline fails if ANY command inside the pipe (e.g. `crashed_cmd | grep ok`) fails.',
    practicalCommand: '#!/usr/bin/env bash\nset -euo pipefail\nIFS=$"\\n\\t"'
  },

  // --- PYTHON FOR DEVOPS ---
  {
    id: 'python-1',
    topic: 'python',
    difficulty: 'intermediate',
    question: 'How do you write a Python script using `boto3` to find unattached EBS volumes older than 14 days and tag them for deletion with proper error handling and pagination?',
    hints: [
      'Use boto3.client("ec2") and get_paginator("describe_volumes").',
      'Filter for Attachments == empty / State == available.',
      'Handle ClientError from botocore.exceptions.'
    ],
    expectedKeywords: ['boto3', 'describe_volumes', 'paginator', 'State=available', 'botocore.exceptions.ClientError', 'create_tags'],
    referenceAnswer: 'Use `boto3.client("ec2")` with `get_paginator("describe_volumes")` to handle AWS API pagination without missing volumes beyond 100 items. Filter volumes where `State == "available"` (unattached) and compare `CreateTime` against `datetime.now(timezone.utc) - timedelta(days=14)`. Wrap calls in a `try...except ClientError as e:` block. Use `ec2.create_tags(Resources=[vol["VolumeId"]], Tags=[{"Key": "DeleteCandidate", "Value": "true"}])`.',
    practicalCommand: 'paginator = ec2.get_paginator("describe_volumes")\nfor page in paginator.paginate(Filters=[{"Name": "status", "Values": ["available"]}])'
  }
];
