# Agent Flow Diagram

## Graph + Subgraph Architecture

```mermaid
flowchart TB
    subgraph MainGraph["Main Graph (TravelAgentState)"]
        Entry[Entry Point] --> ExtractParams[extract_parameters<br/>Node]
        
        ExtractParams --> Route{route_after_extraction<br/>Conditional Router}
        
        Route -->|Missing Inputs| End1[END]
        Route -->|All Inputs Present| ResearchPlanning[research_planning<br/>Node]
        Route -->|Plan Selected| FinalizePlan[finalize_plan<br/>Node]
        
        ResearchPlanning -.invokes.-> SubgraphInvoke[Research Subgraph]
        
        SubgraphInvoke -.returns.-> PresentPlans[present_plans<br/>Node]
        PresentPlans --> End2[END]
        
        FinalizePlan --> CreateItinerary[create_itinerary<br/>Node]
        CreateItinerary --> End3[END]
    end
    
    subgraph ResearchSubgraph["Research Subgraph (TravelPlanState)"]
        SubEntry[Entry Point] --> Coordinator[coordinator<br/>Node<br/>Delta Detection]
        
        Coordinator -->|Parallel Fan-Out| Places[places_to_visit<br/>Node]
        Coordinator -->|Parallel Fan-Out| Weather[weather<br/>Node]
        Coordinator -->|Parallel Fan-Out| Transport[transport<br/>Node]
        Coordinator -->|Parallel Fan-Out| Stay[stay<br/>Node]
        
        Places -->|Converge| Validate[validate_research<br/>Node]
        Weather -->|Converge| Validate
        Transport -->|Converge| Validate
        Stay -->|Converge| Validate
        
        Validate --> Synthesizer[synthesizer<br/>Node]
        Synthesizer --> SubEnd[END<br/>Returns TravelPlan]
    end
    
    style MainGraph fill:#E3F2FD,stroke:#1976D2,stroke-width:3px
    style ResearchSubgraph fill:#FFF3E0,stroke:#F57C00,stroke-width:3px
    style ExtractParams fill:#4A90E2,color:#fff
    style ResearchPlanning fill:#F5A623,color:#fff
    style Coordinator fill:#7ED321,color:#fff
    style Synthesizer fill:#BD10E0,color:#fff
    style FinalizePlan fill:#9C27B0,color:#fff
    style CreateItinerary fill:#FF6B6B,color:#fff
```

## Graph Structure Details

```mermaid
graph TB
    subgraph MainGraphStructure["Main Graph Structure<br/>StateGraph(TravelAgentState)"]
        direction TB
        M1[extract_parameters] -->|conditional| M2{route_after_extraction}
        M2 -->|research_planning| M3[research_planning]
        M2 -->|finalize_plan| M5[finalize_plan]
        M2 -->|human_input| MEND1[END]
        M3 --> M4[present_plans]
        M4 --> MEND2[END]
        M5 --> M6[create_itinerary]
        M6 --> MEND3[END]
    end
    
    subgraph SubgraphStructure["Research Subgraph Structure<br/>StateGraph(TravelPlanState)"]
        direction TB
        S1[coordinator] -->|parallel edges| S2[places_to_visit]
        S1 -->|parallel edges| S3[weather]
        S1 -->|parallel edges| S4[transport]
        S1 -->|parallel edges| S5[stay]
        S2 -->|converge| S6[validate_research]
        S3 -->|converge| S6
        S4 -->|converge| S6
        S5 -->|converge| S6
        S6 --> S7[synthesizer]
        S7 --> SEND[END]
    end
    
    M3 -.invoke.-> S1
    SEND -.return TravelPlan.-> M3
    
    style MainGraphStructure fill:#E3F2FD,stroke:#1976D2,stroke-width:2px
    style SubgraphStructure fill:#FFF3E0,stroke:#F57C00,stroke-width:2px
    style M3 fill:#F5A623,color:#fff
    style S1 fill:#7ED321,color:#fff
    style S7 fill:#BD10E0,color:#fff
```

## Complete Agent Flow Sequence

```mermaid
flowchart TD
    Start([User Query]) --> ExtractParams[extract_parameters_node<br/>travel_agent]
    
    ExtractParams --> RouteDecision{route_after_extraction}
    
    RouteDecision -->|Missing Inputs| End1[END<br/>Wait for User Input]
    RouteDecision -->|All Inputs Present<br/>No Plans Yet| ResearchPlanning[research_planning_node]
    RouteDecision -->|Plan Selected| FinalizePlan[finalize_plan_node]
    RouteDecision -->|Plans Exist<br/>User Modified| ResearchPlanning
    
    ResearchPlanning --> ResearchSubgraph[Research Subgraph]
    
    subgraph ResearchSubgraph["Research Subgraph"]
        Coordinator[coordinator_node<br/>Detect Delta Changes] --> ParallelFanOut{Parallel Execution}
        
        ParallelFanOut --> PlacesAgent[places_to_visit_node<br/>places_to_visit_agent<br/>Tavily Search]
        ParallelFanOut --> WeatherAgent[weather_node<br/>weather_agent<br/>Tavily Search]
        ParallelFanOut --> TransportAgent[transport_node<br/>transport_finder_agent<br/>Tavily Search]
        ParallelFanOut --> StayAgent[stay_node<br/>stay_finder_agent<br/>Tavily Search]
        
        PlacesAgent --> Validate[validate_research_node]
        WeatherAgent --> Validate
        TransportAgent --> Validate
        StayAgent --> Validate
        
        Validate --> Synthesizer[synthesizer_node<br/>research_synthesizer_agent<br/>Creates 2-3 Plan Variants]
        Synthesizer --> SubgraphEnd[END]
    end
    
    ResearchSubgraph --> PresentPlans[present_plans_node<br/>Show Plans to User]
    PresentPlans --> End2[END<br/>Wait for User Selection]
    
    End2 -->|User Selects Plan| ExtractParams
    
    FinalizePlan --> CreateItinerary[create_itinerary_node<br/>itinerary_planner_agent]
    CreateItinerary --> End3[END<br/>Complete]
    
    style ExtractParams fill:#4A90E2,color:#fff
    style ResearchPlanning fill:#F5A623,color:#fff
    style Coordinator fill:#7ED321,color:#fff
    style PlacesAgent fill:#50E3C2,color:#fff
    style WeatherAgent fill:#50E3C2,color:#fff
    style TransportAgent fill:#50E3C2,color:#fff
    style StayAgent fill:#50E3C2,color:#fff
    style Synthesizer fill:#BD10E0,color:#fff
    style PresentPlans fill:#FF9800,color:#fff
    style FinalizePlan fill:#9C27B0,color:#fff
    style CreateItinerary fill:#FF6B6B,color:#fff
```

## Detailed Sequence Diagram

```mermaid
sequenceDiagram
    participant User
    participant MainGraph as Main Graph
    participant TravelAgent as Travel Agent
    participant ResearchGraph as Research Subgraph
    participant PlacesAgent as Places Agent
    participant WeatherAgent as Weather Agent
    participant TransportAgent as Transport Agent
    participant StayAgent as Stay Agent
    participant Synthesizer as Research Synthesizer
    participant ItineraryAgent as Itinerary Planner
    
    User->>MainGraph: "Plan trip to Rishikesh, 5 days, $2000"
    MainGraph->>TravelAgent: extract_parameters
    TravelAgent-->>MainGraph: TravelAgentResponse<br/>(inputs, intent, validation)
    
    alt Missing Required Inputs
        MainGraph-->>User: Request missing information
        User->>MainGraph: Provide missing inputs
        MainGraph->>TravelAgent: extract_parameters (updated)
        TravelAgent-->>MainGraph: TravelAgentResponse
    end
    
    alt All Inputs Present
        MainGraph->>ResearchGraph: research_planning_node
        
        par Parallel Research Execution
            ResearchGraph->>PlacesAgent: places_to_visit_node
            PlacesAgent->>PlacesAgent: Tavily Search API
            PlacesAgent-->>ResearchGraph: PlacesToVisit
            
            ResearchGraph->>WeatherAgent: weather_node
            WeatherAgent->>WeatherAgent: Tavily Search API
            WeatherAgent-->>ResearchGraph: WeatherDetails
            
            ResearchGraph->>TransportAgent: transport_node
            TransportAgent->>TransportAgent: Tavily Search API
            TransportAgent-->>ResearchGraph: TransportationRoutes
            
            ResearchGraph->>StayAgent: stay_node
            StayAgent->>StayAgent: Tavily Search API
            StayAgent-->>ResearchGraph: StayOptions
        end
        
        ResearchGraph->>ResearchGraph: validate_research_node
        ResearchGraph->>Synthesizer: synthesizer_node
        Synthesizer-->>ResearchGraph: TravelPlan<br/>(2-3 variants)
        ResearchGraph-->>MainGraph: TravelPlan variants
        
        MainGraph->>MainGraph: present_plans_node
        MainGraph-->>User: Display plan options
        User->>MainGraph: Select plan "Adventurous"
        
        MainGraph->>TravelAgent: extract_parameters<br/>(user_intent: selecting_plan)
        TravelAgent-->>MainGraph: TravelAgentResponse<br/>(selected_plan_name)
        
        MainGraph->>MainGraph: finalize_plan_node
        MainGraph->>ItineraryAgent: create_itinerary_node
        ItineraryAgent-->>MainGraph: DayByDayItinerary
        MainGraph-->>User: Complete itinerary
    end
```

## Delta Execution Flow (Re-optimization)

```mermaid
flowchart LR
    subgraph DeltaDetection["Delta Detection Logic"]
        PreviousInputs[Previous Inputs<br/>destination, dates, budget, etc.] --> Compare[Compare with<br/>Current Inputs]
        CurrentInputs[Current Inputs] --> Compare
        Compare --> DetectChanges{Changes<br/>Detected?}
    end
    
    DetectChanges -->|destination changed| AllNodes[Execute All Nodes<br/>places, weather, transport, stay]
    DetectChanges -->|source changed| TransportOnly[Execute transport only]
    DetectChanges -->|dates changed| DateNodes[Execute transport, stay, weather]
    DetectChanges -->|budget changed| BudgetNodes[Execute transport, stay, places]
    DetectChanges -->|travel_vibe changed| VibeNodes[Execute places, stay]
    DetectChanges -->|No changes| SynthesizeOnly[Re-synthesize only<br/>Skip all research nodes]
    
    AllNodes --> Validate
    TransportOnly --> Validate
    DateNodes --> Validate
    BudgetNodes --> Validate
    VibeNodes --> Validate
    SynthesizeOnly --> Validate
    
    Validate --> Synthesizer
    
    style Compare fill:#FFE082,color:#000
    style DetectChanges fill:#90CAF9,color:#000
    style SynthesizeOnly fill:#C8E6C9,color:#000
```

## Agent Responsibilities

```mermaid
mindmap
  root((WanderWise Agents))
    Travel Agent
      Extract Parameters
      Validate Inputs
      Classify Intent
      Handle User Queries
    Research Pod
      Coordinator
        Delta Detection
        Node Orchestration
      Places Agent
        Find Attractions
        Discover Activities
        Local Experiences
      Weather Agent
        Current Conditions
        Best Time to Visit
        Weather Trends
      Transport Agent
        Route Research
        Transportation Options
        Cost Analysis
      Stay Agent
        Accommodation Research
        Hotel Options
        Budget Matching
      Synthesizer
        Combine Research
        Create Variants
        Balance Trade-offs
    Itinerary Planner
      Schedule Activities
      Calculate Timings
      Estimate Costs
      Provide Tips
```
