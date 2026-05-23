interface TrendCardProps {
  trend: {
    id: string;
    title: string;
    image_url: string;
    platform: string;
    engagement_rate: string; // oder number, je nachdem wie du es in Supabase hast
  };
}

export default function TrendCard({ trend }: TrendCardProps) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-sm transition-all hover:border-zinc-700">
      {/* Bild-Bereich */}
      <div className="aspect-video w-full overflow-hidden">
        <img 
          src={trend.image_url} 
          alt={trend.title}
          className="h-full w-full object-cover"
        />
      </div>
      
      {/* Info-Bereich */}
      <div className="p-4">
        <span className="mb-2 inline-block rounded-full bg-zinc-800 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-zinc-400">
          {trend.platform}
        </span>
        <h3 className="text-sm font-semibold text-white">
          {trend.title}
        </h3>
        <p className="mt-1 text-xs text-zinc-500">
          Engagement: {trend.engagement_rate}
        </p>
      </div>
    </div>
  );
}
