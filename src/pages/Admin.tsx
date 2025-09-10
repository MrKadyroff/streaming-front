import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { BannerData } from '../components/PromoBanner';
import { Match } from '../types';
import {
    createMatch,
    updateMatch as apiUpdateMatch,
    deleteMatch as apiDeleteMatch,
    CreateMatchDto
} from '../api';
import AdminHeader from '../components/admin/AdminHeader';
import AdminTabs, { AdminTab } from '../components/admin/AdminTabs';
import AdminDashboard from '../components/admin/AdminDashboard';
import MatchesManagement from '../components/admin/MatchesManagement';
import AdsManagement from '../components/admin/AdsManagement';
import UsersManagement from '../components/admin/UsersManagement';
import ReportsManagement from '../components/admin/ReportsManagement';
import HlsManagement from '../components/admin/HlsManagement';
import AdForm from '../components/admin/AdForm';
import MatchModal from '../components/MatchModal';
import { useAdminData } from '../components/admin/useAdminData';
import './Admin.css';

const Admin: React.FC = () => {
    const { matches, addMatch, updateMatch, deleteMatch } = useData();
    const { logout } = useAuth();
    const navigate = useNavigate();

    // Используем наш кастомный хук для управления данными
    const {
        serverHealth,
        apiUsers,
        apiReports,
        hlsStreams,
        allAds,
        filteredAds,
        adsFilter,
        adsSort,
        adsLoading,
        setAdsFilter,
        setAdsSort,
        handleDeleteAd,
        handleToggleAd,
        createAdFromForm
    } = useAdminData();

    // Локальное состояние для UI
    const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
    const [showAdForm, setShowAdForm] = useState(false);
    const [showMatchModal, setShowMatchModal] = useState(false);
    const [editingAd, setEditingAd] = useState<BannerData | null>(null);
    const [editingMatch, setEditingMatch] = useState<Match | null>(null);

    // Состояние формы рекламы
    const [formData, setFormData] = useState({
        title: '',
        imageUrl: '',
        gifUrl: '',
        clickUrl: '',
        type: 'vertical' as 'vertical' | 'square' | 'horizontal',
    });

    // Обработчики событий
    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleOpenAdForm = () => {
        setEditingAd(null);
        setFormData({ title: '', imageUrl: '', gifUrl: '', clickUrl: '', type: 'vertical' });
        setShowAdForm(true);
    };

    const handleCloseAdForm = () => {
        setShowAdForm(false);
        setEditingAd(null);
        setFormData({ title: '', imageUrl: '', gifUrl: '', clickUrl: '', type: 'vertical' });
    };

    const handleEditAd = (banner: BannerData) => {
        setEditingAd(banner);
        setShowAdForm(true);
    }; const handleFormDataChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmitAd = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createAdFromForm(formData, editingAd);
            handleCloseAdForm();
        } catch (error) {
            // Ошибка уже обработана в хуке
        }
    };

    const handleOpenMatchModal = () => {
        setEditingMatch(null);
        setShowMatchModal(true);
    };

    const handleEditMatch = (match: Match) => {
        setEditingMatch(match);
        setShowMatchModal(true);
    };

    const handleDeleteMatch = async (id: string) => {
        if (window.confirm('Вы уверены, что хотите удалить этот матч?')) {
            try {
                await apiDeleteMatch(id);
                deleteMatch(id);
            } catch (error) {
                console.error('Ошибка при удалении матча:', error);
            }
        }
    };

    const handleMatchSubmit = async (matchData: Omit<Match, 'id'>) => {
        try {
            const dto: CreateMatchDto = {
                homeTeam: typeof matchData.homeTeam === 'string' ? matchData.homeTeam : matchData.homeTeam?.name || matchData.player1,
                awayTeam: typeof matchData.awayTeam === 'string' ? matchData.awayTeam : matchData.awayTeam?.name || matchData.player2,
                date: matchData.date || new Date().toISOString(),
                time: matchData.time || '00:00',
                tournament: matchData.tournament || '',
                sport: matchData.sport || 'football',
                venue: matchData.venue || '',
                status: matchData.status || 'upcoming'
            };

            if (editingMatch) {
                await apiUpdateMatch(editingMatch.id, dto);
                updateMatch(editingMatch.id, matchData);
            } else {
                await createMatch(dto);
                addMatch(matchData);
            }
            setShowMatchModal(false);
            setEditingMatch(null);
        } catch (error) {
            console.error('Ошибка при сохранении матча:', error);
        }
    };

    const handleUpdateMatch = (id: string, updates: Partial<Match>) => {
        // Получаем полные данные матча для обновления
        const existingMatch = matches.find(m => m.id === id);
        if (existingMatch) {
            const fullUpdates = { ...existingMatch, ...updates };
            updateMatch(id, fullUpdates);
        }
    };

    // Рендер контента в зависимости от активной вкладки
    const renderTabContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return (
                    <AdminDashboard
                        serverHealth={serverHealth}
                        matches={matches}
                        apiUsers={apiUsers}
                        apiReports={apiReports}
                        hlsStreams={hlsStreams}
                        allAds={allAds}
                        onOpenMatchModal={handleOpenMatchModal}
                        onOpenAdForm={handleOpenAdForm}
                    />
                );
            case 'matches':
                return (
                    <MatchesManagement
                        matches={matches}
                        onAddMatch={handleOpenMatchModal}
                        onEditMatch={handleEditMatch}
                        onDeleteMatch={handleDeleteMatch}
                        onUpdateMatch={handleUpdateMatch}
                    />
                );
            case 'ads':
                return (
                    <AdsManagement
                        allAds={allAds}
                        filteredAds={filteredAds}
                        adsFilter={adsFilter}
                        adsSort={adsSort}
                        adsLoading={adsLoading}
                        onAddAd={handleOpenAdForm}
                        onEditAd={handleEditAd}
                        onDeleteAd={handleDeleteAd}
                        onToggleAd={handleToggleAd}
                        onFilterChange={setAdsFilter}
                        onSortChange={setAdsSort}
                    />
                );
            case 'users':
                return <UsersManagement apiUsers={apiUsers} />;
            case 'reports':
                return <ReportsManagement apiReports={apiReports} />;
            case 'hls':
                return <HlsManagement hlsStreams={hlsStreams} />;
            default:
                return null;
        }
    };

    return (
        <div className="admin-page">
            <AdminHeader onLogout={handleLogout} />

            <main className="admin-content">
                <AdminTabs
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />

                {renderTabContent()}

                {/* Модальные окна */}
                <MatchModal
                    isOpen={showMatchModal}
                    onClose={() => {
                        setShowMatchModal(false);
                        setEditingMatch(null);
                    }}
                    onSubmit={handleMatchSubmit}
                    editMatch={editingMatch}
                />

                <AdForm
                    isOpen={showAdForm}
                    editingAd={editingAd}
                    formData={formData}
                    isLoading={adsLoading}
                    onClose={handleCloseAdForm}
                    onSubmit={handleSubmitAd}
                    onFormDataChange={handleFormDataChange}
                />
            </main>
        </div>
    );
};

export default Admin;
