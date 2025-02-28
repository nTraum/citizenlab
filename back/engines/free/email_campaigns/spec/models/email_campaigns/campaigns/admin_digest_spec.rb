# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::AdminDigest, type: :model do
  describe 'AdminDigest Campaign default factory' do
    it { expect(build(:admin_digest_campaign)).to be_valid }
  end

  describe '#generate_commands' do
    let(:campaign) { create(:admin_digest_campaign) }
    let!(:admin) { create(:admin) }
    let!(:old_ideas) { create_list(:idea, 2, published_at: Time.zone.now - 20.days) }
    let!(:new_ideas) { create_list(:idea, 3, published_at: Time.zone.now - 1.day) }
    let!(:vote) { create(:vote, mode: 'up', votable: new_ideas.first) }
    let!(:draft) { create(:idea, publication_status: 'draft') }

    it 'generates a command with the desired payload and tracked content' do
      command = campaign.generate_commands(recipient: admin).first

      expect(
        command.dig(:event_payload, :statistics, :activities, :new_ideas, :increase)
      ).to eq(new_ideas.size)
      expect(
        command.dig(:event_payload, :statistics, :activities, :new_votes, :increase)
      ).to eq(1)
      expect(
        command.dig(:event_payload, :top_project_ideas).flat_map { |tpi| tpi[:top_ideas].pluck(:id) }
      ).to include(new_ideas.first.id)
      expect(
        command.dig(:event_payload, :top_project_ideas).flat_map { |tpi| tpi[:top_ideas].pluck(:id) }
      ).not_to include(draft.id)
      expect(command.dig(:tracked_content, :idea_ids)).to include(new_ideas.first.id)
    end
  end

  describe 'apply_recipient_filters' do
    let(:campaign) { build(:admin_digest_campaign) }

    it 'filters out invitees' do
      admin = create(:admin)
      _invitee = create(:invited_user, roles: [{ type: 'admin' }])

      expect(campaign.apply_recipient_filters).to match([admin])
    end

    it 'filters out normal users' do
      admin = create(:admin)
      _user = create(:user)

      expect(campaign.apply_recipient_filters).to match([admin])
    end
  end
end
