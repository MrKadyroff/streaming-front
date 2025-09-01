const KEY = 'sport_schedule_v1';

const sample = [
    { id: '1', time: '2025-08-30 18:00', title: 'Финал Чемпионата', channel: 'Arena Sport' },
    { id: '2', time: '2025-08-31 20:30', title: 'Дерби: Команда A vs Команда B', channel: 'SportTV' },
];

export function loadSchedule() {
    try {
        const raw = localStorage.getItem(KEY);
        if (!raw) {
            localStorage.setItem(KEY, JSON.stringify(sample));
            return sample;
        }
        return JSON.parse(raw);
    } catch (e) {
        console.error('loadSchedule error', e);
        return sample;
    }
}

export function saveSchedule(items) {
    try {
        localStorage.setItem(KEY, JSON.stringify(items));
    } catch (e) {
        console.error('saveSchedule error', e);
    }
}
