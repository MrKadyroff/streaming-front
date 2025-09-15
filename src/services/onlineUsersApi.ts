export interface OnlineUsersResponse {
    count: number;
    timestamp: string;
}

export const getOnlineUsersCount = async (): Promise<number> => {
    try {
        const response = await fetch('https://f4u.online/api/admin/users/online-count', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('Ошибка при получении количества онлайн пользователей');
        }

        const data: OnlineUsersResponse = await response.json();
        return data.count;
    } catch (error) {
        console.error('Ошибка получения онлайн пользователей:', error);
        return 0;
    }
};
