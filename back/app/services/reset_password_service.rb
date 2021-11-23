require 'jwt'

class ResetPasswordService
  def generate_reset_password_token user
    payload = {
      id: user.id,
      exp: (Time.now+1.hour).to_i
    }

    JWT.encode payload, secret, 'HS256'
  end

  def token_valid? user, token
    begin
      payload = JWT.decode token, secret, true, { algorithm: 'HS256'}
      payload[0]["id"] == user.id
    rescue JWT::ExpiredSignature
      return false
    end
  end

  def send_email_later(user, token)
    campaign = EmailCampaigns::Campaign.find_by!(type: "EmailCampaigns::Campaigns::PasswordReset")

    delivery_service = EmailCampaigns::DeliveryService.new
    delivery_service.send_now(campaign)
  end

  def log_password_reset_activity(user, token)
    LogActivityJob.perform_now(
      user, 'requested_password_reset', user, Time.now.to_i,
      payload: {token: token}
    )
  end

  private

  def secret
    Rails.application.secrets.secret_key_base
  end
end
