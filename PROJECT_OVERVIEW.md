# Meta-Driven Form Project Overview

## Project Structure

This repo is a meta-driven form builder with:

- `backend/`: GraphQL API + MongoDB persistence
- `frontend/`: React admin UI and form renderer

---

## Backend

### Core stack

- `Express` + `apollo-server-express`
- `MongoDB` via `mongoose`
- `TypeScript`

### Entry point

- `backend/src/index.ts`
  - loads `.env`
  - connects to DB via `backend/src/config/db.ts`
  - starts Apollo GraphQL server at `/graphql`
  - applies global error middleware

### Data model

- `backend/src/models/FormSchema.model.ts`
  - stores form schemas
  - includes meta, settings, steps, fields, validation, conditions
- `backend/src/models/FormResponse.model.ts`
  - stores submitted responses
  - saves answers, form version, submitter, status

### GraphQL API

- `backend/src/graphql/typeDefs/formSchema.typeDef.ts`
  - queries: `getFormSchema`, `listFormSchemas`
  - mutations: `createFormSchema`, `updateFormSchema`, `deleteFormSchema`
- `backend/src/graphql/typeDefs/formResponse.typeDef.ts`
  - queries: `getFormResponses`, `getResponseById`
  - mutations: `submitFormResponse`, `deleteFormResponse`
- `backend/src/graphql/index.ts`
  - combines type defs and resolvers

### Business logic

- `backend/src/graphql/resolvers/formSchema.resolver.ts`
  - CRUD for schemas
  - soft-delete archives forms
  - increments version on update
- `backend/src/graphql/resolvers/formResponse.resolver.ts`
  - fetches and submits responses
  - strips hidden-field answers
  - validates answers before save
- `backend/src/services/validation.service.ts`
  - validates required, length, pattern, email, numeric, checkbox group rules
- `backend/src/services/condition.service.ts`
  - evaluates conditional visibility rules
  - filters out answers for hidden fields

---

## Frontend

### Core stack

- `React` + `Vite`
- `Apollo Client`
- `React Router`
- `Redux Toolkit`

### Entry point

- `frontend/src/main.tsx`
  - sets up Redux store
  - ApolloProvider
  - BrowserRouter

### Layout/navigation

- `frontend/src/components/Layout.tsx`
  - `Sidebar`
  - `Topbar`
  - content area
- `frontend/src/components/Sidebar.tsx`
  - dashboard + builder navigation
- `frontend/src/components/Topbar.tsx`
  - simple breadcrumb/search UI

### Pages

- `frontend/src/App.tsx`
  - routes:
    - `/` → `Dashboard`
    - `/builder` → `Builder`
    - `/builder/:formId` → `Builder`
    - `/renderer/:formId` → `Renderer`
    - `/responses/:formId` → `Responses`

- `frontend/src/pages/Dashboard.tsx`
  - lists form schemas
  - navigates to edit or preview
  - uses `LIST_FORM_SCHEMAS`

- `frontend/src/pages/Builder.tsx`
  - builds or edits a schema
  - local state in Redux for current schema
  - supports add/update/delete fields
  - uses `GET_FORM_SCHEMA`, `CREATE_FORM_SCHEMA`, `UPDATE_FORM_SCHEMA`

- `frontend/src/pages/Renderer.tsx`
  - renders live form preview
  - evaluates simple conditional visibility client-side
  - posts responses via `SUBMIT_FORM_RESPONSE`

- `frontend/src/pages/Responses.tsx`
  - shows submitted responses for a form
  - uses `GET_FORM_RESPONSES`

### State

- `frontend/src/store/slices/formSlice.ts`
  - stores schemas list, current schema, selected field
  - actions for add/update/delete field, meta updates

### GraphQL operations

- Queries in `frontend/src/graphql/queries.ts`
- Mutations in `frontend/src/graphql/mutations.ts`

---

## How it fits together

- Backend stores form definitions and responses
- Frontend builds/edit schemas and previews live form rendering
- Renderer sends form submissions to backend
- Backend validates with schema rules and condition logic
- Responses page shows saved submissions
