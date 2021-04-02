# frozen_string_literal: true

module ProjectManagement
  module Patches
    module User
      def self.prepended(base)
        base.class_eval do
          scope :project_moderator, lambda { |project_id = nil|
            if project_id
              where('roles @> ?', JSON.generate([{ type: 'project_moderator', project_id: project_id }]))
            else
              where("roles @> '[{\"type\":\"project_moderator\"}]'")
            end
          }

          scope :not_project_moderator, lambda { where.not("roles @> '[{\"type\":\"project_moderator\"}]'") }
        end
      end

      def project_moderator?(project_id = nil)
        !!roles.find { |r| r['type'] == 'project_moderator' && (project_id.nil? || r['project_id'] == project_id) }
      end

      def moderatable_project_ids
        roles.select { |role| role['type'] == 'project_moderator' }
             .map { |role| role['project_id'] }.compact
      end

      def moderatable_projects
        Project.where(id: moderatable_project_ids)
      end
    end
  end
end
