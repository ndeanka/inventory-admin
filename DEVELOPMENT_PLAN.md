# Inventory Admin - AI Development Plan

## Project Overview

**Current State:** Angular 19 standalone admin UI for inventory management
- **Stack:** Angular 19, Standalone Components, Signals, OnPush, TypeScript
- **Features:** List items, Create items, Basic error handling
- **Architecture:** Feature-based (items folder), Thin shell
- **API Integration:** HTTP Basic Auth, REST endpoints

---

## Phase 1: Foundation & Code Quality

### 1.1 Testing Infrastructure
**Priority:** HIGH | **Effort:** Medium

- [ ] Set up Jasmine/Karma test suite
- [ ] Add unit tests for `ItemApiService`
  - Test `list()` method with mock data
  - Test `create()` method with success/error scenarios
  - Test HTTP interceptor behavior
- [ ] Add unit tests for `ItemsPageComponent`
  - Test form validation logic
  - Test loading/error/success states
  - Test signal updates
  - Test form submission flow
- [ ] Add e2e tests with Playwright or Cypress
  - Test full create item flow
  - Test error handling when API is down
  - Test form validation behavior
- [ ] Update CI workflow to run tests
- [ ] Add code coverage reporting (minimum 80%)

**Files to Create:**
- `src/app/items/item-api.service.spec.ts`
- `src/app/items/items-page.component.spec.ts`
- `src/app/items/basic-auth.interceptor.spec.ts`
- `e2e/` folder with test specs

### 1.2 Linting & Code Standards
**Priority:** HIGH | **Effort:** Low

- [ ] Install ESLint with Angular plugin
- [ ] Configure Prettier for consistent formatting
- [ ] Add `.eslintrc.json` with strict rules
  - No `any` types
  - Enforce OnPush change detection
  - Require explicit return types
- [ ] Add pre-commit hooks with Husky
- [ ] Add lint-staged for staged files
- [ ] Update CI to run linting
- [ ] Run linter and fix all issues

**Files to Create:**
- `.eslintrc.json`
- `.prettierrc`
- `.husky/pre-commit`
- `.lintstagedrc.json`

### 1.3 Error Handling Enhancement
**Priority:** HIGH | **Effort:** Low

- [ ] Create global error handler service
- [ ] Add HTTP error interceptor for consistent error handling
- [ ] Implement toast/notification service for user feedback
- [ ] Add retry logic for failed API calls (with exponential backoff)
- [ ] Add loading indicators at appropriate levels
- [ ] Add network status detection

**Files to Create/Modify:**
- `src/app/core/services/error-handler.service.ts`
- `src/app/core/interceptors/error.interceptor.ts`
- `src/app/core/services/notification.service.ts`
- Modify `item-api.service.ts` to use new error handling

---

## Phase 2: Feature Enhancements

### 2.1 CRUD Operations Completion
**Priority:** HIGH | **Effort:** Medium

- [ ] Implement **Update/Edit** functionality
  - Add edit button to each table row
  - Create inline edit mode OR modal dialog
  - Implement `update()` method in service
  - Add validation for edit form
- [ ] Implement **Delete** functionality
  - Add delete button with confirmation dialog
  - Implement `delete()` method in service
  - Add optimistic UI update
- [ ] Implement **Detail View**
  - Add detail page or expandable rows
  - Show full item information including timestamps
  - Add navigation to/from detail view

**Files to Create/Modify:**
- Modify `item-api.service.ts` (add update/delete methods)
- Modify `items-page.component.ts` (add edit/delete handlers)
- Modify `items-page.component.html` (add edit/delete UI)
- Create `src/app/items/components/item-detail.component.ts` (optional)
- Create `src/app/items/components/delete-confirm-dialog.component.ts`

### 2.2 Search & Filtering
**Priority:** MEDIUM | **Effort:** Medium

- [ ] Add search input for filtering items
  - Search by SKU, Name
  - Implement client-side filtering with signals
  - Add debouncing for performance
- [ ] Add sort functionality
  - Sort by SKU, Name, Quantity, Price
  - Ascending/Descending toggle
  - Persist sort preference
- [ ] Add filters
  - Filter by price range
  - Filter by quantity (in stock, low stock, out of stock)
  - Filter combination support

**Files to Create/Modify:**
- Create `src/app/items/components/search-filter.component.ts`
- Create `src/app/items/utils/filter.utils.ts`
- Modify `items-page.component.ts` to integrate filtering

### 2.3 Pagination
**Priority:** MEDIUM | **Effort:** Medium

- [ ] Implement client-side pagination
  - Add pagination controls
  - Configurable page size (10, 25, 50, 100)
  - Page number display
  - First/Last/Next/Previous buttons
- [ ] Add "Load More" option as alternative
- [ ] Persist pagination state in URL query params

**Files to Create:**
- `src/app/shared/components/pagination.component.ts`
- Modify `items-page.component.ts`

### 2.4 Bulk Operations
**Priority:** LOW | **Effort:** High

- [ ] Add row selection (checkboxes)
- [ ] Implement "Select All" functionality
- [ ] Add bulk delete operation
- [ ] Add bulk export (CSV/JSON)
- [ ] Add bulk update (e.g., adjust prices by percentage)

**Files to Create:**
- `src/app/items/components/bulk-actions.component.ts`
- `src/app/items/services/export.service.ts`

---

## Phase 3: UI/UX Improvements

### 3.1 Responsive Design Enhancement
**Priority:** MEDIUM | **Effort:** Medium

- [ ] Optimize mobile layout
  - Stack form and table on small screens
  - Card view for items on mobile
  - Touch-friendly buttons and controls
- [ ] Add responsive table (horizontal scroll or card view)
- [ ] Test on various screen sizes
- [ ] Add viewport meta tags

**Files to Modify:**
- `items-page.component.scss`
- `styles.scss`

### 3.2 Accessibility (A11y)
**Priority:** HIGH | **Effort:** Medium

- [ ] Add proper ARIA labels
- [ ] Ensure keyboard navigation works
- [ ] Add focus indicators
- [ ] Test with screen readers
- [ ] Add skip navigation links
- [ ] Ensure color contrast meets WCAG AA standards
- [ ] Add loading announcements for screen readers

**Files to Modify:**
- All component templates
- Add `src/app/core/directives/a11y.directive.ts`

### 3.3 Enhanced Visuals
**Priority:** LOW | **Effort:** Medium

- [ ] Add loading skeletons instead of "Loading…" text
- [ ] Add animations for list updates
  - Fade in new items
  - Slide out deleted items
- [ ] Improve form validation feedback
  - Show validation errors inline
  - Add success states
- [ ] Add empty state illustrations
- [ ] Consider dark mode support

**Files to Create:**
- `src/app/shared/components/skeleton-loader.component.ts`
- Animation utilities
- Update styles

---

## Phase 4: Architecture & Performance

### 4.1 State Management
**Priority:** MEDIUM | **Effort:** High

- [ ] Implement centralized state management
  - Option A: NgRx SignalStore (lightweight, modern)
  - Option B: Custom Signal-based store
- [ ] Move items state to store
- [ ] Add derived/computed signals
- [ ] Implement undo/redo functionality (optional)

**Files to Create:**
- `src/app/items/store/items.store.ts`
- `src/app/items/store/items.actions.ts` (if NgRx)
- `src/app/items/store/items.selectors.ts` (if NgRx)

### 4.2 Performance Optimization
**Priority:** MEDIUM | **Effort:** Medium

- [ ] Implement virtual scrolling for large lists
- [ ] Add trackBy functions for *ngFor (already using track in @for)
- [ ] Lazy load routes
- [ ] Optimize bundle size
  - Analyze with webpack-bundle-analyzer
  - Tree-shake unused code
  - Lazy load heavy dependencies
- [ ] Add service worker for offline support
- [ ] Implement caching strategy

**Files to Modify:**
- Update `items-page.component.ts` for virtual scroll
- Add `angular.json` optimization config
- Create `ngsw-config.json` for service worker

### 4.3 Code Organization
**Priority:** MEDIUM | **Effort:** Medium

- [ ] Create shared module structure
  - `src/app/shared/components/`
  - `src/app/shared/directives/`
  - `src/app/shared/pipes/`
  - `src/app/shared/utils/`
- [ ] Create core module structure
  - `src/app/core/services/`
  - `src/app/core/interceptors/`
  - `src/app/core/guards/`
- [ ] Extract reusable components
  - Button component
  - Input component
  - Form field component
- [ ] Add barrel exports (index.ts files)

**Files to Create:**
- Folder structure as listed above
- Component library foundation

---

## Phase 5: Advanced Features

### 5.1 Authentication & Authorization
**Priority:** HIGH | **Effort:** High

- [ ] Implement proper login flow
  - Login page component
  - Token-based auth (JWT)
  - Store tokens securely
- [ ] Add auth guard for protected routes
- [ ] Add role-based access control
  - Admin: full access
  - Editor: create/edit
  - Viewer: read-only
- [ ] Add logout functionality
- [ ] Add token refresh mechanism
- [ ] Handle 401/403 responses globally

**Files to Create:**
- `src/app/auth/login.component.ts`
- `src/app/auth/auth.service.ts`
- `src/app/auth/auth.guard.ts`
- `src/app/core/interceptors/auth.interceptor.ts`
- Update routes with guards

### 5.2 Multi-tenancy / Workspaces
**Priority:** LOW | **Effort:** High

- [ ] Add workspace/organization concept
- [ ] Add workspace switcher
- [ ] Scope API calls to workspace
- [ ] Add workspace management page

**Files to Create:**
- `src/app/workspaces/` feature folder
- Workspace service and components

### 5.3 Import/Export
**Priority:** MEDIUM | **Effort:** Medium

- [ ] Add CSV import functionality
  - File upload component
  - CSV parsing
  - Validation before import
  - Show preview
- [ ] Add Excel import support
- [ ] Add CSV/Excel export
- [ ] Add JSON export/import

**Files to Create:**
- `src/app/items/components/import-dialog.component.ts`
- `src/app/items/services/import-export.service.ts`
- `src/app/shared/utils/csv-parser.ts`

### 5.4 Activity Log / Audit Trail
**Priority:** LOW | **Effort:** High

- [ ] Track all CRUD operations
- [ ] Display activity log
- [ ] Add filtering by date, user, action
- [ ] Add export capability

**Files to Create:**
- `src/app/activity/` feature folder
- Activity log service and components

---

## Phase 6: DevOps & Deployment

### 6.1 Environment Configuration
**Priority:** HIGH | **Effort:** Low

- [ ] Add development environment
- [ ] Add staging environment
- [ ] Add production environment
- [ ] Use Angular environment files properly
- [ ] Add runtime configuration (config.json)
- [ ] Document environment setup

**Files to Modify:**
- `src/environments/environment.ts`
- `src/environments/environment.staging.ts`
- `src/environments/environment.prod.ts`
- `angular.json` build configurations

### 6.2 CI/CD Pipeline Enhancement
**Priority:** HIGH | **Effort:** Medium

- [ ] Add test execution to CI
- [ ] Add linting to CI
- [ ] Add build verification
- [ ] Add deployment automation
  - Deploy to staging on PR merge
  - Deploy to production on tag
- [ ] Add Docker support
  - Create Dockerfile
  - Create docker-compose.yml
  - Optimize image size
- [ ] Add GitHub Actions deployment workflow

**Files to Create:**
- `Dockerfile`
- `docker-compose.yml`
- `.dockerignore`
- `.github/workflows/deploy.yml`

### 6.3 Monitoring & Analytics
**Priority:** MEDIUM | **Effort:** Medium

- [ ] Add error tracking (Sentry)
- [ ] Add analytics (Google Analytics or Plausible)
- [ ] Add performance monitoring
- [ ] Add custom event tracking
- [ ] Create dashboard for metrics

**Files to Create:**
- `src/app/core/services/analytics.service.ts`
- `src/app/core/services/error-tracking.service.ts`

---

## Phase 7: Documentation & Developer Experience

### 7.1 Documentation
**Priority:** HIGH | **Effort:** Medium

- [ ] Create comprehensive README
  - Setup instructions
  - Architecture overview
  - Development workflow
  - Deployment guide
- [ ] Add JSDoc comments to all public APIs
- [ ] Create CONTRIBUTING.md
- [ ] Create API documentation
- [ ] Add Storybook for component library
- [ ] Create user guide

**Files to Create:**
- `docs/` folder
- `CONTRIBUTING.md`
- `docs/ARCHITECTURE.md`
- `docs/API.md`
- `.storybook/` configuration

### 7.2 Developer Tools
**Priority:** MEDIUM | **Effort:** Low

- [ ] Add VS Code recommended extensions
- [ ] Add debug configurations
- [ ] Add code snippets
- [ ] Add workspace settings
- [ ] Document common tasks in npm scripts

**Files to Create:**
- `.vscode/extensions.json`
- `.vscode/launch.json`
- `.vscode/settings.json`
- `.vscode/snippets.code-snippets`

---

## Implementation Priority Matrix

### Critical Path (Do First)
1. Testing Infrastructure (1.1)
2. Linting & Code Standards (1.2)
3. Error Handling Enhancement (1.3)
4. CRUD Operations Completion (2.1)
5. Authentication & Authorization (5.1)
6. Environment Configuration (6.1)

### High Priority (Do Soon)
1. Search & Filtering (2.2)
2. Pagination (2.3)
3. Responsive Design Enhancement (3.1)
4. Accessibility (3.2)
5. CI/CD Pipeline Enhancement (6.2)
6. Documentation (7.1)

### Medium Priority (Do Later)
1. State Management (4.1)
2. Performance Optimization (4.2)
3. Code Organization (4.3)
4. Import/Export (5.3)
5. Monitoring & Analytics (6.3)
6. Developer Tools (7.2)

### Low Priority (Nice to Have)
1. Enhanced Visuals (3.3)
2. Bulk Operations (2.4)
3. Multi-tenancy (5.2)
4. Activity Log (5.4)

---

## Technical Debt to Address

1. **Move basic-auth.interceptor to core/interceptors/**
2. **Create proper folder structure (core, shared, features)**
3. **Add proper TypeScript strict mode configuration**
4. **Add API response type validation (consider Zod)**
5. **Add proper logging service**
6. **Consider adding API versioning support**
7. **Add request caching for GET endpoints**
8. **Add optimistic UI updates for better UX**

---

## Success Metrics

- [ ] Test coverage >= 80%
- [ ] Zero TypeScript errors in strict mode
- [ ] Zero ESLint errors
- [ ] Lighthouse score >= 90
- [ ] Bundle size < 500KB
- [ ] First Contentful Paint < 1.5s
- [ ] All CRUD operations working
- [ ] Full accessibility compliance (WCAG AA)
- [ ] Mobile responsive on all screens
- [ ] Comprehensive documentation

---

## Quick Wins (Start Here)

For immediate value, implement these first:

1. **Add linting and formatting** (30 minutes)
2. **Fix code organization** - move interceptor to proper location (15 minutes)
3. **Add loading skeletons** instead of text (1 hour)
4. **Implement edit functionality** (2-3 hours)
5. **Implement delete functionality** (1-2 hours)
6. **Add basic unit tests** (2-3 hours)
7. **Add search/filter** (2-3 hours)
8. **Improve error messages** (1 hour)

---

## Notes for AI Development

- Always run `npm install` after adding dependencies
- Always run `npm run build` to verify changes compile
- Run tests after each feature implementation
- Follow Angular style guide strictly
- Use signals over observables where possible
- Keep components thin, services thick
- Always use `inject()` function, never constructor injection
- Always implement `DestroyRef` for subscriptions
- Default to `OnPush` change detection
- Never use `any` type
- Add tests alongside feature code
- Commit frequently with descriptive messages
- Update documentation as you code
