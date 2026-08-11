---
name: claude-api
description: Baut Apps mit der Claude API oder dem Anthropic SDK. Use beim Schreiben von Code, der anthropic, @anthropic-ai/sdk oder claude_agent_sdk importiert, oder wenn der User die Claude API nutzen will.
---

# Claude API Development Guide

Bau Applikationen, die von der Claude API angetrieben werden, mit den offiziellen Anthropic SDKs.

---

## Wann dieser Skill aktiviert

Trigger, wenn:
- Code `anthropic`, `@anthropic-ai/sdk` oder `claude_agent_sdk` importiert
- Der User mit der Claude API, dem Anthropic SDK oder Claude-Agents bauen will
- Der User Claude zu einer bestehenden Applikation hinzufügen will
- Der User nach Tool Use, Function Calling oder Streaming mit Claude fragt

NICHT dein Scope:
- Allgemeine Programmierung ohne Bezug zu Claude
- Andere AI-SDKs (OpenAI, Gemini, etc.)
- ML/Data Science, Model-Training oder Fine-Tuning

---

## Schritt 0: Kontext laden

Bevor du Code schreibst, klär:

1. **Sprache** - Python oder TypeScript?
2. **Was sie bauen** - Chatbot, Agent, Automation, Document-Processor, etc.
3. **Benötigte Key-Features** - Streaming? Tool Use? Vision? Multi-Turn?
4. **Environment** - API-Key gesetzt? SDK installiert?

Frag, wenn unklar. Dann mach mit den richtigen Patterns unten weiter.

---

## API-Basics

| Feld | Wert |
|-------|-------|
| **Base URL** | `https://api.anthropic.com` |
| **Auth-Header** | `x-api-key: YOUR_API_KEY` |
| **API-Version** | `2023-06-01` |
| **Content-Type** | `application/json` |

### Model-IDs

| Model | ID | Use Case |
|-------|-----|----------|
| Claude Opus 4.6 | `claude-opus-4-6` | Am fähigsten - komplexes Reasoning, Coding, Analyse |
| Claude Sonnet 4.6 | `claude-sonnet-4-6` | Ausgewogen - schnell und smart, bester Default |
| Claude Haiku 4.5 | `claude-haiku-4-5-20251001` | Schnell und günstig - Klassifikation, Extraktion, einfache Tasks |

**Default ist `claude-sonnet-4-6`**, außer der User gibt was anderes vor oder die Aufgabe verlangt Reasoning auf Opus-Niveau.

---

## Python SDK

### Installation

```bash
pip install anthropic
```

### Basic Message

```python
import anthropic

client = anthropic.Anthropic()  # liest ANTHROPIC_API_KEY aus env

message = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "Explain quantum computing in one paragraph."}
    ]
)

print(message.content[0].text)
```

### Mit System-Prompt

```python
message = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    system="You are a senior Python developer. Give concise, production-ready code.",
    messages=[
        {"role": "user", "content": "Write a retry decorator with exponential backoff."}
    ]
)
```

### Streaming

```python
with client.messages.stream(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "Write a short story about a robot."}
    ]
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)
```

### Multi-Turn Conversation

```python
conversation = []

def chat(user_message: str) -> str:
    conversation.append({"role": "user", "content": user_message})

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        messages=conversation
    )

    assistant_text = message.content[0].text
    conversation.append({"role": "assistant", "content": assistant_text})
    return assistant_text

# Nutzung
print(chat("What is Python?"))
print(chat("How does it compare to JavaScript?"))  # Claude erinnert sich an den Kontext
```

### Vision (Image-Input)

```python
import base64
from pathlib import Path

# Aus Datei
image_data = base64.standard_b64encode(Path("photo.png").read_bytes()).decode("utf-8")

message = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": "image/png",
                        "data": image_data
                    }
                },
                {
                    "type": "text",
                    "text": "Describe what you see in this image."
                }
            ]
        }
    ]
)

# Aus URL
message = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "image",
                    "source": {
                        "type": "url",
                        "url": "https://example.com/image.png"
                    }
                },
                {
                    "type": "text",
                    "text": "What is in this image?"
                }
            ]
        }
    ]
)
```

### Tool Use / Function Calling

```python
import json

tools = [
    {
        "name": "get_weather",
        "description": "Get the current weather for a given location.",
        "input_schema": {
            "type": "object",
            "properties": {
                "location": {
                    "type": "string",
                    "description": "City and state, e.g. San Francisco, CA"
                },
                "unit": {
                    "type": "string",
                    "enum": ["celsius", "fahrenheit"],
                    "description": "Temperature unit"
                }
            },
            "required": ["location"]
        }
    }
]

# Schritt 1: Message mit Tools schicken
message = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    tools=tools,
    messages=[
        {"role": "user", "content": "What's the weather in San Francisco?"}
    ]
)

# Schritt 2: Prüfen, ob Claude ein Tool nutzen will
if message.stop_reason == "tool_use":
    # Den Tool-Call extrahieren
    tool_block = next(b for b in message.content if b.type == "tool_use")
    tool_name = tool_block.name
    tool_input = tool_block.input

    # Schritt 3: Das Tool ausführen (dein Code)
    def get_weather(location: str, unit: str = "fahrenheit") -> dict:
        # Dein echter Weather-API-Call hier
        return {"temperature": 62, "unit": "fahrenheit", "condition": "foggy"}

    result = get_weather(**tool_input)

    # Schritt 4: Tool-Result zurück an Claude schicken
    final_message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        tools=tools,
        messages=[
            {"role": "user", "content": "What's the weather in San Francisco?"},
            {"role": "assistant", "content": message.content},
            {
                "role": "user",
                "content": [
                    {
                        "type": "tool_result",
                        "tool_use_id": tool_block.id,
                        "content": json.dumps(result)
                    }
                ]
            }
        ]
    )

    print(final_message.content[0].text)
```

---

## TypeScript SDK

### Installation

```bash
npm install @anthropic-ai/sdk
```

### Basic Message

```typescript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic(); // liest ANTHROPIC_API_KEY aus env

const message = await client.messages.create({
  model: "claude-sonnet-4-6",
  max_tokens: 1024,
  messages: [
    { role: "user", content: "Explain quantum computing in one paragraph." },
  ],
});

console.log(message.content[0].type === "text" ? message.content[0].text : "");
```

### Streaming

```typescript
const stream = client.messages.stream({
  model: "claude-sonnet-4-6",
  max_tokens: 1024,
  messages: [
    { role: "user", content: "Write a short story about a robot." },
  ],
});

for await (const event of stream) {
  if (
    event.type === "content_block_delta" &&
    event.delta.type === "text_delta"
  ) {
    process.stdout.write(event.delta.text);
  }
}
```

### Tool Use / Function Calling

```typescript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const tools: Anthropic.Tool[] = [
  {
    name: "get_weather",
    description: "Get the current weather for a given location.",
    input_schema: {
      type: "object" as const,
      properties: {
        location: {
          type: "string",
          description: "City and state, e.g. San Francisco, CA",
        },
        unit: {
          type: "string",
          enum: ["celsius", "fahrenheit"],
          description: "Temperature unit",
        },
      },
      required: ["location"],
    },
  },
];

// Schritt 1: Message mit Tools schicken
const message = await client.messages.create({
  model: "claude-sonnet-4-6",
  max_tokens: 1024,
  tools,
  messages: [
    { role: "user", content: "What's the weather in San Francisco?" },
  ],
});

// Schritt 2: Auf Tool Use prüfen
if (message.stop_reason === "tool_use") {
  const toolBlock = message.content.find(
    (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
  )!;

  // Schritt 3: Das Tool ausführen
  const result = { temperature: 62, unit: "fahrenheit", condition: "foggy" };

  // Schritt 4: Result zurückschicken
  const finalMessage = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    tools,
    messages: [
      { role: "user", content: "What's the weather in San Francisco?" },
      { role: "assistant", content: message.content },
      {
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: toolBlock.id,
            content: JSON.stringify(result),
          },
        ],
      },
    ],
  });

  const textBlock = finalMessage.content.find(
    (b): b is Anthropic.TextBlock => b.type === "text"
  );
  console.log(textBlock?.text);
}
```

---

## Agent SDK (Multi-Step Agents)

Das Agent SDK ermöglicht autonome Multi-Step-Agents, die Tools nutzen, schlussfolgern und loopen können, bis eine Aufgabe erledigt ist.

### Python Agent Loop

```python
import anthropic
import json

client = anthropic.Anthropic()

tools = [
    {
        "name": "search_docs",
        "description": "Search documentation by keyword.",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Search query"}
            },
            "required": ["query"]
        }
    },
    {
        "name": "write_file",
        "description": "Write content to a file.",
        "input_schema": {
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "File path"},
                "content": {"type": "string", "description": "File content"}
            },
            "required": ["path", "content"]
        }
    }
]

def execute_tool(name: str, input: dict) -> str:
    """Tool-Calls an deine Implementierungen routen."""
    if name == "search_docs":
        # Deine Such-Logik
        return json.dumps({"results": ["Doc 1: ...", "Doc 2: ..."]})
    elif name == "write_file":
        with open(input["path"], "w") as f:
            f.write(input["content"])
        return json.dumps({"status": "written", "path": input["path"]})
    else:
        return json.dumps({"error": f"Unknown tool: {name}"})

def run_agent(task: str, max_steps: int = 10) -> str:
    """Agentic Loop: Claude schlussfolgert, ruft Tools auf, wiederholt bis fertig."""
    messages = [{"role": "user", "content": task}]

    for step in range(max_steps):
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=4096,
            system="You are a helpful agent. Use the available tools to complete the task. When finished, respond with your final answer.",
            tools=tools,
            messages=messages
        )

        # Falls Claude fertig ist (keine Tool-Calls mehr), den Text zurückgeben
        if response.stop_reason == "end_turn":
            text_blocks = [b.text for b in response.content if b.type == "text"]
            return "\n".join(text_blocks)

        # Tool-Calls verarbeiten
        messages.append({"role": "assistant", "content": response.content})

        tool_results = []
        for block in response.content:
            if block.type == "tool_use":
                result = execute_tool(block.name, block.input)
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": result
                })

        messages.append({"role": "user", "content": tool_results})

    return "Agent hit max steps without completing."

# Nutzung
answer = run_agent("Search the docs for 'authentication' and write a summary to auth-guide.md")
print(answer)
```

### TypeScript Agent Loop

```typescript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const tools: Anthropic.Tool[] = [
  {
    name: "search_docs",
    description: "Search documentation by keyword.",
    input_schema: {
      type: "object" as const,
      properties: {
        query: { type: "string", description: "Search query" },
      },
      required: ["query"],
    },
  },
];

async function executeTool(
  name: string,
  input: Record<string, unknown>
): Promise<string> {
  if (name === "search_docs") {
    return JSON.stringify({ results: ["Doc 1: ...", "Doc 2: ..."] });
  }
  return JSON.stringify({ error: `Unknown tool: ${name}` });
}

async function runAgent(task: string, maxSteps = 10): Promise<string> {
  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: task },
  ];

  for (let step = 0; step < maxSteps; step++) {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system:
        "You are a helpful agent. Use the available tools to complete the task.",
      tools,
      messages,
    });

    if (response.stop_reason === "end_turn") {
      return response.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("\n");
    }

    messages.push({ role: "assistant", content: response.content });

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const block of response.content) {
      if (block.type === "tool_use") {
        const result = await executeTool(
          block.name,
          block.input as Record<string, unknown>
        );
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: result,
        });
      }
    }

    messages.push({ role: "user", content: toolResults });
  }

  return "Agent hit max steps without completing.";
}
```

---

## Best Practices

### Token-Management

- Setz `max_tokens` auf das Minimum, das du für deinen Use Case brauchst
- Nutz Haiku für einfache Extraktion/Klassifikation, Sonnet für allgemeine Tasks, Opus für komplexes Reasoning
- Bei langen Dokumenten chunke den Input, statt alles auf einmal zu schicken
- Überwach die Nutzung mit `message.usage.input_tokens` und `message.usage.output_tokens`

### Error Handling

```python
import anthropic

try:
    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        messages=[{"role": "user", "content": "Hello"}]
    )
except anthropic.AuthenticationError:
    print("Invalid API key. Check ANTHROPIC_API_KEY.")
except anthropic.RateLimitError:
    print("Rate limited. Implement backoff and retry.")
except anthropic.APIStatusError as e:
    print(f"API error {e.status_code}: {e.message}")
except anthropic.APIConnectionError:
    print("Network error. Check your connection.")
```

### Rate Limits & Retries

```python
import time
import anthropic

client = anthropic.Anthropic()

def call_with_retry(messages, max_retries=3):
    for attempt in range(max_retries):
        try:
            return client.messages.create(
                model="claude-sonnet-4-6",
                max_tokens=1024,
                messages=messages
            )
        except anthropic.RateLimitError:
            if attempt < max_retries - 1:
                wait = 2 ** attempt  # 1s, 2s, 4s
                time.sleep(wait)
            else:
                raise
```

### Kosten-Optimierung

| Strategie | Wie |
|----------|-----|
| Das richtige Model nutzen | Haiku für einfache Tasks, Sonnet für das meiste, Opus nur wenn nötig |
| Input-Tokens minimieren | Nur relevanten Kontext schicken, nicht ganze Dokumente |
| `max_tokens` knapp setzen | Setz nicht 4096, wenn du eine Ein-Zeilen-Antwort brauchst |
| System-Prompts cachen | Nutz Prompt Caching für wiederholte System-Prompts (senkt Kosten um 90%) |
| Requests batchen | Nutz die Batch API für nicht zeitkritische Arbeit (50% Kosten-Reduktion) |

### Prompt Caching

```python
message = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    system=[
        {
            "type": "text",
            "text": "You are an expert assistant with access to the following documentation: ...(long context)...",
            "cache_control": {"type": "ephemeral"}
        }
    ],
    messages=[
        {"role": "user", "content": "Summarize the key points."}
    ]
)
```

---

## Common Patterns

### Chat-Interface

Bau einen persistenten Chat, der die History hält:

```python
class ChatSession:
    def __init__(self, system_prompt: str = "", model: str = "claude-sonnet-4-6"):
        self.client = anthropic.Anthropic()
        self.model = model
        self.system = system_prompt
        self.messages: list = []

    def send(self, user_input: str) -> str:
        self.messages.append({"role": "user", "content": user_input})

        response = self.client.messages.create(
            model=self.model,
            max_tokens=2048,
            system=self.system,
            messages=self.messages
        )

        assistant_text = response.content[0].text
        self.messages.append({"role": "assistant", "content": assistant_text})
        return assistant_text

    def reset(self):
        self.messages = []
```

### Document-Analyse

```python
def analyze_document(text: str, question: str) -> str:
    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=2048,
        messages=[
            {
                "role": "user",
                "content": f"Document:\n\n{text}\n\nQuestion: {question}"
            }
        ]
    )
    return message.content[0].text
```

### Structured Output (JSON)

```python
import json

message = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    system="Always respond with valid JSON. No markdown, no explanation - just JSON.",
    messages=[
        {
            "role": "user",
            "content": "Extract the name, email, and company from this text: 'Hi, I'm Jane Smith from Acme Corp. Reach me at jane@acme.com'"
        }
    ]
)

data = json.loads(message.content[0].text)
# {"name": "Jane Smith", "email": "jane@acme.com", "company": "Acme Corp"}
```

### RAG (Retrieval-Augmented Generation)

```python
def rag_query(question: str, retrieved_chunks: list[str]) -> str:
    context = "\n\n---\n\n".join(retrieved_chunks)

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=2048,
        system="Answer questions using ONLY the provided context. If the context doesn't contain the answer, say so.",
        messages=[
            {
                "role": "user",
                "content": f"Context:\n{context}\n\nQuestion: {question}"
            }
        ]
    )
    return message.content[0].text
```