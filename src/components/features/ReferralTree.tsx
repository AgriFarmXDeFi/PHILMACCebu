import { useState, useEffect } from 'react';
import { Users, CheckCircle, Clock, Lock, Award, TrendingUp, ChevronDown, ChevronRight } from 'lucide-react';
import type { Student } from '@/types';

interface TreeNode {
  id: string;
  name: string;
  code: string;
  status: Student['status'];
  directCount: number;
  secondLevelCount: number;
  children: TreeNode[];
  isRoot?: boolean;
}

interface Props {
  rootStudent: Student;
  allStudents: Student[];
  compact?: boolean;
}

const STATUS_META: Record<string, {
  label: string;
  icon: React.ElementType;
  dotColor: string;
  badgeBg: string;
  badgeText: string;
  ring: string;
}> = {
  pending:               { label: 'Pending',         icon: Clock,       dotColor: '#f59e0b', badgeBg: '#fef3c7', badgeText: '#92400e', ring: '#f59e0b' },
  payment_review:        { label: 'Payment Review',  icon: Clock,       dotColor: '#f97316', badgeBg: '#ffedd5', badgeText: '#9a3412', ring: '#f97316' },
  active:                { label: 'Active',           icon: CheckCircle, dotColor: '#22c55e', badgeBg: '#dcfce7', badgeText: '#166534', ring: '#22c55e' },
  basic_course:          { label: 'Basic Course',     icon: TrendingUp,  dotColor: '#3b82f6', badgeBg: '#dbeafe', badgeText: '#1e40af', ring: '#3b82f6' },
  next_course_qualified: { label: 'Next Course',      icon: TrendingUp,  dotColor: '#8b5cf6', badgeBg: '#ede9fe', badgeText: '#4c1d95', ring: '#8b5cf6' },
  final_course_qualified:{ label: 'Final Course',     icon: TrendingUp,  dotColor: '#6366f1', badgeBg: '#e0e7ff', badgeText: '#312e81', ring: '#6366f1' },
  challenge_training:    { label: 'Training Challenge',icon: Award,      dotColor: '#eab308', badgeBg: '#fef9c3', badgeText: '#713f12', ring: '#eab308' },
  challenge_profirm:     { label: 'Pro Firm Challenge',icon: Award,      dotColor: '#ef4444', badgeBg: '#fee2e2', badgeText: '#991b1b', ring: '#ef4444' },
  completed:             { label: 'Completed',         icon: Award,      dotColor: '#10b981', badgeBg: '#d1fae5', badgeText: '#064e3b', ring: '#10b981' },
  awarded:               { label: 'Awarded',           icon: Award,      dotColor: '#f97316', badgeBg: '#fef3c7', badgeText: '#9a3412', ring: '#f97316' },
};

function getMeta(status: string) {
  return STATUS_META[status] || { label: status, icon: Users, dotColor: '#9ca3af', badgeBg: '#f3f4f6', badgeText: '#374151', ring: '#d1d5db' };
}

function buildTree(student: Student, allStudents: Student[], depth = 0): TreeNode {
  const children = depth < 2
    ? student.directReferrals
        .map(id => allStudents.find(s => s.id === id))
        .filter(Boolean)
        .map(s => buildTree(s!, allStudents, depth + 1))
    : [];

  return {
    id: student.id,
    name: student.fullName,
    code: student.referralCode,
    status: student.status,
    directCount: student.directReferrals.length,
    secondLevelCount: student.secondLevelReferrals?.length ?? 0,
    children,
    isRoot: depth === 0,
  };
}

// ─── Individual Node Card ───────────────────────────────────────────────────
function NodeCard({
  node,
  depth,
}: {
  node: TreeNode;
  depth: number;
}) {
  const [expanded, setExpanded] = useState(true);
  const meta = getMeta(node.status);
  const StatusIcon = meta.icon;
  const hasChildren = node.children.length > 0;
  const initials = node.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  // Depth-based visual weight
  const isRoot = depth === 0;
  const isLevel1 = depth === 1;

  return (
    <div className="flex flex-col items-center">
      {/* Node */}
      <div
        className="relative group select-none"
        style={{
          width: isRoot ? 200 : isLevel1 ? 168 : 148,
        }}
      >
        {/* Card */}
        <div
          className="rounded-2xl transition-all duration-200 hover:scale-[1.02] hover:shadow-xl cursor-default"
          style={{
            background: isRoot
              ? 'linear-gradient(135deg, hsl(218,72%,18%), hsl(218,72%,12%))'
              : '#ffffff',
            border: `2px solid ${isRoot ? 'hsl(18,90%,54%)' : meta.ring}`,
            boxShadow: isRoot
              ? `0 8px 32px rgba(0,0,0,0.3), 0 0 0 3px rgba(234,88,12,0.25)`
              : `0 2px 12px rgba(0,0,0,0.08)`,
            padding: isRoot ? '14px' : '10px',
          }}
        >
          {/* Header row */}
          <div className="flex items-center gap-2 mb-2">
            {/* Avatar */}
            <div
              className="rounded-full flex items-center justify-center shrink-0 font-black text-white text-xs"
              style={{
                width: isRoot ? 36 : 28,
                height: isRoot ? 36 : 28,
                background: isRoot
                  ? 'linear-gradient(135deg, hsl(18,90%,58%), hsl(14,88%,46%))'
                  : meta.ring,
                fontSize: isRoot ? 13 : 10,
              }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="font-bold truncate leading-tight"
                style={{
                  color: isRoot ? '#ffffff' : 'hsl(218,72%,12%)',
                  fontSize: isRoot ? 13 : 11,
                }}
              >
                {node.name.length > 18 ? node.name.slice(0, 16) + '…' : node.name}
              </p>
              <p
                className="font-mono truncate"
                style={{
                  color: isRoot ? 'rgba(255,255,255,0.6)' : 'hsl(218,35%,52%)',
                  fontSize: 9,
                }}
              >
                {node.code}
              </p>
            </div>
            {/* Live dot */}
            <div
              className="rounded-full shrink-0"
              style={{
                width: isRoot ? 9 : 7,
                height: isRoot ? 9 : 7,
                background: meta.dotColor,
                boxShadow: `0 0 6px ${meta.dotColor}88`,
              }}
            />
          </div>

          {/* Status badge */}
          <div
            className="rounded-lg flex items-center gap-1.5 px-2 py-1"
            style={{
              background: isRoot ? 'rgba(255,255,255,0.10)' : meta.badgeBg,
            }}
          >
            <StatusIcon
              style={{
                width: 10,
                height: 10,
                color: isRoot ? 'hsl(18,90%,62%)' : meta.badgeText,
                flexShrink: 0,
              }}
            />
            <span
              className="font-semibold truncate"
              style={{
                fontSize: 9,
                color: isRoot ? 'hsl(18,90%,68%)' : meta.badgeText,
              }}
            >
              {meta.label}
            </span>
          </div>

          {/* Sub-stats for root and level-1 */}
          {(isRoot || isLevel1) && (
            <div
              className="mt-2 flex gap-1"
            >
              <div
                className="flex-1 rounded-lg text-center py-1"
                style={{
                  background: isRoot ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                }}
              >
                <p
                  className="font-black"
                  style={{
                    fontSize: 13,
                    color: isRoot ? '#ffffff' : 'hsl(218,72%,12%)',
                  }}
                >
                  {node.directCount}
                </p>
                <p
                  style={{
                    fontSize: 8,
                    color: isRoot ? 'rgba(255,255,255,0.5)' : 'hsl(218,35%,52%)',
                  }}
                >
                  Directs
                </p>
              </div>
              {isRoot && (
                <div
                  className="flex-1 rounded-lg text-center py-1"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                >
                  <p className="font-black" style={{ fontSize: 13, color: '#ffffff' }}>
                    {node.secondLevelCount}
                  </p>
                  <p style={{ fontSize: 8, color: 'rgba(255,255,255,0.5)' }}>
                    Level 2
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Expand toggle */}
        {hasChildren && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center z-20 transition-all hover:scale-110"
            style={{
              background: isRoot ? 'hsl(18,90%,54%)' : meta.ring,
              color: '#ffffff',
              boxShadow: `0 2px 8px ${meta.ring}66`,
            }}
          >
            {expanded
              ? <ChevronDown style={{ width: 12, height: 12 }} />
              : <ChevronRight style={{ width: 12, height: 12 }} />}
          </button>
        )}
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <div className="flex flex-col items-center">
          {/* Vertical connector from node to branch point */}
          <div
            style={{
              width: 2,
              height: 20,
              background: `linear-gradient(to bottom, ${getMeta(node.status).ring}cc, hsl(215,18%,78%))`,
              borderRadius: 2,
              marginTop: 8,
            }}
          />

          {/* Horizontal branch + children */}
          <div className="flex items-start" style={{ gap: isRoot ? 20 : 12 }}>
            {node.children.map((child, idx) => (
              <div key={child.id} className="flex flex-col items-center">
                {/* Vertical line to child */}
                <div
                  style={{
                    width: 2,
                    height: 20,
                    background: `linear-gradient(to bottom, hsl(215,18%,78%), ${getMeta(child.status).ring}cc)`,
                    borderRadius: 2,
                  }}
                />
                <NodeCard node={child} depth={depth + 1} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function ReferralTree({ rootStudent, allStudents }: Props) {
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => { setAnimKey(k => k + 1); }, [rootStudent.id]);

  const tree = buildTree(rootStudent, allStudents);

  const directCount = rootStudent.directReferrals.length;
  const secondCount = rootStudent.secondLevelReferrals?.length ?? 0;
  const totalNetwork = directCount + secondCount;

  const direct3Done = directCount >= 3;
  const threeByThreeDone = secondCount >= 9;

  return (
    <div className="space-y-4" key={animKey}>
      {/* Network Stats Bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: 'Total Network', val: totalNetwork, max: 12,
            color: '#3b82f6', desc: `${12 - totalNetwork} slots remaining`,
          },
          {
            label: 'Direct Referrals', val: directCount, max: 3,
            color: direct3Done ? '#22c55e' : 'hsl(18,90%,54%)',
            desc: direct3Done ? '✅ Next Course unlocked' : `Need ${3 - directCount} more`,
          },
          {
            label: '3×3 Progress', val: secondCount, max: 9,
            color: threeByThreeDone ? '#22c55e' : '#8b5cf6',
            desc: threeByThreeDone ? '✅ Final Course unlocked' : `${secondCount}/9 second-level`,
          },
        ].map(stat => (
          <div key={stat.label} className="bg-white border border-border rounded-xl p-3">
            <div className="flex items-end justify-between mb-2">
              <span style={{ color: 'hsl(218,35%,48%)' }} className="text-xs font-semibold">{stat.label}</span>
              <span style={{ color: stat.color }} className="text-xl font-black leading-none">
                {stat.val}<span style={{ color: 'hsl(218,35%,60%)' }} className="text-sm font-normal">/{stat.max}</span>
              </span>
            </div>
            <div className="w-full rounded-full h-1.5" style={{ background: 'hsl(215,18%,90%)' }}>
              <div
                className="h-1.5 rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min((stat.val / stat.max) * 100, 100)}%`,
                  background: stat.color,
                }}
              />
            </div>
            <p style={{ color: 'hsl(218,35%,52%)' }} className="text-xs mt-1.5">{stat.desc}</p>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: 'Basic Course', color: '#3b82f6' },
          { label: 'Next Course',  color: '#8b5cf6' },
          { label: 'Final Course', color: '#6366f1' },
          { label: 'Challenge',    color: '#eab308' },
          { label: 'Completed',    color: '#10b981' },
          { label: 'Awarded',      color: '#f97316' },
        ].map(item => (
          <div
            key={item.label}
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
            style={{
              background: '#ffffff',
              border: '1px solid hsl(215,18%,85%)',
            }}
          >
            <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
            <span style={{ color: 'hsl(218,35%,48%)', fontSize: 11 }}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Tree Diagram */}
      <div
        className="rounded-2xl overflow-x-auto"
        style={{
          background: 'linear-gradient(160deg, hsl(218,30%,97%) 0%, hsl(215,25%,94%) 100%)',
          border: '1px solid hsl(215,18%,85%)',
          padding: '32px 24px 40px',
        }}
      >
        {rootStudent.directReferrals.length === 0 ? (
          <div className="py-12 text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(59,130,246,0.1)', border: '2px dashed hsl(215,18%,75%)' }}
            >
              <Users style={{ width: 24, height: 24, color: 'hsl(218,35%,55%)' }} />
            </div>
            <p style={{ color: 'hsl(218,72%,12%)' }} className="font-bold text-base mb-1">
              Your network is empty
            </p>
            <p style={{ color: 'hsl(218,35%,48%)' }} className="text-sm">
              Share your referral code to start building your 3×3 network.
            </p>
          </div>
        ) : (
          <div className="flex justify-center min-w-max mx-auto">
            <NodeCard node={tree} depth={0} />
          </div>
        )}
      </div>

      {/* Unlock Conditions Summary */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div
          className="rounded-xl p-4 flex items-start gap-3"
          style={{
            background: direct3Done ? '#f0fdf4' : '#fffbeb',
            border: `1px solid ${direct3Done ? '#bbf7d0' : '#fde68a'}`,
          }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: direct3Done ? '#dcfce7' : '#fef3c7' }}
          >
            {direct3Done
              ? <CheckCircle style={{ width: 16, height: 16, color: '#16a34a' }} />
              : <Lock style={{ width: 16, height: 16, color: '#d97706' }} />}
          </div>
          <div>
            <p style={{ color: 'hsl(218,72%,12%)' }} className="font-bold text-sm">Next Course</p>
            <p style={{ color: 'hsl(218,35%,45%)' }} className="text-xs mt-0.5">
              {direct3Done
                ? 'Unlocked — you have 3 direct paid referrals'
                : `Locked — need ${3 - directCount} more direct paid referral${3 - directCount !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
        <div
          className="rounded-xl p-4 flex items-start gap-3"
          style={{
            background: threeByThreeDone ? '#f0fdf4' : '#eff6ff',
            border: `1px solid ${threeByThreeDone ? '#bbf7d0' : '#bfdbfe'}`,
          }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: threeByThreeDone ? '#dcfce7' : '#dbeafe' }}
          >
            {threeByThreeDone
              ? <CheckCircle style={{ width: 16, height: 16, color: '#16a34a' }} />
              : <Lock style={{ width: 16, height: 16, color: '#2563eb' }} />}
          </div>
          <div>
            <p style={{ color: 'hsl(218,72%,12%)' }} className="font-bold text-sm">Final Course</p>
            <p style={{ color: 'hsl(218,35%,45%)' }} className="text-xs mt-0.5">
              {threeByThreeDone
                ? 'Unlocked — 3×3 network complete'
                : `Locked — need ${9 - secondCount} more second-level student${9 - secondCount !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
