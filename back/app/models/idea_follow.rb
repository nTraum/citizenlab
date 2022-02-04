class IdeaFollow < ApplicationRecord
  belongs_to :idea
  belongs_to :user

  validates :idea, :user, presence: true
end
