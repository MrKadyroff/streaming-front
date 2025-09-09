import React from 'react';
import { AdData } from '../AdBanner';
import './AdForm.css';

interface AdFormData {
    title: string;
    imageUrl: string;
    gifUrl: string;
    clickUrl: string;
    type: 'vertical' | 'square' | 'horizontal';
}

interface AdFormProps {
    isOpen: boolean;
    editingAd: AdData | null;
    formData: AdFormData;
    isLoading: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    onFormDataChange: (field: keyof AdFormData, value: string) => void;
}

const AdForm: React.FC<AdFormProps> = ({
    isOpen,
    editingAd,
    formData,
    isLoading,
    onClose,
    onSubmit,
    onFormDataChange
}) => {
    if (!isOpen) return null;

    return (
        <div className="admin-modal">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>{editingAd ? 'Редактировать рекламу' : 'Добавить рекламу'}</h3>
                    <button
                        className="close-btn"
                        onClick={onClose}
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={onSubmit} className="ad-form">
                    <div className="form-group">
                        <label>Название:</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => onFormDataChange('title', e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Тип баннера:</label>
                        <select
                            value={formData.type}
                            onChange={(e) => onFormDataChange('type', e.target.value)}
                        >
                            <option value="vertical">Вертикальный (160x600)</option>
                            <option value="square">Квадратный (160x160)</option>
                            <option value="horizontal">Горизонтальный (728x90)</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>URL изображения:</label>
                        <input
                            type="url"
                            value={formData.imageUrl}
                            onChange={(e) => onFormDataChange('imageUrl', e.target.value)}
                            placeholder="https://example.com/image.jpg"
                        />
                        {formData.imageUrl && (
                            <div className="image-preview">
                                <img
                                    src={formData.imageUrl}
                                    alt="Превью изображения"
                                    className="preview-image"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                    }}
                                />
                                <div className="preview-placeholder hidden">
                                    Не удалось загрузить изображение
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>URL GIF:</label>
                        <input
                            type="url"
                            value={formData.gifUrl}
                            onChange={(e) => onFormDataChange('gifUrl', e.target.value)}
                            placeholder="https://example.com/animation.gif"
                        />
                        {formData.gifUrl && (
                            <div className="image-preview">
                                <img
                                    src={formData.gifUrl}
                                    alt="Превью GIF"
                                    className="preview-image"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                    }}
                                />
                                <div className="preview-placeholder hidden">
                                    Не удалось загрузить GIF
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Ссылка при клике:</label>
                        <input
                            type="url"
                            value={formData.clickUrl}
                            onChange={(e) => onFormDataChange('clickUrl', e.target.value)}
                            placeholder="https://example.com/target"
                        />
                    </div>

                    <div className="form-actions">
                        <button type="submit" disabled={isLoading}>
                            {isLoading ? 'Сохранение...' : (editingAd ? 'Обновить' : 'Добавить')}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Отмена
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdForm;
