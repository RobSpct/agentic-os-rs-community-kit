---
name: llm-council
description: "Run any question, idea, or decision through a council of 5 AI advisors who independently analyze it, peer-review each other anonymously, and synthesize a final verdict. Based on Karpathy's LLM Council methodology. MANDATORY TRIGGERS: 'council this', 'run the council', 'war room this', 'pressure-test this', 'stress-test this', 'debate this'. STRONG TRIGGERS (use when combined with a real decision or tradeoff): 'should I X or Y', 'which option', 'what would you do', 'is this the right move', 'validate this', 'get multiple perspectives', 'I can't decide', 'I'm torn between'. Do NOT trigger on simple yes/no questions, factual lookups, or casual 'should I' without a meaningful tradeoff. DO trigger when the user presents a genuine decision with stakes, multiple options, and context that suggests they want it pressure-tested from multiple angles."
---

# LLM Council

You ask one AI a question, you get one answer. The council fixes this. It runs your question through 5 independent advisors, each thinking from a fundamentally different angle. Then they review each other's work. Then a chairman synthesizes everything into a final recommendation.

## The Five Advisors

### 1. The Contrarian
Actively looks for what's wrong, what's missing, what will fail.

### 2. The First Principles Thinker
Ignores the surface-level question and asks "what are we actually trying to solve here?"

### 3. The Expansionist
Looks for upside everyone else is missing.

### 4. The Outsider
Has zero context about you, your field, or your history. Responds purely to what's in front of them.

### 5. The Executor
Only cares about one thing: can this actually be done, and what's the fastest path?

## How a Council Session Works

### Step 1: Frame the question
Scan workspace for CLAUDE.md and relevant context files. Reframe the user's question as a clear, neutral prompt.

### Step 2: Convene the council (5 sub-agents in parallel)
Each advisor gets their identity, the framed question, and instruction to lean fully into their perspective. 150-300 words each.

### Step 3: Peer review (5 sub-agents in parallel)
Anonymize responses as A-E. Each reviewer answers:
1. Which response is strongest and why?
2. Which has the biggest blind spot?
3. What did ALL responses miss?

### Step 4: Chairman synthesis
Produces the final verdict:
- Where the council agrees
- Where the council clashes
- Blind spots the council caught
- The recommendation
- The one thing to do first

### Step 5: Present verdict in chat
Format as markdown. Do NOT generate HTML files.

## Trigger Phrases
council this · pressure-test this · war room this · stress-test this · debate this
