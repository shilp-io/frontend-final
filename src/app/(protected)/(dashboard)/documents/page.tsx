"use client";

import React, { useState } from "react";
import { FileText, Tags } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CreatePanel, TableManager } from "@/components/private";
import { useDocumentStore } from "@/lib/store/documentStore";
import { useRecentStore } from "@/lib/store/recentStore";
import type { ExternalDoc } from "@/types";
import type { Column } from "@/components/private";

const formatDate = (date: string | null) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString();
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "pdf":
      return "border-red-500 text-red-500";
    case "doc":
    case "docx":
      return "border-blue-500 text-blue-500";
    case "xls":
    case "xlsx":
      return "border-green-500 text-green-500";
    case "ppt":
    case "pptx":
      return "border-orange-500 text-orange-500";
    default:
      return "border-muted text-muted-foreground";
  }
};

export default function DocumentsPage() {
  const { selectDocument } = useDocumentStore();
  const { addRecentItem } = useRecentStore();
  const [documents, setDocuments] = useState<ExternalDoc[]>([]);
  const [isCreatePanelOpen, setIsCreatePanelOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load documents
  React.useEffect(() => {
    const loadDocuments = async () => {
      try {
        const response = await fetch("/api/db/documents");
        if (!response.ok) {
          throw new Error("Failed to fetch documents");
        }
        const data = await response.json();
        setDocuments(data);
      } catch (error) {
        console.error("Error loading documents:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDocuments();
  }, []);

  const handleDocumentSelect = async (doc: ExternalDoc) => {
    selectDocument(doc.id);
    addRecentItem(doc.id, doc.title, "document");
  };

  const columns: Column<ExternalDoc>[] = [
    {
      header: "Title",
      accessor: (doc: ExternalDoc) => doc.title,
      width: 30,
      isSortable: true,
    },
    {
      header: "Type",
      accessor: (doc: ExternalDoc) => doc.type,
      width: 20,
      renderCell: (doc: ExternalDoc) => (
        <Badge variant="outline" className={getTypeColor(doc.type)}>
          {doc.type}
        </Badge>
      ),
      isSortable: true,
    },
    {
      header: "Last Modified",
      accessor: (doc: ExternalDoc) => formatDate(doc.updated_at),
      width: 20,
      isSortable: true,
    },
  ];

  const renderGridItem = (doc: ExternalDoc) => (
    <div className="space-y-6 p-4 border rounded-lg">
      <div>
        <h2 className="text-xl font-bold">{doc.title}</h2>
      </div>
      <Badge variant="outline" className={getTypeColor(doc.type)}>
        {doc.type}
      </Badge>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <FileText className="h-4 w-4" />
        <span>Last modified: {formatDate(doc.updated_at)}</span>
      </div>
      {doc.tags && doc.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {doc.tags.slice(0, 3).map((tag: string, index: number) => (
            <Badge key={index} variant="secondary">
              {tag}
            </Badge>
          ))}
          {doc.tags.length > 3 && (
            <Badge variant="secondary">+{doc.tags.length - 3}</Badge>
          )}
        </div>
      )}
    </div>
  );

  const renderDetails = (doc: ExternalDoc) => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{doc.title}</h2>
      </div>
      <Badge variant="outline" className={getTypeColor(doc.type)}>
        {doc.type}
      </Badge>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold flex items-center">
          <FileText className="mr-2 h-5 w-5" /> Document Details
        </h3>
        <p className="text-muted-foreground">
          Created: {formatDate(doc.created_at)}
        </p>
        <p className="text-muted-foreground">
          Last Modified: {formatDate(doc.updated_at)}
        </p>
        <p className="text-muted-foreground">
          URL:{" "}
          <a
            href={doc.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {doc.url}
          </a>
        </p>
        {doc.author && (
          <p className="text-muted-foreground">Author: {doc.author}</p>
        )}
        {doc.version_info && (
          <p className="text-muted-foreground">Version: {doc.version_info}</p>
        )}
        {doc.publication_date && (
          <p className="text-muted-foreground">
            Published: {formatDate(doc.publication_date)}
          </p>
        )}
        {doc.last_verified_date && (
          <p className="text-muted-foreground">
            Last Verified: {formatDate(doc.last_verified_date)}
          </p>
        )}
        <p className="text-muted-foreground">Status: {doc.status}</p>
      </div>
      {doc.tags && doc.tags.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold flex items-center">
            <Tags className="mr-2 h-5 w-5" /> Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {doc.tags.map((tag: string, index: number) => (
              <Badge key={index} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground p-4">
      <div className="container mx-auto">
        <TableManager
          title="Documents"
          description="Manage and organize your documents"
          data={documents}
          isLoading={isLoading}
          columns={columns}
          onItemSelect={handleDocumentSelect}
          handleGoToPage={(document: ExternalDoc) =>
            `/documents/${document.id}`
          }
          onNewItem={() => setIsCreatePanelOpen(true)}
          renderGridItem={renderGridItem}
          renderDetails={renderDetails}
          newItemLabel="New Document"
          searchPlaceholder="Search documents..."
          emptyMessage="No documents found. Create a new document to get started."
        />
        <CreatePanel
          isOpen={isCreatePanelOpen}
          onClose={() => setIsCreatePanelOpen(false)}
          initialTab="document"
          showTabs="document"
        />
      </div>
    </div>
  );
}
