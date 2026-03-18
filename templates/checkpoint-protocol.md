# Checkpoint Protocol

After completing each major step, write a checkpoint:
echo "$(date '+%H:%M') | STEP | STATUS | summary" >> .claude/checkpoints/YOUR_ROLE.log

When FULLY DONE: echo "COMPLETED $(date)" > .claude/vp-signals/YOUR_ROLE.done
