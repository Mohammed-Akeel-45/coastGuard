import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { HAZARD_TYPES } from '../../utils/constants';

const PostReportView = () => {
    const { submitReport } = useApp();
    const [formData, setFormData] = useState({
        text: '',
        type_id: 1,
        latitude: '',
        longitude: '',
        location_name: '',
        media: [],
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const fileInputRef = useRef(null);

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData((prev) => ({
                        ...prev,
                        latitude: position.coords.latitude.toString(),
                        longitude: position.coords.longitude.toString(),
                    }));
                },
                (error) => {
                    alert('Error getting location: ' + error.message);
                }
            );
        } else {
            alert('Geolocation is not supported by your browser');
        }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setFormData((prev) => ({ ...prev, media: files }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSuccess(false);

        const result = await submitReport(formData);

        setIsSubmitting(false);
        if (result.success) {
            setSuccess(true);
            setFormData({
                text: '',
                type_id: 1,
                latitude: '',
                longitude: '',
                location_name: '',
                media: [],
            });
            if (fileInputRef.current) fileInputRef.current.value = '';

            setTimeout(() => setSuccess(false), 5000);
        } else {
            alert(result.message || 'Failed to submit report');
        }
    };

    return (
        <div className="h-full overflow-y-auto bg-gradient-to-br from-gray-900 to-gray-800 p-6">
            <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                    <h2 className="text-3xl font-bold text-white">Report a Hazard</h2>
                    <p className="text-gray-400 mt-2">Help protect our coastline by reporting hazards</p>
                </div>

                {success && (
                    <div className="bg-green-500 bg-opacity-10 border border-green-500 text-green-300 px-4 py-3 rounded-lg mb-6 flex items-center">
                        <span className="mr-2">✓</span>
                        Report submitted successfully!
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6 bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl"
                >
                    <div>
                        <label className="block text-gray-300 font-semibold mb-2">Hazard Type</label>
                        <select
                            value={formData.type_id}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, type_id: parseInt(e.target.value) }))
                            }
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            required
                        >
                            {HAZARD_TYPES.map((type) => (
                                <option key={type.id} value={type.id}>
                                    {type.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-gray-300 font-semibold mb-2">Description</label>
                        <textarea
                            value={formData.text}
                            onChange={(e) => setFormData((prev) => ({ ...prev, text: e.target.value }))}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition h-32 resize-none"
                            placeholder="Describe what you observed in detail..."
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-300 font-semibold mb-2">Latitude</label>
                            <input
                                type="number"
                                step="any"
                                value={formData.latitude}
                                onChange={(e) => setFormData((prev) => ({ ...prev, latitude: e.target.value }))}
                                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                placeholder="12.9716"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-300 font-semibold mb-2">Longitude</label>
                            <input
                                type="number"
                                step="any"
                                value={formData.longitude}
                                onChange={(e) => setFormData((prev) => ({ ...prev, longitude: e.target.value }))}
                                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                placeholder="77.5946"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={getCurrentLocation}
                        className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg transition duration-200 font-medium shadow-lg hover:shadow-xl flex items-center justify-center"
                    >
                        <span className="mr-2"></span>
                        Use My Current Location
                    </button>

                    <div>
                        <label className="block text-gray-300 font-semibold mb-2">
                            Location Name (Optional)
                        </label>
                        <input
                            type="text"
                            value={formData.location_name}
                            onChange={(e) => setFormData((prev) => ({ ...prev, location_name: e.target.value }))}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            placeholder="e.g., Marina Beach"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-300 font-semibold mb-2">
                            Photos/Videos (Optional)
                        </label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*,video/*"
                            onChange={handleFileChange}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:cursor-pointer hover:file:bg-blue-700 file:transition"
                        />
                        {formData.media.length > 0 && (
                            <p className="text-sm text-gray-400 mt-2 flex items-center">
                                <span className="mr-1">📎</span>
                                {formData.media.length} file(s) selected
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-lg transition duration-200 shadow-lg hover:shadow-xl"
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Report'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PostReportView;
