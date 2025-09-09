import React from 'react';
import './ReportsManagement.css';

interface ReportsManagementProps {
    apiReports: any[];
}

const ReportsManagement: React.FC<ReportsManagementProps> = ({ apiReports }) => {
    return (
        <div className="tab-content">
            <div className="reports-management">
                <h2>Отчеты системы</h2>
                {apiReports.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📊</div>
                        <h3>Отчеты не найдены</h3>
                        <p>Отчеты будут генерироваться автоматически</p>
                    </div>
                ) : (
                    <div className="reports-list">
                        {apiReports.map((report, index) => (
                            <div key={index} className="report-card">
                                <h4>{report.title || `Отчет ${index + 1}`}</h4>
                                <p>{report.description || 'Описание отсутствует'}</p>
                                <small>{report.date || 'Дата не указана'}</small>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportsManagement;
