
import React, { useState } from 'react';
import { FreelancerProfile, Notification, Education, Job, Application } from '../types';

interface FreelancerViewProps {
  profile: FreelancerProfile | null;
  setProfile: (profile: FreelancerProfile) => void;
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  jobs: Job[];
  applications: Application[];
  onApply: (jobId: string) => void;
}

const FreelancerView: React.FC<FreelancerViewProps> = ({ 
  profile, setProfile, notifications, onMarkRead, jobs, applications, onApply 
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'jobs' | 'apps'>('jobs');
  const [isEditing, setIsEditing] = useState(false);
  const [newEd, setNewEd] = useState<Education>({ school: '', degree: '', fieldOfStudy: '', year: '' });

  if (!profile) return null;

  const completion = (() => {
    let score = 0;
    if (profile.about) score += 20;
    if (profile.education.length > 0) score += 20;
    if (profile.skills.length > 0) score += 20;
    if (profile.avatar) score += 20;
    if (profile.headline) score += 20;
    return score;
  })();

  const handleAddEducation = () => {
    if (newEd.school && newEd.degree) {
      setProfile({ ...profile, education: [...profile.education, newEd] });
      setNewEd({ school: '', degree: '', fieldOfStudy: '', year: '' });
      setIsEditing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20">
      {/* LEFT SIDEBAR: Personal Branding */}
      <aside className="lg:col-span-3 space-y-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="h-16 bg-gradient-to-br from-[#0a66c2] to-blue-400"></div>
          <div className="px-4 pb-4 -mt-10 flex flex-col items-center text-center">
            <div className="relative">
              <img src={profile.avatar} className="w-20 h-20 rounded-full border-4 border-white mb-3 shadow-md object-cover" alt="" />
              <div className="absolute bottom-4 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
            </div>
            <h3 className="font-bold text-gray-900 text-lg leading-tight">{profile.name}</h3>
            <p className="text-xs text-gray-500 mt-1 px-2">{profile.headline}</p>
          </div>
          <div className="border-t border-gray-100 p-4 space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase">
                <span>Strength</span>
                <span className="text-[#0a66c2]">{completion}%</span>
              </div>
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-[#0a66c2] transition-all duration-1000" style={{ width: `${completion}%` }}></div>
              </div>
            </div>
            <div className="flex justify-between text-xs py-1 hover:bg-gray-50 -mx-4 px-4 cursor-pointer">
              <span className="text-gray-500">Profile views</span>
              <span className="text-[#0a66c2] font-bold">{profile.viewsCount}</span>
            </div>
            <div className="flex justify-between text-xs py-1 hover:bg-gray-50 -mx-4 px-4 cursor-pointer">
              <span className="text-gray-500">Applications</span>
              <span className="text-[#0a66c2] font-bold">{applications.length}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden py-2">
          {['jobs', 'apps', 'profile'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`w-full text-left px-4 py-3 text-sm font-bold border-l-4 transition-all capitalize ${activeTab === tab ? 'border-[#0a66c2] bg-blue-50 text-[#0a66c2]' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}
            >
              {tab === 'jobs' ? 'Job Market' : tab === 'apps' ? 'My Applications' : 'Professional Profile'}
            </button>
          ))}
        </div>
      </aside>

      {/* CENTER: Dynamic Content */}
      <section className="lg:col-span-9 space-y-6">
        {activeTab === 'jobs' && (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Recommended for you</h2>
              <p className="text-xs text-gray-500 mb-6">Based on your profile and search history</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jobs.map(job => {
                  const applied = applications.some(a => a.jobId === job.id);
                  return (
                    <div key={job.id} className="group border border-gray-100 rounded-xl p-5 hover:border-blue-300 hover:shadow-lg transition-all bg-white flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center text-[#0a66c2] font-black text-xl border border-gray-100 group-hover:bg-blue-50 transition-colors">
                          {job.company[0]}
                        </div>
                        <div className="text-[10px] font-bold bg-green-50 text-green-700 px-2 py-1 rounded-full uppercase tracking-tighter">
                          {job.salary}
                        </div>
                      </div>
                      <h3 className="font-bold text-gray-900 hover:text-[#0a66c2] hover:underline cursor-pointer transition-colors line-clamp-1">{job.title}</h3>
                      <p className="text-xs font-semibold text-gray-600 mb-1">{job.company}</p>
                      <p className="text-[10px] text-gray-400 mb-3">{job.location} • {job.postedDate}</p>
                      
                      <div className="flex flex-wrap gap-1 mb-6">
                        {job.techStack.map(t => (
                          <span key={t} className="text-[9px] bg-gray-50 text-gray-500 px-2 py-0.5 rounded border border-gray-100">{t}</span>
                        ))}
                      </div>

                      <button 
                        onClick={() => onApply(job.id)}
                        disabled={applied}
                        className={`mt-auto w-full py-2.5 rounded-full text-xs font-bold transition-all ${applied ? 'bg-gray-100 text-gray-400' : 'bg-[#0a66c2] text-white hover:bg-[#004182] shadow-md shadow-blue-100'}`}
                      >
                        {applied ? 'Application Sent' : 'Easy Apply'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'apps' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Track Applications</h2>
                <p className="text-xs text-gray-500">Manage your active opportunities</p>
              </div>
              <span className="text-xs font-bold text-[#0a66c2]">{applications.length} Total</span>
            </div>
            <div className="divide-y divide-gray-100">
              {applications.length === 0 ? (
                <div className="p-20 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-gray-400 font-medium">No applications found</p>
                  <button onClick={() => setActiveTab('jobs')} className="text-[#0a66c2] text-sm font-bold mt-2 hover:underline">Browse open roles</button>
                </div>
              ) : (
                applications.map(app => {
                  const job = jobs.find(j => j.id === app.jobId);
                  return (
                    <div key={app.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-gray-50 transition-colors gap-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-[#0a66c2] font-black border border-blue-100">
                          {job?.company[0]}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 leading-tight">{job?.title}</h4>
                          <p className="text-xs text-gray-500 mt-1">{job?.company} • {app.appliedDate}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 self-end md:self-center">
                        <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full border tracking-wide uppercase ${
                          app.status === 'SELECTED' ? 'bg-green-50 text-green-700 border-green-200' :
                          app.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-yellow-50 text-yellow-700 border-yellow-200'
                        }`}>
                          {app.status}
                        </span>
                        <button className="text-gray-400 hover:text-gray-600 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900">Professional Summary</h2>
                <button className="text-[#0a66c2] text-sm font-bold flex items-center hover:bg-blue-50 px-3 py-1.5 rounded-full transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Edit profile
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">About</h3>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{profile.about}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Education</h3>
                      <button onClick={() => setIsEditing(!isEditing)} className="text-[#0a66c2] text-xs font-bold hover:underline">+ Add</button>
                    </div>
                    <div className="space-y-4">
                      {profile.education.map((ed, i) => (
                        <div key={i} className="flex space-x-4 p-4 rounded-xl border border-gray-100 hover:border-blue-100 transition-colors">
                          <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                             </svg>
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">{ed.school}</h4>
                            <p className="text-xs text-gray-600 font-medium">{ed.degree}, {ed.fieldOfStudy}</p>
                            <p className="text-[10px] text-gray-400 mt-1">{ed.year}</p>
                          </div>
                        </div>
                      ))}
                      {isEditing && (
                        <div className="p-5 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 space-y-4">
                           <input className="w-full p-3 text-sm border border-gray-200 rounded-lg bg-white" placeholder="Institution Name" value={newEd.school} onChange={e => setNewEd({...newEd, school: e.target.value})} />
                           <div className="grid grid-cols-2 gap-3">
                             <input className="p-3 text-sm border border-gray-200 rounded-lg bg-white" placeholder="Degree (e.g. B.S.)" value={newEd.degree} onChange={e => setNewEd({...newEd, degree: e.target.value})} />
                             <input className="p-3 text-sm border border-gray-200 rounded-lg bg-white" placeholder="Graduation Year" value={newEd.year} onChange={e => setNewEd({...newEd, year: e.target.value})} />
                           </div>
                           <div className="flex space-x-2">
                             <button onClick={handleAddEducation} className="flex-1 bg-[#0a66c2] text-white py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-blue-100 hover:bg-[#004182]">Save</button>
                             <button onClick={() => setIsEditing(false)} className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-bold text-gray-500">Cancel</button>
                           </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-6 bg-[#f8f9fb] rounded-2xl border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Core Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map(skill => (
                        <span key={skill} className="bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm hover:border-[#0a66c2] transition-colors cursor-default">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
                    <h3 className="text-sm font-bold text-[#0a66c2] uppercase tracking-widest mb-2 italic">Pro Tip</h3>
                    <p className="text-xs text-blue-800/80 leading-relaxed font-medium">
                      Profiles with professional headshots and a detailed 'About' section get 4x more attention from recruiters.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default FreelancerView;
