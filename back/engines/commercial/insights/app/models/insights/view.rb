# frozen_string_literal: true

module Insights
  class View < ::ApplicationRecord
    belongs_to :scope, class_name: 'Project'
    has_many :categories, class_name: 'Insights::Category', dependent: :destroy

    validates :name, presence: true, uniqueness: true
    validates :scope, presence: true
  end
end
