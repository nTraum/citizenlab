class MakeNotificationsForClassJob < ApplicationJob
  queue_as :default

  def run(notification_class, activity)
    notifications = notification_class.constantize.make_notifications_on(activity)

    notifications.each(&:validate!)

    notifications.each do |notification|
      begin
        notification.save!
        LogActivityJob.set(wait: 10.seconds).perform_later(notification, 'created', notification.recipient, notification.created_at.to_i)
        if notification.type == 'Notifications::CommentOnYourComment'
          serialized_notification = {
            id: notification.id,
            attributes: {
              post_type: notification.post_type,
              initiating_user_first_name: notification.initiating_user&.first_name,
              initiating_user_last_name: notification.initiating_user&.last_name,
              initiating_user_slug: notification.initiating_user&.slug,
              post_title_multiloc: notification.post&.title_multiloc,
              post_slug: notification.post&.slug
            },
            read_at: notification.read_at,
            created_at: notification.created_at,
            type: notification.type.demodulize.underscore,
            recipient: recipient_id
          }
          ActionCable.server.broadcast('comment_on_your_comment', serialized_notification)
        end
      rescue ActiveRecord::RecordInvalid => exception
        Raven.capture_exception(exception)
      end
    end
  end

end
