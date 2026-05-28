-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "content" TEXT,
    "url" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "sourceSlug" TEXT NOT NULL,
    "publishedAt" DATETIME,
    "date" TEXT NOT NULL,
    "category" TEXT,
    "imageUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Article_url_key" ON "Article"("url");

-- CreateIndex
CREATE INDEX "Article_date_idx" ON "Article"("date");

-- CreateIndex
CREATE INDEX "Article_date_sourceSlug_idx" ON "Article"("date", "sourceSlug");
