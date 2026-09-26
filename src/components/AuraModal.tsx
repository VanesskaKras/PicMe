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
    <div className="absolute inset-0 z-50 flex items-center justify-center p-3 bg-ink-strong/40 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-white border border-line rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-full">
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-b from-white to-white border-b border-line">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-card border border-line flex items-center justify-center text-muted hover:text-ink-strong"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-ink p-[2px] shadow-md">
                <div className="w-full h-full bg-white rounded-[14px] flex flex-col items-center justify-center">
                  <span className="text-xl font-bold font-mono text-success">
                    {currentUser.auraScore}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-muted font-semibold">
                    Aura
                  </span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-ink-strong tracking-tight">Urban Contribution Aura</h2>
                {isModeratorTier ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-success-soft text-success border border-success/40 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-success" />
                    City Moderator
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-success-soft text-success border border-success/40">
                    Active Citizen
                  </span>
                )}
              </div>
              <p className="text-xs text-muted mt-0.5">
                Objective system counter of reliable actions. Zero vanity likes.
              </p>
            </div>
          </div>

          {/* Daily Quota Counter */}
          <div className="mt-4 p-3 rounded-2xl bg-card border border-line flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-people-strong" />
              <div>
                <span className="text-xs font-semibold text-ink-strong block">Daily Free Signals</span>
                <span className="text-[10px] text-subtle">Anti-spam intent throttle</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-mono font-bold text-success">
                {currentUser.dailySignalsLimit - currentUser.dailySignalsUsed} / {currentUser.dailySignalsLimit}
              </span>
              <span className="text-[10px] text-subtle block">pings left today</span>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Core Philosophy Notice */}
          <div className="p-4 rounded-2xl bg-card border border-line space-y-2 text-xs">
            <div className="flex items-center gap-2 text-success font-semibold">
              <HeartHandshake className="w-4 h-4 text-success shrink-0" />
              <span>How Aura Governs Dublin Interaction</span>
            </div>
            <p className="text-muted leading-relaxed text-[11px]">
              No human can manually downvote you. Aura changes purely through observable actions:
              keeping promises, verifying places, and responding promptly instead of silently disappearing.
            </p>
          </div>

          {/* What Adds (+) vs What Subtracts (-) Grid */}
          <div className="grid grid-cols-1 @md:grid-cols-2 gap-3 text-xs">
            {/* GAINS */}
            <div className="p-3.5 rounded-2xl bg-success-soft border border-success/30 space-y-2">
              <span className="text-success font-bold flex items-center gap-1.5 text-xs">
                <TrendingUp className="w-4 h-4" />
                What Adds to Aura (+)
              </span>
              <ul className="space-y-1.5 text-[11px] text-muted">
                <li className="flex items-start gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                  <span><strong>+35</strong> Adding/verifying local places</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                  <span><strong>+20</strong> Replying in reasonable time window</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                  <span><strong>+5</strong> Polite decline ("Not right now")</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                  <span><strong>+50</strong> Sourcing housing or job opportunity</span>
                </li>
              </ul>
            </div>

            {/* PENALTIES */}
            <div className="p-3.5 rounded-2xl bg-danger-soft border border-danger/30 space-y-2">
              <span className="text-danger font-bold flex items-center gap-1.5 text-xs">
                <TrendingDown className="w-4 h-4" />
                What Subtracts (-)
              </span>
              <ul className="space-y-1.5 text-[11px] text-muted">
                <li className="flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-danger shrink-0 mt-0.5" />
                  <span><strong>-40</strong> Silent ghosting after read receipt</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-danger shrink-0 mt-0.5" />
                  <span><strong>-50</strong> RSVPing to group event & no-show</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-danger shrink-0 mt-0.5" />
                  <span><strong>-60</strong> Spamming unsolicited signals</span>
                </li>
                <li className="text-[10px] text-muted pt-1 border-t border-danger/20">
                  <em>Declining politely is never punished! Only silent disappearance after reading.</em>
                </li>
              </ul>
            </div>
          </div>

          {/* Moderator Tier Progress */}
          <div className="p-3.5 rounded-2xl bg-card border border-line space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-ink-strong flex items-center gap-1.5">
                <Award className="w-4 h-4 text-success" />
                Path to Dublin Map Moderator (850 Aura)
              </span>
              <span className="font-mono text-success">{currentUser.auraScore} / 850</span>
            </div>
            <div className="w-full h-2 rounded-full bg-card overflow-hidden border border-line">
              <div
                className="h-full bg-success rounded-full"
                style={{ width: `${Math.min(100, (currentUser.auraScore / 850) * 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-subtle">
              At 850 Aura, you unlock the ability to approve community places, curate housing listings, and moderate neighborhood boards.
            </p>
          </div>

          {/* Recent Action Activity Log */}
          <div>
            <span className="text-[11px] font-semibold text-muted uppercase tracking-wider block mb-2">
              Recent Aura Logs
            </span>
            <div className="space-y-1.5">
              {auraLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-xl bg-card/80 border border-line flex items-center justify-between text-xs"
                >
                  <div className="flex-1 pr-2">
                    <span className="text-ink-strong block text-xs">{log.action}</span>
                    <span className="text-[10px] text-subtle">{log.timestamp}</span>
                  </div>
                  <span
                    className={`font-mono font-bold text-xs ${
                      log.type === 'gain' ? 'text-success' : 'text-danger'
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
        <div className="p-4 border-t border-line bg-card/70 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-line hover:bg-line text-ink-strong text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
