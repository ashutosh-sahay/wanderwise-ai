# WanderWise AI - Mermaid Architecture Diagrams

This document contains Mermaid diagrams for visualizing the WanderWise AI architecture and flows.

## Table of Contents
1. [Main Graph Flow](#main-graph-flow)
2. [Research Subgraph Flow](#research-subgraph-flow)
3. [Complete User Journey](#complete-user-journey)
4. [State Transitions](#state-transitions)
5. [Agent Architecture](#agent-architecture)
6. [Proposed Enhanced Architecture](#proposed-enhanced-architecture)

---

## Main Graph Flow

### Current Implementation

```mermaid
graph TD
    Start([User Query]) --> Extract[Extract Parameters<br/>Travel Agent AI]
    
    Extract --> Route{Route After<br/>Extraction}
    
    Route -->|Missing Params| End1([END<br/>Wait for User])
    Route -->|Plan Selected| Finalize[Finalize Plan]
    Route -->|Ready to Research| Research[Research Planning<br/>Invoke Subgraph]
    
    Research --> Present[Present Plans<br/>Show Options]
    Present --> End2([END<br/>Wait for Selection])
    
    End1 -.User Provides Info.-> Extract
    End2 -.User Selects Plan.-> Extract
    
    Finalize --> Itinerary[Create Itinerary<br/>Day-by-Day Schedule]
    Itinerary --> End3([END<br/>Complete])
    
    style Extract fill:#e1f5ff
    style Research fill:#fff4e1
    style Present fill:#f0e1ff
    style Finalize fill:#e1ffe1
    style Itinerary fill:#ffe1e1
    style End1 fill:#ffcccc
    style End2 fill:#ffcccc
    style End3 fill:#ccffcc
```

### Detailed Node Flow

```mermaid
flowchart TB
    subgraph Main["Main Orchestration Graph"]
        direction TB
        
        A[extract_parameters_node] -->|All inputs present<br/>No plans yet| B[research_planning_node]
        A -->|Plan selected| C[finalize_plan_node]
        A -->|Missing inputs| D[END: Await User Input]
        
        B --> E[present_plans_node]
        E --> F[END: Await Plan Selection]
        
        C --> G[create_itinerary_node]
        G --> H[END: Complete]
        
        F -.User Selects.-> A
        D -.User Provides.-> A
    end
    
    style A fill:#4A90E2,color:#fff
    style B fill:#F5A623,color:#fff
    style C fill:#7ED321,color:#fff
    style E fill:#BD10E0,color:#fff
    style G fill:#FF6B6B,color:#fff
```

---

## Research Subgraph Flow

### Current Implementation

```mermaid
graph TD
    Entry([Invoked by<br/>research_planning_node]) --> Coordinator[Coordinator Node<br/>Validate Inputs]
    
    Coordinator --> Parallel{Fan-Out<br/>Parallel Execution}
    
    Parallel -->|Parallel| Places[Places Agent<br/>Tourist Attractions]
    Parallel -->|Parallel| Weather[Weather Agent<br/>Weather Data]
    
    Places --> Validate[Validate Research<br/>Check Completeness]
    Weather --> Validate
    
    Validate --> Synthesizer[Synthesizer<br/>Create 2-3 Plan Variants]
    
    Synthesizer --> Return([Return to<br/>Parent Graph])
    
    style Coordinator fill:#e1f5ff
    style Places fill:#c8e6c9
    style Weather fill:#fff9c4
    style Validate fill:#ffccbc
    style Synthesizer fill:#f8bbd0
```

### With Future Agents

```mermaid
graph TD
    Coordinator[Coordinator] --> FanOut{Fan-Out}
    
    FanOut --> Places[Places Agent]
    FanOut --> Weather[Weather Agent]
    FanOut --> Flights[Flight Agent<br/>Coming Soon]
    FanOut --> Hotels[Hotel Agent<br/>Coming Soon]
    FanOut --> Transport[Transport Agent<br/>Coming Soon]
    FanOut --> Food[Food Agent<br/>Coming Soon]
    FanOut --> Reviews[Reviews Agent<br/>Coming Soon]
    
    Places --> Validate[Validate Research]
    Weather --> Validate
    Flights --> Validate
    Hotels --> Validate
    Transport --> Validate
    Food --> Validate
    Reviews --> Validate
    
    Validate --> Synthesizer[Synthesizer<br/>Create Plan Variants]
    Synthesizer --> Return([Return])
    
    style Places fill:#4CAF50,color:#fff
    style Weather fill:#2196F3,color:#fff
    style Flights fill:#ddd,color:#666
    style Hotels fill:#ddd,color:#666
    style Transport fill:#ddd,color:#666
    style Food fill:#ddd,color:#666
    style Reviews fill:#ddd,color:#666
```

---

## Complete User Journey

### End-to-End Flow

```mermaid
sequenceDiagram
    participant User
    participant CLI as Interactive CLI
    participant Graph as Main Graph
    participant SubGraph as Research Subgraph
    participant Agents as AI Agents
    
    User->>CLI: "Plan trip to Rishikesh, 5 days, $2000"
    CLI->>Graph: Initialize with user_query
    
    Graph->>Agents: extract_parameters
    Agents-->>Graph: TravelInputs + intent
    
    alt Missing Parameters
        Graph->>CLI: Request more info
        CLI->>User: "Where are you traveling from?"
        User->>CLI: "From Delhi"
        CLI->>Graph: Updated query
    end
    
    Graph->>SubGraph: research_planning
    
    par Parallel Research
        SubGraph->>Agents: places_agent
        SubGraph->>Agents: weather_agent
    end
    
    Agents-->>SubGraph: Research data
    SubGraph->>Agents: synthesizer
    Agents-->>SubGraph: 3 plan variants
    SubGraph-->>Graph: TravelPlan
    
    Graph->>CLI: present_plans
    CLI->>User: Show options (Balanced/Adventurous/Luxury)
    
    User->>CLI: "I'll take adventurous"
    CLI->>Graph: User selection
    
    Graph->>Agents: finalize_plan
    Agents-->>Graph: Selected plan stored
    
    Graph->>Agents: create_itinerary
    Agents-->>Graph: DayByDayItinerary
    
    Graph->>CLI: Complete itinerary
    CLI->>User: Display day-by-day schedule
```

### Routing Decision Flow

```mermaid
flowchart TD
    Start[After extract_parameters] --> CheckSelection{Plan<br/>Selected?}
    
    CheckSelection -->|Yes| Finalize[Route to:<br/>finalize_plan]
    CheckSelection -->|No| CheckInputs{All Inputs<br/>Present?}
    
    CheckInputs -->|No| WaitUser[Route to:<br/>END - Await User]
    CheckInputs -->|Yes| CheckPlans{Plans<br/>Exist?}
    
    CheckPlans -->|No| Research[Route to:<br/>research_planning]
    CheckPlans -->|Yes| WaitSelection[Route to:<br/>END - Await Selection]
    
    style Finalize fill:#7ED321,color:#fff
    style Research fill:#F5A623,color:#fff
    style WaitUser fill:#FF6B6B,color:#fff
    style WaitSelection fill:#FF6B6B,color:#fff
```

---

## State Transitions

### State Lifecycle

```mermaid
stateDiagram-v2
    [*] --> InitialState: User starts conversation
    
    InitialState --> ParamsIncomplete: Missing travel details
    ParamsIncomplete --> ParamsComplete: User provides all info
    ParamsIncomplete --> ParamsIncomplete: User provides partial info
    
    ParamsComplete --> Researching: All inputs present
    
    Researching --> PlansReady: Research complete
    
    PlansReady --> PlanSelected: User selects a plan
    PlansReady --> ParamsComplete: User requests modifications
    
    PlanSelected --> ItineraryCreated: Itinerary generated
    
    ItineraryCreated --> [*]: Complete
    
    note right of InitialState
        State:
        - user_query
        - conversation_history: []
        - travel_inputs: None
    end note
    
    note right of ParamsComplete
        State:
        - all_required_inputs_present: True
        - travel_inputs: TravelInputs(...)
    end note
    
    note right of PlansReady
        State:
        - proposed_travel_plans: TravelPlan
        - awaiting_user_input: True
    end note
    
    note right of ItineraryCreated
        State:
        - day_by_day_itinerary: Complete
        - accepted_travel_plan: Selected
    end note
```

### State Data Flow

```mermaid
graph LR
    subgraph Input["User Input"]
        A1[Raw Query Text]
    end
    
    subgraph Extraction["After Extract Parameters"]
        B1[TravelInputs]
        B2[user_intent]
        B3[conversation_history]
    end
    
    subgraph Research["After Research"]
        C1[proposed_travel_plans]
        C2[balanced plan]
        C3[adventurous plan]
        C4[luxury plan]
    end
    
    subgraph Selection["After Selection"]
        D1[selected_plan_name]
        D2[accepted_travel_plan]
    end
    
    subgraph Final["Final Output"]
        E1[day_by_day_itinerary]
        E2[Daily plans]
        E3[Costs]
        E4[Tips]
    end
    
    A1 --> B1
    A1 --> B2
    A1 --> B3
    
    B1 --> C1
    C1 --> C2
    C1 --> C3
    C1 --> C4
    
    C2 & C3 & C4 --> D1
    D1 --> D2
    
    D2 --> E1
    E1 --> E2
    E1 --> E3
    E1 --> E4
```

---

## Agent Architecture

### Current Agent Ecosystem

```mermaid
graph TB
    subgraph Orchestration["Orchestration Layer"]
        MainGraph[Main Graph<br/>graph.py]
        ResearchGraph[Research Subgraph<br/>research_subgraph.py]
    end
    
    subgraph Agents["AI Agents Layer"]
        TravelAgent[Travel Agent<br/>Parameter Extraction]
        PlacesAgent[Places Agent<br/>Attractions Research]
        WeatherAgent[Weather Agent<br/>Weather Data]
        Synthesizer[Research Synthesizer<br/>Plan Variants]
        ItineraryAgent[Itinerary Planner<br/>Day-by-Day Schedule]
    end
    
    subgraph Tools["Tools & APIs Layer"]
        TavilySearch[Tavily Search API]
        OpenAI[OpenAI GPT-4]
    end
    
    subgraph Models["Data Models Layer"]
        StateModels[State Models<br/>TravelAgentState]
        ResponseModels[Response Models<br/>TravelAgentResponse]
        ResearchModels[Research Models<br/>TravelResearch]
    end
    
    MainGraph --> TravelAgent
    MainGraph --> ItineraryAgent
    MainGraph --> ResearchGraph
    
    ResearchGraph --> PlacesAgent
    ResearchGraph --> WeatherAgent
    ResearchGraph --> Synthesizer
    
    TravelAgent --> OpenAI
    PlacesAgent --> TavilySearch
    PlacesAgent --> OpenAI
    WeatherAgent --> TavilySearch
    WeatherAgent --> OpenAI
    Synthesizer --> OpenAI
    ItineraryAgent --> OpenAI
    
    TravelAgent --> ResponseModels
    PlacesAgent --> ResearchModels
    WeatherAgent --> ResearchModels
    ItineraryAgent --> StateModels
    
    style MainGraph fill:#4A90E2,color:#fff
    style ResearchGraph fill:#F5A623,color:#fff
    style TravelAgent fill:#7ED321,color:#fff
    style PlacesAgent fill:#50E3C2,color:#fff
    style WeatherAgent fill:#50E3C2,color:#fff
    style Synthesizer fill:#BD10E0,color:#fff
    style ItineraryAgent fill:#FF6B6B,color:#fff
```

### Agent Responsibility Matrix

```mermaid
mindmap
  root((WanderWise<br/>Agents))
    Travel Agent
      Parse user query
      Extract parameters
      Classify intent
      Validate completeness
    Research Pod
      Places Agent
        Find attractions
        Discover activities
        Local experiences
      Weather Agent
        Current conditions
        Best time to visit
        Weather trends
      Synthesizer
        Combine research
        Create variants
        Balance trade-offs
    Itinerary Planner
      Schedule activities
      Calculate timings
      Estimate costs
      Provide tips
```

---

## Proposed Enhanced Architecture

### With All Planned Agents

```mermaid
graph TB
    subgraph Main["Main Graph - Enhanced"]
        A[Extract Parameters] --> B{Route}
        B -->|Research| C[Research Planning]
        B -->|Finalize| D[Finalize Plan]
        
        C --> E[Present Plans]
        E --> F[Wait for Selection]
        
        D --> G[Create Itinerary]
        G --> H[Budget Analysis]
        H --> I[Present Budget]
        I --> J[Wait for Approval]
        
        J --> K[Prepare Booking Cart]
        K --> L[Present Cart]
        L --> M[Wait for Confirmation]
        
        M --> N[Generate Outputs]
        N --> O[Complete]
    end
    
    subgraph Research["Research Subgraph - Enhanced"]
        R1[Coordinator] --> R2{Fan-Out}
        
        R2 --> R3[Places]
        R2 --> R4[Weather]
        R2 --> R5[Flights]
        R2 --> R6[Hotels]
        R2 --> R7[Transport]
        R2 --> R8[Food]
        R2 --> R9[Reviews]
        
        R3 & R4 & R5 & R6 & R7 & R8 & R9 --> R10[Validate]
        R10 --> R11[Synthesizer]
    end
    
    C -.Invoke.-> Research
    
    style A fill:#4A90E2,color:#fff
    style C fill:#F5A623,color:#fff
    style G fill:#FF6B6B,color:#fff
    style H fill:#7ED321,color:#fff
    style K fill:#BD10E0,color:#fff
    style N fill:#50E3C2,color:#fff
    style R3 fill:#4CAF50,color:#fff
    style R4 fill:#2196F3,color:#fff
    style R5 fill:#FF9800,color:#fff
    style R6 fill:#E91E63,color:#fff
    style R7 fill:#9C27B0,color:#fff
    style R8 fill:#795548,color:#fff
    style R9 fill:#607D8B,color:#fff
```

### Multiple Approval Checkpoints

```mermaid
graph TD
    Start([User Query]) --> Params[Parameter Collection]
    
    Params --> CP1{Checkpoint 1:<br/>Plan Selection}
    CP1 -->|User Approves| Research[Research Complete]
    CP1 -->|User Rejects| Params
    
    Research --> Itinerary[Itinerary Created]
    
    Itinerary --> CP2{Checkpoint 2:<br/>Budget Approval}
    CP2 -->|User Approves| Budget[Budget Approved]
    CP2 -->|Optimize| BudgetOpt[Budget Optimizer]
    BudgetOpt --> CP2
    
    Budget --> Cart[Booking Cart]
    
    Cart --> CP3{Checkpoint 3:<br/>Booking Confirmation}
    CP3 -->|User Confirms| Final[Final Output]
    CP3 -->|User Modifies| Cart
    
    Final --> End([Complete])
    
    style CP1 fill:#FF6B6B,color:#fff
    style CP2 fill:#FF9800,color:#fff
    style CP3 fill:#4CAF50,color:#fff
    style End fill:#7ED321,color:#fff
```

---

## System Architecture Overview

### High-Level Components

```mermaid
C4Context
    title System Context - WanderWise AI
    
    Person(user, "Traveler", "User planning a trip")
    
    System(wanderwise, "WanderWise AI", "Multi-agent travel planning system")
    
    System_Ext(openai, "OpenAI API", "GPT-4 for agent intelligence")
    System_Ext(tavily, "Tavily Search", "Web search for research")
    System_Ext(langsmith, "LangSmith", "Agent monitoring")
    
    Rel(user, wanderwise, "Plans trip via", "CLI/API")
    Rel(wanderwise, openai, "Uses for", "AI reasoning")
    Rel(wanderwise, tavily, "Uses for", "Web search")
    Rel(wanderwise, langsmith, "Logs to", "Monitoring")
```

### Container Diagram

```mermaid
graph TB
    subgraph User["User Interface"]
        CLI[Interactive CLI<br/>Python Script]
        API[FastAPI Server<br/>REST API]
    end
    
    subgraph Application["Application Core"]
        Orchestrator[LangGraph Orchestrator<br/>graph.py]
        Agents[AI Agents<br/>Individual Agents]
        Models[Data Models<br/>Pydantic]
    end
    
    subgraph External["External Services"]
        OpenAI[OpenAI API<br/>GPT-4]
        Tavily[Tavily Search API<br/>Web Search]
        LangSmith[LangSmith<br/>Monitoring]
    end
    
    CLI --> Orchestrator
    API --> Orchestrator
    
    Orchestrator --> Agents
    Agents --> Models
    
    Agents --> OpenAI
    Agents --> Tavily
    Orchestrator --> LangSmith
    
    style CLI fill:#4A90E2,color:#fff
    style API fill:#4A90E2,color:#fff
    style Orchestrator fill:#F5A623,color:#fff
    style Agents fill:#7ED321,color:#fff
    style Models fill:#BD10E0,color:#fff
```

---

## Data Flow Diagram

### Information Transformation Pipeline

```mermaid
graph LR
    A[User Text<br/>Raw Query] -->|Travel Agent| B[Structured Data<br/>TravelInputs]
    
    B -->|Research Agents| C[Research Data<br/>Places, Weather, etc.]
    
    C -->|Synthesizer| D[Plan Variants<br/>TravelPlan]
    
    D -->|User Selection| E[Selected Plan<br/>TravelResearch]
    
    E -->|Itinerary Planner| F[Final Itinerary<br/>DayByDayItinerary]
    
    F -->|Display| G[User Output<br/>Formatted Display]
    
    style A fill:#E3F2FD
    style B fill:#FFF3E0
    style C fill:#F3E5F5
    style D fill:#E8F5E9
    style E fill:#FCE4EC
    style F fill:#FFF9C4
    style G fill:#E0F2F1
```

---

## Performance Visualization

### Parallel Execution Speed-Up

```mermaid
gantt
    title Sequential vs Parallel Agent Execution
    dateFormat  s
    axisFormat %Ss
    
    section Sequential
    Places Agent        :a1, 0, 10s
    Weather Agent       :a2, after a1, 8s
    Flight Agent        :a3, after a2, 12s
    Hotel Agent         :a4, after a3, 10s
    
    section Parallel
    Places Agent        :b1, 0, 10s
    Weather Agent       :b2, 0, 8s
    Flight Agent        :b3, 0, 12s
    Hotel Agent         :b4, 0, 10s
```

---

## Error Handling Flow

### Retry and Fallback Strategy (Proposed)

```mermaid
graph TD
    Start[Agent Invocation] --> Try{Execute}
    
    Try -->|Success| Success[Return Result]
    Try -->|Error| Retry{Retry<br/>Count < 3?}
    
    Retry -->|Yes| Wait[Exponential<br/>Backoff]
    Wait --> Try
    
    Retry -->|No| Fallback{Fallback<br/>Available?}
    
    Fallback -->|Yes| UseFallback[Use Cached<br/>or Default Data]
    UseFallback --> Warn[Log Warning]
    Warn --> Success
    
    Fallback -->|No| Error[Return Error]
    Error --> Notify[Notify User]
    
    style Success fill:#4CAF50,color:#fff
    style Error fill:#F44336,color:#fff
    style Warn fill:#FF9800,color:#fff
```

---

## Usage Instructions

### How to Use These Diagrams

1. **Copy any diagram code block** above
2. **Paste into a Mermaid editor**:
   - GitHub (supports Mermaid in markdown)
   - https://mermaid.live/
   - VS Code (with Mermaid extension)
   - Documentation sites (GitBook, etc.)

3. **Customize** colors, labels, or structure as needed

### Rendering in GitHub

GitHub automatically renders Mermaid diagrams in markdown. Simply include the code blocks as:

\`\`\`mermaid
graph TD
    A --> B
\`\`\`

### Exporting Diagrams

Using mermaid.live:
- Export as PNG/SVG for presentations
- Export as PDF for documentation
- Copy as image for embedding

---

## Contributing

To add new diagrams:
1. Follow the existing style and naming conventions
2. Use consistent colors for similar node types
3. Add descriptive titles and legends
4. Test rendering in GitHub or mermaid.live
5. Update the Table of Contents

---

**Note**: These diagrams are living documentation. Update them as the architecture evolves.
