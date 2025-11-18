import React from 'react';
import { STATUS_BADGE_COLORS } from '../../utils/constants';

const ReportCard = ({ report }) => {
    return (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 hover:shadow-xl transition-all">
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <h3 className="font-semibold text-white text-lg mb-1">
                        {report.type_name || 'Hazard Report'}
                    </h3>
                    <p className="text-sm text-gray-400">
                        {new Date(report.report_time).toLocaleString()}
                    </p>
                </div>
                <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${STATUS_BADGE_COLORS[report.status_id]
                        } shadow-lg`}
                >
                    {report.status_name}
                </span>
            </div>

            {report.description && (
                <p className="text-gray-300 mb-4 leading-relaxed">{report.description}</p>
            )}

            {report.media_urls && report.media_urls.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-4">
                    {report.media_urls.map((url, idx) => (
                        <img
                            key={idx}
                            src={url}
                            alt="Report media"
                            className="w-full h-48 object-cover rounded-lg shadow-md"
                        />
                    ))}
                </div>
            )}

            {report.location_name && (
                <p className="text-sm text-gray-400 flex items-center">
                    <span className="mr-1"></span>
                    {report.location_name}
                </p>
            )}
        </div>
    );
};

export default ReportCard;
