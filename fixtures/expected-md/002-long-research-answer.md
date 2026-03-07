## User

Compare supervised, unsupervised, and reinforcement learning with practical tradeoffs.

## Assistant

## High-level comparison

These three paradigms differ mainly in how feedback is provided and what objective is optimized.

### Supervised learning

Uses labeled examples. It often provides the fastest path to production when labels are available.

### Unsupervised learning

Uses unlabeled data to discover structure. It is useful for clustering, representation learning, and anomaly detection.

### Reinforcement learning

Optimizes sequential decisions through reward signals. It can solve control problems but is usually data- and tuning-intensive.

> In practice, teams often combine paradigms: self-supervised pretraining, then supervised fine-tuning, and occasionally RL for policy optimization.

1. Label quality is often the bottleneck in supervised setups.
2. Evaluation can be ambiguous in unsupervised workflows.
3. Reward design and simulator fidelity dominate RL reliability.
