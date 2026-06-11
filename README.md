 Local Export Guide (from README)
Quick Start
Install dependencies: npm install
Start PostgreSQL (Docker recommended):
Bash

docker run --name classroom-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=app_db -p 5432:5432 -d postgres:16
Create .env:
text

DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
Push schema: npx drizzle-kit push
Run dev server: npm run dev
Open: http://localhost:3000
Production Build
Bash

npm run build
npm start
