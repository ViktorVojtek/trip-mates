import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { TripFormData } from '../types';
import { createZodResolver } from '../utils/zodResolver';

const tripSchema = z
  .object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().min(20, 'Please write at least 20 characters'),
    destination: z.string().min(2, 'Destination is required'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    groupType: z.string().min(1, 'Please select a group type'),
    activityPref: z.string().optional(),
    budget: z.coerce.number().min(0, 'Budget must be 0 or more').optional(),
  })
  .refine((data) => !data.startDate || !data.endDate || data.endDate >= data.startDate, {
    message: 'End date must be on or after start date',
    path: ['endDate'],
  });

interface TripFormProps {
  onSubmit: (data: TripFormData) => Promise<void>;
  defaultValues?: Partial<TripFormData>;
}

export default function TripForm({ onSubmit, defaultValues }: TripFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TripFormData>({
    resolver: createZodResolver(tripSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Trip Title</label>
        <input
          {...register('title')}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          placeholder="Summer Europe Family Adventure"
        />
        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
        <input
          {...register('destination')}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          placeholder="Paris, France"
        />
        {errors.destination && (
          <p className="text-red-500 text-xs mt-1">{errors.destination.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          {...register('description')}
          rows={4}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
          placeholder="Tell us about your trip plans, what you hope to do, and what kind of companions you're looking for..."
        />
        {errors.description && (
          <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input
            {...register('startDate')}
            type="date"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          {errors.startDate && (
            <p className="text-red-500 text-xs mt-1">{errors.startDate.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
          <input
            {...register('endDate')}
            type="date"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          {errors.endDate && (
            <p className="text-red-500 text-xs mt-1">{errors.endDate.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Group Type</label>
        <select
          {...register('groupType')}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
        >
          <option value="">Select group type</option>
          <option value="family">Families</option>
          <option value="couples">Couples</option>
          <option value="solo">Solo Travelers</option>
          <option value="friends">Friends Group</option>
          <option value="mixed">Mixed Group</option>
        </select>
        {errors.groupType && (
          <p className="text-red-500 text-xs mt-1">{errors.groupType.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Activities{' '}
          <span className="text-gray-400 font-normal">(optional, comma-separated)</span>
        </label>
        <input
          {...register('activityPref')}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          placeholder="hiking, museums, beaches, food tours..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Budget (per person)</label>
        <input
          {...register('budget')}
          type="number"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          placeholder="1000"
        />
        {errors.budget && <p className="text-red-500 text-xs mt-1">{errors.budget.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 text-sm"
      >
        {isSubmitting ? 'Posting...' : 'Post Trip'}
      </button>
    </form>
  );
}
