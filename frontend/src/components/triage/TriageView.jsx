import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ApiService } from '../../services/api';

const TriageView = () => {
    const { reports, token } = useApp();
    const [selectedReport, setSelectedReport] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const unverifiedReports = reports.filter((r) => r.status_id === 1);

    const handleVerify = async (reportId) => {
        setIsProcessing(true);
        try {
            const response = await ApiService.verifyReport(token, reportId);
            if (response.ok) {
                alert('Report verified successfully');
                setSelectedReport(null);
                window.location.reload();
            } else {
                alert('Failed to verify report');
            }
        } catch (error) {
            alert('Error verifying report');
        }
        setIsProcessing(false);
    };

    const handleDebunk = async (reportId) => {
        setIsProcessing(true);
        try {
            const response = await ApiService.debunkReport(token, reportId);
            if (response.ok) {
                alert('Report marked as debunked');
                setSelectedReport(null);
                window.location.reload();
            } else {
                alert('Failed to debunk report');
            }
        } catch (error) {
            alert('Error debunking report');
        }
        setIsProcessing(false);
    };

    return (
        <div className="h-full overflow-y-auto bg-gray-900 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6">
                    <h2 className="text-3xl font-bold text-white">Report Triage</h2>
                    <p className="text-gray-400 mt-2">
                        <span className="bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
                            {unverifiedReports.length}
                        </span>
                        <span className="ml-2">reports awaiting verification</span>
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-white flex items-center">
                            <span className="mr-2">⏳</span>
                            Pending Reports
                        </h3>
                        <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                            {unverifiedReports.length === 0 ? (
                                <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
                                    <p className="text-gray-400">No pending reports</p>
                                </div>
                            ) : (
                                unverifiedReports.map((report) => (
                                    <div
                                        key={report.report_id}
                                        onClick={() => setSelectedReport(report)}
                                        className={`bg-gray-800 rounded-lg p-4 border cursor-pointer transition hover:shadow-lg ${selectedReport?.report_id === report.report_id
                                            ? 'border-blue-500 shadow-blue-500/50 shadow-lg'
                                            : 'border-gray-700 hover:border-gray-600'
                                            }`}
                                    >
                                        <h4 className="font-semibold text-white">{report.type_name}</h4>
                                        <p className="text-sm text-gray-400">
                                            {new Date(report.report_time).toLocaleString()}
                                        </p>
                                        <p className="text-gray-300 mt-2 line-clamp-2">{report.description}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="sticky top-6">
                        {selectedReport ? (
                            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl">
                                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                                    <span className="mr-2">🔍</span>
                                    Report Details
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm text-gray-400 font-medium">Type</label>
                                        <p className="text-white font-semibold">{selectedReport.type_name}</p>
                                    </div>

                                    <div>
                                        <label className="text-sm text-gray-400 font-medium">Time</label>
                                        <p className="text-white">
                                            {new Date(selectedReport.report_time).toLocaleString()}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="text-sm text-gray-400 font-medium">Description</label>
                                        <p className="text-white">
                                            {selectedReport.description || 'No description provided'}
                                        </p>
                                    </div>

                                    {selectedReport.location_name && (
                                        <div>
                                            <label className="text-sm text-gray-400 font-medium">Location</label>
                                            <p className="text-white flex items-center">
                                                <span className="mr-1">📍</span>
                                                {selectedReport.location_name}
                                            </p>
                                        </div>
                                    )}

                                    {selectedReport.relevance_score && (
                                        <div>
                                            <label className="text-sm text-gray-400 font-medium">
                                                AI Relevance Score
                                            </label>
                                            <p className="text-white">{selectedReport.relevance_score}%</p>
                                        </div>
                                    )}

                                    {selectedReport.media_urls && selectedReport.media_urls.length > 0 && (
                                        <div>
                                            <label className="text-sm text-gray-400 font-medium block mb-2">Media</label>
                                            <div className="grid grid-cols-1 gap-2">
                                                {selectedReport.media_urls.map((url, idx) => (
                                                    <img
                                                        key={idx}
                                                        src={url}
                                                        alt="Report media"
                                                        className="w-full rounded-lg shadow-md"
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-4 space-y-3">
                                        <button
                                            onClick={() => handleVerify(selectedReport.report_id)}
                                            disabled={isProcessing}
                                            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
                                        >
                                            <span className="mr-2">✓</span>
                                            VERIFY REPORT
                                        </button>
                                        <button
                                            onClick={() => handleDebunk(selectedReport.report_id)}
                                            disabled={isProcessing}
                                            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
                                        >
                                            <span className="mr-2">✗</span>
                                            DEBUNK REPORT
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-800 rounded-xl p-12 text-center border border-gray-700 shadow-xl">
                                <div className="text-6xl mb-4">👈</div>
                                <p className="text-gray-400 text-lg">Select a report to review</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TriageView;
