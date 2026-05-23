import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import TrendCard from './TrendCard'

export function TrendsGrid() {
  const [trends, setTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrends() {
      // Holt Daten aus deiner echten Datenbank
      const { data, error } = await supabase
        .from('trends')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Fehler beim Laden:", error);
      } else {
        setTrends(data || []);
      }
      setLoading(false);
    }
    fetchTrends();
  }, []);

  if (loading) return <div className="text-white p-4">Lade echte Trends aus Datenbank...</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {trends.map((trend) => (
        <TrendCard key={trend.id} trend={trend} />
      ))}
    </div>
  );
}
