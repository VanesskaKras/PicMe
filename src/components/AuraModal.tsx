import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  CheckCircle,
  X,
  Radio,
  Award,
  AlertTriangle,
  HeartHandshake
} from 'lucide-react';
import { AuraLog, UserProfile } from '../types';

interface AuraModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  auraLogs: AuraLog[];
}

export const AuraModal: React.FC<AuraModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  auraLogs,
}) => {
  if (!isOpen) return null;

  const isModeratorTier = currentUser.auraScore >= 850;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0a0f24] border border-cyan-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-b from-[#101b44] to-[#0a0f24] border-b border-slate-800">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-400 via-emerald-400 to-pink-500 p-[2px] shadow-[0_0_25px_rgba(0,240,255,0.4)]">
                <div className="w-full h-full bg-[#0a0f24] rounded-[14px] flex flex-col items-center justify-center">
                  <span className="text-xl font-bold font-mono text-cyan-300">
                    {currentUser.auraScore}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">
                    Aura
                  </span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Urban Contribution Aura</h2>
                {isModeratorTier ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    City Moderator
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    Active Citizen
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Objective system counter of reliable actions. Zero vanity likes.
              </p>
            </div>
          </div>

          {/* Daily Quota Counter */}
          <div className="mt-4 p-3 rounded-2xl bg-[#080d1e] border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-pink-400" />
              <div>
                <span className="text-xs font-semibold text-slate-200 block">Daily Free Signals</span>
                <span className="text-[10px] text-slate-500">Anti-spam intent throttle</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-mono font-bold text-cyan-400">
                {currentUser.dailySignalsLimit - currentUser.dailySignalsUsed} / {currentUser.dailySignalsLimit}
              </span>
              <span className="text-[10px] text-slate-500 block">pings left today</span>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Core Philosophy Notice */}
          <div className="p-4 rounded-2xl bg-[#0f183d] border border-cyan-500/20 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-cyan-300 font-semibold">
              <HeartHandshake className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>How Aura Governs Dublin Interaction</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              No human can manually downvote you. Aura changes purely through observable actions:
              keeping promises, verifying places, and responding promptly instead of silently disappearing.
            </p>
          </div>

          {/* What Adds (+) vs What Subtracts (-) Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* GAINS */}
            <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
              <span className="text-emerald-400 font-bold flex items-center gap-1.5 text-xs">
                <TrendingUp className="w-4 h-4" />
                What Adds to Aura (+)
              </span>
              <ul className="space-y-1.5 text-[11px] text-slate-300">
                <li className="flex items-start gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>+35</strong> Adding/verifying local places</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>+20</strong> Replying in reasonable time window</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>+5</strong> Polite decline ("Not right now")</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>+50</strong> Sourcing housing or job opportunity</span>
                </li>
              </ul>
            </div>

            {/* PENALTIES */}
            <div className="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-2">
              <span className="text-rose-400 font-bold flex items-center gap-1.5 text-xs">
                <TrendingDown className="w-4 h-4" />
                What Subtracts (-)
              </span>
              <ul className="space-y-1.5 text-[11px] text-slate-300">
                <li className="flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                  <span><strong>-40</strong> Silent ghosting after read receipt</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                  <span><strong>-50</strong> RSVPing to group event & no-show</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                  <span><strong>-60</strong> Spamming unsolicited signals</span>
                </li>
                <li className="text-[10px] text-slate-400 pt-1 border-t border-rose-900/40">
                  <em>Declining politely is never punished! Only silent disappearance after reading.</em>
                </li>
              </ul>
            </div>
          </div>

          {/* Moderator Tier Progress */}
          <div className="p-3.5 rounded-2xl bg-[#0c1228] border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Award className="w-4 h-4 text-cyan-400" />
                Path to Dublin Map Moderator (850 Aura)
              </span>
              <span className="font-mono text-cyan-300">{currentUser.auraScore} / 850</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-pink-500 rounded-full"
                style={{ width: `${Math.min(100, (currentUser.auraScore / 850) * 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500">
              At 850 Aura, you unlock the ability to approve community places, curate housing listings, and moderate neighborhood boards.
            </p>
          </div>

          {/* Recent Action Activity Log */}
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Recent Aura Logs
            </span>
            <div className="space-y-1.5">
              {auraLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex-1 pr-2">
                    <span className="text-slate-200 block text-xs">{log.action}</span>
                    <span className="text-[10px] text-slate-500">{log.timestamp}</span>
                  </div>
                  <span
                    className={`font-mono font-bold text-xs ${
                      log.type === 'gain' ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {log.delta > 0 ? `+${log.delta}` : log.delta}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0d1430]/70 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
