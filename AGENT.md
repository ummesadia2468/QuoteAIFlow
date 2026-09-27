# QuoteFlow AI — AI Coding Agent Instructions

## 1. PROJECT IDENTITY

Project Name: QuoteFlow AI

Tagline:
"Turn client requirements into professional quotations in minutes."

Project Type:
Commercial MVP / SaaS-style web application

Primary Goal:
Build a small, polished, functional quotation-generation application for freelancers, agencies, developers, designers, consultants, and other service-based businesses.

Core workflow:

Client Requirements
→ Requirement Analysis
→ Editable Services
→ Pricing
→ Quote Preview
→ PDF Export
→ Quote Status Tracking

The application must feel like a real commercial product, not a classroom CRUD project.

---

# 2. IMPORTANT DEVELOPMENT RULE

You are an AI Coding Agent.

Do NOT immediately generate the entire application blindly.

Follow this development process:

SCAN
→ PLAN
→ SCAFFOLD
→ IMPLEMENT
→ TEST
→ FIX
→ VERIFY
→ POLISH

Before changing existing files:

1. Inspect the current project structure.
2. Understand existing code.
3. Reuse working components when possible.
4. Do not unnecessarily replace working code.
5. Check dependencies before adding new ones.

After every major feature:

1. Run the relevant checks.
2. Fix errors immediately.
3. Verify the feature manually.
4. Only then continue.

Never knowingly leave TypeScript, build, runtime, or console errors.

---

# 3. MVP SCOPE

The MVP MUST include:

### Public

* Landing page

### Application

* Dashboard
* Quotes list
* Create Quote
* Quote Details / Preview
* Client information
* Requirement input
* Requirement analysis
* Editable service items
* Pricing calculations
* Discount
* Tax
* Grand total
* Quote status
* Search
* Status filtering
* Professional quotation preview
* PDF/print functionality
* Responsive design

---

# 4. FEATURES THAT MUST NOT BE BUILT

Do NOT expand the project beyond MVP scope.

Do NOT implement:

* Payment gateway
* Subscription billing
* Real email delivery
* WhatsApp API
* Complex CRM
* Accounting system
* Multi-company enterprise architecture
* Team collaboration
* Real-time chat
* Complex analytics
* Social login
* Complex authentication
* External paid APIs
* Cryptocurrency
* Marketplace
* Mobile application
* Unnecessary admin panel

These can be mentioned as future roadmap items but must not be implemented in the MVP.

---

# 5. RECOMMENDED TECHNOLOGY

Use a modern, stable stack that is easy to deploy.

Preferred:

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router
* Lucide React
* LocalStorage for MVP persistence

For AI functionality:

Preferred architecture:

* Create an AI service abstraction.
* Keep AI logic separate from UI.
* The application must continue functioning if AI is unavailable.
* Provide deterministic/demo fallback requirement parsing.

If Ollama is available locally, it may be used through a backend service.

Do NOT expose secret API keys in frontend code.

Do NOT hardcode private API keys.

---

# 6. DATA STORAGE

For this MVP, use browser LocalStorage unless a backend is genuinely required.

Persist:

* Clients
* Quotes
* Quote items
* Quote status
* Quote number
* Dates
* Pricing information
* Company settings

The application must continue working after browser refresh.

Create a clean storage/service layer rather than accessing localStorage randomly throughout components.

---

# 7. QUOTE DATA MODEL

A quote should conceptually contain:

* id
* quoteNumber
* client
* projectTitle
* projectDescription
* services
* subtotal
* discount
* tax
* total
* currency
* timeline
* terms
* status
* createdAt
* updatedAt

Client:

* name
* company
* email
* phone
* address

Service item:

* id
* name
* description
* quantity
* unitPrice
* total

Allowed quote statuses:

* Draft
* Sent
* Accepted
* Rejected

Do not create unnecessary fields.

---

# 8. QUOTE NUMBERING

Generate readable quote numbers.

Example:

QF-2026-001
QF-2026-002
QF-2026-003

Quote numbers must be unique within the application.

Do not generate random unreadable identifiers for the user-facing quote number.

Internal IDs may use UUIDs.

---

# 9. REQUIREMENT ANALYSIS

The main AI feature is:

User enters natural-language project requirements.

Example:

"I need a modern website for my clothing brand with 6 pages, product catalog, WhatsApp button and basic SEO."

The system should convert this into structured requirements.

Example result:

Website Development
Quantity: 1

Website Pages
Quantity: 6

Product Catalog
Quantity: 1

WhatsApp Integration
Quantity: 1

Basic SEO
Quantity: 1

The result MUST be editable.

AI suggestions are never automatically considered final pricing.

The user must be able to:

* Add service
* Remove service
* Edit service name
* Edit quantity
* Edit price
* Edit description

---

# 10. AI SAFETY / RELIABILITY

Never present AI-generated information as guaranteed truth.

The AI should only assist with requirement structuring.

Do NOT allow the AI to:

* Automatically charge money
* Automatically send quotes
* Automatically change important business data
* Automatically finalize pricing
* Execute operating-system commands
* Access private files unnecessarily

AI output must be treated as a suggestion.

User confirmation is required before the quote is finalized.

If AI is unavailable:

Show a friendly message such as:

"Smart analysis is currently unavailable. You can add services manually."

The user must still be able to complete the quotation manually.

---

# 11. PRICING ENGINE

Pricing calculations must be deterministic and handled by application code.

Do NOT ask AI to calculate totals.

Formula:

itemTotal = quantity × unitPrice

subtotal = sum(itemTotal)

discountAmount = subtotal × discountPercentage / 100

taxableAmount = subtotal - discountAmount

taxAmount = taxableAmount × taxPercentage / 100

grandTotal = taxableAmount + taxAmount

Handle:

* Empty values
* Zero values
* Decimal prices
* Negative values
* Invalid input

Negative quantity and negative price must not be allowed.

Round displayed monetary values consistently.

---

# 12. CURRENCY

Default currency:

USD

Allow the architecture to support:

* USD
* PKR
* EUR
* GBP

Do not implement complex currency conversion.

Currency selection only changes the displayed currency symbol/code.

---

# 13. LANDING PAGE

Create a polished SaaS landing page.

Sections:

1. Navigation
2. Hero
3. Problem statement
4. How it works
5. Features
6. Example quotation preview
7. CTA
8. Footer

Hero:

Headline:

"Create Professional Quotes in Minutes"

Supporting text:

"Turn messy client requirements into polished, ready-to-send quotations."

Primary CTA:

"Create Your First Quote"

Secondary CTA:
"View Demo"

Avoid exaggerated claims.

---

# 14. APPLICATION DASHBOARD

Dashboard should show:

* Total Quotes
* Draft Quotes
* Sent Quotes
* Accepted Quotes
* Total Quoted Value

Also show:

* Recent quotes
* Quick Create Quote button
* Quote status indicators

Do not create meaningless analytics.

---

# 15. CREATE QUOTE FLOW

Create a clear multi-step or well-organized form.

Recommended flow:

STEP 1
Client Information

STEP 2
Project Requirements

STEP 3
Services & Pricing

STEP 4
Timeline & Terms

STEP 5
Review & Generate

The user should always understand where they are.

Allow moving backwards without losing entered information.

Validate required fields before moving forward.

---

# 16. CLIENT FORM

Required:

* Client name

Optional:

* Company
* Email
* Phone
* Address

Validate email format when an email is entered.

Do not block users unnecessarily.

---

# 17. REQUIREMENT INPUT

Provide a large textarea.

Placeholder:

"Describe what your client needs..."

Example:

"I need a 6-page website for my clothing business with a product catalog, WhatsApp integration and basic SEO."

Add:

"Analyze Requirements"

button.

While analyzing:

Show loading state.

Never freeze the interface.

---

# 18. SERVICES & PRICING UI

Each service should be displayed as an editable row/card.

Fields:

* Service
* Description
* Quantity
* Unit Price
* Total
* Delete

Provide:

"+ Add Service"

Pricing summary:

Subtotal
Discount
Tax
Grand Total

The total should update immediately when values change.

---

# 19. QUOTE PREVIEW

The preview must resemble a real professional business quotation.

Include:

* Company logo/name
* Company contact information
* QUOTE label
* Quote number
* Date
* Client information
* Project title
* Project description
* Services table
* Subtotal
* Discount
* Tax
* Grand Total
* Timeline
* Terms & conditions
* Footer

Use clean typography and strong visual hierarchy.

The quote should look professional when printed.

---

# 20. PDF / PRINT

Prioritize reliable browser printing.

Provide:

"Print / Save as PDF"

button.

The print output must:

* Hide application navigation
* Hide unnecessary UI
* Show only quotation content
* Use clean page margins
* Avoid broken table rows where possible

If a PDF library is added, verify it works in production before depending on it.

Do not introduce a heavy PDF system unnecessarily.

---

# 21. QUOTES PAGE

Display all saved quotations.

Columns:

* Quote
* Client
* Project
* Amount
* Status
* Date
* Actions

Actions:

* View
* Edit
* Duplicate
* Delete

Ask for confirmation before destructive deletion.

---

# 22. SEARCH & FILTER

Search by:

* Quote number
* Client name
* Company
* Project title

Filter by:

* All
* Draft
* Sent
* Accepted
* Rejected

Filtering should update immediately.

---

# 23. STATUS SYSTEM

Status colors should be visually distinct but accessible.

Status:

Draft
Sent
Accepted
Rejected

The user can update status from quote details.

Do not create complicated workflow automation.

---

# 24. DUPLICATE QUOTE

Allow users to duplicate an existing quote.

When duplicated:

* Generate a new quote ID.
* Generate a new quote number.
* Set status to Draft.
* Set current date.
* Preserve client and service information.

---

# 25. EMPTY STATES

Every major page needs a useful empty state.

Example:

"No quotes yet."

Supporting text:

"Create your first professional quotation to get started."

CTA:

"Create Quote"

Never leave blank screens.

---

# 26. ERROR HANDLING

Every user-facing action must have proper error handling.

Do not show raw JavaScript errors to users.

Use friendly messages.

Examples:

"Please enter a client name."

"Please add at least one service."

"Something went wrong while analyzing the requirements."

"Your quote could not be saved. Please try again."

---

# 27. LOADING STATES

Every asynchronous operation must have a loading state.

Examples:

* Analyze Requirements
* Save Quote
* Generate Preview
* Export/Print

Prevent duplicate submissions.

Disable relevant buttons while processing.

---

# 28. RESPONSIVE DESIGN

The application must work on:

* Desktop
* Laptop
* Tablet
* Mobile

Desktop is the primary target.

Do not allow horizontal scrolling.

Forms should stack cleanly on small screens.

Tables should become responsive cards or horizontally scroll only when necessary.

---

# 29. ACCESSIBILITY

Use:

* Semantic HTML
* Labels for inputs
* Keyboard-accessible buttons
* Visible focus states
* Sufficient contrast
* Accessible dialogs
* Descriptive button text

Do not rely only on color to communicate status.

---

# 30. DESIGN SYSTEM

Visual direction:

Modern SaaS
Premium
Clean
Professional
Minimal

Avoid:

* Excessive gradients
* Excessive animations
* Giant decorative graphics
* Cluttered dashboards
* Too many colors
* Glassmorphism everywhere

Use:

* Consistent spacing
* Rounded cards
* Subtle borders
* Clear typography
* Strong hierarchy
* Small purposeful animations

---

# 31. COLOR DIRECTION

Primary:

Deep navy / dark blue

Accent:

Professional blue or indigo

Background:

Very light neutral

Text:

Dark neutral

Success:
Accessible green

Warning:
Accessible amber

Danger:
Accessible red

Do not use excessive colors.

---

# 32. NAVIGATION

Application sidebar:

QuoteFlow AI

* Dashboard
* Quotes
* Clients
* Settings

Primary action:

* Create Quote

On mobile:

Use a responsive navigation pattern.

---

# 33. SETTINGS

Keep settings minimal.

Allow:

* Business name
* Business email
* Business phone
* Business address
* Website
* Default currency
* Default tax
* Default terms

Save settings locally.

These settings should appear automatically in generated quotations.

---

# 34. DEMO DATA

Provide optional demo data so the application looks populated during demonstration.

Example clients:

Urban Threads
Nova Digital
GreenLeaf Café

Example quotes:

QF-2026-001
QF-2026-002
QF-2026-003

Do not force demo data if the user chooses to start empty.

Provide a clear way to reset demo data.

---

# 35. SECURITY

Never:

* Store API secrets in frontend source code.
* Commit `.env` files containing secrets.
* Expose private keys.
* Execute arbitrary AI-generated shell commands.
* Trust AI output as executable code.

Add `.env.example` if environment variables are required.

---

# 36. PROJECT STRUCTURE

Prefer a clean structure similar to:

src/
components/
pages/
layouts/
services/
hooks/
utils/
types/
data/
lib/
styles/

Keep components focused.

Avoid giant files.

If a component becomes difficult to understand, split it.

---

# 37. CODE QUALITY

Use TypeScript properly.

Avoid:

* `any` unless absolutely necessary
* duplicated business logic
* duplicated components
* inline complex calculations
* magic numbers
* unused imports
* unused variables
* dead code
* console errors
* unnecessary dependencies

Use reusable functions for:

* Currency formatting
* Quote calculations
* Quote numbering
* Storage
* Validation

---

# 38. VALIDATION

Before considering the MVP complete, test:

### Landing Page

* Navigation works
* CTA works
* Responsive layout works

### Create Quote

* Required fields validate
* Client data saves
* Requirements save
* AI analysis works or fallback works
* Services can be added
* Services can be edited
* Services can be deleted
* Pricing updates correctly

### Quote

* Quote saves
* Quote number is generated
* Quote appears in dashboard
* Quote can be edited
* Quote can be duplicated
* Quote can be deleted
* Status can change

### PDF/Print

* Preview looks correct
* Print layout is clean
* Navigation does not appear in print

### Persistence

* Refresh browser
* Data remains available

### Responsive

Test desktop and mobile layouts.

---

# 39. TESTING REQUIREMENT

Before declaring the project finished:

Run:

1. TypeScript check
2. Production build
3. Linting if configured
