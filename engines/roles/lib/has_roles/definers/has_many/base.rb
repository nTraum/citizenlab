module HasRoles
  module Definers
    module HasMany
      #
      # When called, defines the methods related to role management of a has_many_roles macro.
      #
      # @example:
      #
      #   class User < ApplicationRecord
      #     has_many_roles :admin
      #
      #     [defines all :admin methods here]
      #   end
      #
      class Base < ::HasRoles::Definers::Base
        def options_valid?
          roleable_class_present?
        end

        delegate :present?, to: :roleable_class, prefix: true
        delegate :present?, to: :foreign_key, prefix: true

        attr_reader :roles_config

        def call
          return unless options_valid?

          define_base_methods
          if polymorphic_through? then Definers::HasMany::Association::PolymorphicThrough.define(klass, role_name, options)
          elsif associated?       then Definers::HasMany::Association::Base.define(klass, role_name, options)
          end
        end

        def define_base_methods
          define_roles_method
          define_role_query_method
          define_role_query_method
          define_role_add_method
          define_role_remove_method
          define_role_scope
          define_role_not_scope
        end

        #
        # Defines a method that returns all roles from the roles json for a given role_name.
        #
        # @example:
        #
        #   class User < ApplicationRecord
        #     def admin_roles
        #       roles_of_type('admin')
        #     end
        #   end
        #
        def define_roles_method
          role_name = self.role_name

          define_klass_instance_method(:"#{role_name}_roles") do
            roles_of_type(role_name)
          end
        end

        #
        # Defines a method that returns true if roles of a given role_name exist.
        #
        # @example:
        #
        #   class User < ApplicationRecord
        #     def admin?
        #       roles_of_type('admin').any?
        #     end
        #   end
        #
        def define_role_query_method
          role_name = self.role_name

          define_klass_instance_method(:"#{role_name}?") do
            roles_of_type(role_name).any?
          end
        end

        #
        # Defines a method that adds a role of the given name when called.
        #
        # @example:
        #
        #   class User < ApplicationRecord
        #     def add_admin_role
        #       add_role('admin')
        #     end
        #   end
        #
        def define_role_add_method
          role_name = self.role_name

          define_klass_instance_method(:"add_#{role_name}_role") do |*|
            add_role(role_name.to_s)
          end
        end

        #
        # Defines a method that removes a role of the given name when called.
        #
        # @example:
        #
        #   class User < ApplicationRecord
        #     def remove_admin_role
        #       remove_role('admin')
        #     end
        #   end
        #
        def define_role_remove_method
          role_name = self.role_name

          define_klass_instance_method(:"remove_#{role_name}_role") do |*|
            remove_role(role_name.to_s)
          end
        end

        #
        # Defines a scope that returns only the roled db entries with the given role.
        #
        # @example:
        #
        #   class User < ApplicationRecord
        #     scope :admin, lambda { |*|
        #       where("users.roles @> '#{role_to_json('admin')}'")
        #     }
        #
        def define_role_scope
          role_name = self.role_name

          define_klass_scope :"#{role_name}", lambda { |*|
            where("#{table_name}.roles @> '#{role_to_json(role_name)}'")
          }
        end

        #
        # Defines a scope that returns only the roled db entries that do not have the given role.
        #
        # @example:
        #
        #   class User < ApplicationRecord
        #     scope :not_admin, lambda { |*|
        #       where.not("users.roles @> '#{role_to_json('admin')}'")
        #     }
        #
        def define_role_not_scope
          role_name = self.role_name

          define_klass_scope :"not_#{role_name}", lambda { |*|
            where.not("#{table_name}.roles @> '#{role_to_json(role_name)}'")
          }
        end
      end
    end
  end
end
