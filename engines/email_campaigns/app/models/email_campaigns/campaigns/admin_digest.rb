module EmailCampaigns
  class Campaigns::AdminDigest < Campaign
    include Disableable
    include Consentable
    include Schedulable
    include RecipientConfigurable
    include Trackable

    add_recipient_filter :user_filter_admin_only

    def self.default_schedule
      IceCube::Schedule.new(Time.find_zone(Tenant.settings('core','timezone')).local(2018)) do |s|
        s.add_recurrence_rule(
          IceCube::Rule.weekly(1).day(:monday).hour_of_day(10)
        )
      end
    end

    def generate_command recipient:, time: nil
      {
        event_payload: {},
        tracked_content: {}
      }
    end

    private

    def user_filter_admin_only users_scope
      users_scope.admin
    end

  end
end