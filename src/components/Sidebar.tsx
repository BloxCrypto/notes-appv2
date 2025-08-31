import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Note } from '@/types/note';
import { Plus, Search, FileText, Code, Calendar } from 'lucide-react';

interface SidebarProps {
  notes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (noteId: string) => void;
  onCreateNote: () => void;
  onDeleteNote: (noteId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function Sidebar({
  notes,
  selectedNoteId,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
  searchQuery,
  onSearchChange,
}: SidebarProps) {
  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getLanguageIcon = (language: string) => {
    return language === 'plaintext' || language === 'markdown' ? FileText : Code;
  };

  return (
    <div className="w-80 bg-sidebar-bg border-r border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Notes</h2>
          <Button 
            onClick={onCreateNote} 
            size="sm" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="w-4 h-4 mr-2" />
            New
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Notes List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredNotes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? 'No notes found' : 'No notes yet'}
              <p className="text-sm mt-1">
                {searchQuery ? 'Try a different search term' : 'Create your first note'}
              </p>
            </div>
          ) : (
            filteredNotes.map((note) => {
              const LanguageIcon = getLanguageIcon(note.language);
              return (
                <div
                  key={note.id}
                  onClick={() => onSelectNote(note.id)}
                  className={`
                    p-3 rounded-lg cursor-pointer transition-colors mb-2 border
                    ${selectedNoteId === note.id
                      ? 'bg-primary/10 border-primary/20'
                      : 'bg-card hover:bg-sidebar-hover border-transparent'
                    }
                  `}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <LanguageIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <h3 className="font-medium text-foreground truncate">
                        {note.title || 'Untitled'}
                      </h3>
                    </div>
                    <Badge variant="secondary" className="text-xs ml-2">
                      {note.language}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {note.content.slice(0, 80)}
                    {note.content.length > 80 ? '...' : ''}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(note.updatedAt)}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteNote(note.id);
                      }}
                      className="text-destructive hover:text-destructive/80 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}