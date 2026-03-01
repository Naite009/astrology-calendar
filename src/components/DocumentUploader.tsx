import { useState, useRef, useEffect, forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, Trash2, Loader2, AlertCircle, CheckCircle, LogIn, LogOut, Sparkles, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface UploadedDocument {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  document_type: string | null;
  description: string | null;
  created_at: string | null;
  extraction_status: string | null;
  extracted_text: string | null;
}

export const DocumentUploader = forwardRef<HTMLDivElement, Record<string, never>>((_, ref) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading, signOut } = useAuth();
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch documents when authenticated
  useEffect(() => {
    // Helpful for debugging "I am signed in" reports without logging sensitive details
    console.debug('[DocumentUploader] auth state', {
      authLoading,
      isAuthenticated,
      hasUser: !!user,
    });

    if (isAuthenticated && user) {
      fetchDocuments();
    }
  }, [isAuthenticated, user, authLoading]);

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

  const validateFile = (file: File) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF or Word document');
      return false;
    }

    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size must be less than 50MB');
      return false;
    }

    return true;
  };

  const uploadFile = async (file: File) => {
    if (!user) return;
    if (!validateFile(file)) return;

    setIsUploading(true);
    try {
      // Upload to storage
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const filePath = `${user.id}/${Date.now()}_${safeName}`;
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

      setDocuments((prev) => [data, ...prev]);
      toast.success('Document uploaded successfully!');

      // Trigger text extraction
      triggerExtraction(data.id);

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

  const triggerExtraction = async (documentId: string) => {
    try {
      // Update local state to show extracting
      setDocuments(prev => prev.map(d => 
        d.id === documentId ? { ...d, extraction_status: 'extracting' } : d
      ));

      const { error } = await supabase.functions.invoke('extract-document-text', {
        body: { documentId },
      });

      if (error) throw error;

      // Update local state with completion
      setDocuments(prev => prev.map(d => 
        d.id === documentId ? { ...d, extraction_status: 'complete' } : d
      ));
      toast.success('Text extracted from document!');
    } catch (error: any) {
      console.error('Extraction error:', error);
      setDocuments(prev => prev.map(d => 
        d.id === documentId ? { ...d, extraction_status: 'error' } : d
      ));

      let message = 'Text extraction failed — you can retry later';
      try {
        const errBody = await error?.context?.json?.();
        if (errBody?.error) message = errBody.error;
      } catch {
        // ignore parse errors and keep fallback message
      }

      toast.error(message);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(false);

    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    await uploadFile(file);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(false);
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

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div ref={ref}>
        <Card className="border-dashed border-2 border-muted">
          <CardContent className="py-8 text-center">
            <Loader2 className="mx-auto text-muted-foreground mb-2 animate-spin" size={32} />
            <p className="text-sm text-muted-foreground">
              Checking authentication...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div ref={ref}>
        <Card className="border-dashed border-2 border-muted">
          <CardContent className="py-8 text-center space-y-3">
            <AlertCircle className="mx-auto text-muted-foreground" size={32} />
            <div>
              <p className="text-sm text-muted-foreground">Sign in to upload reference documents</p>
              <p className="text-xs text-muted-foreground mt-1">
                (This is your account login — not the chart name at the top.)
              </p>
            </div>
            <Button onClick={() => navigate('/auth')} className="gap-2">
              <LogIn size={16} />
              Sign in
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div ref={ref}>
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText size={18} />
            Reference Documents
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="text-right leading-tight">
              <p className="text-xs text-muted-foreground">Signed in</p>
              <p className="text-xs font-medium truncate max-w-[160px]">
                {user?.email || 'Account'}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => signOut()}
              className="gap-2"
              title="Sign out"
            >
              <LogOut size={16} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
            isDragActive ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'
          }`}
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
          }}
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
              <Upload className={isDragActive ? 'text-primary' : 'text-muted-foreground'} size={32} />
              <p className="text-sm font-medium">Drag & drop a document here, or click to upload</p>
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
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(doc.file_size)}
                      </p>
                      {doc.extraction_status === 'extracting' && (
                        <span className="flex items-center gap-1 text-xs text-primary">
                          <Loader2 size={10} className="animate-spin" /> Extracting text…
                        </span>
                      )}
                      {doc.extraction_status === 'complete' && (
                        <span className="flex items-center gap-1 text-xs text-accent-foreground">
                          <Sparkles size={10} /> Text extracted
                        </span>
                      )}
                      {(doc.extraction_status === 'error' || doc.extraction_status === 'rate_limited') && (
                        <button
                          onClick={(e) => { e.stopPropagation(); triggerExtraction(doc.id); }}
                          className="flex items-center gap-1 text-xs text-destructive hover:underline"
                        >
                          <RefreshCw size={10} /> Retry extraction
                        </button>
                      )}
                      {(!doc.extraction_status || doc.extraction_status === 'pending') && (
                        <button
                          onClick={(e) => { e.stopPropagation(); triggerExtraction(doc.id); }}
                          className="flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          <Sparkles size={10} /> Extract text
                        </button>
                      )}
                    </div>
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
        {documents.some(d => d.extraction_status === 'complete') && (
          <div className="flex items-start gap-2 p-3 bg-secondary/50 rounded-lg text-sm">
            <Sparkles className="text-primary shrink-0 mt-0.5" size={16} />
            <p className="text-muted-foreground">
              Extracted text is now available to enrich your Sacred Script, Moon phases, and transit interpretations.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  </div>
  );
});
