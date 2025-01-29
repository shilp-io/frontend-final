"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const documentFormSchema = z.object({
  title: z.string().min(1, "Document title is required"),
  description: z.string().optional(),
  type: z.enum(["pdf", "doc", "docx", "txt", "other"]),
  status: z.enum(["draft", "under_review", "approved", "archived"]),
  version: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

type DocumentFormValues = z.infer<typeof documentFormSchema>;

const defaultValues: Partial<DocumentFormValues> = {
  title: "",
  description: "",
  type: "pdf",
  status: "draft",
  version: "",
  tags: [],
};

interface DocumentFormProps {
  collectionId?: string;
  onSuccess: () => void;
}

export default function DocumentForm({
  collectionId,
  onSuccess,
}: DocumentFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();
  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentFormSchema),
    defaultValues,
  });

  const [file, setFile] = React.useState<File | null>(null);

  async function onSubmit(data: DocumentFormValues) {
    if (!collectionId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Collection ID is required",
      });
      return;
    }

    if (!file) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "File is required",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      // TODO: Implement document creation API call with file upload
      console.log("Document data:", { ...data, collectionId, file });
      toast({
        variant: "default",
        title: "Success",
        description: "Document created successfully",
      });
      onSuccess();
    } catch (error) {
      console.error("Failed to create document:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create document",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Auto-detect document type from file extension
      const extension = selectedFile.name.split(".").pop()?.toLowerCase();
      if (extension && ["pdf", "doc", "docx", "txt"].includes(extension)) {
        form.setValue(
          "type",
          extension as z.infer<typeof documentFormSchema>["type"],
        );
      } else {
        form.setValue("type", "other");
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid place-items-center p-6 border-2 border-dashed rounded-lg">
          <div className="text-center space-y-4">
            <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={() => document.getElementById("file-upload")?.click()}
                type="button"
              >
                Choose File
              </Button>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.txt"
              />
              <p className="text-sm text-muted-foreground">
                {file ? file.name : "PDF, DOC, DOCX, or TXT up to 10MB"}
              </p>
            </div>
          </div>
        </div>

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter document title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter document description"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="doc">DOC</SelectItem>
                    <SelectItem value="docx">DOCX</SelectItem>
                    <SelectItem value="txt">TXT</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="version"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Version</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 1.0.0" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={!file || isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Document"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
