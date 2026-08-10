#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

user_problem_statement: "Add a Halloween seasonal theme (active only in October, hidden otherwise): a new Seasonal page between Workshops and Vouchers (nav + footer), spooky Seasonal page with flying bats, a preorder Halloween bouquet (Small £24.99 / Medium £54.99 / Large £74.99) buyable for any day in October via normal Stripe checkout, October workshop rows highlighted in purple on the Workshops page that link/scroll to the Seasonal page, a Halloween banner + bat button + popup on the Workshops page, and a 'Make it Halloween themed' tick box in the Shop that adds a note to the order (Stripe metadata)."

backend:
  - task: "Seed 3 Halloween bouquet products (fixed IDs, prices 24.99/54.99/74.99) via idempotent upsert"
    implemented: true
    working: true
    file: "backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "Added idempotent upsert in seed_data for halloween-bouquet-small/medium/large. Verified via curl that GET /api/products returns all 3 with correct prices."
        -working: true
        -agent: "testing"
        -comment: "PASSED: GET /api/products returns all 3 Halloween bouquets with exact fixed IDs (halloween-bouquet-small/medium/large) and correct prices (24.99/54.99/74.99). All have category='halloween' and in_stock=true. Idempotent upsert working correctly."
  - task: "Add special_notes field to CheckoutRequest and pass through to Stripe metadata + order doc"
    implemented: true
    working: true
    file: "backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "CheckoutRequest now has special_notes; create_checkout adds it to cart_metadata (Stripe) and stores in order_doc. Halloween bouquet items check out via existing /api/orders/checkout using DB price."
        -working: true
        -agent: "testing"
        -comment: "PASSED: POST /api/orders/checkout successfully creates Stripe checkout session with special_notes and delivery_date. Verified: (1) Returns 200 with Stripe URL and order_id, (2) Order document persists both special_notes and delivery_date fields, (3) Backend correctly validates and uses DB price (54.99) instead of client-sent price - security check passed. Regression tests also passed: GET /api/subscriptions/plans returns 3 plans, GET /api/vouchers/validate returns 404 for invalid codes."

frontend:
  - task: "Halloween theme (October auto-activation + ?spooky=1 preview), Seasonal page, bats, nav/footer link, Workshops banner/popup/October rows, Shop tick box"
    implemented: true
    working: "NA"
    file: "frontend/src/pages/SeasonalPage.jsx, frontend/src/components/Bats.jsx, frontend/src/lib/halloween.js, frontend/src/components/Navbar.jsx, frontend/src/components/Footer.jsx, frontend/src/pages/WorkshopsPage.jsx, frontend/src/pages/SubscriptionPage.jsx, frontend/src/pages/CartPage.jsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "Implemented. Verified visually via screenshots: Seasonal page spooky hero, nav/footer Seasonal link, Workshops banner + popup + flying bats + purple October rows. Frontend not yet tested by testing agent (awaiting user permission)."

metadata:
  created_by: "main_agent"
  version: "1.0"
  test_sequence: 1
  run_ui: false

test_plan:
  current_focus:
    - "Seed 3 Halloween bouquet products (fixed IDs, prices 24.99/54.99/74.99) via idempotent upsert"
    - "Add special_notes field to CheckoutRequest and pass through to Stripe metadata + order doc"
  stuck_tasks: []
  test_all: false
  test_priority: "high_first"

agent_communication:
    -agent: "main"
    -message: "Please test the backend only. 1) GET /api/products should include halloween-bouquet-small (24.99), halloween-bouquet-medium (54.99), halloween-bouquet-large (74.99). 2) POST /api/orders/checkout with items=[{product_id:'halloween-bouquet-medium', name:'Halloween Bouquet – Medium', price:54.99, quantity:1}], origin_url, delivery_date='2026-10-15', special_notes='Halloween: test note' should return a Stripe session url (200) and persist an order with special_notes. Also confirm existing checkout endpoints still work (regression). Do NOT test the frontend."
    -agent: "testing"
    -message: "PASS. All 3 Halloween products seeded with correct fixed IDs/prices (category=halloween, in_stock). /api/orders/checkout returns 200 with Stripe url + order_id, uses DB price 54.99 (ignores client price — price-manipulation safe), and persists special_notes + delivery_date. Regression OK: /api/subscriptions/plans returns 3 plans; invalid voucher validate returns 404 (not 500). Backend feature is fully functional."
    -agent: "testing"
    -message: "✅ Backend testing complete - ALL TESTS PASSED. Halloween feature implementation verified: (1) All 3 Halloween bouquets seeded with correct fixed IDs and prices, (2) Checkout endpoint successfully handles special_notes and delivery_date with proper persistence, (3) Backend validates product prices from DB (security verified), (4) Regression tests passed for subscriptions and vouchers. No issues found. Ready for main agent to summarize and finish."