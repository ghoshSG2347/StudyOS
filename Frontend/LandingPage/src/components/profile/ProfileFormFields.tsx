import { useRef, useState } from 'react';
import { Camera, Trash2, AlertCircle, Loader2, Check } from 'lucide-react';
import type { ProfileFormData, EducationLevel } from '@/types/profile';
import { getInitials, compressAndResizeImage } from '@/lib/profile';

type Props = {
  data: ProfileFormData;
  onChange: (updater: (prev: ProfileFormData) => ProfileFormData) => void;
  nameError?: string | null;
  onClearNameError?: () => void;
  disabled?: boolean;
};

export function ProfileFormFields({
  data,
  onChange,
  nameError,
  onClearNameError,
  disabled = false,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const initials = getInitials(data.fullName);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarError(null);
    setUploading(true);

    try {
      const compressedDataUrl = await compressAndResizeImage(file, 256, 256, 0.82);
      onChange((prev) => ({ ...prev, avatarUrl: compressedDataUrl }));
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : 'Could not process this image.');
    } finally {
      setUploading(false);
      // Reset input value so re-selecting the same file works
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarError(null);
    onChange((prev) => ({ ...prev, avatarUrl: undefined }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleEducationLevelChange = (level: string) => {
    const nextLevel = level as EducationLevel | '';
    onChange((prev) => {
      // Clear out opposite academic branch when level changes to avoid stale fields
      if (nextLevel === 'School') {
        return {
          ...prev,
          educationLevel: nextLevel,
          courseOrBranch: '',
          currentSemester: '',
        };
      }
      if (nextLevel === 'College / University') {
        return {
          ...prev,
          educationLevel: nextLevel,
          currentClass: '',
        };
      }
      return {
        ...prev,
        educationLevel: '',
        currentClass: '',
        courseOrBranch: '',
        currentSemester: '',
      };
    });
  };

  return (
    <div className="space-y-5 text-left">
      {/* 1. Profile Picture Uploader */}
      <div>
        <label className="block text-sm font-medium text-ink-800 mb-2">
          Profile Picture <span className="text-xs font-normal text-ink-500">(Optional)</span>
        </label>
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0">
            {data.avatarUrl ? (
              <img
                src={data.avatarUrl}
                alt={data.fullName || 'Student profile'}
                className="h-16 w-16 sm:h-18 sm:w-18 rounded-full object-cover border-2 border-line-strong shadow-sm"
              />
            ) : (
              <div
                className="h-16 w-16 sm:h-18 sm:w-18 rounded-full border-2 border-line-strong flex items-center justify-center font-display text-xl font-semibold tracking-wide shadow-sm"
                style={{
                  backgroundColor: 'var(--ws-avatar-bg, #e5c9a4)',
                  color: 'var(--ws-avatar-ink, #293047)',
                }}
                aria-label={`Initials: ${initials}`}
              >
                {initials}
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                <Loader2 className="h-5 w-5 text-white animate-spin" />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                disabled={disabled || uploading}
                onChange={handleImageSelect}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || uploading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-line-strong bg-paper-50 text-ink-800 hover:bg-paper-100 transition focus-ring disabled:opacity-60"
              >
                <Camera className="h-3.5 w-3.5 text-ink-500" />
                {data.avatarUrl ? 'Change picture' : 'Upload photo'}
              </button>

              {data.avatarUrl && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  disabled={disabled || uploading}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md border border-line text-rose-600 hover:bg-rose-50/50 transition focus-ring disabled:opacity-60"
                  title="Remove picture"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </button>
              )}
            </div>
            <p className="text-[11px] text-ink-500">
              {data.avatarUrl
                ? 'Image will be displayed in your workspace avatar.'
                : 'Initials are used if no photo is uploaded.'}
            </p>
          </div>
        </div>
        {avatarError && (
          <p className="mt-2 text-xs text-rose-600 flex items-center gap-1 animate-fade-in" role="alert">
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
            {avatarError}
          </p>
        )}
      </div>

      {/* 2. Full Name (Required) */}
      <div>
        <label htmlFor="profile-full-name" className="block text-sm font-medium text-ink-800 mb-1.5">
          Full Name <span className="text-rose-500">*</span>
        </label>
        <input
          id="profile-full-name"
          type="text"
          autoComplete="name"
          required
          value={data.fullName}
          onChange={(e) => {
            const val = e.target.value;
            onChange((prev) => ({ ...prev, fullName: val }));
            if (nameError && onClearNameError) onClearNameError();
          }}
          disabled={disabled}
          placeholder="e.g. Alex Chen"
          aria-invalid={!!nameError || undefined}
          aria-describedby={nameError ? 'profile-name-error' : undefined}
          className={[
            'w-full rounded-md border bg-paper-50 px-3 py-2 text-[14px] sm:text-[15px] text-ink-900 placeholder:text-ink-400 transition duration-150 focus:outline-none',
            nameError
              ? 'border-rose-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-200'
              : 'border-line-strong field-focus',
            'disabled:opacity-60 disabled:cursor-not-allowed',
          ].join(' ')}
        />
        {nameError && (
          <p id="profile-name-error" className="mt-1.5 text-xs text-rose-600 flex items-center gap-1 animate-fade-in" role="alert">
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
            {nameError}
          </p>
        )}
      </div>

      {/* 3. Email Address (Read-only from authentication) */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="profile-email" className="block text-sm font-medium text-ink-800">
            Email Address
          </label>
          <span className="text-[11px] text-ink-500 bg-paper-200/60 px-2 py-0.5 rounded">
            From authentication · Read only
          </span>
        </div>
        <input
          id="profile-email"
          type="email"
          readOnly
          disabled
          value={data.email}
          className="w-full rounded-md border border-line bg-paper-200/50 px-3 py-2 text-[14px] text-ink-600 cursor-not-allowed select-none"
        />
        <p className="mt-1 text-[11px] text-ink-500">
          This address is linked to your StudyOS login account and cannot be modified here.
        </p>
      </div>

      {/* 4. Institute / School (Optional) */}
      <div>
        <label htmlFor="profile-institute" className="block text-sm font-medium text-ink-800 mb-1.5">
          Institute / School <span className="text-xs font-normal text-ink-500">(Optional)</span>
        </label>
        <input
          id="profile-institute"
          type="text"
          value={data.institute}
          onChange={(e) => {
            const val = e.target.value;
            onChange((prev) => ({ ...prev, institute: val }));
          }}
          disabled={disabled}
          placeholder="e.g. Stanford University or Lincoln High School"
          className="w-full rounded-md border border-line-strong bg-paper-50 px-3 py-2 text-[14px] sm:text-[15px] text-ink-900 placeholder:text-ink-400 transition duration-150 field-focus focus:outline-none disabled:opacity-60"
        />
      </div>

      {/* 5. Education Level (Optional Selector) */}
      <div>
        <label htmlFor="profile-education-level" className="block text-sm font-medium text-ink-800 mb-1.5">
          Education Level <span className="text-xs font-normal text-ink-500">(Optional)</span>
        </label>
        <div className="relative">
          <select
            id="profile-education-level"
            value={data.educationLevel}
            onChange={(e) => handleEducationLevelChange(e.target.value)}
            disabled={disabled}
            className="w-full rounded-md border border-line-strong bg-paper-50 px-3 py-2 text-[14px] sm:text-[15px] text-ink-900 transition duration-150 field-focus focus:outline-none appearance-none cursor-pointer disabled:opacity-60"
          >
            <option value="">Select education level...</option>
            <option value="School">School</option>
            <option value="College / University">College / University</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-ink-500">
            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>
      </div>

      {/* 6. Conditional Academic Fields */}
      {data.educationLevel === 'School' && (
        <div className="rounded-md border border-line bg-paper-100/60 p-4 space-y-3 animate-fade-in">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-accent uppercase tracking-wider">
            <span>School Details</span>
          </div>

          <div>
            <label htmlFor="profile-school-class" className="block text-sm font-medium text-ink-800 mb-1">
              Current Class <span className="text-xs font-normal text-ink-500">(Optional)</span>
            </label>
            <input
              id="profile-school-class"
              type="text"
              value={data.currentClass}
              onChange={(e) => {
                const val = e.target.value;
                onChange((prev) => ({ ...prev, currentClass: val }));
              }}
              disabled={disabled}
              placeholder="e.g. Class 10, Class 12, Grade 11"
              className="w-full rounded-md border border-line-strong bg-paper-50 px-3 py-2 text-[14px] text-ink-900 placeholder:text-ink-400 field-focus focus:outline-none"
            />
          </div>
        </div>
      )}

      {data.educationLevel === 'College / University' && (
        <div className="rounded-md border border-line bg-paper-100/60 p-4 space-y-4 animate-fade-in">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-accent uppercase tracking-wider">
            <span>College / University Details</span>
          </div>

          <div>
            <label htmlFor="profile-course-branch" className="block text-sm font-medium text-ink-800 mb-1">
              Course / Branch <span className="text-xs font-normal text-ink-500">(Optional)</span>
            </label>
            <input
              id="profile-course-branch"
              type="text"
              value={data.courseOrBranch}
              onChange={(e) => {
                const val = e.target.value;
                onChange((prev) => ({ ...prev, courseOrBranch: val }));
              }}
              disabled={disabled}
              placeholder="e.g. B.Tech Computer Science, B.Sc Mathematics, MBBS"
              className="w-full rounded-md border border-line-strong bg-paper-50 px-3 py-2 text-[14px] text-ink-900 placeholder:text-ink-400 field-focus focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="profile-semester" className="block text-sm font-medium text-ink-800 mb-1">
              Current Semester <span className="text-xs font-normal text-ink-500">(Optional)</span>
            </label>
            <input
              id="profile-semester"
              type="text"
              value={data.currentSemester}
              onChange={(e) => {
                const val = e.target.value;
                onChange((prev) => ({ ...prev, currentSemester: val }));
              }}
              disabled={disabled}
              placeholder="e.g. 3rd Semester, Year 2, Semester 5"
              className="w-full rounded-md border border-line-strong bg-paper-50 px-3 py-2 text-[14px] text-ink-900 placeholder:text-ink-400 field-focus focus:outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}

