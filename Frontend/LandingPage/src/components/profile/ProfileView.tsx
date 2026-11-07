import { useState } from 'react';
import { Pencil, User, Mail, GraduationCap, Building2, BookOpen, Clock, CheckCircle, ShieldCheck } from 'lucide-react';
import type { StudentProfile } from '@/types/profile';
import { EditProfileModal } from './EditProfileModal';
import { getInitials } from '@/lib/profile';

type Props = {
  profile: StudentProfile;
  onUpdateProfile: (updated: StudentProfile) => void;
  syllabusCount?: number;
};

export function ProfileView({ profile, onUpdateProfile, syllabusCount = 0 }: Props) {
  const [isEditing, setIsEditing] = useState(false);

  const initials = getInitials(profile.fullName);

  return (
    <div className="catalogue-main" style={{ maxWidth: '820px' }}>
      {/* Eyebrow and Page Heading */}
      <div className="page-eyebrow">STUDENT ACCOUNT</div>
      <h1>Student Profile</h1>
      <p className="page-intro">
        Manage your personal information, academic details, and workspace identity.
      </p>

      {/* ── 1. Profile Header Banner ──────────────────────────── */}
      <div
        className="mt-7 rounded-lg border border-line p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 transition-colors"
        style={{ background: 'var(--surface)' }}
      >
        <div className="flex items-center gap-5">
          {/* Avatar circle */}
          <div className="relative flex-shrink-0">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.fullName}
                className="h-20 w-20 sm:h-22 sm:w-22 rounded-full object-cover border-2 border-line-strong shadow-sm"
              />
            ) : (
              <div
                className="h-20 w-20 sm:h-22 sm:w-22 rounded-full border-2 border-line-strong flex items-center justify-center font-display text-2xl font-bold tracking-wide shadow-sm"
                style={{
                  backgroundColor: 'var(--ws-avatar-bg, #e5c9a4)',
                  color: 'var(--ws-avatar-ink, #293047)',
                }}
              >
                {initials}
              </div>
            )}
          </div>

          {/* Student Header Meta */}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight truncate">
                {profile.fullName || 'Student'}
              </h2>
              {profile.completedOnboarding && (
                <span
                  className="inline-flex items-center gap-1 text-[10px] font-semibold text-done bg-done/10 border border-done/20 px-2 py-0.5 rounded-full"
                  title="Profile completed"
                >
                  <CheckCircle size={11} /> Active
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-ink-secondary mt-1 flex items-center gap-1.5 truncate">
              <Mail size={13} className="flex-shrink-0 text-ink-secondary" />
              <span>{profile.email}</span>
            </p>
            {profile.institute && (
              <p className="text-xs text-ink-secondary mt-1 flex items-center gap-1.5 truncate">
                <Building2 size={13} className="flex-shrink-0 text-ink-secondary" />
                <span>{profile.institute}</span>
              </p>
            )}
          </div>
        </div>

        {/* Edit Profile Action */}
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="primary-button flex-shrink-0 self-stretch sm:self-auto"
        >
          <Pencil size={14} />
          Edit Profile
        </button>
      </div>

      {/* ── 2. Information Cards Grid ──────────────────────────── */}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {/* Personal Information */}
        <div
          className="rounded-lg border border-line p-5 sm:p-6 transition-colors"
          style={{ background: 'var(--surface)' }}
        >
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-line">
            <User size={16} className="text-accent" />
            <h3 className="text-sm font-bold text-ink uppercase tracking-wider">
              Personal Information
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-[10px] font-bold text-ink-secondary uppercase tracking-wider">
                Full Name
              </div>
              <div className="text-[14px] font-medium text-ink mt-0.5">
                {profile.fullName || <span className="text-ink-secondary/60 italic text-xs">Not specified</span>}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-ink-secondary uppercase tracking-wider">
                Email Address
              </div>
              <div className="text-[14px] font-medium text-ink mt-0.5 flex items-center gap-1.5">
                <span>{profile.email}</span>
                <span title="Authentication email verified">
                  <ShieldCheck size={14} className="text-accent" />
                </span>
              </div>
              <div className="text-[10px] text-ink-secondary mt-0.5">
                Managed by your authentication provider.
              </div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-ink-secondary uppercase tracking-wider">
                Institute / School
              </div>
              <div className="text-[14px] font-medium text-ink mt-0.5">
                {profile.institute ? (
                  profile.institute
                ) : (
                  <span className="text-ink-secondary/60 italic text-xs">Not specified</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Academic Information */}
        <div
          className="rounded-lg border border-line p-5 sm:p-6 transition-colors"
          style={{ background: 'var(--surface)' }}
        >
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-line">
            <GraduationCap size={16} className="text-accent" />
            <h3 className="text-sm font-bold text-ink uppercase tracking-wider">
              Academic Information
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-[10px] font-bold text-ink-secondary uppercase tracking-wider">
                Education Level
              </div>
              <div className="text-[14px] font-medium text-ink mt-0.5">
                {profile.educationLevel ? (
                  profile.educationLevel
                ) : (
                  <span className="text-ink-secondary/60 italic text-xs">Not specified</span>
                )}
              </div>
            </div>

            {/* School branch */}
            {profile.educationLevel === 'School' && (
              <div className="pt-1 animate-fade-in">
                <div className="text-[10px] font-bold text-ink-secondary uppercase tracking-wider">
                  Current Class
                </div>
                <div className="text-[14px] font-medium text-ink mt-0.5">
                  {profile.schoolDetails?.currentClass ? (
                    profile.schoolDetails.currentClass
                  ) : (
                    <span className="text-ink-secondary/60 italic text-xs">Not specified</span>
                  )}
                </div>
              </div>
            )}

            {/* College branch */}
            {profile.educationLevel === 'College / University' && (
              <>
                <div className="pt-1 animate-fade-in">
                  <div className="text-[10px] font-bold text-ink-secondary uppercase tracking-wider">
                    Course / Branch
                  </div>
                  <div className="text-[14px] font-medium text-ink mt-0.5">
                    {profile.collegeDetails?.courseOrBranch ? (
                      profile.collegeDetails.courseOrBranch
                    ) : (
                      <span className="text-ink-secondary/60 italic text-xs">Not specified</span>
                    )}
                  </div>
                </div>

                <div className="pt-1 animate-fade-in">
                  <div className="text-[10px] font-bold text-ink-secondary uppercase tracking-wider">
                    Current Semester
                  </div>
                  <div className="text-[14px] font-medium text-ink mt-0.5">
                    {profile.collegeDetails?.currentSemester ? (
                      profile.collegeDetails.currentSemester
                    ) : (
                      <span className="text-ink-secondary/60 italic text-xs">Not specified</span>
                    )}
                  </div>
                </div>
              </>
            )}

            {!profile.educationLevel && (
              <div className="text-xs text-ink-secondary pt-2">
                Select your education level in <em>Edit Profile</em> to add class or semester details.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 3. Workspace Activity & Session Footer ─────────────────── */}
      <div
        className="mt-6 rounded-lg border border-line p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-ink-secondary transition-colors"
        style={{ background: 'var(--surface)' }}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <BookOpen size={14} className="text-accent" />
            <span>
              <strong>{syllabusCount}</strong> {syllabusCount === 1 ? 'syllabus' : 'syllabuses'} active
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={14} className="text-ink-secondary" />
            <span>Last updated {new Date(profile.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="text-[11px] text-ink-secondary/80">
          Saved in local demo storage.
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <EditProfileModal
          profile={profile}
          onSave={(updated) => {
            onUpdateProfile(updated);
          }}
          onClose={() => setIsEditing(false)}
        />
      )}
    </div>
  );
}
