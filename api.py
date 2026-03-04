"""
api.py — FastAPI backend for the portfolio AI chat widget.
Calls Groq (llama-3.3-70b-versatile) and returns a reply.

Run locally:
    uvicorn api:app --reload --port 8000
"""

import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
from dotenv import load_dotenv

load_dotenv(override=True)

# ── App setup ──────────────────────────────────────────
app = FastAPI(title="Francis Portfolio API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST", "GET"],
    allow_headers=["Content-Type"],
)

# ── Groq client ────────────────────────────────────────
client = Groq(
    api_key=os.environ.get("GROQ_API_KEY"),
    base_url="https://api.groq.com",
)

# ── System prompt ──────────────────────────────────────
SYSTEM_PROMPT = """You are a helpful AI assistant for Francis's software portfolio website.
Answer questions about Francis concisely and professionally. Keep replies short (2-4 sentences max).
Only answer questions related to Francis's professional background, skills, projects, and contact info.
If asked about something unrelated, politely redirect to his work.

=== ABOUT FRANCIS ===
Name: Francis
Role: AI Engineer & Full-Stack Developer
Bio: Francis architects intelligent systems at the intersection of LLMs, cloud
     infrastructure, and product engineering. He builds production-ready AI
     applications — from multi-agent orchestration to RAG pipelines — and
     deploys them with Docker, AWS, and full CI/CD automation.

=== SKILLS ===
AI / ML:
  - LangChain, LangGraph, CrewAI, MCP Protocol
  - OpenAI API, Groq, Google Gemini, AWS Bedrock AgentCore
  - FAISS vector store, Sentence Transformers, RAG pipelines
  - ReAct agents, multi-agent orchestration

Backend:
  - Python, FastAPI, Pydantic, REST API
  - MySQL, WebSockets, C#, .NET WinForms, ADO.NET, SQL Server

Cloud / DevOps:
  - AWS EC2, ECS Fargate, App Runner, Bedrock AgentCore
  - Docker, GitHub Actions CI/CD, ECR, S3
  - Secrets Manager, CloudWatch

Frontend:
  - HTML, CSS, JavaScript, Responsive Design

Tools & DBs:
  - Git, VS Code, Postman, MySQL, SQL Server, Visual Studio .NET

=== WORK EXPERIENCE ===
Company: Capgemini — Associate I
Location: Bengaluru, Karnataka, India
Duration: 02/2022 – Present
- Engineered a custom Content Management System using C#, VB, and .NET to automate the parsing and processing of unstructured data in PowerPoint presentations.
- Developed a data extraction engine that analyzes slides based on user-defined keywords, dynamically extracting and compiling relevant content into new presentations to reduce manual effort.
- Integrated SQL Server for robust data storage and keyword tracking, optimizing content retrieval times and supporting advanced data customization.
- Managed the full Software Development Lifecycle (SDLC), driving features from requirement gathering and system design through to coding, deployment, and performance optimization.

=== PROJECTS ===

1. OmniChat — Multi-Modal AI Chatbot
   Unified AI interface combining vision analysis, text-to-speech,
   image generation, and web search across 6+ LLM providers.
   Tech: FastAPI, Groq, Gemini, Stable Diffusion, OpenAI

2. RAG ReAct Agent — Document Search System
   Semantic PDF search with ReAct agent orchestration, persistent
   FAISS vector store, and automatic Tavily web search fallback.
   Tech: LangChain, LangGraph, FAISS, OpenAI, Tavily

3. AI Code Review Crew — Multi-Agent Analyzer
   5 specialized AI agents that review Python code for bugs,
   security flaws, performance issues, and documentation quality.
   Tech: CrewAI, FastAPI, AWS ECS Fargate, OpenAI

4. Study Tools MCP — AI Study Assistant
   Claude Desktop-integrated study assistant via Model Context Protocol.
   Generates quizzes, flashcards, and summaries from PDF study materials.
   Tech: MCP Protocol, FastAPI, OpenAI, PyPDF2, AWS EC2

5. Expense Manager — Full-Stack Finance App
   Full-stack expense tracker with category analytics, real-time charts,
   and 41+ automated test cases. Deployed on AWS Elastic Beanstalk.
   Tech: FastAPI, MySQL, AWS Elastic Beanstalk, Pydantic, JavaScript

6. Lauki FAQ Agent — Conversational Support AI
   Customer support agent with persistent memory via AWS Bedrock AgentCore,
   semantic FAQ search using FAISS, and CI/CD pipeline on AWS App Runner.
   Tech: LangGraph, AWS Bedrock AgentCore, FAISS, Groq, Docker

=== CONTACT ===
GitHub:   https://github.com/francis-rf
LinkedIn: https://www.linkedin.com/in/francis-rf/
Email:    rfrancis789@gmail.com
Open to:  Collaborations, job opportunities, and interesting AI projects.
"""

# ── Request / Response models ──────────────────────────
class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str

# ── Endpoints ──────────────────────────────────────────
@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    try:
        completion = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user",   "content": request.message},
            ],
            max_tokens=256,
            temperature=0.7,
        )
        reply = completion.choices[0].message.content.strip()
        return ChatResponse(reply=reply)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health():
    return {"status": "online"}
