import React from 'react';
import { Download } from 'lucide-react';


import type { JobOffer } from '../../types';

interface JobsViewProps {
  jobs: JobOffer[];
  onAddJobClick?: () => void;
  onContact?: (jobId: string, authorId: string) => void;
  mobileView: 'map' | 'list';
}

export const JobsView: React.FC<JobsViewProps> = ({ mobileView, jobs, onAddJobClick, onContact }) => {
  return (
    <div className={`flex-1 flex flex-col ${mobileView === 'list' ? 'block' : 'hidden lg:flex'} overflow-y-auto pr-2 scrollbar-thin pb-20`}>
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-widest mb-1">Emploi BTP</h2>
          <p className="text-xs text-slate-400">Offres et demandes d'emploi spécialisées</p>
        </div>
        <button onClick={onAddJobClick} className="bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl transition shadow-lg shadow-orange-500/20">
          + Publier
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {jobs.map(job => (
          <div key={job.id} className="bg-slate-900/40 border border-white/5 p-5 rounded-2xl hover:border-orange-500/30 transition-colors">
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                job.type === 'offer' 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                  : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
              }`}>
                {job.type === 'offer' ? 'Offre d\'emploi' : 'Cherche emploi'}
              </span>
              <span className="text-[9px] text-slate-500">{job.dateAdded}</span>
            </div>
            <h3 className="text-sm font-black text-white mb-1">{job.title}</h3>
            <p className="text-[10px] text-orange-400 font-bold mb-3">
              {job.type === 'offer' ? job.companyName : job.candidateName} • {job.wilaya}
            </p>
            <div className="grid grid-cols-2 gap-2 mb-3 text-[10px]">
              <div className="bg-slate-950/50 p-2 rounded-lg border border-white/5">
                <span className="text-slate-500 block mb-0.5">Profession</span>
                <span className="text-slate-200 font-bold">{job.profession}</span>
              </div>
              <div className="bg-slate-950/50 p-2 rounded-lg border border-white/5">
                <span className="text-slate-500 block mb-0.5">Expérience</span>
                <span className="text-slate-200 font-bold">{job.experience}</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mb-4 line-clamp-3">{job.description}</p>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  if (!job.authorId) {
                    alert("عذراً، هذا الإعلان قديم ولا يحتوي على معرف الناشر (author_id) لذا لا يمكن فتح المحادثة. جرب إعلاناً تم نشره حديثاً.");
                    return;
                  }
                  if (onContact) onContact(job.id, job.authorId);
                }}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-black uppercase py-2.5 rounded-xl transition"
              >
                {job.type === 'offer' ? 'Postuler' : 'Contacter'}
              </button>
              {job.cvUrl && (
                <a href={job.cvUrl} download className="flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black uppercase px-3 py-2.5 rounded-xl transition">
                  <Download className="h-3.5 w-3.5" /> CV
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
