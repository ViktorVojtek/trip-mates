import { useNavigate } from 'react-router-dom';
import TripForm from '../components/TripForm';
import { postTrip } from '../services/api';
import type { TripFormData } from '../types';

export default function PostTrip() {
  const navigate = useNavigate();

  const handleSubmit = async (data: TripFormData) => {
    const trip = await postTrip(data);
    navigate(`/trips/${trip.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Post a Trip</h1>
        <p className="text-gray-500 text-sm mt-1">
          Share your travel plans and find companions
        </p>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <TripForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
