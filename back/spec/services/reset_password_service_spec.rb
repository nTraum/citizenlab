require 'rails_helper'

describe ResetPasswordService do

  let(:user) { create(:user) }
  let(:service) { described_class.new }

  before { create(:password_reset_campaign) }

  describe "#send_email_later" do
    it "enqueues a reset password email with high priority" do
      token = service.generate_reset_password_token(user)

      user.update!(reset_password_token: token)
      service.log_password_reset_activity(user, token)
      service.send_email_later(user, token)
    end
  end
end
