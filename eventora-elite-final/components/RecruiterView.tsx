
import React, { useState } from 'react';
import { FreelancerProfile, Notification, Job, Application } from '../types';
import { analyzeQualification } from '../services/geminiService';

interface RecruiterViewProps {
  jobs: Job[];
  onPostJob: (job: Job) => void;
  applications: Application[];
  onUpdateApplication: (appId: string, updates: Partial<Application>) => void;
  onSendNotification: (notif: Notification) => void;
  freelancerProfiles: FreelancerProfile[];
}

const RecruiterView: React.FC<RecruiterViewProps> = ({ 
  jobs, onPostJob, applications, onUpdateApplication, onSendNotification, freelancerProfiles 
}) => {
  const [showPostModal, setShowPostModal] = useState(false);
  const [newJob, setNewJob] = useState<Partial<Job>>({
    title: '', company: '', location: '', salary: '', requirements: '', techStack: []
  });
  const [screeningLoading, setScreeningLoading] = useState<Record<string, boolean>>({});

  const handlePost = () => {
    if (newJob.title && newJob.company) {
      onPostJob({
        ...newJob as Job,
        id: `job-${Date.now()}`,
        postedDate: 'Just now',
        recruiterId: 'rec-1'
      });
      setShowPostModal(false);
      setNewJob({ title: '', company: '', location: '', salary: '', requirements: '', techStack: [] });
    }
  };

  const handleScreen = async (app: Application, freelancer: FreelancerProfile, job: Job) => {
    setScreeningLoading(prev => ({ ...prev, [app.id]: true }));
    try {
      const freelancerData = `${freelancer.name} Profile: ${freelancer.headline}. Skills: ${freelancer.skills.join(', ')}. Education: ${JSON.stringify(freelancer.education)}`;
      const jobData = `Title: ${job.title}. Requirements: ${job.requirements}`;
      const result = await analyzeQualification(freelancerData, jobData);
      onUpdateApplication(app.id, { aiScore: result.score, aiSummary: result.summary, status: 'REVIEWED' });
    } catch (err) {
      console.error(err);
    } finally {
      setScreeningLoading(prev => ({ ...prev, [app.id]: false }));
    }
  };

  const handleAction = (app: Application, freelancer: FreelancerProfile, job: Job, action: 'SELECTED' | 'REJECTED') => {
    onUpdateApplication(app.id, { status: action });
    if (action === 'SELECTED') {
      // Fix: Use correct Notification properties from types.ts
      onSendNotification({
        id: `notif-sel-${Date.now()}`,
        type: 'SUCCESS',
        title: `Update: Your application for ${job.title}`,
        message: `Hi ${freelancer.name}, we're impressed by your profile and would love to schedule a preliminary call regarding the ${job.title} role at ${job.company}.`,
        date: 'Just now',
        isRead: false
      });
    }
  };

  const stats = {
    activeJobs: jobs.length,
    totalApplicants: applications.length,
    newToday: applications.filter(a => a.appliedDate === new Date().toLocaleDateString()).length
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20">
      {/* SIDEBAR: Command Stats */}
      <aside className="lg:col-span-3 space-y-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
          <button 
            onClick={() => setShowPostModal(true)}
            className="w-full bg-[#0a66c2] text-white py-3 rounded-full font-bold text-sm shadow-xl shadow-blue-100 hover:bg-[#004182] hover:-translate-y-0.5 transition-all flex items-center justify-center space-x-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            <span>Post a Job</span>
          </button>
          
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Recruitment Health</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Active listings</span>
                <span className="font-bold text-gray-900">{stats.activeJobs}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Total applicants</span>
                <span className="font-bold text-gray-900">{stats.totalApplicants}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">New today</span>
                <span className="font-bold text-green-600">{stats.newToday}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h3 className="text-xs font-bold text-gray-800">Recent Postings</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {jobs.map(j => (
              <div key={j.id} className="p-4 hover:bg-gray-50 cursor-pointer group transition-colors">
                <h4 className="text-xs font-bold text-gray-900 group-hover:text-[#0a66c2] truncate">{j.title}</h4>
                <p className="text-[10px] text-gray-400 mt-1 flex justify-between uppercase tracking-tighter">
                  <span>{applications.filter(a => a.jobId === j.id).length} candidates</span>
                  <span>{j.location}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* MAIN HUB: Applicant Management */}
      <section className="lg:col-span-9 space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden min-h-[600px]">
          <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/80 backdrop-blur-md sticky top-0 z-10">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Applicant Tracking Hub</h2>
              <p className="text-xs text-gray-500 mt-0.5">Automated screening with Gemini AI Vision</p>
            </div>
            <div className="flex items-center space-x-2 text-[10px] font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-100 tracking-widest uppercase">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
              <span>AI Pipeline Active</span>
            </div>
          </div>
          
          <div className="divide-y divide-gray-100">
            {applications.length === 0 ? (
              <div className="p-24 text-center">
                 <div className="w-20 h-20 bg-[#f8f9fb] rounded-full flex items-center justify-center mx-auto mb-6 text-gray-200">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                   </svg>
                 </div>
                 <h3 className="text-lg font-bold text-gray-800">Your candidate pipeline is empty</h3>
                 <p className="text-sm text-gray-400 max-w-xs mx-auto mt-2">Share your job listings on social networks to start receiving professional applications.</p>
              </div>
            ) : (
              applications.map(app => {
                const job = jobs.find(j => j.id === app.jobId);
                const free = freelancerProfiles.find(f => f.id === app.freelancerId);
                if (!job || !free) return null;

                const isScreening = screeningLoading[app.id];

                return (
                  <div key={app.id} className="p-8 hover:bg-gray-50/50 transition-colors animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
                      <div className="flex items-start space-x-5 flex-1">
                        <div className="relative">
                          <img src={free.avatar} className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl border border-gray-100 object-cover shadow-sm" alt="" />
                          <div className="absolute -top-2 -left-2 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                            NEW
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-lg font-bold text-gray-900 hover:text-[#0a66c2] hover:underline cursor-pointer">{free.name}</h3>
                            <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full uppercase tracking-widest">{job.title}</span>
                          </div>
                          <p className="text-sm font-medium text-gray-600">{free.headline}</p>
                          <div className="flex flex-wrap gap-1.5 pt-2">
                            {free.skills.map(s => <span key={s} className="text-[10px] bg-white border border-gray-100 text-gray-500 px-2 py-0.5 rounded shadow-sm">{s}</span>)}
                          </div>
                          <p className="text-[10px] text-gray-400 pt-2 uppercase font-bold">Applied on {app.appliedDate}</p>
                        </div>
                      </div>

                      <div className="lg:w-64 space-y-4">
                        {app.aiScore !== undefined ? (
                          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-2">
                             <div className="flex justify-between items-center">
                               <span className="text-[10px] font-bold text-gray-400 uppercase">AI Rating</span>
                               <span className={`text-sm font-black ${app.aiScore >= 80 ? 'text-green-600' : 'text-orange-500'}`}>{app.aiScore}%</span>
                             </div>
                             <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className={`h-full transition-all duration-1000 ${app.aiScore >= 80 ? 'bg-green-500' : 'bg-orange-400'}`} style={{ width: `${app.aiScore}%` }}></div>
                             </div>
                             <p className="text-[11px] text-gray-500 leading-tight italic">"{app.aiSummary?.slice(0, 100)}..."</p>
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleScreen(app, free, job)}
                            disabled={isScreening}
                            className={`w-full py-3 rounded-xl text-xs font-bold border-2 transition-all flex items-center justify-center space-x-2 ${
                              isScreening ? 'bg-gray-50 text-gray-400 border-gray-200' : 'border-[#0a66c2] text-[#0a66c2] hover:bg-blue-50'
                            }`}
                          >
                            {isScreening ? (
                              <>
                                <div className="w-3 h-3 border-2 border-[#0a66c2] border-t-transparent rounded-full animate-spin"></div>
                                <span>AI Processing...</span>
                              </>
                            ) : (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                                </svg>
                                <span>Analyze Qualification</span>
                              </>
                            )}
                          </button>
                        )}
                        
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleAction(app, free, job, 'SELECTED')}
                            disabled={app.status === 'SELECTED'}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                              app.status === 'SELECTED' ? 'bg-green-100 text-green-700 shadow-none' : 'bg-[#0a66c2] text-white hover:bg-[#004182] shadow-blue-100'
                            }`}
                          >
                            {app.status === 'SELECTED' ? 'Invited' : 'Hire'}
                          </button>
                          <button 
                            onClick={() => handleAction(app, free, job, 'REJECTED')}
                            className="p-2.5 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-gray-100"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* POST MODAL: Professional Design */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a66c2]/10 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-100">
             <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center">
               <div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Post a new role</h3>
                <p className="text-xs text-gray-500 font-medium">Reach over 500k+ vetted professionals</p>
               </div>
               <button onClick={() => setShowPostModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                 </svg>
               </button>
             </div>
             
             <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
               <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-1.5">
                   <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Job Title</label>
                   <input className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#0a66c2] outline-none transition-all" placeholder="e.g. Senior Visual Designer" value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} />
                 </div>
                 <div className="space-y-1.5">
                   <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Company</label>
                   <input className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#0a66c2] outline-none transition-all" placeholder="Company name" value={newJob.company} onChange={e => setNewJob({...newJob, company: e.target.value})} />
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-1.5">
                   <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Location</label>
                   <input className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#0a66c2] outline-none transition-all" placeholder="Remote / City" value={newJob.location} onChange={e => setNewJob({...newJob, location: e.target.value})} />
                 </div>
                 <div className="space-y-1.5">
                   <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Budget / Salary</label>
                   <input className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#0a66c2] outline-none transition-all" placeholder="e.g. $80k - $120k" value={newJob.salary} onChange={e => setNewJob({...newJob, salary: e.target.value})} />
                 </div>
               </div>

               <div className="space-y-1.5">
                 <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Detailed Requirements</label>
                 <textarea className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#0a66c2] outline-none transition-all h-32 resize-none" placeholder="Explain the role, technology stack, and expectations..." value={newJob.requirements} onChange={e => setNewJob({...newJob, requirements: e.target.value})} />
               </div>
             </div>

             <div className="p-8 bg-gray-50 flex justify-end items-center space-x-4">
               <button onClick={() => setShowPostModal(false)} className="text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors">Discard Draft</button>
               <button 
                 onClick={handlePost} 
                 className="px-10 py-3.5 bg-[#0a66c2] text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-100 hover:bg-[#004182] hover:-translate-y-0.5 transition-all"
                >
                  Confirm Posting
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruiterView;
