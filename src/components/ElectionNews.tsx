import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Newspaper, ExternalLink, Calendar, Tag } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  publishedAt: string;
  category: string;
  url?: string;
}

export default function ElectionNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/news')
      .then(res => res.json())
      .then(data => {
        setNews(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch news:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-text text-bg">
          <Newspaper className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-2xl font-serif italic italic tracking-tight">Election Intelligence</h2>
          <p className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-60">Verified Updates & Briefings</p>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-text border-t-transparent animate-spin rounded-full"></div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide">
          <AnimatePresence mode="popLayout">
            {news.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-5 bg-bg border border-border group hover:bg-text hover:text-bg transition-colors duration-300"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-1 bg-border/10 border border-border group-hover:border-bg/30">
                      {item.category}
                    </span>
                    <span className="text-[10px] opacity-60 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-serif font-medium leading-tight group-hover:italic transition-all">
                    {item.title}
                  </h3>
                  
                  <p className="text-sm opacity-80 leading-relaxed line-clamp-2">
                    {item.summary}
                  </p>
                  
                  <div className="flex justify-between items-center pt-2 border-t border-border/20 group-hover:border-bg/20">
                    <span className="text-[10px] font-bold uppercase tracking-tighter opacity-60">
                      Source: {item.source}
                    </span>
                    {item.url && (
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[10px] font-bold uppercase underline flex items-center gap-1 group-hover:text-bg"
                      >
                        Read Full <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {news.length === 0 && (
            <div className="text-center py-12 border border-dashed border-border opacity-60">
              <p className="font-serif italic text-lg">No updates available in your region yet.</p>
              <p className="text-xs uppercase tracking-widest mt-2">Check back soon for verified briefings.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
