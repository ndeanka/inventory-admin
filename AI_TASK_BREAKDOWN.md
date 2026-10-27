# AI Task Breakdown - Execution Checklist

This document provides atomic, executable tasks for AI-driven development. Each task is self-contained and can be completed independently.

---

## SPRINT 1: Foundation Setup (Est. 8-10 hours)

### Task 1.1: ESLint & Prettier Setup
**Dependencies:** None  
**Verification:** Run `npm run lint` successfully

```bash
# Steps
1. npm install -D eslint @angular-eslint/builder @angular-eslint/eslint-plugin @angular-eslint/eslint-plugin-template @angular-eslint/schematics @angular-eslint/template-parser @typescript-eslint/eslint-plugin @typescript-eslint/parser prettier eslint-config-prettier eslint-plugin-prettier
2. Create .eslintrc.json with strict rules
3. Create .prettierrc with standard config
4. Add lint scripts to package.json
5. Run eslint and fix all issues
6. Update CI workflow to include linting
```

**Files:**
- `.eslintrc.json`
- `.prettierrc`
- `package.json`
- `.github/workflows/ci.yml`

---

### Task 1.2: Reorganize Project Structure
**Dependencies:** None  
**Verification:** App builds and runs

```bash
# Steps
1. Create folder structure:
   - src/app/core/interceptors/
   - src/app/core/services/
   - src/app/shared/components/
   - src/app/shared/utils/
2. Move basic-auth.interceptor.ts to core/interceptors/
3. Update all imports
4. Test build: npm run build
5. Test serve: npm start
```

**Files to Move/Create:**
- `src/app/core/interceptors/basic-auth.interceptor.ts`
- Update `src/app/app.config.ts` import

---

### Task 1.3: Add Error Handling Infrastructure
**Dependencies:** Task 1.2  
**Verification:** Error handling works for API failures

**Create:**
1. `src/app/core/services/notification.service.ts`
2. `src/app/core/interceptors/error.interceptor.ts`
3. `src/app/shared/components/notification.component.ts`

**Implementation:**
```typescript
// notification.service.ts - Signal-based notification service
// error.interceptor.ts - Global HTTP error handler
// notification.component.ts - Toast notification UI
```

**Update:**
- `src/app/app.config.ts` - Add error interceptor
- `src/app/app.component.ts` - Add notification component

---

### Task 1.4: Unit Tests for ItemApiService
**Dependencies:** None  
**Verification:** Tests pass with `ng test`

**Create:** `src/app/items/item-api.service.spec.ts`

**Test Cases:**
- ✓ should be created
- ✓ list() should return array of items
- ✓ list() should handle HTTP errors
- ✓ create() should post item and return created item
- ✓ create() should handle validation errors

---

### Task 1.5: Unit Tests for ItemsPageComponent
**Dependencies:** Task 1.4  
**Verification:** Tests pass with `ng test`

**Create:** `src/app/items/items-page.component.spec.ts`

**Test Cases:**
- ✓ should create component
- ✓ should load items on init
- ✓ should display error when API fails
- ✓ should validate form before submit
- ✓ should add new item to list on successful create
- ✓ should reset form after successful submit

---

### Task 1.6: Update CI Pipeline
**Dependencies:** Task 1.1, 1.4, 1.5  
**Verification:** CI passes on push

**Update:** `.github/workflows/ci.yml`

Add:
- Linting step
- Test execution step
- Code coverage report (optional)

---

## SPRINT 2: Complete CRUD Operations (Est. 6-8 hours)

### Task 2.1: Implement Update/Edit API
**Dependencies:** None  
**Verification:** Manual API test with curl/Postman

**Update:** `src/app/items/item-api.service.ts`

Add method:
```typescript
update(id: string, payload: CreateInventoryItem): Observable<InventoryItem> {
  return this.http.put<InventoryItem>(`${this.base}/${id}`, payload);
}
```

**Test:** Add unit test for update method

---

### Task 2.2: Implement Delete API
**Dependencies:** None  
**Verification:** Manual API test

**Update:** `src/app/items/item-api.service.ts`

Add method:
```typescript
delete(id: string): Observable<void> {
  return this.http.delete<void>(`${this.base}/${id}`);
}
```

**Test:** Add unit test for delete method

---

### Task 2.3: Add Edit UI to Items List
**Dependencies:** Task 2.1  
**Verification:** Can edit item inline or in modal

**Update:**
- `src/app/items/items-page.component.ts`
  - Add `editingId` signal
  - Add `editForm` FormGroup
  - Add `startEdit(item)` method
  - Add `saveEdit()` method
  - Add `cancelEdit()` method
  
- `src/app/items/items-page.component.html`
  - Add edit button to each row
  - Add inline edit mode OR modal
  - Add save/cancel buttons

**Style:** Update `items-page.component.scss`

---

### Task 2.4: Add Delete Confirmation Dialog
**Dependencies:** Task 2.2  
**Verification:** Can delete item with confirmation

**Create:** `src/app/shared/components/confirm-dialog.component.ts`

**Update:**
- `src/app/items/items-page.component.ts`
  - Add `showDeleteConfirm` signal
  - Add `itemToDelete` signal
  - Add `confirmDelete()` method
  - Add `deleteItem(id)` method

- `src/app/items/items-page.component.html`
  - Add delete button to each row
  - Add confirmation dialog

---

### Task 2.5: Add Optimistic Updates
**Dependencies:** Task 2.3, 2.4  
**Verification:** UI updates immediately, rolls back on error

**Update:** `src/app/items/items-page.component.ts`
- Update signals immediately
- Rollback on error
- Show notification on success/error

---

### Task 2.6: Unit Tests for CRUD Operations
**Dependencies:** Task 2.1-2.5  
**Verification:** All tests pass

**Update:** `src/app/items/items-page.component.spec.ts`

Add tests:
- ✓ should edit item
- ✓ should cancel edit
- ✓ should delete item with confirmation
- ✓ should rollback on failed update

---

## SPRINT 3: Search & Filter (Est. 4-6 hours)

### Task 3.1: Implement Client-Side Search
**Dependencies:** None  
**Verification:** Search filters items in real-time

**Update:** `src/app/items/items-page.component.ts`

Add:
- `searchQuery` signal
- `filteredItems` computed signal with search logic
- Debounce search input (300ms)

**Update:** `src/app/items/items-page.component.html`
- Add search input at top of table
- Bind to searchQuery signal
- Use filteredItems() in @for loop

---

### Task 3.2: Add Sort Functionality
**Dependencies:** None  
**Verification:** Can sort by each column

**Update:** `src/app/items/items-page.component.ts`

Add:
- `sortColumn` signal<keyof InventoryItem | null>
- `sortDirection` signal<'asc' | 'desc'>
- `sortedItems` computed signal
- `toggleSort(column)` method

**Update:** `src/app/items/items-page.component.html`
- Make table headers clickable
- Add sort indicators (↑↓)

---

### Task 3.3: Add Advanced Filters
**Dependencies:** Task 3.1  
**Verification:** Filters work in combination

**Create:** `src/app/items/components/filter-panel.component.ts`

Filters:
- Price range (min/max)
- Quantity range (min/max)
- In stock / Low stock / Out of stock

**Update:** `filteredItems` computed to include all filters

---

### Task 3.4: Filter Utility Functions
**Dependencies:** Task 3.1, 3.2, 3.3  
**Verification:** Filters are reusable

**Create:** `src/app/items/utils/item-filters.ts`

Export functions:
- `filterBySearch(items, query)`
- `filterByPriceRange(items, min, max)`
- `sortItems(items, column, direction)`

---

## SPRINT 4: Pagination (Est. 3-4 hours)

### Task 4.1: Create Pagination Component
**Dependencies:** None  
**Verification:** Component renders and emits events

**Create:** `src/app/shared/components/pagination.component.ts`

Inputs:
- `totalItems: number`
- `pageSize: number`
- `currentPage: number`

Outputs:
- `pageChange: EventEmitter<number>`
- `pageSizeChange: EventEmitter<number>`

---

### Task 4.2: Integrate Pagination
**Dependencies:** Task 4.1  
**Verification:** Items paginate correctly

**Update:** `src/app/items/items-page.component.ts`

Add:
- `currentPage` signal
- `pageSize` signal
- `paginatedItems` computed signal
- `totalPages` computed signal

**Update:** `src/app/items/items-page.component.html`
- Add pagination component below table

---

### Task 4.3: Persist Pagination in URL
**Dependencies:** Task 4.2  
**Verification:** Page refresh maintains pagination state

Use `Router` and `ActivatedRoute` to:
- Read query params on init
- Update query params on change

---

## SPRINT 5: Authentication (Est. 8-10 hours)

### Task 5.1: Create Auth Service
**Dependencies:** None  
**Verification:** Service methods work

**Create:** `src/app/auth/auth.service.ts`

Methods:
- `login(username, password): Observable<AuthResponse>`
- `logout(): void`
- `isAuthenticated(): Signal<boolean>`
- `getToken(): string | null`
- `refreshToken(): Observable<AuthResponse>`

Store token in localStorage or sessionStorage

---

### Task 5.2: Create Login Page
**Dependencies:** Task 5.1  
**Verification:** Can log in successfully

**Create:** `src/app/auth/login.component.ts`

Features:
- Login form (username, password)
- Remember me checkbox
- Error display
- Loading state

**Update:** `src/app/app.routes.ts`
- Add login route

---

### Task 5.3: Create Auth Guard
**Dependencies:** Task 5.1  
**Verification:** Unauthenticated users redirect to login

**Create:** `src/app/auth/auth.guard.ts`

Implement:
- Check authentication status
- Redirect to login if not authenticated
- Store return URL

---

### Task 5.4: Update HTTP Interceptor for JWT
**Dependencies:** Task 5.1  
**Verification:** API calls include JWT token

**Update:** `src/app/core/interceptors/basic-auth.interceptor.ts`
- Rename to `auth.interceptor.ts`
- Use JWT Bearer token instead of Basic Auth
- Add token refresh logic on 401

---

### Task 5.5: Add Logout Functionality
**Dependencies:** Task 5.1, 5.2  
**Verification:** User can log out

**Update:** `src/app/app.component.ts`
- Add logout button in header
- Call auth.service.logout()
- Navigate to login page

---

### Task 5.6: Handle Token Expiration
**Dependencies:** Task 5.4  
**Verification:** Token refreshes automatically

**Update:** `src/app/core/interceptors/auth.interceptor.ts`
- Check token expiration
- Refresh token before expiry
- Handle refresh failures

---

## SPRINT 6: UI/UX Polish (Est. 6-8 hours)

### Task 6.1: Create Loading Skeleton
**Dependencies:** None  
**Verification:** Skeleton shows while loading

**Create:** `src/app/shared/components/skeleton-loader.component.ts`

Types:
- Table row skeleton
- Card skeleton
- Text skeleton

**Update:** `items-page.component.html`
- Show skeleton when loading() is true

---

### Task 6.2: Add Form Validation Feedback
**Dependencies:** None  
**Verification:** Validation errors display inline

**Update:** `src/app/items/items-page.component.html`

Add:
- Error messages below each input
- Show errors only when touched and invalid
- Add success state styles

**Update:** `styles.scss`
- Add error/success styles

---

### Task 6.3: Improve Mobile Responsiveness
**Dependencies:** None  
**Verification:** Works on mobile devices

**Update:** `src/app/items/items-page.component.scss`

Add:
- Mobile-first media queries
- Card layout for items on mobile
- Sticky header
- Touch-friendly buttons (min 44px)

---

### Task 6.4: Add Loading Animations
**Dependencies:** None  
**Verification:** Smooth transitions

**Create:** `src/app/shared/animations.ts`

Animations:
- Fade in
- Slide in/out
- List stagger

**Update:** Components to use animations

---

### Task 6.5: Accessibility Improvements
**Dependencies:** None  
**Verification:** Screen reader friendly, keyboard navigable

Updates:
- Add ARIA labels to all interactive elements
- Add focus management
- Add skip links
- Test with keyboard only
- Test with screen reader

---

## SPRINT 7: Performance & Build (Est. 4-6 hours)

### Task 7.1: Add Virtual Scrolling
**Dependencies:** None  
**Verification:** Large lists scroll smoothly

**Update:** `src/app/items/items-page.component.ts`
- Import `@angular/cdk/scrolling`
- Use `cdk-virtual-scroll-viewport`

---

### Task 7.2: Implement Service Worker
**Dependencies:** None  
**Verification:** App works offline

```bash
ng add @angular/pwa
```

Configure caching strategy in `ngsw-config.json`

---

### Task 7.3: Bundle Size Optimization
**Dependencies:** None  
**Verification:** Bundle size < 500KB

Steps:
1. Analyze bundle: `npm run build -- --stats-json`
2. Use webpack-bundle-analyzer
3. Identify large dependencies
4. Lazy load heavy modules
5. Use tree-shaking

---

### Task 7.4: Add Build Configurations
**Dependencies:** None  
**Verification:** Can build for dev/staging/prod

**Update:** `angular.json`

Add configurations:
- development
- staging  
- production

---

## SPRINT 8: Deployment (Est. 4-6 hours)

### Task 8.1: Create Dockerfile
**Dependencies:** None  
**Verification:** Docker image builds and runs

**Create:** `Dockerfile`

Multi-stage build:
1. Build stage (node:22)
2. Runtime stage (nginx:alpine)

---

### Task 8.2: Create Docker Compose
**Dependencies:** Task 8.1  
**Verification:** Full stack runs with docker-compose

**Create:** `docker-compose.yml`

Services:
- inventory-admin (this app)
- inventory-api (backend)

---

### Task 8.3: Add Deployment Workflow
**Dependencies:** Task 8.1  
**Verification:** GitHub Actions deploys automatically

**Create:** `.github/workflows/deploy.yml`

Stages:
- Build
- Test
- Build Docker image
- Push to registry
- Deploy to environment

---

### Task 8.4: Environment Configuration
**Dependencies:** None  
**Verification:** Can switch environments easily

**Create:**
- `src/environments/environment.staging.ts`
- `src/assets/config.json` for runtime config

Add script to load runtime config on app init

---

## SPRINT 9: Monitoring & Documentation (Est. 4-6 hours)

### Task 9.1: Add Error Tracking
**Dependencies:** None  
**Verification:** Errors logged to Sentry

1. Create Sentry account
2. Install @sentry/angular
3. Configure in app.config.ts
4. Test error reporting

---

### Task 9.2: Add Analytics
**Dependencies:** None  
**Verification:** Events tracked

Create `src/app/core/services/analytics.service.ts`

Track:
- Page views
- User actions
- Errors

---

### Task 9.3: Write Comprehensive README
**Dependencies:** None  
**Verification:** New developer can set up locally

**Update:** `README.md`

Sections:
- Prerequisites
- Installation
- Configuration
- Development
- Testing
- Deployment
- Architecture
- Contributing

---

### Task 9.4: Create Architecture Documentation
**Dependencies:** None  
**Verification:** Architecture is clear

**Create:** `docs/ARCHITECTURE.md`

Cover:
- Folder structure
- State management
- Data flow
- Component hierarchy
- API integration

---

### Task 9.5: Add JSDoc Comments
**Dependencies:** None  
**Verification:** All public APIs documented

Add JSDoc to:
- All services
- All public methods
- Complex utility functions

---

## Quick Reference: Commands

```bash
# Development
npm start                 # Start dev server
npm run build             # Production build
npm test                  # Run tests
npm run lint              # Lint code
npm run format            # Format code

# Docker
docker build -t inventory-admin .
docker-compose up -d

# Testing
ng test                   # Unit tests
ng test --code-coverage   # With coverage
ng e2e                    # E2E tests

# Code Quality
npm run lint              # ESLint
npm run format:check      # Prettier check
npm run format:write      # Prettier fix
```

---

## Completion Criteria

Each task is complete when:
1. ✅ Code is written and tested
2. ✅ Unit tests pass (if applicable)
3. ✅ Linter passes with no errors
4. ✅ Build succeeds
5. ✅ Manual testing completed
6. ✅ Code reviewed (if team)
7. ✅ Committed with descriptive message
8. ✅ Documentation updated

---

## Notes for AI

- Always verify the previous task completed successfully before starting next
- Run `npm run build` after each significant change
- Run `npm test` after adding/modifying tests
- Commit after each completed task
- If a task fails, fix issues before proceeding
- Keep changes atomic and focused
- Update this document if tasks change
