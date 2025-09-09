import React, { useState, useEffect } from 'react';
import { getReports, createReport, updateReport, deleteReport } from '../api';
import './ReportsManagement.css';

interface Report {
    id: string;
    title: string;
    type: string;
    status: string;
    content: string;
    author: string;
    createdAt: string;
    updatedAt: string;
}

const ReportsManagement: React.FC = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showContent, setShowContent] = useState<string | null>(null);
    const [editingReport, setEditingReport] = useState<Report | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        type: 'bug',
        status: 'open',
        content: '',
        author: ''
    });

    useEffect(() => {
        loadReports();
    }, []);

    const loadReports = async () => {
        try {
            setLoading(true);
            const response = await getReports();
            setReports(response.data);
        } catch (error) {
            console.error('Ошибка загрузки отчетов:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingReport) {
                await updateReport(editingReport.id, formData);
            } else {
                await createReport(formData);
            }
            setFormData({ title: '', type: 'bug', status: 'open', content: '', author: '' });
            setShowForm(false);
            setEditingReport(null);
            loadReports();
        } catch (error) {
            console.error('Ошибка сохранения отчета:', error);
        }
    };

    const handleEdit = (report: Report) => {
        setEditingReport(report);
        setFormData({
            title: report.title,
            type: report.type,
            status: report.status,
            content: report.content,
            author: report.author
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Удалить отчет?')) {
            try {
                await deleteReport(id);
                loadReports();
            } catch (error) {
                console.error('Ошибка удаления отчета:', error);
            }
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return '#ffc107';
            case 'in-progress': return '#17a2b8';
            case 'resolved': return '#28a745';
            case 'closed': return '#6c757d';
            default: return '#6c757d';
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'bug': return '#dc3545';
            case 'feature': return '#007bff';
            case 'improvement': return '#28a745';
            case 'question': return '#6f42c1';
            default: return '#6c757d';
        }
    };

    if (loading) {
        return <div className="loading">Загрузка отчетов...</div>;
    }

    return (
        <div className="reports-management">
            <div className="reports-header">
                <h2>Управление отчетами</h2>
                <button
                    className="add-btn"
                    onClick={() => setShowForm(true)}
                >
                    Создать отчет
                </button>
            </div>

            {showForm && (
                <div className="modal">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{editingReport ? 'Редактировать' : 'Создать'} отчет</h3>
                            <button
                                className="close-btn"
                                onClick={() => {
                                    setShowForm(false);
                                    setEditingReport(null);
                                    setFormData({ title: '', type: 'bug', status: 'open', content: '', author: '' });
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Заголовок:</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Тип:</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                                    >
                                        <option value="bug">Ошибка</option>
                                        <option value="feature">Функция</option>
                                        <option value="improvement">Улучшение</option>
                                        <option value="question">Вопрос</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Статус:</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                                    >
                                        <option value="open">Открыт</option>
                                        <option value="in-progress">В работе</option>
                                        <option value="resolved">Решен</option>
                                        <option value="closed">Закрыт</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Автор:</label>
                                <input
                                    type="text"
                                    value={formData.author}
                                    onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Содержание:</label>
                                <textarea
                                    value={formData.content}
                                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                                    rows={6}
                                    required
                                />
                            </div>

                            <div className="form-actions">
                                <button type="submit">
                                    {editingReport ? 'Обновить' : 'Создать'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingReport(null);
                                    }}
                                >
                                    Отмена
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showContent && (
                <div className="modal">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Содержание отчета</h3>
                            <button
                                className="close-btn"
                                onClick={() => setShowContent(null)}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="modal-body">
                            <pre className="report-content">{showContent}</pre>
                        </div>
                    </div>
                </div>
            )}

            <div className="reports-list">
                {reports.length === 0 ? (
                    <div className="no-reports">Отчеты не найдены</div>
                ) : (
                    <div className="reports-grid">
                        {reports.map(report => (
                            <div key={report.id} className="report-card">
                                <div className="report-header">
                                    <h3 className="report-title">{report.title}</h3>
                                    <div className="report-meta">
                                        <span
                                            className="report-type"
                                            style={{ backgroundColor: getTypeColor(report.type) }}
                                        >
                                            {report.type}
                                        </span>
                                        <span
                                            className="report-status"
                                            style={{ backgroundColor: getStatusColor(report.status) }}
                                        >
                                            {report.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="report-info">
                                    <p><strong>Автор:</strong> {report.author}</p>
                                    <p><strong>Создан:</strong> {new Date(report.createdAt).toLocaleDateString()}</p>
                                    <p><strong>Обновлен:</strong> {new Date(report.updatedAt).toLocaleDateString()}</p>
                                </div>

                                <div className="report-content-preview">
                                    {report.content.length > 100
                                        ? `${report.content.substring(0, 100)}...`
                                        : report.content
                                    }
                                </div>

                                <div className="report-actions">
                                    <button
                                        className="view-btn"
                                        onClick={() => setShowContent(report.content)}
                                    >
                                        👁️ Просмотр
                                    </button>
                                    <button
                                        className="edit-btn"
                                        onClick={() => handleEdit(report)}
                                    >
                                        ✏️ Редактировать
                                    </button>
                                    <button
                                        className="delete-btn"
                                        onClick={() => handleDelete(report.id)}
                                    >
                                        🗑️ Удалить
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportsManagement;
