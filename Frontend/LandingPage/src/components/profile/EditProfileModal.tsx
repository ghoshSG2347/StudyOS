import { useState } from 'react';
import { X, Check } from 'lucide-react';
import type { StudentProfile, ProfileFormData } from '@/types/profile';
import { ProfileFormFields } from './ProfileFormFields';
import { profileToFormData, formDataToProfile } from '@/lib/profile';

type Props = {
  profile: StudentProfile;
  onSave: (updated: StudentProfile) => void;
  onClose: () => void;
};

export function EditProfileModal({ profile, onSave, onClose }: Props) {
  const [formData, setFormData] = useState<ProfileFormData>(() => profileToFormData(profile));
  const [nameError, setNameError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      setNameError('Full name is required.');
      return;
    }

    setIsSaving(true);
    try {
      const updated = formDataToProfile(formData, profile, true);
      onSave(updated);
      onClose();
    } catch (err) {
      console.error('Failed to save profile changes:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-profile-modal-title"
        style={{ width: 'min(540px, 100%)', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div className="modal-heading mb-4">
          <h2 id="edit-profile-modal-title" className="text-[17px] font-bold text-ink">
            Edit Student Profile
          </h2>
          <button
            type="button"
            className="icon-button"
            aria-label="Close dialog"
            onClick={onClose}
          >
            <X size={17} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <ProfileFormFields
            data={formData}
            onChange={setFormData}
            nameError={nameError}
            onClearNameError={() => setNameError(null)}
            disabled={isSaving}
          />

          <div className="modal-actions mt-6 pt-4 border-t border-line flex justify-end gap-3">
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="primary-button"
              disabled={isSaving}
            >
              <Check size={15} />
              {isSaving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

