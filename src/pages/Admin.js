import React, { useEffect, useState } from 'react';
import { loadSchedule, saveSchedule } from '../utils/scheduleStorage';

function emptyItem() {
    return { id: Date.now().toString(), time: '', title: '', channel: '' };
}

export default function Admin() {
    const [items, setItems] = useState([]);
    const [draft, setDraft] = useState(emptyItem());

    useEffect(() => setItems(loadSchedule()), []);

    function addItem(e) {
        e.preventDefault();
        const next = [draft, ...items];
        setItems(next);
        saveSchedule(next);
        setDraft(emptyItem());
    }

    function removeId(id) {
        const next = items.filter((i) => i.id !== id);
        setItems(next);
        saveSchedule(next);
    }

    return (
        <main className="page page-admin">
            <h1>Админ: расписание</h1>
            <p className="lead">Добавляйте, редактируйте или удаляйте трансляции (локально).</p>

            <form className="admin-form" onSubmit={addItem}>
                <input
                    required
                    placeholder="Время (например: 2025-08-30 18:00)"
                    value={draft.time}
                    onChange={(e) => setDraft({ ...draft, time: e.target.value })}
                />
                <input
                    required
                    placeholder="Название матча / события"
                    value={draft.title}
                    onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                />
                <input
                    placeholder="Канал"
                    value={draft.channel}
                    onChange={(e) => setDraft({ ...draft, channel: e.target.value })}
                />
                <button className="btn-primary" type="submit">Добавить</button>
            </form>

            <div className="admin-list">
                {items.length === 0 ? (
                    <p className="muted">Пока нет записей.</p>
                ) : (
                    <ul>
                        {items.map((it) => (
                            <li key={it.id} className="admin-row">
                                <div>
                                    <strong>{it.time}</strong> — {it.title} <em>({it.channel})</em>
                                </div>
                                <div>
                                    <button className="btn-danger" onClick={() => removeId(it.id)}>Удалить</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </main>
    );
}
