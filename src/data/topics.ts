import { TopicId, TopicInfo } from '../types';

export const TOPICS: TopicInfo[] = [
  {
    id: 'linux',
    name: 'Linux Administration',
    icon: 'Terminal',
    description: 'File permissions, processes, services, logs, disk usage, memory, and networking.',
    tags: ['systemd', 'journalctl', 'chmod', 'top/htop', 'lsof', 'iptables']
  },
  {
    id: 'aws',
    name: 'AWS Cloud Infrastructure',
    icon: 'Cloud',
    description: 'EC2, S3, IAM, VPC, subnets, security groups, ALB/NLB, Auto Scaling, CloudWatch.',
    tags: ['IAM Roles', 'VPC Peering', 'ALB', 'CloudWatch', 'S3 Policies', 'AutoScaling']
  },
  {
    id: 'git',
    name: 'Git & Version Control',
    icon: 'GitBranch',
    description: 'Branching strategies, interactive rebasing, merge conflicts, pull requests, hooks.',
    tags: ['git rebase', 'merge conflicts', 'cherry-pick', 'git bisect', 'hooks']
  },
  {
    id: 'cicd',
    name: 'Jenkins & CI/CD Pipelines',
    icon: 'Workflow',
    description: 'Pipelines as code, Jenkinsfiles, agents, stages, artifacts, webhooks, blue/green.',
    tags: ['Declarative Pipeline', 'Shared Libraries', 'Webhook Triggers', 'Canary']
  },
  {
    id: 'docker',
    name: 'Docker & Containerization',
    icon: 'Box',
    description: 'Dockerfiles, multi-stage builds, layers, volumes, bridge networks, registries.',
    tags: ['Multi-stage', 'cgroups', 'docker compose', 'Volume Mounts', 'Container Sec']
  },
  {
    id: 'kubernetes',
    name: 'Kubernetes Orchestration',
    icon: 'Boxes',
    description: 'Pods, Deployments, Services, Ingress, ConfigMaps, Secrets, probes, CrashLoopBackOff.',
    tags: ['CrashLoopBackOff', 'Ingress-NGINX', 'HPA', 'Liveness/Readiness', 'RBAC']
  },
  {
    id: 'terraform',
    name: 'Terraform & IaC',
    icon: 'FileCode2',
    description: 'Providers, state locking, drift detection, modules, remote backend, plan & apply.',
    tags: ['Remote State S3+DynamoDB', 'State Lock', 'Terraform Modules', 'Workspaces']
  },
  {
    id: 'ansible',
    name: 'Ansible Configuration Mgmt',
    icon: 'Cpu',
    description: 'Playbooks, dynamic inventories, roles, handlers, Ansible Vault, idempotent tasks.',
    tags: ['Playbooks', 'Ansible Vault', 'Idempotency', 'Dynamic Inventory', 'Handlers']
  },
  {
    id: 'networking',
    name: 'DevOps & Cloud Networking',
    icon: 'Network',
    description: 'TCP/IP, DNS resolution, NAT gateways, SSL/TLS handshakes, load balancing, MTU.',
    tags: ['DNS dig/nslookup', 'NAT Gateways', 'CIDR blocks', 'TLS 1.3', 'TCP 3-Way']
  },
  {
    id: 'bash',
    name: 'Bash & Shell Scripting',
    icon: 'Code',
    description: 'Robust automation scripts, pipes, redirection, awk/sed/grep, exit codes, traps.',
    tags: ['set -euo pipefail', 'awk & sed', 'Exit codes', 'Signal traps', 'xargs']
  },
  {
    id: 'python',
    name: 'Python for DevOps',
    icon: 'Binary',
    description: 'Boto3 AWS automation, REST API integrations, Kubernetes client, error handling.',
    tags: ['boto3', 'requests', 'argparse', 'k8s client-python', 'JSON parsing']
  },
  {
    id: 'monitoring',
    name: 'Prometheus & Grafana',
    icon: 'Activity',
    description: 'Metrics scraping, PromQL, Alertmanager, Grafana dashboards, exporters, Loki.',
    tags: ['PromQL', 'Alertmanager routing', 'Node Exporter', 'Rate & Histogram', 'Loki']
  },
  {
    id: 'troubleshooting',
    name: 'Production Troubleshooting',
    icon: 'AlertTriangle',
    description: 'High CPU/OOM investigation, disk saturation, slow queries, 502/504 Bad Gateway.',
    tags: ['strace/tcpdump', 'dmesg OOM-Killer', 'iostat/vmstat', 'curl timing', '502 debug']
  },
  {
    id: 'sre',
    name: 'SRE, SLIs, SLOs & Incidents',
    icon: 'ShieldAlert',
    description: 'Error budgets, MTTR, post-mortems, blameless RCAs, on-call runbooks, chaos eng.',
    tags: ['SLI/SLO math', 'Error Budget Burn', 'Blameless Post-Mortem', 'MTTD/MTTR']
  }
];
