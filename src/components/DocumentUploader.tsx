import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, Trash2, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface UploadedDocument {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  document_type: string | null;
  description: string | null;
  created_at: string | null;
}

export const DocumentUploader = () => {
  const { user, isAuthenticated } = useAuth();
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch documents on mount
  useState(() => {
    if (isAuthenticated && user) {
      fetchDocuments();
    }
  });

  const fetchDocuments = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('astrology_documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF or Word document');
      return;
    }

    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size must be less than 50MB');
      return;
    }

    setIsUploading(true);
    try {
      // Upload to storage
      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('astrology-docs')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Save metadata to database
      const { data, error: dbError } = await supabase
        .from('astrology_documents')
        .insert({
          user_id: user.id,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          document_type: 'reference',
        })
        .select()
        .single();

      if (dbError) throw dbError;

      setDocuments(prev => [data, ...prev]);
      toast.success('Document uploaded successfully!');
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (doc: UploadedDocument) => {
    if (!user) return;

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('astrology-docs')
        .remove([doc.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('astrology_documents')
        .delete()
        .eq('id', doc.id);

      if (dbError) throw dbError;

      setDocuments(prev => prev.filter(d => d.id !== doc.id));
      toast.success('Document deleted');
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Failed to delete document');
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (!isAuthenticated) {
    return (
      <Card className="border-dashed border-2 border-muted">
        <CardContent className="py-8 text-center">
          <AlertCircle className="mx-auto text-muted-foreground mb-2" size={32} />
          <p className="text-sm text-muted-foreground">
            Sign in to upload reference documents
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText size={18} />
          Reference Documents
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        <div 
          className="border-2 border-dashed border-muted rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileSelect}
            className="hidden"
          />
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="animate-spin text-primary" size={32} />
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="text-muted-foreground" size={32} />
              <p className="text-sm font-medium">Click to upload PDF</p>
              <p className="text-xs text-muted-foreground">Max 50MB • PDF or Word documents</p>
            </div>
          )}
        </div>

        {/* Document List */}
        {documents.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Uploaded Documents
            </p>
            {documents.map(doc => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="text-primary shrink-0" size={20} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{doc.file_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(doc.file_size)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(doc)}
                  className="text-destructive hover:text-destructive shrink-0"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Success message */}
        {documents.length > 0 && (
          <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg text-sm">
            <CheckCircle className="text-green-600 shrink-0 mt-0.5" size={16} />
            <p className="text-green-700 dark:text-green-400">
              Documents are saved! Share them with me in chat and I can integrate the content into your Sacred Script.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
