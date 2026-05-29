import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Tag, Eye, Trash2, GripVertical, Plus, Image as ImageIcon, CheckSquare, Grid3x3, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/components/layout/AdminLayout';
import { useAdminAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface GalleryPhoto {
  id: string;
  url: string;
  caption: string;
  category: string;
  uploadedAt: string;
  order: number;
  featured: boolean;
}

const CATEGORIES = [
  { value: 'all', label: 'All Photos' },
  { value: 'workshop', label: 'Workshop Sessions' },
  { value: 'graduation', label: 'Graduation' },
  { value: 'students', label: 'Student Success' },
  { value: 'events', label: 'Events' },
  { value: 'facilities', label: 'Facilities' },
];

const INIT_PHOTOS: GalleryPhoto[] = [
  { id: 'gal-1', url: '/src/assets/workshop-1.jpg', caption: 'Free Forex Workshop Session', category: 'workshop', uploadedAt: '2025-05-01', order: 1, featured: true },
  { id: 'gal-2', url: '/src/assets/workshop-2.jpg', caption: 'PHILMAC Training Room', category: 'workshop', uploadedAt: '2025-05-02', order: 2, featured: false },
  { id: 'gal-3', url: '/src/assets/workshop-3.jpg', caption: 'Saturday Workshop Session', category: 'workshop', uploadedAt: '2025-05-03', order: 3, featured: false },
  { id: 'gal-4', url: '/src/assets/graduation.jpg', caption: 'Graduation Ceremony 2024', category: 'graduation', uploadedAt: '2025-04-15', order: 4, featured: true },
  { id: 'gal-5', url: '/src/assets/philmac-banner.jpg', caption: 'PHILMAC Cebu Academy', category: 'facilities', uploadedAt: '2025-04-01', order: 5, featured: false },
];

const STORAGE_KEY = 'philmac_gallery';

function loadPhotos(): GalleryPhoto[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : INIT_PHOTOS;
}

function savePhotos(photos: GalleryPhoto[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
}

export default function AdminGallery() {
  const navigate = useNavigate();
  const { admin, loading } = useAdminAuth();
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [filterCat, setFilterCat] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [previewPhoto, setPreviewPhoto] = useState<GalleryPhoto | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dragItemId, setDragItemId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [newCaption, setNewCaption] = useState('');
  const [newCategory, setNewCategory] = useState('workshop');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !admin) navigate('/login');
  }, [admin, loading, navigate]);

  useEffect(() => {
    setPhotos(loadPhotos());
  }, []);

  const persistPhotos = (updated: GalleryPhoto[]) => {
    setPhotos(updated);
    savePhotos(updated);
  };

  const filtered = filterCat === 'all' ? photos : photos.filter(p => p.category === filterCat);
  const sortedFiltered = [...filtered].sort((a, b) => a.order - b.order);

  // File upload handler
  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const validFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (validFiles.length === 0) { toast.error('Please upload image files only'); setUploading(false); return; }

    let processed = 0;
    const newPhotos: GalleryPhoto[] = [];

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        const photo: GalleryPhoto = {
          id: `gal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          url,
          caption: file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
          category: newCategory,
          uploadedAt: new Date().toISOString().split('T')[0],
          order: photos.length + newPhotos.length + 1,
          featured: false,
        };
        newPhotos.push(photo);
        processed++;
        if (processed === validFiles.length) {
          persistPhotos([...photos, ...newPhotos]);
          toast.success(`${newPhotos.length} photo${newPhotos.length > 1 ? 's' : ''} uploaded!`);
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    });
  }, [photos, newCategory]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = () => setIsDragOver(false);

  // Reorder drag
  const handleItemDragStart = (id: string) => setDragItemId(id);
  const handleItemDragOver = (e: React.DragEvent, id: string) => { e.preventDefault(); setDragOverId(id); };
  const handleItemDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!dragItemId || dragItemId === targetId) { setDragItemId(null); setDragOverId(null); return; }
    const updated = [...photos];
    const fromIdx = updated.findIndex(p => p.id === dragItemId);
    const toIdx = updated.findIndex(p => p.id === targetId);
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    const reordered = updated.map((p, i) => ({ ...p, order: i + 1 }));
    persistPhotos(reordered);
    setDragItemId(null);
    setDragOverId(null);
    toast.success('Photo order updated');
  };
  const handleItemDragEnd = () => { setDragItemId(null); setDragOverId(null); };

  const deletePhoto = (id: string) => {
    const updated = photos.filter(p => p.id !== id).map((p, i) => ({ ...p, order: i + 1 }));
    persistPhotos(updated);
    setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    toast.success('Photo deleted');
  };

  const deleteSelected = () => {
    if (selectedIds.size === 0) return;
    const updated = photos.filter(p => !selectedIds.has(p.id)).map((p, i) => ({ ...p, order: i + 1 }));
    persistPhotos(updated);
    setSelectedIds(new Set());
    toast.success(`${selectedIds.size} photo${selectedIds.size > 1 ? 's' : ''} deleted`);
  };

  const toggleFeatured = (id: string) => {
    const updated = photos.map(p => p.id === id ? { ...p, featured: !p.featured } : p);
    persistPhotos(updated);
  };

  const updatePhoto = (id: string, caption: string, category: string) => {
    const updated = photos.map(p => p.id === id ? { ...p, caption, category } : p);
    persistPhotos(updated);
    setEditingId(null);
    toast.success('Photo updated');
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  if (loading || !admin) return null;

  return (
    <AdminLayout>
      <div className="max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-[hsl(218,72%,12%)]">Gallery Management</h1>
            <p className="text-[hsl(218,35%,32%)] text-sm mt-0.5">{photos.length} photos — drag to reorder, click to edit</p>
          </div>
          <div className="flex items-center gap-2">
            {selectedIds.size > 0 && (
              <Button size="sm" variant="destructive" onClick={deleteSelected} className="gap-1.5">
                <Trash2 className="w-3.5 h-3.5" /> Delete {selectedIds.size} selected
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => setViewMode(v => v === 'grid' ? 'list' : 'grid')} className="gap-1.5 border-border text-[hsl(218,72%,12%)]">
              {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3x3 className="w-4 h-4" />}
              {viewMode === 'grid' ? 'List' : 'Grid'}
            </Button>
            <Button size="sm" className="brand-gradient text-white font-bold gap-1.5 hover:opacity-90" onClick={() => fileInputRef.current?.click()}>
              <Plus className="w-4 h-4" /> Add Photos
            </Button>
          </div>
        </div>

        {/* Upload Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${isDragOver ? 'border-brand bg-brand/5 scale-[1.01]' : 'border-border bg-white hover:border-brand/50 hover:bg-brand/2'}`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={e => handleFiles(e.target.files)}
          />
          <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-3 transition-all ${isDragOver ? 'brand-gradient' : 'bg-muted'}`}>
            <Upload className={`w-6 h-6 ${isDragOver ? 'text-white' : 'text-[hsl(218,35%,32%)]'}`} />
          </div>
          <p className="font-bold text-[hsl(218,72%,12%)] text-sm">
            {uploading ? 'Uploading...' : isDragOver ? 'Drop photos here' : 'Drag & drop photos here'}
          </p>
          <p className="text-[hsl(218,35%,32%)] text-xs mt-1">or click to browse — JPG, PNG, WEBP supported</p>

          {/* Category selector for new uploads */}
          <div className="mt-4 flex items-center justify-center gap-2" onClick={e => e.stopPropagation()}>
            <Label className="text-xs font-semibold text-[hsl(218,72%,12%)]">Upload to category:</Label>
            <Select value={newCategory} onValueChange={setNewCategory}>
              <SelectTrigger className="w-40 h-8 text-xs border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.filter(c => c.value !== 'all').map(c => (
                  <SelectItem key={c.value} value={c.value} className="text-xs">{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filter + Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => setFilterCat(cat.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filterCat === cat.value ? 'brand-gradient text-white shadow-sm' : 'bg-white border border-border text-[hsl(218,72%,12%)] hover:border-brand/50 hover:text-brand'}`}
              >
                {cat.label}
                <span className="ml-1.5 opacity-70">
                  {cat.value === 'all' ? photos.length : photos.filter(p => p.category === cat.value).length}
                </span>
              </button>
            ))}
          </div>
          <p className="text-xs text-[hsl(218,35%,32%)]">Drag photos to reorder their display order</p>
        </div>

        {/* Photo Grid */}
        {sortedFiltered.length === 0 ? (
          <div className="bg-white border border-border rounded-2xl p-16 text-center">
            <ImageIcon className="w-12 h-12 text-[hsl(218,35%,32%)] mx-auto mb-3 opacity-40" />
            <p className="font-bold text-[hsl(218,72%,12%)]">No photos in this category</p>
            <p className="text-sm text-[hsl(218,35%,32%)]">Upload photos above to get started</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {sortedFiltered.map(photo => {
              const isSelected = selectedIds.has(photo.id);
              const isDraggingOver = dragOverId === photo.id;
              const isBeingDragged = dragItemId === photo.id;
              const isEditing = editingId === photo.id;

              return (
                <div
                  key={photo.id}
                  draggable
                  onDragStart={() => handleItemDragStart(photo.id)}
                  onDragOver={e => handleItemDragOver(e, photo.id)}
                  onDrop={e => handleItemDrop(e, photo.id)}
                  onDragEnd={handleItemDragEnd}
                  className={`group relative bg-white border-2 rounded-xl overflow-hidden transition-all cursor-grab active:cursor-grabbing
                    ${isSelected ? 'border-brand ring-2 ring-brand/30' : 'border-border'}
                    ${isDraggingOver ? 'border-brand/60 scale-105 shadow-xl' : ''}
                    ${isBeingDragged ? 'opacity-40 scale-95' : 'hover:shadow-lg hover:-translate-y-0.5'}
                  `}
                >
                  {/* Image */}
                  <div className="aspect-square relative overflow-hidden bg-muted">
                    <img
                      src={photo.url}
                      alt={photo.caption}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                      onError={e => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${photo.id}/400/400`; }}
                    />

                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-[hsl(218,72%,12%)]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => setPreviewPhoto(photo)}
                        className="w-9 h-9 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center text-white hover:bg-white/40 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { setEditingId(photo.id); setNewCaption(photo.caption); setNewCategory(photo.category); }}
                        className="w-9 h-9 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center text-white hover:bg-white/40 transition-colors"
                      >
                        <Tag className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deletePhoto(photo.id)}
                        className="w-9 h-9 bg-red-500/80 backdrop-blur rounded-lg flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Select checkbox */}
                    <button
                      onClick={() => toggleSelect(photo.id)}
                      className={`absolute top-2 left-2 w-6 h-6 rounded-md flex items-center justify-center transition-all ${isSelected ? 'brand-gradient text-white' : 'bg-white/70 text-[hsl(218,72%,12%)] opacity-0 group-hover:opacity-100'}`}
                    >
                      {isSelected ? <CheckSquare className="w-4 h-4" /> : <div className="w-3 h-3 border-2 border-[hsl(218,72%,12%)] rounded" />}
                    </button>

                    {/* Featured badge */}
                    {photo.featured && (
                      <div className="absolute top-2 right-2 bg-brand/90 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">FEATURED</div>
                    )}

                    {/* Drag handle */}
                    <div className="absolute bottom-2 right-2 text-white/50 group-hover:text-white/80 transition-colors">
                      <GripVertical className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Caption / Edit */}
                  {isEditing ? (
                    <div className="p-3 space-y-2 border-t border-border" onClick={e => e.stopPropagation()}>
                      <Input
                        value={newCaption}
                        onChange={e => setNewCaption(e.target.value)}
                        placeholder="Caption"
                        className="text-xs h-8 border-border text-[hsl(218,72%,12%)]"
                        autoFocus
                      />
                      <Select value={newCategory} onValueChange={setNewCategory}>
                        <SelectTrigger className="h-8 text-xs border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.filter(c => c.value !== 'all').map(c => (
                            <SelectItem key={c.value} value={c.value} className="text-xs">{c.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex gap-1.5">
                        <Button size="sm" className="flex-1 h-7 text-xs brand-gradient text-white hover:opacity-90" onClick={() => updatePhoto(photo.id, newCaption, newCategory)}>Save</Button>
                        <Button size="sm" variant="outline" className="flex-1 h-7 text-xs border-border text-[hsl(218,72%,12%)]" onClick={() => setEditingId(null)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 border-t border-border">
                      <p className="text-xs font-semibold text-[hsl(218,72%,12%)] truncate">{photo.caption}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] bg-muted text-[hsl(218,35%,32%)] px-1.5 py-0.5 rounded-full capitalize">
                          {CATEGORIES.find(c => c.value === photo.category)?.label || photo.category}
                        </span>
                        <button
                          onClick={() => toggleFeatured(photo.id)}
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full transition-colors ${photo.featured ? 'bg-brand/15 text-orange-700' : 'text-[hsl(218,35%,32%)] hover:text-brand'}`}
                        >
                          {photo.featured ? '★ Featured' : '☆ Feature'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="bg-white border border-border rounded-xl overflow-hidden divide-y divide-border">
            {sortedFiltered.map(photo => {
              const isSelected = selectedIds.has(photo.id);
              const isDraggingOver = dragOverId === photo.id;
              const isBeingDragged = dragItemId === photo.id;

              return (
                <div
                  key={photo.id}
                  draggable
                  onDragStart={() => handleItemDragStart(photo.id)}
                  onDragOver={e => handleItemDragOver(e, photo.id)}
                  onDrop={e => handleItemDrop(e, photo.id)}
                  onDragEnd={handleItemDragEnd}
                  className={`flex items-center gap-4 p-3 transition-all cursor-grab active:cursor-grabbing
                    ${isDraggingOver ? 'bg-brand/5 border-l-2 border-brand' : 'hover:bg-muted/30'}
                    ${isBeingDragged ? 'opacity-40' : ''}
                    ${isSelected ? 'bg-brand/5' : ''}
                  `}
                >
                  <GripVertical className="w-4 h-4 text-[hsl(218,35%,32%)] shrink-0" />
                  <button onClick={() => toggleSelect(photo.id)} className="shrink-0">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${isSelected ? 'brand-gradient border-transparent' : 'border-border'}`}>
                      {isSelected && <CheckSquare className="w-3 h-3 text-white" />}
                    </div>
                  </button>
                  <img
                    src={photo.url}
                    alt={photo.caption}
                    className="w-14 h-14 object-cover rounded-lg shrink-0"
                    onError={e => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${photo.id}/100/100`; }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[hsl(218,72%,12%)] truncate">{photo.caption}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-[hsl(218,35%,32%)] bg-muted px-2 py-0.5 rounded-full">
                        {CATEGORIES.find(c => c.value === photo.category)?.label}
                      </span>
                      <span className="text-xs text-[hsl(218,35%,32%)]">{photo.uploadedAt}</span>
                      {photo.featured && <span className="text-xs text-brand font-semibold">★ Featured</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => setPreviewPhoto(photo)} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-[hsl(218,35%,32%)] hover:text-[hsl(218,72%,12%)] hover:bg-muted/70 transition-colors">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => { setEditingId(photo.id); setNewCaption(photo.caption); setNewCategory(photo.category); }} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-[hsl(218,35%,32%)] hover:text-[hsl(218,72%,12%)] hover:bg-muted/70 transition-colors">
                      <Tag className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => toggleFeatured(photo.id)} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${photo.featured ? 'bg-brand/15 text-brand' : 'bg-muted text-[hsl(218,35%,32%)] hover:text-brand hover:bg-brand/10'}`}>
                      <span className="text-xs font-black">{photo.featured ? '★' : '☆'}</span>
                    </button>
                    <button onClick={() => deletePhoto(photo.id)} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-[hsl(218,35%,32%)] hover:text-red-600 hover:bg-red-50 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Live Preview Section */}
        <div className="bg-white border border-border rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-brand" />
              <h3 className="font-bold text-[hsl(218,72%,12%)]">Live Gallery Preview</h3>
            </div>
            <span className="text-xs text-[hsl(218,35%,32%)] bg-muted px-2 py-1 rounded-full">Public view</span>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {[...photos].sort((a, b) => a.order - b.order).slice(0, 12).map(photo => (
                <div key={photo.id} className="aspect-square rounded-lg overflow-hidden relative group">
                  <img
                    src={photo.url}
                    alt={photo.caption}
                    className="w-full h-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${photo.id}/200/200`; }}
                  />
                  {photo.featured && (
                    <div className="absolute inset-0 ring-2 ring-brand rounded-lg" />
                  )}
                </div>
              ))}
              {photos.length > 12 && (
                <div className="aspect-square rounded-lg bg-muted flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-lg font-black text-[hsl(218,72%,12%)]">+{photos.length - 12}</p>
                    <p className="text-[10px] text-[hsl(218,35%,32%)]">more</p>
                  </div>
                </div>
              )}
            </div>
            {photos.length === 0 && (
              <div className="text-center py-8 text-[hsl(218,35%,32%)] text-sm">No photos yet — upload some above!</div>
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewPhoto && (
        <div
          className="fixed inset-0 z-50 bg-[hsl(218,72%,6%)]/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewPhoto(null)}
        >
          <div className="relative max-w-3xl w-full" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setPreviewPhoto(null)}
              className="absolute -top-10 right-0 text-white/70 hover:text-white transition-colors flex items-center gap-1.5 text-sm"
            >
              <X className="w-4 h-4" /> Close
            </button>
            <img
              src={previewPhoto.url}
              alt={previewPhoto.caption}
              className="w-full rounded-2xl shadow-2xl max-h-[80vh] object-contain"
              onError={e => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${previewPhoto.id}/800/600`; }}
            />
            <div className="bg-white rounded-xl mt-3 p-3 flex items-center justify-between">
              <div>
                <p className="font-bold text-[hsl(218,72%,12%)] text-sm">{previewPhoto.caption}</p>
                <p className="text-xs text-[hsl(218,35%,32%)]">{CATEGORIES.find(c => c.value === previewPhoto.category)?.label} · Uploaded {previewPhoto.uploadedAt}</p>
              </div>
              {previewPhoto.featured && <span className="text-xs bg-brand/15 text-orange-700 font-bold px-2 py-1 rounded-full">★ Featured</span>}
            </div>
          </div>
        </div>
      )}

      {/* Inline edit modal (list view) */}
      {editingId && viewMode === 'list' && (
        <div className="fixed inset-0 z-50 bg-[hsl(218,72%,6%)]/80 flex items-center justify-center p-4" onClick={() => setEditingId(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-black text-[hsl(218,72%,12%)] mb-4">Edit Photo</h3>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-[hsl(218,72%,12%)]">Caption</Label>
                <Input value={newCaption} onChange={e => setNewCaption(e.target.value)} className="border-border text-[hsl(218,72%,12%)]" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[hsl(218,72%,12%)]">Category</Label>
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger className="border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.filter(c => c.value !== 'all').map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-2">
                <Button className="flex-1 brand-gradient text-white font-bold hover:opacity-90" onClick={() => updatePhoto(editingId, newCaption, newCategory)}>Save Changes</Button>
                <Button variant="outline" className="border-border text-[hsl(218,72%,12%)]" onClick={() => setEditingId(null)}>Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
