import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Note, SupportedLanguage, LANGUAGE_OPTIONS } from '@/types/note';
import Sidebar from './Sidebar';
import CodeEditor from './CodeEditor';
import { Save, Plus, Download, Upload } from 'lucide-react';

const STORAGE_KEY = 'notes-app-data';

export default function NotesApp() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const selectedNote = selectedNoteId ? notes.find(note => note.id === selectedNoteId) : null;

  // Load notes from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const notesWithDates = parsed.map((note: any) => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt),
        }));
        setNotes(notesWithDates);
        
        // Auto-select first note if available
        if (notesWithDates.length > 0) {
          setSelectedNoteId(notesWithDates[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to load notes:', error);
    }
  }, []);

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch (error) {
      console.error('Failed to save notes:', error);
    }
  }, [notes]);

  const createNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      content: '',
      language: 'plaintext',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setNotes(prev => [newNote, ...prev]);
    setSelectedNoteId(newNote.id);
    
    toast({
      title: "Note created",
      description: "A new note has been created.",
    });
  };

  const updateNote = (updates: Partial<Note>) => {
    if (!selectedNoteId) return;

    setNotes(prev => prev.map(note => 
      note.id === selectedNoteId 
        ? { ...note, ...updates, updatedAt: new Date() }
        : note
    ));
  };

  const deleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
    
    if (selectedNoteId === noteId) {
      const remainingNotes = notes.filter(note => note.id !== noteId);
      setSelectedNoteId(remainingNotes.length > 0 ? remainingNotes[0].id : null);
    }
    
    toast({
      title: "Note deleted",
      description: "The note has been deleted.",
      variant: "destructive",
    });
  };

  const exportNotes = () => {
    const dataStr = JSON.stringify(notes, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `notes-export-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "Notes exported",
      description: "Your notes have been exported to a JSON file.",
    });
  };

  const importNotes = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        const notesWithDates = imported.map((note: any) => ({
          ...note,
          id: Date.now().toString() + Math.random(), // Ensure unique IDs
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt),
        }));
        
        setNotes(prev => [...notesWithDates, ...prev]);
        
        toast({
          title: "Notes imported",
          description: `Imported ${notesWithDates.length} notes successfully.`,
        });
      } catch (error) {
        toast({
          title: "Import failed",
          description: "Failed to import notes. Please check the file format.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const saveNote = () => {
    if (selectedNote) {
      toast({
        title: "Note saved",
        description: `"${selectedNote.title}" has been saved.`,
      });
    }
  };

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        notes={notes}
        selectedNoteId={selectedNoteId}
        onSelectNote={setSelectedNoteId}
        onCreateNote={createNote}
        onDeleteNote={deleteNote}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        {selectedNote ? (
          <>
            {/* Editor Header */}
            <div className="border-b border-border bg-card p-4 flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <Input
                  value={selectedNote.title}
                  onChange={(e) => updateNote({ title: e.target.value })}
                  placeholder="Note title..."
                  className="text-lg font-semibold bg-transparent border-none shadow-none p-0 h-auto focus-visible:ring-0"
                />
                
                <Select
                  value={selectedNote.language}
                  onValueChange={(value: SupportedLanguage) => updateNote({ language: value })}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Button onClick={saveNote} size="sm" variant="outline">
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                
                <Button onClick={exportNotes} size="sm" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                
                <Button size="sm" variant="outline" onClick={() => document.getElementById('file-import')?.click()}>
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </Button>
                
                <input
                  id="file-import"
                  type="file"
                  accept=".json"
                  onChange={importNotes}
                  className="hidden"
                />
              </div>
            </div>

            {/* Editor Content */}
            <div className="flex-1 p-4">
              <CodeEditor
                value={selectedNote.content}
                onChange={(content) => updateNote({ content })}
                language={selectedNote.language}
                placeholder={`Start writing your ${selectedNote.language} code or notes...`}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-card">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Welcome to Notes
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md">
                Create your first note to start writing code with syntax highlighting
                and organize your thoughts.
              </p>
              <Button onClick={createNote} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="w-5 h-5 mr-2" />
                Create First Note
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}