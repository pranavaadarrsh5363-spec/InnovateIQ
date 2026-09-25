import { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { resourcesApi } from '../../services/api';
import { SavedResource } from '../../types';
import { Bookmark, BookmarkCheck, ExternalLink, Trash2, Database } from 'lucide-react';

export default function SavedResources() {
  const [saved, setSaved] = useState<SavedResource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    resourcesApi.getSaved().then(res => setSaved(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleRemove = async (resourceId: string) => {
    await resourcesApi.unsave(resourceId).catch(() => {});
    setSaved(prev => prev.filter(s => s.resourceId !== resourceId));
  };

  return (
    <Layout title="Saved Resources" subtitle={`${saved.length} resources saved`}>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 h-40 animate-pulse" />)}
        </div>
      ) : saved.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Bookmark size={48} className="mx-auto mb-4 opacity-30" />
          <h3 className="font-semibold text-gray-500 text-lg mb-2">No saved resources yet</h3>
          <p className="text-sm">Explore the Resource Explorer and save useful resources for later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {saved.map(s => s.resource && (
            <div key={s.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 card-hover flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">{s.resource.name}</h3>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{s.resource.category}</span>
                </div>
                <button onClick={() => handleRemove(s.resourceId)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">{s.resource.description}</p>
              {s.notes && (
                <div className="p-2.5 bg-blue-50 rounded-xl">
                  <p className="text-xs text-blue-700 font-medium">📝 {s.notes}</p>
                </div>
              )}
              <div className="flex flex-wrap gap-1">
                {s.resource.tags.slice(0, 3).map(t => (
                  <span key={t} className="text-xs px-2 py-0.5 bg-gray-50 text-gray-500 rounded border border-gray-100">{t}</span>
                ))}
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-gray-50">
                <span className="text-xs text-gray-400">Saved {new Date(s.savedAt).toLocaleDateString()}</span>
                <a href={s.resource.link} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-blue-600 font-medium hover:text-blue-700">
                  Visit <ExternalLink size={11} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
