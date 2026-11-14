import Link from "next/link";
import { ArrowLeft, Clock3, Layers3 } from "lucide-react";

export function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <section className="sa-coming-page" aria-labelledby="coming-soon-title">
      <div className="sa-coming-card">
        <div className="sa-coming-icon"><Layers3 size={25} strokeWidth={1.8} /></div>
        <span className="sa-coming-eyebrow"><Clock3 size={14} /> COMING SOON</span>
        <h2 id="coming-soon-title">{title}</h2>
        <p>{description}</p>
        <Link className="sa-back-link" href="/admin"><ArrowLeft size={16} /> Back to Dashboard</Link>
      </div>
    </section>
  );
}
