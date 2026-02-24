# WanderWise AI - Implementation Plan

## Current State

### Working Well ✅
- Clean agent separation (main graph + research subgraph)
- Human-in-the-loop pattern with state management
- Structured outputs with Pydantic models
- Parallel agent execution for speed

### Critical Issues ⚠️
1. **No error handling** - Single agent failure breaks entire flow
2. **No validation** - Missing data checks before nodes
3. **Code duplication** - Date calc, plan matching repeated
4. **No performance tracking** - Can't measure costs/speed

### Missing Features (Problem Statement Requirements)
1. **Booking agents** - Flight, hotel, activity booking
2. **Budget breakdown** - Category-wise with approval checkpoint
3. **Booking links** - Real integration with booking platforms
4. **Multiple approvals** - Only have plan selection, need budget + booking
5. **Visual outputs** - Maps, PDF export
6. **Dynamic re-planning** - Handle delays/changes

---

## Priority Implementation Plan

### Phase 1: Foundation (Week 1)

#### 1.1 Extract Utilities
**Create `app/utils/travel_utils.py`:**
```python
def calculate_trip_duration(start_date: str, end_date: str, duration: int) -> int:
    """Calculate trip duration with fallback."""

def find_plan_by_name(plans: dict, plan_name: str) -> Optional[TravelResearch]:
    """Case-insensitive plan lookup."""
```

#### 1.2 Add Error Handling
**Create `app/ai/agents/base.py`:**
```python
async def invoke_agent_with_retry(agent, message: str, max_retries: int = 3) -> dict:
    """Standard invocation with retry and timeout."""
```
Apply to all agent invocations.

#### 1.3 Add Validation
**Create `app/validators/state_validator.py`:**
```python
def validate_travel_inputs(inputs: TravelInputs) -> list[str]:
    """Return validation errors."""

def validate_research_completeness(plan: TravelResearch) -> bool:
    """Check if research has minimum required data."""
```

---

### Phase 2: Core Agents (Week 2)

#### 2.1 Flight Agent
**Files:**
- `app/models/flight.py` - FlightOption, FlightResults models
- `app/ai/agents/research_pod/flight_agent.py` - Agent
- `app/tools/flight_search.py` - SkyScanner/Amadeus API integration

**Integration:** Add to research subgraph parallel execution

#### 2.2 Hotel Agent
**Files:**
- `app/models/accommodation.py` - AccommodationOption model
- `app/ai/agents/research_pod/hotel_agent.py` - Agent
- `app/tools/hotel_search.py` - Booking.com API integration

**Integration:** Add to research subgraph parallel execution

#### 2.3 Budget Optimizer
**Files:**
- `app/models/budget.py` - BudgetBreakdown, BudgetAnalysis models
- `app/ai/agents/budget_optimizer.py` - Optimizer logic

**Integration:** Add node after itinerary creation

**Flow:** `create_itinerary` → `budget_analysis` → `present_budget` → END

#### 2.4 Booking Coordinator
**Files:**
- `app/models/booking.py` - BookingItem, BookingCart models
- Add nodes: `prepare_booking_cart`, `present_cart`

**Integration:** Add after budget approval

**Flow:** `budget_approval` → `prepare_cart` → `present_cart` → END

---

### Phase 3: Enhanced Features (Week 3)

#### 3.1 Transport Agent
- Google Maps Directions API integration
- Calculate travel times between activities
- Add to research subgraph

#### 3.2 Food Agent
- Google Places/Zomato API integration
- Find restaurants near activities
- Add meal suggestions to itinerary

#### 3.3 Dynamic Re-planning
```python
class PlanChange(BaseModel):
    type: str  # flight_delay, budget_change, activity_closed
    details: str
    affected_days: List[int]

async def replan_node(state: TravelAgentState, change: PlanChange) -> dict:
    """Adjust itinerary based on change event."""
```

---

### Phase 4: Visualization (Week 4)

#### 4.1 Map Generation
**Create `app/utils/map_generator.py`:**
```python
def generate_itinerary_map(itinerary: DayByDayItinerary) -> str:
    """Generate HTML map with markers (using folium)."""
```

#### 4.2 PDF Export
**Create `app/utils/pdf_generator.py`:**
```python
def generate_itinerary_pdf(itinerary: DayByDayItinerary) -> bytes:
    """Generate PDF (using ReportLab)."""
```

---

## Enhanced Graph Flow

### Proposed Architecture

```
User Query
    ↓
Extract Parameters → [Missing?] → END
    ↓ [Complete]
Research Subgraph (Parallel):
    ├─ Places Agent
    ├─ Weather Agent
    ├─ Flight Agent (NEW)
    ├─ Hotel Agent (NEW)
    ├─ Transport Agent (NEW)
    └─ Food Agent (NEW)
    ↓
Synthesizer → Present Plans → END
    ↓ [User Selects]
Finalize Plan
    ↓
Create Itinerary
    ↓
Budget Analysis (NEW) → Present Budget → END
    ↓ [User Approves]
Prepare Cart (NEW) → Present Cart → END
    ↓ [User Confirms]
Generate Outputs (NEW)
    ├─ Map
    └─ PDF
    ↓
END (Complete)
```

---

## Code Patterns

### Node Function Template
```python
async def node_name(state: TravelAgentState) -> dict:
    """Description."""
    log.info("Starting node", context)
    
    try:
        validate_preconditions(state)
        result = await invoke_agent_with_retry(agent, message)
        output = validate_output(result["structured_response"])
    except Exception as e:
        log.error(f"Failed: {e}")
        return {"errors": [str(e)]}
    
    log.info("Completed")
    return {"field": output}
```

### Agent Creation Template
```python
from langchain.agents import create_agent
from langchain_openai import ChatOpenAI

model = ChatOpenAI(
    model=settings.OPENAI_MODEL,
    temperature=0.2,
)

agent = create_agent(
    model=model,
    name="agent_name",
    system_prompt=prompt,
    tools=[tool] if needed else [],
    response_format=OutputModel
)
```

---

## Prioritization

| Task | Impact | Effort | Priority |
|------|--------|--------|----------|
| Error handling | High | Medium | 🔴 P0 |
| Validation | High | Low | 🔴 P0 |
| Flight agent | High | High | 🟡 P1 |
| Hotel agent | High | High | 🟡 P1 |
| Budget optimizer | High | Medium | 🟡 P1 |
| Booking coordinator | High | Medium | 🟡 P1 |
| Transport agent | Medium | Medium | 🟢 P2 |
| Food agent | Medium | Medium | 🟢 P2 |
| Map/PDF export | Medium | Low | 🟢 P2 |
| Re-planning | High | High | 🟢 P2 |

---

## Testing Strategy

### Test Structure
```
tests/
├── unit/          # Utilities, validators
├── integration/   # Agent + API tests
└── e2e/          # Full graph tests
```

### Run Tests
```bash
pytest tests/ -v
pytest tests/ --cov=app --cov-report=html
```

---

## Success Metrics

- ✅ Complete trip planning in < 2 minutes
- ✅ 90%+ bookings have valid links
- ✅ Budget accuracy ±10%
- ✅ 3+ approval checkpoints
- ✅ Test coverage > 80%
- ✅ API cost < $0.50 per plan

---

## Next Steps

1. **Week 1**: Error handling, validation, utilities
2. **Week 2**: Flight + hotel agents, budget optimizer, booking cart
3. **Week 3**: Transport, food, re-planning
4. **Week 4**: Maps, PDF, polish

**Start with:** Phase 1 Task 1.1 (Extract utilities)

---

