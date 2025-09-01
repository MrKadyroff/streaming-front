import React, { useEffect, useState } from 'react';
import { loadSchedule } from '../utils/scheduleStorage';

export default function Schedule() {
    const [items, setItems] = useState([]);

    useEffect(() => {
        setItems(loadSchedule());
    }, []);

    return (
        <main className="page page-schedule">
            <h1>Расписание трансляций</h1>
            <p className="lead">Все ближайшие трансляции в удобной таблице.</p>
            <div className="table-wrap">
                <table className="schedule-table">
                    <thead>
                        <tr>
                            <th>Время</th>
                            <th>Матч / Событие</th>
                            <th>Канал</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan="3" className="muted">
                                    Нет запланированных трансляций
                                </td>
                            </tr>
                        ) : (
                            items.map((it) => (
                                <tr key={it.id}>
                                    <td>{it.time}</td>
                                    <td>{it.title}</td>
                                    <td>{it.channel}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </main>
    );
}
