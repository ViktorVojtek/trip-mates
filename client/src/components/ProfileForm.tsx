import { useState, type ChangeEvent } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { updateProfile } from '../services/auth';
import { uploadAvatar } from '../services/api';
import type { User, UpdateProfileFormData } from '../types';
import { createZodResolver } from '../utils/zodResolver';
import AvailabilityCalendar from '../components/AvailabilityCalendar';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  bio: z.string().optional(),
  familySize: z.coerce.number().min(1, 'At least 1').max(20, 'Max 20'),
  childrenAges: z.string().optional(),
  travelPreferences: z.string().optional(),
  availability: z.string().optional(),
  profilePicture: z.string().optional(),
});

interface ProfileFormProps {
  user: User;
  onSave: () => Promise<void>;
}

export default function ProfileForm({ user, onSave }: ProfileFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProfileFormData>({
    resolver: createZodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      bio: user.bio ?? '',
      familySize: user.familySize,
      childrenAges: user.childrenAges ?? '',
      travelPreferences: user.travelPreferences ?? '',
      availability: user.availability ?? '',
      profilePicture: user.profilePicture ?? '',
    },
  });

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const updated = await uploadAvatar(file);
      if (updated.profilePicture) {
        setValue('profilePicture', updated.profilePicture, { shouldDirty: true });
      }
    } catch {
      setUploadError('Upload failed. Please try a different image.');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: UpdateProfileFormData) => {
    await updateProfile(data);
    await onSave();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4"
    >
      <h2 className="text-lg font-semibold text-gray-800">Edit Profile</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <input
          {...register('name')}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture URL</label>
        <input
          {...register('profilePicture')}
          type="url"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          placeholder="https://example.com/photo.jpg"
        />
        <div className="mt-2">
          <label className="block text-xs text-gray-500 mb-1">…or upload an image</label>
          <input
            type="file"
            accept="image/*"
            aria-label="Upload profile picture"
            onChange={(e) => void handleFile(e)}
            disabled={uploading}
            className="block w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {uploading && <p className="text-xs text-gray-400 mt-1">Uploading…</p>}
          {uploadError && <p className="text-red-500 text-xs mt-1">{uploadError}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
        <textarea
          {...register('bio')}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
          placeholder="Tell other travelers about yourself..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Family Size</label>
          <input
            {...register('familySize')}
            type="number"
            min={1}
            max={20}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          {errors.familySize && (
            <p className="text-red-500 text-xs mt-1">{errors.familySize.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Children&apos;s Ages
          </label>
          <input
            {...register('childrenAges')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="e.g. 5, 8, 12"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Travel Preferences{' '}
          <span className="text-gray-400 font-normal">(comma-separated)</span>
        </label>
        <input
          {...register('travelPreferences')}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          placeholder="hiking, beaches, museums, food tours..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
        <Controller
          name="availability"
          control={control}
          render={({ field }) => (
            <AvailabilityCalendar
              value={field.value ? field.value.split(',').filter(Boolean) : []}
              onChange={(dates) => field.onChange(dates.join(','))}
            />
          )}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 text-sm"
      >
        {isSubmitting ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
}
