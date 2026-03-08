---
name: linear
description: "CLI to Interact with Linear API, should be used when need to update/create/modify any Linear.app issue"
license: MIT
compatibility: OpenCode
metadata:
  version: "1.0.0"
  owner: agent-skills
---

# Linear CLI

If linearis is not available, install the latest version with 
```bash
npm install -g linearis
```

## Usage

Usage: linearis comments create [options] <issueId>

Create new comment on issue.

Options:
  --body <body>  comment body (required)
  -h, --help     display help for command

When passing issue IDs, both UUID and identifiers like ABC-123 are supported.

---

Usage: linearis cycles list [options]

List cycles

Options:
  --team <team>        team key, name, or ID
  --active             only active cycles
  --around-active <n>  return active +/- n cycles (requires --team)
  -h, --help           display help for command

---

Usage: linearis cycles read [options] <cycleIdOrName>

Get cycle details including issues. Accepts UUID or cycle name (optionally
scoped by --team)

Options:
  --team <team>       team key, name, or ID to scope name lookup
  --issues-first <n>  how many issues to fetch (default 50) (default: "50")
  -h, --help          display help for command

---

Usage: linearis documents create [options]

Create a new document

Options:
  --title <title>      document title
  --content <content>  document content (markdown)
  --project <project>  project name or ID
  --team <team>        team key or name
  --icon <icon>        document icon
  --color <color>      icon color
  --attach-to <issue>  also attach document to issue (e.g., ABC-123)
  -h, --help           display help for command

---

Usage: linearis documents delete [options] <documentId>

Delete (trash) a document

Options:
  -h, --help  display help for command

---

Usage: linearis documents list [options]

List documents

Options:
  --project <project>  filter by project name or ID
  --issue <issue>      filter by issue (shows documents attached to the issue)
  -l, --limit <limit>  maximum number of documents (default: "50")
  -h, --help           display help for command

---

Usage: linearis documents read [options] <documentId>

Read a document

Options:
  -h, --help  display help for command

---

Usage: linearis documents update [options] <documentId>

Update an existing document

Options:
  --title <title>      new document title
  --content <content>  new document content (markdown)
  --project <project>  move to different project
  --icon <icon>        document icon
  --color <color>      icon color
  -h, --help           display help for command

---

Usage: linearis embeds download [options] <url>

Download a file from Linear storage.

Options:
  --output <path>  output file path
  --overwrite      overwrite existing file (default: false)
  -h, --help       display help for command

---

Usage: linearis embeds upload [options] <file>

Upload a file to Linear storage.

Options:
  -h, --help  display help for command

---

Usage: linearis issues create [options] <title>

Create new issue.

Options:
  -d, --description <desc>         issue description
  -a, --assignee <assigneeId>      assign to user ID
  -p, --priority <priority>        priority level (1-4)
  --project <project>              add to project (name or ID)
  --team <team>                    team key, name, or ID (required if not
                                   specified)
  --labels <labels>                labels (comma-separated names or IDs)
  --project-milestone <milestone>  project milestone name or ID (requires
                                   --project)
  --cycle <cycle>                  cycle name or ID (requires --team)
  --status <status>                status name or ID
  --parent-ticket <parentId>       parent issue ID or identifier
  -h, --help                       display help for command

---

Usage: linearis issues list [options]

List issues.

Options:
  -l, --limit <number>  limit results (default: "25")
  -h, --help            display help for command

---

Usage: linearis issues read [options] <issueId>

Get issue details.

Options:
  -h, --help  display help for command

When passing issue IDs, both UUID and identifiers like ABC-123 are supported.

---

Usage: linearis issues search [options] <query>

Search issues.

Options:
  --team <team>            filter by team key, name, or ID
  --assignee <assigneeId>  filter by assignee ID
  --project <project>      filter by project name or ID
  --status <status>        filter by status (comma-separated)
  -l, --limit <number>     limit results (default: "10")
  -h, --help               display help for command

---

Usage: linearis issues update [options] <issueId>

Update an issue.

Options:
  -t, --title <title>              new title
  -d, --description <desc>         new description
  -s, --status <status>            new status name or ID
  -p, --priority <priority>        new priority (1-4)
  --assignee <assigneeId>          new assignee ID
  --project <project>              new project (name or ID)
  -h, --help                       display help for command

Labels-related options:
  --labels <labels>                labels to work with (comma-separated names or
                                   IDs)
  --label-by <mode>                how to apply labels: 'adding' (default) or
                                   'overwriting'
  --clear-labels                   remove all labels from issue

Parent ticket-related options:
  --parent-ticket <parentId>       set parent issue ID or identifier
  --clear-parent-ticket            clear existing parent relationship

Project milestone-related options:
  --project-milestone <milestone>  set project milestone (can use name or ID,
                                   will try to resolve within project context
                                   first)
  --clear-project-milestone        clear existing project milestone assignment

Cycle-related options:
  --cycle <cycle>                  set cycle (can use name or ID, will try to
                                   resolve within team context first)
  --clear-cycle                    clear existing cycle assignment

When passing issue IDs, both UUID and identifiers like ABC-123 are supported.

---

Usage: linearis labels list [options]

List all available labels

Options:
  --team <team>  filter by team key, name, or ID
  -h, --help     display help for command

---

Usage: linearis project-milestones create [options] <name>

Create a new project milestone

Options:
  --project <project>              project name or ID
  -d, --description <description>  milestone description
  --target-date <date>             target date in ISO format (YYYY-MM-DD)
  -h, --help                       display help for command

---

Usage: linearis project-milestones list [options]

List milestones in a project

Options:
  --project <project>   project name or ID
  -l, --limit <number>  limit results (default: "50")
  -h, --help            display help for command

---

Usage: linearis project-milestones read [options] <milestoneIdOrName>

Get milestone details including issues. Accepts UUID or milestone name
(optionally scoped by --project)

Options:
  --project <project>  project name or ID to scope name lookup
  --issues-first <n>   how many issues to fetch (default 50) (default: "50")
  -h, --help           display help for command

---

Usage: linearis project-milestones update [options] <milestoneIdOrName>

Update an existing project milestone. Accepts UUID or milestone name (optionally
scoped by --project)

Options:
  --project <project>              project name or ID to scope name lookup
  -n, --name <name>                new milestone name
  -d, --description <description>  new milestone description
  --target-date <date>             new target date in ISO format (YYYY-MM-DD)
  --sort-order <number>            new sort order
  -h, --help                       display help for command

---

Usage: linearis projects list [options]

List projects

Options:
  -l, --limit <number>  limit results (not implemented by Linear SDK, showing
                        all) (default: "100")
  -h, --help            display help for command

---

Usage: linearis teams list [options]

List all teams

Options:
  -h, --help  display help for command

---

Usage: linearis usage [options]

show usage info for *all* tools

Options:
  -h, --help  display help for command

---

Usage: linearis users list [options]

List all users

Options:
  --active    Only show active users
  -h, --help  display help for command

---

## Specific tasks

* **Task Template** [references/linear-task-template.md](references/linear-task-template.md)
