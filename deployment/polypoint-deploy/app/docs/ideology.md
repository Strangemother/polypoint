# Ideology

+ as automated as possible, with sensible defaults - but with options for customization.
+ idempotent, so it can be run multiple times without causing issues.
+ modular, with each module isolated to a specific task.
+ extensible, with the ability to add new modules and functionality easily.

Fundamentally it should be fire-and-forget, with minimal user input. Given access to domain management tools, it can also verify domain records.

I'd like to avoid using tools like Ansible, as they add complexity and dependencies. Instead, the tool should be a standalone, the dev should be to _just run it_. and it should handle everything else.
