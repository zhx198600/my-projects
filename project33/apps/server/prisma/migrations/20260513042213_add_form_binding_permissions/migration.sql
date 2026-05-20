-- CreateTable
CREATE TABLE "node_field_permissions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nodeId" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "permission" TEXT NOT NULL DEFAULT 'EDITABLE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "node_field_permissions_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "workflow_nodes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_workflow_definitions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "formSchema" TEXT NOT NULL DEFAULT '{}',
    "formId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "workflow_definitions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "workflow_definitions_formId_fkey" FOREIGN KEY ("formId") REFERENCES "form_definitions" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_workflow_definitions" ("code", "createdAt", "createdById", "description", "formSchema", "id", "isPublished", "name", "updatedAt", "version") SELECT "code", "createdAt", "createdById", "description", "formSchema", "id", "isPublished", "name", "updatedAt", "version" FROM "workflow_definitions";
DROP TABLE "workflow_definitions";
ALTER TABLE "new_workflow_definitions" RENAME TO "workflow_definitions";
CREATE UNIQUE INDEX "workflow_definitions_code_key" ON "workflow_definitions"("code");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "node_field_permissions_nodeId_fieldName_key" ON "node_field_permissions"("nodeId", "fieldName");
