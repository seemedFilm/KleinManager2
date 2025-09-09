// Notifications functionality
class NotificationsManager extends KleinManagerCore {
    constructor() {
        super();
        this.notifications = [];
        this.notificationsOpen = false;
        this.notificationSound = null;
    }

    initNotificationSound() {
        if (this.settings.notification_sound && this.settings.notification_sound !== 'default') {
            this.notificationSound = new Audio(`/static/sounds/${this.settings.notification_sound}.mp3`);
        }
    }

    startNotificationPolling() {
        this.checkNotifications();
        setInterval(() => {
            this.checkNotifications();
        }, 30000); // Check every 30 seconds
    }

    async checkNotifications() {
        try {
            const notifications = await this.apiRequest('/notifications');
            if (notifications.length > this.notifications.length) {
                // New notification
                if (this.settings.notifications_enabled && this.notificationSound) {
                    this.notificationSound.play().catch(() => {});
                }
            }
            this.notifications = notifications;
            this.updateNotificationBadge();
        } catch (error) {
            console.error('Failed to check notifications:', error);
        }
    }

    updateNotificationBadge() {
        const badge = document.getElementById('notificationBadge');
        if (this.notifications.length > 0) {
            badge.textContent = this.notifications.length;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }

    toggleNotifications() {
        this.notificationsOpen = !this.notificationsOpen;
        const modal = document.getElementById('notificationsModal');

        if (this.notificationsOpen) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            this.renderNotifications();
        } else {
            this.closeNotifications();
        }
    }

    closeNotifications() {
        this.notificationsOpen = false;
        const modal = document.getElementById('notificationsModal');
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }

    renderNotifications() {
        const container = document.getElementById('notificationsList');

        if (this.notifications.length === 0) {
            container.innerHTML = `
                <div class="p-6 text-center text-gray-400">
                    <i class="fas fa-bell-slash text-3xl mb-3 text-gray-500"></i>
                    <p>No new notifications</p>
                </div>
            `;
        } else {
            container.innerHTML = this.notifications.map(notification => `
                <div class="p-4 border-b border-gray-700 hover:bg-gray-700 cursor-pointer transition-colors duration-200"
                     onclick="app.markNotificationRead(${notification.id})">
                    <div class="flex items-start gap-3">
                        <div class="p-2 bg-blue-600 rounded-full">
                            <i class="fas ${this.getNotificationIcon(notification.type)} text-white text-sm"></i>
                        </div>
                        <div class="flex-1">
                            <p class="text-white font-medium text-sm">${notification.title}</p>
                            <p class="text-gray-400 text-xs mt-1">${notification.message}</p>
                            <p class="text-gray-500 text-xs mt-2">${new Date(notification.created_at).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }

    getNotificationIcon(type) {
        const icons = {
            'price_change': 'fa-chart-line',
            'tracking_update': 'fa-truck',
            'system': 'fa-info-circle'
        };
        return icons[type] || 'fa-bell';
    }

    async markNotificationRead(notificationId) {
        try {
            await this.apiRequest(`/notifications/${notificationId}/read`, { method: 'POST' });
            this.checkNotifications();
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    }

    async clearAllNotifications() {
        try {
            await this.apiRequest('/notifications', { method: 'DELETE' });
            this.notifications = [];
            this.updateNotificationBadge();
            this.renderNotifications();
        } catch (error) {
            console.error('Failed to clear notifications:', error);
        }
    }
}