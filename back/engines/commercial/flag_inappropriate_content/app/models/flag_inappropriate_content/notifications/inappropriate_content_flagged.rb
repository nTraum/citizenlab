module FlagInappropriateContent
  module Notifications
    class InappropriateContentFlagged < Notification

      ACTIVITY_TRIGGERS = {'FlagInappropriateContent::InappropriateContentFlag' => {'created' => true}}
      EVENT_NAME = 'Inappropriate content flagged'

      validates :inappropriate_content_flag, presence: true

      
      def self.recipient_ids
        User.admin.ids
      end

      def self.make_notifications_on activity
        flag = activity.item
        self.recipient_ids.map do |recipient_id|
          self.new(
            recipient_id: recipient_id,
            initiating_user_id: activity.user_id,
            inappropriate_content_flag: flag
          )
        end
      end

    end
  end
end

