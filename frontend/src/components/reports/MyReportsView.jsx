import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import ReportCard from './ReportCard';

const MyReportsView = () => {
    const { myReports, fetchMyReports } = useApp();

    useEffect(() => {
        fetchMyReports();
    }, [fetchMyReports]);

    return (
        <div className="h-full overflow-y-auto bg-gray-900 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <h2 className="text-3xl font-bold text-white">My Reports</h2>
                    <p className="text-gray-400 mt-2">Track the status of your submitted reports</p>
                </div>

                {myReports.length === 0 ? (
                    <div className="bg-gray-800 rounded-xl p-12 text-center border border-gray-700 shadow-xl">
                        <div className="text-6xl mb-4"></div>
                        <p className="text-gray-400 text-lg">You haven't submitted any reports yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {myReports.map((report) => (
                            <ReportCard key={report.report_id} report={report} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyReportsView;
