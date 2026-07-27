/**
 * Notification Service Interface
 */
class NotificationService {
  async send(recipient, message, data) {
    throw new Error('Method send must be implemented');
  }
}

export default NotificationService;
